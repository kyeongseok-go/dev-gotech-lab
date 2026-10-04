"""호출 계층: 클라이언트 선택, HTTP·CLI 파싱. 실제 키 값·실제 호출은 쓰지 않는다."""
from __future__ import annotations

import io
import json
import subprocess
import urllib.error

import pytest

from caption import clients
from caption.config import MODEL_ENV, load_config

FAKE_KEY = "test-key-not-real"   # 실제 키 아님 — 노출 여부 검사용 표식


class DummySdk:
    name, model = clients.CLIENT_API_SDK, "m"

    def __init__(self, cfg):
        self.cfg = cfg


# ── 선택 로직 ─────────────────────────────────────────────────

def test_select_api_sdk_when_key_and_sdk(monkeypatch, cfg):
    monkeypatch.setattr(clients, "AnthropicSdkClient", DummySdk)
    choice = clients.select_client(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY},
                                   which=lambda _n: "/usr/bin/claude", sdk_available=lambda: True)
    assert choice.path == clients.CLIENT_API_SDK and isinstance(choice.client, DummySdk)
    assert FAKE_KEY not in choice.reason


def test_select_api_http_when_key_without_sdk(cfg):
    choice = clients.select_client(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY},
                                   which=lambda _n: None, sdk_available=lambda: False)
    assert choice.path == clients.CLIENT_API_HTTP
    assert FAKE_KEY not in repr(choice.client) and FAKE_KEY not in choice.reason


def test_select_cli_when_no_key(cfg):
    choice = clients.select_client(cfg, env={}, which=lambda n: "/opt/claude" if n == "claude" else None,
                                   sdk_available=lambda: True)
    assert choice.path == clients.CLIENT_CLI
    assert choice.client.build_command("sys", {"type": "object"})[0] == "/opt/claude"


def test_blank_key_counts_as_missing(cfg):
    choice = clients.select_client(cfg, env={"ANTHROPIC_API_KEY": "  "}, which=lambda _n: None)
    assert choice.path == "none" and choice.client is None
    assert choice.reason.startswith(clients.REASON_NO_CLIENT)


def test_model_from_env_overrides_default(tmp_path):
    missing = tmp_path / "none.yaml"
    assert load_config(missing, env={})["model"] == "claude-sonnet-5-5"
    assert load_config(missing, env={MODEL_ENV: "claude-opus-5-5"})["model"] == "claude-opus-5-5"


def test_repo_config_file_loads():
    cfg = load_config(env={})
    assert cfg["model"] == "claude-sonnet-5-5"
    assert cfg["limits"]["overlap_chars"] == 25


# ── HTTP 클라이언트 ───────────────────────────────────────────

class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def api_body(data: dict, stop: str = "end_turn") -> bytes:
    return json.dumps({
        "model": "claude-sonnet-5-5", "stop_reason": stop,
        "content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False)}],
        "usage": {"input_tokens": 1000, "output_tokens": 200},
    }).encode()


def test_http_client_sends_schema_and_parses(cfg):
    seen = {}

    def opener(req, timeout):
        seen["headers"] = {k.lower(): v for k, v in req.header_items()}
        seen["body"] = json.loads(req.data)
        seen["timeout"] = timeout
        return FakeResponse(api_body({"ok": True}))

    client = clients.AnthropicHttpClient(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY}, opener=opener)
    res = client.complete_json("sys", "user", {"type": "object"})
    assert res.data == {"ok": True}
    assert res.cost_usd == pytest.approx((1000 * 2 + 200 * 10) / 1_000_000)
    assert res.cost_source == "estimated"
    assert seen["headers"]["x-api-key"] == FAKE_KEY  # 키는 요청 헤더에만
    assert seen["headers"]["anthropic-beta"] == clients.FALLBACK_BETA
    body = seen["body"]
    assert body["model"] == "claude-sonnet-5-5"
    assert body["output_config"]["format"] == {"type": "json_schema", "schema": {"type": "object"}}
    assert body["fallbacks"] == "default"
    assert "thinking" not in body and "temperature" not in body


def test_http_client_error_message_has_no_key(cfg):
    def opener(req, timeout):
        raise urllib.error.HTTPError(req.full_url, 401, "unauthorized", {}, io.BytesIO(b"{}"))

    client = clients.AnthropicHttpClient(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY}, opener=opener)
    with pytest.raises(clients.CallError) as exc:
        client.complete_json("s", "u", {})
    assert "401" in str(exc.value) and FAKE_KEY not in str(exc.value)


def test_http_client_retries_429_then_succeeds(cfg):
    attempts = []

    def opener(req, timeout):
        attempts.append(1)
        if len(attempts) == 1:
            raise urllib.error.HTTPError(req.full_url, 429, "rate", {}, io.BytesIO(b"{}"))
        return FakeResponse(api_body({"ok": 1}))

    client = clients.AnthropicHttpClient(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY}, opener=opener, sleep=lambda _s: None)
    assert client.complete_json("s", "u", {}).data == {"ok": 1}
    assert len(attempts) == 2


