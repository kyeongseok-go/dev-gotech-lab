"""Claude 호출 계층. 테스트에서는 같은 인터페이스의 가짜 클라이언트를 주입한다.

선택 순서
  1. ANTHROPIC_API_KEY 가 있으면 API — anthropic SDK 가 설치돼 있으면 SDK, 없으면 urllib HTTP
  2. 키가 없고 `claude` CLI 가 있으면 `claude -p --output-format json`
  3. 둘 다 없으면 None + 사유

키 값은 읽어서 요청 헤더에만 넣는다. 출력·로그·파일·예외 메시지에 넣지 않는다.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Callable, Mapping, Protocol

API_KEY_ENV = "ANTHROPIC_API_KEY"
API_URL = "https://api.anthropic.com/v1/messages"
API_VERSION = "2023-06-01"
FALLBACK_BETA = "server-side-fallback-2026-07-01"

# 비용 추정용(USD per 1M tokens). 2026-09-25 claude-api 스킬 표 기준. API 경로에서만 쓴다(CLI 는 실측값 제공).
PRICING_PER_MTOK: dict[str, tuple[float, float]] = {
    "claude-sonnet-5-5": (2.0, 10.0),
    "claude-opus-5-5": (4.0, 20.0),
    "claude-haiku-4-5": (1.0, 5.0),
}

CLIENT_API_SDK = "api_sdk"
CLIENT_API_HTTP = "api_http"
CLIENT_CLI = "cli"
REASON_NO_CLIENT = "no_claude_client"


class CallError(RuntimeError):
    """Claude 호출 실패(키 값은 메시지에 넣지 않는다)."""


@dataclass(frozen=True)
class CallResult:
    data: dict[str, Any]
    model: str
    cost_usd: float | None
    cost_source: str              # measured(CLI) | estimated(API 단가표) | unknown
    duration_s: float
    usage: dict[str, Any] = field(default_factory=dict)
    stop_reason: str = ""


class ClaudeClient(Protocol):
    name: str
    model: str

    def complete_json(self, system: str, user: str, schema: dict[str, Any]) -> CallResult: ...


def _estimate_cost(model: str, usage: Mapping[str, Any]) -> float | None:
    price = PRICING_PER_MTOK.get(model)
    if not price:
        return None
    tokens_in = float(usage.get("input_tokens") or 0) + float(usage.get("cache_creation_input_tokens") or 0) * 1.25 \
        + float(usage.get("cache_read_input_tokens") or 0) * 0.1
    tokens_out = float(usage.get("output_tokens") or 0)
    return round((tokens_in * price[0] + tokens_out * price[1]) / 1_000_000, 6)


def _parse_message(body: Mapping[str, Any]) -> tuple[dict[str, Any], str]:
    stop = str(body.get("stop_reason") or "")
    if stop == "refusal":
        raise CallError("모델이 요청을 거절함(stop_reason=refusal)")
    if stop == "max_tokens":
        raise CallError("출력이 max_tokens 에서 잘림 — max_tokens 를 늘려야 함")
    texts = [b.get("text", "") for b in body.get("content", []) if b.get("type") == "text"]
    if not texts:
        raise CallError("응답에 text 블록이 없음")
    try:
        data = json.loads(texts[0])
    except ValueError as e:
        raise CallError(f"응답 JSON 파싱 실패: {e}") from e
    if not isinstance(data, dict):
        raise CallError("응답 JSON 이 객체가 아님")
    return data, stop


def _request_body(cfg: Mapping[str, Any], system: str, user: str, schema: dict[str, Any]) -> dict[str, Any]:
    return {
        "model": cfg["model"],
        "max_tokens": int(cfg.get("max_tokens", 4000)),
        "system": system,
        "messages": [{"role": "user", "content": user}],
        "output_config": {
            "effort": str(cfg.get("effort", "medium")),
            "format": {"type": "json_schema", "schema": schema},
        },
    }


class AnthropicSdkClient:
    """anthropic 파이썬 SDK 경로. 키는 SDK 가 환경변수에서 직접 읽는다."""

    name = CLIENT_API_SDK

    def __init__(self, cfg: Mapping[str, Any]) -> None:
        import anthropic  # 설치돼 있을 때만 선택되므로 지연 import

        self._anthropic = anthropic
        self._cfg = dict(cfg)
        self.model = str(cfg["model"])
        self._client = anthropic.Anthropic(timeout=float(cfg.get("timeout_seconds", 180)), max_retries=2)

    def complete_json(self, system: str, user: str, schema: dict[str, Any]) -> CallResult:
        kwargs = _request_body(self._cfg, system, user, schema)
        if self._cfg.get("api_refusal_fallback"):
            # SDK 버전에 fallbacks 인자가 없을 수 있어 extra_* 로 전달
            kwargs["extra_headers"] = {"anthropic-beta": FALLBACK_BETA}
            kwargs["extra_body"] = {"fallbacks": "default"}
        started = time.monotonic()
        try:
            message = self._client.messages.create(**kwargs)
        except self._anthropic.APIStatusError as e:
            raise CallError(f"API 오류 status={e.status_code}") from None
        except self._anthropic.APIConnectionError:
            raise CallError("API 연결 실패") from None
        body = message.to_dict()
        data, stop = _parse_message(body)
        usage = dict(body.get("usage") or {})
        model = str(body.get("model") or self.model)
        return CallResult(data=data, model=model, cost_usd=_estimate_cost(model, usage),
                          cost_source="estimated", duration_s=round(time.monotonic() - started, 2),
                          usage=usage, stop_reason=stop)


Opener = Callable[..., Any]


class AnthropicHttpClient:
    """SDK 가 없을 때 urllib 로 /v1/messages 를 직접 호출."""

    name = CLIENT_API_HTTP

    def __init__(self, cfg: Mapping[str, Any], env: Mapping[str, str] | None = None,
                 opener: Opener | None = None, sleep: Callable[[float], None] = time.sleep) -> None:
        self._cfg = dict(cfg)
        self._env = os.environ if env is None else env
        self._open = opener or urllib.request.urlopen
        self._sleep = sleep
        self.model = str(cfg["model"])

    def __repr__(self) -> str:  # 키가 repr 로 새지 않도록
        return f"AnthropicHttpClient(model={self.model!r})"

    def _headers(self) -> dict[str, str]:
        key = self._env.get(API_KEY_ENV, "")
        if not key:
            raise CallError(f"{API_KEY_ENV} 가 설정돼 있지 않음")
        headers = {"x-api-key": key, "anthropic-version": API_VERSION, "content-type": "application/json"}
        if self._cfg.get("api_refusal_fallback"):
            headers["anthropic-beta"] = FALLBACK_BETA
        return headers

    def complete_json(self, system: str, user: str, schema: dict[str, Any]) -> CallResult:
        body = _request_body(self._cfg, system, user, schema)
        if self._cfg.get("api_refusal_fallback"):
            body["fallbacks"] = "default"
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        timeout = float(self._cfg.get("timeout_seconds", 180))
        started = time.monotonic()
        last_error = "알 수 없음"
        for attempt in range(3):
            req = urllib.request.Request(API_URL, data=payload, headers=self._headers(), method="POST")
            try:
                with self._open(req, timeout=timeout) as resp:
                    response = json.loads(resp.read().decode("utf-8"))
                break
            except urllib.error.HTTPError as e:
                last_error = f"API 오류 status={e.code}"
                if e.code != 429 and e.code < 500:
                    raise CallError(last_error) from None
            except urllib.error.URLError as e:
                last_error = f"API 연결 실패: {type(e.reason).__name__}"
            if attempt < 2:
                self._sleep(2 ** attempt * 2)
        else:
            raise CallError(last_error)
        data, stop = _parse_message(response)
        usage = dict(response.get("usage") or {})
        model = str(response.get("model") or self.model)
        return CallResult(data=data, model=model, cost_usd=_estimate_cost(model, usage),
                          cost_source="estimated", duration_s=round(time.monotonic() - started, 2),
                          usage=usage, stop_reason=stop)


Runner = Callable[..., "subprocess.CompletedProcess[str]"]


class ClaudeCliClient:
    """`claude -p` 비대화 모드. 도구·MCP·스킬·설정 파일을 끄고 구조화 출력만 받는다."""

    name = CLIENT_CLI

    def __init__(self, cfg: Mapping[str, Any], cli_path: str, runner: Runner | None = None) -> None:
        self._cfg = dict(cfg)
        self._cli = cli_path
        self._run = runner or subprocess.run
        self.model = str(cfg["model"])

    def build_command(self, system: str, schema: dict[str, Any]) -> list[str]:
        return [
            self._cli, "-p",
            "--output-format", "json",
            "--model", self.model,
            "--effort", str(self._cfg.get("effort", "medium")),
            "--system-prompt", system,
            "--json-schema", json.dumps(schema, ensure_ascii=False),
            "--tools", "",
            "--strict-mcp-config",
            "--disable-slash-commands",
            "--no-session-persistence",
            "--setting-sources", "",
            "--max-budget-usd", str(self._cfg.get("cli_max_budget_usd", 0.5)),
        ]

    def complete_json(self, system: str, user: str, schema: dict[str, Any]) -> CallResult:
        cmd = self.build_command(system, schema)
        timeout = float(self._cfg.get("timeout_seconds", 180))
        started = time.monotonic()
        # 프로젝트 CLAUDE.md 등을 읽지 않도록 빈 임시 디렉터리에서 실행
        with tempfile.TemporaryDirectory(prefix="caption-cli-") as workdir:
            try:
                proc = self._run(cmd, input=user, capture_output=True, text=True,
                                 timeout=timeout, cwd=workdir, check=False)
            except subprocess.TimeoutExpired:
                raise CallError(f"claude CLI 타임아웃({timeout:.0f}초)") from None
        duration = round(time.monotonic() - started, 2)
        try:
            out = json.loads(proc.stdout or "")
        except ValueError:
            raise CallError(f"claude CLI 출력 파싱 실패(exit={proc.returncode}): {(proc.stderr or '')[:200]}") from None
        if out.get("is_error") or out.get("subtype") != "success":
            raise CallError(f"claude CLI 실패: subtype={out.get('subtype')} {str(out.get('result', ''))[:200]}")
        data = out.get("structured_output")
        if not isinstance(data, dict):
            try:
                data = json.loads(out.get("result") or "")
            except ValueError:
                raise CallError("claude CLI 결과에 구조화 출력이 없음") from None
        model_usage = out.get("modelUsage") or {}
        model = next(iter(model_usage), self.model) if len(model_usage) == 1 else self.model
        cost = out.get("total_cost_usd")
        return CallResult(data=data, model=str(model),
                          cost_usd=float(cost) if cost is not None else None,
                          cost_source="measured" if cost is not None else "unknown",
                          duration_s=duration, usage=dict(out.get("usage") or {}),
                          stop_reason=str(out.get("stop_reason") or ""))


def _sdk_installed() -> bool:
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return False
    return True


@dataclass(frozen=True)
class ClientChoice:
    client: ClaudeClient | None
    path: str          # api_sdk | api_http | cli | none
    reason: str


def select_client(cfg: Mapping[str, Any], env: Mapping[str, str] | None = None,
                  which: Callable[[str], str | None] = shutil.which,
                  sdk_available: Callable[[], bool] = _sdk_installed) -> ClientChoice:
    """키 → CLI → 없음 순으로 고른다. 키는 존재 여부만 본다."""
    env = os.environ if env is None else env
    if (env.get(API_KEY_ENV) or "").strip():
        if sdk_available():
            return ClientChoice(AnthropicSdkClient(cfg), CLIENT_API_SDK, f"{API_KEY_ENV} 있음 + anthropic SDK 설치됨")
        return ClientChoice(AnthropicHttpClient(cfg, env=env), CLIENT_API_HTTP, f"{API_KEY_ENV} 있음, SDK 없음 → HTTP")
    cli = which("claude")
    if cli:
        return ClientChoice(ClaudeCliClient(cfg, cli), CLIENT_CLI, f"{API_KEY_ENV} 없음, claude CLI 사용")
    return ClientChoice(None, "none", f"{REASON_NO_CLIENT}: {API_KEY_ENV} 없음, claude CLI 없음")
