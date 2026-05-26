#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["PyYAML>=6.0", "requests>=2.31"]
# ///
"""Asset resolver — entity 매칭 결과를 실제 PNG 파일 경로로 변환.

흐름:
  1. EntityMatch.asset (entity_assets.yaml 에 선언된 경로) 가 실재하는지 확인
  2. 없으면 Wikimedia Commons auto-fetch 시도 (auto_fetch.enabled=true 일 때)
  3. 그래도 없으면 None 반환 → compositor 가 AI-pure 모드로 폴백
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
from pathlib import Path
from typing import Any

import requests
import yaml

SKILL_ROOT = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = SKILL_ROOT / "config" / "entity_assets.yaml"
WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "tech-news-pipeline/0.1 (asset-resolver)"


def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    with path.open() as f:
        return yaml.safe_load(f)


def resolve_local(asset_rel: str | None) -> Path | None:
    """선언된 상대 경로가 실재하면 절대 경로 반환."""
    if not asset_rel:
        return None
    p = SKILL_ROOT / asset_rel
    return p if p.exists() else None


def _wikimedia_search(query: str, limit: int = 5) -> list[str]:
    """Commons 에서 파일명 검색 → File:xxx 리스트."""
    params = {
        "action": "query",
        "list": "search",
        "srnamespace": "6",            # File namespace
        "srsearch": f"{query} logo",
        "srlimit": str(limit),
        "format": "json",
    }
    resp = requests.get(WIKIMEDIA_API, params=params,
                        headers={"User-Agent": USER_AGENT}, timeout=15)
    resp.raise_for_status()
    return [item["title"] for item in resp.json().get("query", {}).get("search", [])]


def _wikimedia_imageinfo(file_titles: list[str]) -> list[dict[str, Any]]:
    """File:xxx → 직접 다운로드 URL + 라이선스 메타."""
    if not file_titles:
        return []
    params = {
        "action": "query",
        "prop": "imageinfo",
        "titles": "|".join(file_titles),
        "iiprop": "url|mime|extmetadata",
        "format": "json",
    }
    resp = requests.get(WIKIMEDIA_API, params=params,
                        headers={"User-Agent": USER_AGENT}, timeout=15)
    resp.raise_for_status()
    pages = resp.json().get("query", {}).get("pages", {})
    out = []
    for p in pages.values():
        info = (p.get("imageinfo") or [{}])[0]
        if not info:
            continue
        out.append({
            "title": p.get("title", ""),
            "url": info.get("url", ""),
            "mime": info.get("mime", ""),
            "license": info.get("extmetadata", {}).get("LicenseShortName", {}).get("value", ""),
        })
    return out


def _license_ok(license_str: str, allow: list[str]) -> bool:
    s = license_str.lower()
    return any(token in s for token in allow)


def wikimedia_fetch(
    query: str,
    out_dir: Path,
    license_filter: list[str] | None = None,
) -> Path | None:
    """검색 → 라이선스 OK 한 첫 PNG/JPG 다운로드. SVG 는 스킵 (Pillow 가 못 읽음)."""
    license_filter = license_filter or ["cc-by", "cc-by-sa", "public domain"]
    try:
        titles = _wikimedia_search(query)
        infos = _wikimedia_imageinfo(titles)
        for info in infos:
            mime = info["mime"].lower()
            if not (mime.startswith("image/png") or mime.startswith("image/jpeg")):
                continue
            if not _license_ok(info["license"], license_filter):
                continue
            ext = ".png" if "png" in mime else ".jpg"
            safe = urllib.parse.quote(query.replace(" ", "_"), safe="")
            target = out_dir / f"{safe}{ext}"
            r = requests.get(info["url"], headers={"User-Agent": USER_AGENT}, timeout=30)
            r.raise_for_status()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(r.content)
            return target
    except Exception as e:
        print(f"[asset_resolver] wikimedia fetch failed for '{query}': {e}", file=sys.stderr)
    return None


def resolve(
    entity_match: dict[str, Any] | None,
    config: dict[str, Any] | None = None,
) -> Path | None:
    """EntityMatch dict 를 받아 실재 PNG 경로 반환. 없으면 None."""
    if not entity_match:
        return None
    cfg = config or load_config()

    local = resolve_local(entity_match.get("asset"))
    if local:
        return local

    auto = cfg.get("auto_fetch", {})
    if not auto.get("enabled"):
        return None

    cache_dir = SKILL_ROOT / auto.get("cache_dir", "assets/_auto_fetched/")
    fetched = wikimedia_fetch(
        query=entity_match["canonical_name"],
        out_dir=cache_dir,
        license_filter=auto.get("license_filter"),
    )
    return fetched


def main() -> int:
    ap = argparse.ArgumentParser(description="Resolve entity to local asset path.")
    ap.add_argument("--entity-json", type=str, required=True,
                    help='JSON: {"canonical_name":"...", "asset":"..."}')
    args = ap.parse_args()

    entity = json.loads(args.entity_json)
    path = resolve(entity)
    print(json.dumps({"path": str(path) if path else None}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
