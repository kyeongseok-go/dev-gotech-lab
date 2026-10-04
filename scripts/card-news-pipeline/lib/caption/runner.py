"""여러 건 실행 + 파일 저장 + 요약. auto_daily --claude-caption 과 caption_review.py 가 같이 쓴다."""
from __future__ import annotations

import sys
import time
from pathlib import Path
from typing import Any, Iterable, Mapping

from .clients import ClientChoice, select_client
from .flow import run_caption
from .report import write_outputs
from .source_text import CaptionItem, Fetcher


def run_items(items: Iterable[CaptionItem], cfg: Mapping[str, Any], out_dir: Path,
              choice: ClientChoice | None = None, fetcher: Fetcher | None = None) -> list[dict[str, Any]]:
    """각 항목을 실행해 승인 대기 파일을 쓰고 요약 목록을 돌려준다. 게시는 하지 않는다."""
    choice = choice or select_client(cfg)
    print(f"[caption] 호출 경로: {choice.path} — {choice.reason}", file=sys.stderr)
    summaries = []
    for item in items:
        started = time.monotonic()
        result, source_text = run_caption(item, cfg, choice.client, fetcher, client_reason=choice.reason)
        paths = write_outputs(result, source_text, out_dir, item.item_id or item.title)
        summary = {
            "item_id": item.item_id,
            "title": item.title,
            "status": result.get("status"),
            "skip_reason": result.get("skip_reason"),
            "recommendation": result.get("recommendation"),
            "checks_passed": (result.get("checks") or {}).get("passed"),
            "judge_counts": (result.get("judge") or {}).get("counts"),
            "cost_total_usd": result.get("cost_total_usd"),
            "calls": len(result.get("calls") or []),
            "elapsed_s": round(time.monotonic() - started, 1),
            "paths": paths,
        }
        print(f"[caption] {item.item_id or item.title[:30]}: {summary['status']} "
              f"{summary['skip_reason'] or summary['recommendation'] or ''}", file=sys.stderr)
        summaries.append(summary)
    return summaries