@pytest.mark.parametrize("stop", ["refusal", "max_tokens"])
def test_http_client_rejects_bad_stop_reason(cfg, stop):
    client = clients.AnthropicHttpClient(cfg, env={"ANTHROPIC_API_KEY": FAKE_KEY},
                                         opener=lambda req, timeout: FakeResponse(api_body({}, stop)))
    with pytest.raises(clients.CallError):
        client.complete_json("s", "u", {})


# ── CLI 클라이언트 ────────────────────────────────────────────

def cli_output(**over) -> str:
    out = {"type": "result", "subtype": "success", "is_error": False, "result": "{\"a\":1}",
           "structured_output": {"a": 1}, "total_cost_usd": 0.0123,
           "usage": {"input_tokens": 5, "output_tokens": 50},
           "modelUsage": {"claude-sonnet-5-5": {"costUSD": 0.0123}}}
    out.update(over)
    return json.dumps(out)


def test_cli_client_builds_isolated_command_and_parses(cfg):
    seen = {}

    def runner(cmd, **kw):
        seen["cmd"], seen["kw"] = cmd, kw
        return subprocess.CompletedProcess(cmd, 0, cli_output(), "")

    client = clients.ClaudeCliClient(cfg, "/opt/claude", runner=runner)
    res = client.complete_json("시스템", "사용자 입력", {"type": "object"})
    cmd = seen["cmd"]
    assert cmd[:2] == ["/opt/claude", "-p"]
    for flag in ("--output-format", "--json-schema", "--system-prompt", "--tools", "--max-budget-usd",
                 "--no-session-persistence", "--strict-mcp-config"):
        assert flag in cmd
    assert cmd[cmd.index("--model") + 1] == "claude-sonnet-5-5"
    assert cmd[cmd.index("--tools") + 1] == ""
    assert seen["kw"]["input"] == "사용자 입력" and seen["kw"]["timeout"] == 180
    assert (res.data, res.cost_usd, res.cost_source, res.model) == ({"a": 1}, 0.0123, "measured", "claude-sonnet-5-5")


def test_cli_client_falls_back_to_result_text(cfg):
    runner = lambda cmd, **kw: subprocess.CompletedProcess(cmd, 0, cli_output(structured_output=None), "")  # noqa: E731
    assert clients.ClaudeCliClient(cfg, "c", runner=runner).complete_json("s", "u", {}).data == {"a": 1}


def test_cli_client_errors(cfg):
    def timeout_runner(cmd, **kw):
        raise subprocess.TimeoutExpired(cmd, 1)

    with pytest.raises(clients.CallError, match="타임아웃"):
        clients.ClaudeCliClient(cfg, "c", runner=timeout_runner).complete_json("s", "u", {})
    err = lambda cmd, **kw: subprocess.CompletedProcess(cmd, 1, cli_output(is_error=True, subtype="error_max_budget_usd"), "")  # noqa: E731
    with pytest.raises(clients.CallError, match="error_max_budget_usd"):
        clients.ClaudeCliClient(cfg, "c", runner=err).complete_json("s", "u", {})
    garbage = lambda cmd, **kw: subprocess.CompletedProcess(cmd, 1, "not json", "boom")  # noqa: E731
    with pytest.raises(clients.CallError, match="파싱"):
        clients.ClaudeCliClient(cfg, "c", runner=garbage).complete_json("s", "u", {})


# ── SDK 클라이언트(가짜 anthropic 모듈) ────────────────────────

def test_sdk_client_passes_fallback_and_schema(monkeypatch, cfg):
    import sys
    import types

    seen = {}

    class FakeMessage:
        def to_dict(self):
            return json.loads(api_body({"ok": "sdk"}).decode())

    class FakeAnthropic:
        def __init__(self, timeout, max_retries):
            seen["init"] = (timeout, max_retries)
            self.messages = types.SimpleNamespace(create=self._create)

        def _create(self, **kw):
            seen["kw"] = kw
            return FakeMessage()

    fake = types.SimpleNamespace(Anthropic=FakeAnthropic, APIStatusError=type("E1", (Exception,), {}),
                                 APIConnectionError=type("E2", (Exception,), {}))
    monkeypatch.setitem(sys.modules, "anthropic", fake)
    res = clients.AnthropicSdkClient(cfg).complete_json("s", "u", {"type": "object"})
    assert res.data == {"ok": "sdk"} and res.cost_source == "estimated"
    kw = seen["kw"]
    assert kw["extra_headers"] == {"anthropic-beta": clients.FALLBACK_BETA}
    assert kw["extra_body"] == {"fallbacks": "default"}
    assert kw["output_config"]["effort"] == "medium"
    assert seen["init"] == (180.0, 2)
