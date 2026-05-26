#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["PyYAML>=6.0"]
# ///
"""Entity detector — rule-based matching of card text against entity_assets.yaml.

LLM 의존성 없이 alias 부분 문자열 매칭 + context 가중치로 동작한다.
파이프라인 상위 단계에서 LLM이 entity hint 를 명시적으로 제공하면 그걸 우선.

출력:
  primary:   가장 신뢰도 높은 entity (없으면 None)
  secondary: 두 번째 entity (옵션, primary 와 다른 entity 만)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import yaml

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "entity_assets.yaml"


@dataclass
class EntityMatch:
    canonical_name: str
    type: str                  # logo | person | product | team | object
    asset: str | None          # 선언된 asset 경로 (실재 여부는 asset_resolver 가 확인)
    brand_color: str | None    # 헥스 색상 (예: "#D97757")
    confidence: float
    matched_aliases: list[str]
    context_hits: list[str]
    prompt_hint: str | None


def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    with path.open() as f:
        return yaml.safe_load(f)


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def _alias_hit(text_norm: str, alias: str, partial: bool) -> bool:
    a = alias.lower()
    if partial:
        return a in text_norm
    # 단어 경계 매칭 (영문 한정; 한글은 partial 권장)
    return bool(re.search(rf"\b{re.escape(a)}\b", text_norm))


def score_entity(text: str, entity: dict[str, Any], partial: bool) -> EntityMatch | None:
    text_norm = _norm(text)
    aliases = entity.get("aliases", [])
    if not aliases:
        return None

    matched = [a for a in aliases if _alias_hit(text_norm, a, partial)]
    if not matched:
        return None

    context = entity.get("context", [])
    ctx_hits = [c for c in context if _norm(c) in text_norm]

    # 점수: alias 1개라도 매칭되면 기본 0.7 (브랜드명 등장 자체가 강한 시그널).
    # 추가 매칭은 +0.05 each (최대 0.9), context 매칭은 +0.05 each (최대 0.1)
    base = 0.7
    extra_alias_bonus = min((len(matched) - 1) * 0.05, 0.2)
    context_bonus = min(len(ctx_hits) * 0.05, 0.1)
    confidence = min(base + extra_alias_bonus + context_bonus, 1.0)

    return EntityMatch(
        canonical_name=entity["canonical_name"],
        type=entity["type"],
        asset=entity.get("asset"),
        brand_color=entity.get("brand_color"),
        confidence=confidence,
        matched_aliases=matched,
        context_hits=ctx_hits,
        prompt_hint=entity.get("prompt_hint"),
    )


def detect(text: str, config: dict[str, Any] | None = None) -> dict[str, EntityMatch | None]:
    cfg = config or load_config()
    matching = cfg.get("matching", {})
    min_conf = float(matching.get("min_confidence", 0.6))
    partial = bool(matching.get("partial_match", True))

    candidates: list[EntityMatch] = []
    for entity in cfg.get("entities", []):
        m = score_entity(text, entity, partial)
        if m and m.confidence >= min_conf:
            candidates.append(m)

    candidates.sort(key=lambda m: m.confidence, reverse=True)
    primary = candidates[0] if candidates else None
    secondary = candidates[1] if len(candidates) > 1 else None

    return {"primary": primary, "secondary": secondary}


def main() -> int:
    ap = argparse.ArgumentParser(description="Detect entities in card text.")
    ap.add_argument("--text", required=True, help="Card title + body to analyze")
    args = ap.parse_args()

    result = detect(args.text)
    payload = {k: (asdict(v) if v else None) for k, v in result.items()}
    json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
