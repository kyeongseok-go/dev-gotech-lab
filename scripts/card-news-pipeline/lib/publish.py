#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Publish layer — entries JSON → dev-gotech-lab page.tsx 데이터 배열.

자동 생성 마커 사이의 배열만 교체하므로 다른 코드(metadata, JSX 등)는 보존된다.
"""
from __future__ import annotations

import argparse
import json
import re
import os
import sys
from pathlib import Path

_DEFAULT_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
REPO_ROOT = Path(os.environ.get("REPO_ROOT", str(_DEFAULT_REPO_ROOT)))
DEFAULT_TARGET = REPO_ROOT / "src" / "app" / "card-news" / "page.tsx"
START_MARKER = "/* TECH-NEWS-PIPELINE-DATA:START */"
END_MARKER = "/* TECH-NEWS-PIPELINE-DATA:END */"


def _ts(value: object) -> str:
    """JSON 직렬화 → TypeScript literal."""
    return json.dumps(value, ensure_ascii=False)


def render_entries(entries: list[dict]) -> str:
    lines: list[str] = []
    for e in entries:
        legacy_field = "    legacy: true,\n" if e.get("legacy") else ""
        lines.append(
            "  {\n"
            f"    id: {int(e['id'])},\n"
            f"    slug: {_ts(e['slug'])},\n"
            f"    title: {_ts(e['title'])},\n"
            f"    summary: {_ts(e['summary'])},\n"
            f"    content: {_ts(e.get('content', ''))},\n"
            f"    category: {_ts(e['category'])},\n"
            f"    image_url: {_ts(e.get('image_url'))},\n"
            f"    external_link: {_ts(e.get('external_link'))},\n"
            f"    tags: {_ts(e.get('tags', []))},\n"
            f"    created_at: {_ts(e['created_at'])},\n"
            f"    span: \"\",\n"
            f"{legacy_field}"
            "  }"
        )
    return ",\n".join(lines)


def write_to_page_tsx(entries: list[dict], target: Path = DEFAULT_TARGET) -> None:
    """page.tsx 의 마커 사이를 entries 로 교체. 마커 없으면 생성."""
    src = target.read_text()
    rendered = render_entries(sorted(entries, key=lambda e: e["created_at"], reverse=True))

    marker_block = f"{START_MARKER}\n{rendered},\n  {END_MARKER}"

    if START_MARKER in src and END_MARKER in src:
        pattern = re.compile(
            re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
            re.DOTALL,
        )
        new_src = pattern.sub(marker_block, src)
    else:
        # 첫 적용: CARD_NEWS_DATA 배열을 통째로 교체
        pattern = re.compile(
            r"const\s+CARD_NEWS_DATA[^=]*=\s*\[(.*?)\];",
            re.DOTALL,
        )
        replacement = (
            "const CARD_NEWS_DATA: CardNewsItem[] = [\n"
            + marker_block + "\n"
            + "];"
        )
        if not pattern.search(src):
            raise RuntimeError("CARD_NEWS_DATA array not found in target file")
        new_src = pattern.sub(replacement, src)

    target.write_text(new_src)


def main() -> int:
    ap = argparse.ArgumentParser(description="Publish entries to page.tsx.")
    ap.add_argument("--entries", type=Path, required=True)
    ap.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    args = ap.parse_args()

    with args.entries.open() as f:
        entries = json.load(f)

    write_to_page_tsx(entries, args.target)
    print(f"[publish] {len(entries)} entries → {args.target}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
