"""auto_daily: --claude-caption 은 기본 꺼짐이고, 꺼져 있으면 기존 동작과 같다."""
from __future__ import annotations

import datetime as real_datetime
import json
import sys
import types
from pathlib import Path

import pytest

import auto_daily

PICKED = {
    "source": "rss",
    "title": "  Introducing Widget 2 for Agents  ",
    "summary": "x" * 300,
    "link": "https://acme.dev/w2",
    "_slug": "introducing-widget-2-for-agents",
    "_url": "https://acme.dev/w2",
    "weight": 1.0,
}


def test_flag_defaults_off():
    assert auto_daily.parse_args([]).claude_caption is False
    assert auto_daily.parse_args([]).caption_out_dir is None
    assert auto_daily.parse_args(["--claude-caption"]).claude_caption is True


def test_build_entry_unchanged():
    entry = auto_daily.build_entry(dict(PICKED), 185, "2026-10-03")
    assert entry == {
        "id": 185,
        "slug": "introducing-widget-2-for-agents",
        "title": "Introducing Widget 2 for Agents",
        "summary": "x" * 240,
        "content": "",
        "category": "news",
        "external_link": "https://acme.dev/w2",
        "tags": ["Introducing", "Widget", "Agents"],
        "created_at": "2026-10-03",
        "span": "",
        "theme": "agent",
    }


@pytest.fixture
def fake_daily(monkeypatch, tmp_path):
    """외부 명령·page.tsx·실제 날짜 파일을 건드리지 않도록 main 의 의존성을 바꾼다."""
    fixed = real_datetime.date(1999, 1, 1)
    fake_dt = types.SimpleNamespace(date=types.SimpleNamespace(today=lambda: fixed))
    monkeypatch.setattr(auto_daily, "datetime", fake_dt)
    monkeypatch.setattr(auto_daily, "existing_slugs_and_max_id", lambda: (set(), 184))
    cmds: list[list[str]] = []

    def fake_run(cmd):
        cmds.append(cmd)
        if "collect" in cmd:
            Path(cmd[cmd.index("--output") + 1]).write_text(json.dumps([PICKED]))

    monkeypatch.setattr(auto_daily, "run", fake_run)
    caption_calls: list[tuple] = []
    monkeypatch.setattr(auto_daily, "run_claude_caption", lambda *a: caption_calls.append(a))
    yield cmds, caption_calls
    for name in ("news_daily_1999-01-01.json", "entry_1999-01-01.json"):
        Path("/tmp", name).unlink(missing_ok=True)


def test_main_without_flag_runs_original_steps_only(fake_daily, monkeypatch):
    cmds, caption_calls = fake_daily
    for mod in [m for m in sys.modules if m == "caption" or m.startswith("caption.")]:
        monkeypatch.delitem(sys.modules, mod)  # 테스트 뒤 복원
    assert auto_daily.main([]) == 0
    assert caption_calls == []
    assert [c[3] if c[0] == "uv" else c[1] for c in cmds] == [
        str(auto_daily.LIB / "pipeline.py"),
        str(auto_daily.LIB / "pipeline.py"),
        str(auto_daily.LIB / "merge_and_publish.py"),
        str(auto_daily.LIB / "publish.py"),
    ]
    assert not any(m.startswith("caption") for m in sys.modules)  # 옵트인 모듈을 불러오지도 않음
    written = json.loads(Path("/tmp/entry_1999-01-01.json").read_text())
    assert written[0]["title"] == "Introducing Widget 2 for Agents"


def test_main_with_flag_adds_caption_but_keeps_publish_steps(fake_daily, tmp_path):
    cmds, caption_calls = fake_daily
    assert auto_daily.main(["--claude-caption", "--caption-out-dir", str(tmp_path)]) == 0
    assert len(caption_calls) == 1 and caption_calls[0][2] == tmp_path
    assert len(cmds) == 4  # 게시 단계는 그대로


def test_run_claude_caption_never_raises(monkeypatch, tmp_path, capsys):
    import caption.runner

    def boom(*a, **k):
        raise RuntimeError("explode")

    monkeypatch.setattr(caption.runner, "run_items", boom)
    auto_daily.run_claude_caption(dict(PICKED), "1999-01-01", tmp_path)
    assert "claude-caption 실패" in capsys.readouterr().err
