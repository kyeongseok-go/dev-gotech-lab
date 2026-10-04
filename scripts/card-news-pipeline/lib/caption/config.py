"""caption.yaml 로딩. PyYAML 이 없으면 코드 기본값만 쓴다."""
from __future__ import annotations

import copy
import os
from pathlib import Path
from typing import Any, Mapping

CONFIG_PATH = Path(__file__).resolve().parents[2] / "config" / "caption.yaml"
MODEL_ENV = "CARD_NEWS_CAPTION_MODEL"
DEFAULT_MODEL = "claude-sonnet-5-5"

DEFAULTS: dict[str, Any] = {
    "model": DEFAULT_MODEL,
    "effort": "medium",
    "max_tokens": 4000,
    "timeout_seconds": 180,
    "cli_max_budget_usd": 0.5,
    "api_refusal_fallback": True,
    "fetch": {
        "timeout_seconds": 20,
        "max_bytes": 3_000_000,
        "max_source_chars": 30_000,
        "min_body_chars": 400,
        "user_agent": "Mozilla/5.0 (compatible; gotech-card-news/1.0)",
    },
    "judge_even_if_checks_fail": True,
    "extra_blocked_domains": [],
    "limits": {
        "title_max": 30,
        "hook_lines_max": 2,
        "hook_line_max": 16,
        "fact_count": 3,
        "fact_max": 60,
        "why_lines_min": 2,
        "why_lines_max": 3,
        "why_line_max": 60,
        "numbers_max": 3,
        "number_value_max": 16,
        "number_label_max": 24,
        "tag_count": 3,
        "tag_max": 16,
        "source_name_max": 40,
        "overlap_chars": 25,
    },
}


def _merge(base: Mapping[str, Any], override: Mapping[str, Any]) -> dict[str, Any]:
    """중첩 dict 를 새 객체로 병합한다(입력은 바꾸지 않음)."""
    merged = copy.deepcopy(dict(base))
    for key, value in override.items():
        if isinstance(value, Mapping) and isinstance(merged.get(key), Mapping):
            merged[key] = _merge(merged[key], value)
        else:
            merged[key] = copy.deepcopy(value)
    return merged


def load_config(path: Path | None = None, env: Mapping[str, str] | None = None) -> dict[str, Any]:
    env = os.environ if env is None else env
    cfg_path = path or CONFIG_PATH
    file_cfg: dict[str, Any] = {}
    if cfg_path.exists():
        try:
            import yaml  # type: ignore
        except ImportError:
            yaml = None
        if yaml is not None:
            loaded = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or {}
            if not isinstance(loaded, dict):
                raise ValueError(f"caption 설정 형식 오류: {cfg_path}")
            file_cfg = loaded
    cfg = _merge(DEFAULTS, file_cfg)
    env_model = (env.get(MODEL_ENV) or "").strip()
    if env_model:
        cfg["model"] = env_model
    if not str(cfg.get("model") or "").strip():
        cfg["model"] = DEFAULT_MODEL
    return cfg
