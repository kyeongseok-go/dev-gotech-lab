#!/usr/bin/env python3
"""기존 page.tsx 의 카드뉴스 엔트리를 추출 → 신규 엔트리와 합쳐 publish.py 입력 JSON 생성."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

_DEFAULT_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
REPO_ROOT = Path(os.environ.get("REPO_ROOT", str(_DEFAULT_REPO_ROOT)))
PAGE_TSX = REPO_ROOT / "src" / "app" / "card-news" / "page.tsx"
START = "/* TECH-NEWS-PIPELINE-DATA:START */"
END = "/* TECH-NEWS-PIPELINE-DATA:END */"


def extract_existing(src_text: str) -> list[dict]:
    """페이지 소스의 마커 사이에서 객체 리스트를 정규식+JS 파싱으로 추출."""
    m = re.search(re.escape(START) + r"(.*?)" + re.escape(END), src_text, re.DOTALL)
    if not m:
        raise RuntimeError("marker block not found")
    block = m.group(1)

    # 각 { ... } 블록을 jSON 으로 정규화: key: → "key":, 마지막 쉼표 정리
    entries: list[dict] = []
    # depth-aware splitter
    objs: list[str] = []
    depth = 0
    cur = []
    for ch in block:
        if ch == "{":
            if depth == 0:
                cur = ["{"]
            else:
                cur.append(ch)
            depth += 1
        elif ch == "}":
            depth -= 1
            cur.append(ch)
            if depth == 0:
                objs.append("".join(cur))
        elif depth > 0:
            cur.append(ch)
    for raw in objs:
        # 1. key: → "key":  (트레일링 콜론 식별자만)
        s = re.sub(r"^\s*(\w+):", lambda mm: f'"{mm.group(1)}":', raw, flags=re.MULTILINE)
        # 2. 콤마 정리 (trailing comma 제거)
        s = re.sub(r",(\s*[}\]])", r"\1", s)
        # 3. 단일 인용 문자열 → 더블 (없으면 noop)
        entries.append(json.loads(s))
    return entries


def main():
    new_entries_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    existing = extract_existing(PAGE_TSX.read_text())
    with new_entries_path.open() as f:
        new_entries = json.load(f)

    existing_slugs = {e["slug"] for e in existing}
    merged = list(existing)
    for ne in new_entries:
        if ne["slug"] in existing_slugs:
            print(f"[merge] skip duplicate slug: {ne['slug']}", file=sys.stderr)
            continue
        merged.append(ne)

    with output_path.open("w") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"[merge] existing={len(existing)} + new={len(new_entries)} → total={len(merged)}", file=sys.stderr)


if __name__ == "__main__":
    main()
