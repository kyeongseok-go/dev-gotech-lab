#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["PyYAML>=6.0"]
# ///
"""Claude 문구 파이프라인 수동 실행(드라이런·백필 검토용). page.tsx 는 읽기만 한다.

예:
  uv run scripts/card-news-pipeline/caption_review.py --page-ids 184 183 --out-dir /tmp/caption
  uv run scripts/card-news-pipeline/caption_review.py --input entries.json --out-dir /tmp/caption
  uv run scripts/card-news-pipeline/caption_review.py --show-client   # 호출 경로만 확인(호출 없음)

결과는 --out-dir 에 <id>.json(status: pending_review) / <id>.md(판정표) / <id>.source.txt 로 남는다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
LIB = SCRIPT_DIR / "lib"
sys.path.insert(0, str(LIB))

from caption.clients import select_client  # noqa: E402
from caption.config import load_config  # noqa: E402
from caption.runner import run_items  # noqa: E402
from caption.source_text import item_from_page_entry  # noqa: E402


def load_page_entries(ids: list[str]) -> list[dict]:
    from merge_and_publish import PAGE_TSX, extract_existing  # 읽기 전용 파서 재사용

    entries = {str(e.get("id")): e for e in extract_existing(PAGE_TSX.read_text(encoding="utf-8"))}
    missing = [i for i in ids if i not in entries]
    if missing:
        raise SystemExit(f"page.tsx 에 없는 id: {', '.join(missing)}")
    return [entries[i] for i in ids]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Claude 카드 문구 생성·검수(승인 대기 파일만 생성)")
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--page-ids", nargs="+", help="page.tsx 카드 id (읽기 전용)")
    src.add_argument("--input", type=Path, help="엔트리 JSON 목록(title, external_link, summary)")
    ap.add_argument("--out-dir", type=Path, default=Path(os.environ.get("TMPDIR", "/tmp")) / "card-caption")
    ap.add_argument("--show-client", action="store_true", help="호출 경로만 출력하고 끝냄")
    args = ap.parse_args(argv)

    cfg = load_config()
    choice = select_client(cfg)
    if args.show_client:
        print(json.dumps({"path": choice.path, "reason": choice.reason, "model": cfg["model"]}, ensure_ascii=False))
        return 0
    if args.page_ids:
        entries = load_page_entries(args.page_ids)
    elif args.input:
        entries = json.loads(args.input.read_text(encoding="utf-8"))
    else:
        ap.error("--page-ids 또는 --input 이 필요함")
    items = [item_from_page_entry(e) for e in entries]
    summaries = run_items(items, cfg, args.out_dir, choice=choice)
    (args.out_dir / "summary.json").write_text(json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summaries, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
