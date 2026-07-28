#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests>=2.31"]
# ///
"""빈 날짜(카드가 없는 날)를 과거 뉴스로 채우는 백필 스크립트.

RSS/Reddit 은 최근 글만 제공하므로, 과거 날짜는 Hacker News Algolia API
(날짜 범위 검색 지원, 인증 불필요)를 소스로 사용한다.
선정 기준은 auto_daily 의 개발자 우선순위 스코어링을 그대로 재사용한다.

사용:
  # page.tsx 의 빈 날짜를 자동 탐지해 엔트리 JSON 생성
  uv run backfill_dates.py --output /tmp/backfill.json

  # 이후 이미지 생성 → 병합 → 발행
  uv run lib/pipeline.py --mode backfill --input /tmp/backfill.json --output /tmp/backfill_done.json
  python3 lib/merge_and_publish.py /tmp/backfill_done.json /tmp/all.json
  uv run lib/publish.py --entries /tmp/all.json
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
import time
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from auto_daily import (  # noqa: E402
    PAGE_TSX,
    detect_theme,
    existing_slugs_and_max_id,
    priority_score,
    slugify,
)

HN_SEARCH = "https://hn.algolia.com/api/v1/search"
HN_ITEM = "https://news.ycombinator.com/item?id="
USER_AGENT = "gotechy-card-news-backfill/1.0 (+https://dev-gotech-lab.kugll9606.workers.dev)"

# 카테고리 분류 (compositor.CATEGORY_STYLE: ai/dev/trend/news)
# 단어 경계 필수 — "ai" 를 부분 문자열로 두면 "explained"/"available" 이 AI 로 분류된다.
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("ai", [r"\bai\b", r"\bllm\b", r"\bgpt", r"claude", r"gemini", r"llama",
            r"\bmodels?\b", r"neural", r"machine learning", r"transformer",
            r"inference", r"\bagents?\b", r"anthropic", r"openai", r"deepseek",
            r"qwen", r"mistral", r"diffusion", r"\bkimi\b", r"open[- ]weights?"]),
    ("dev", [r"\brust\b", r"python", r"javascript", r"typescript", r"golang",
             r"\bzig\b", r"elixir", r"\bjulia\b", r"\bjdk\b", r"\bjava\b",
             r"compiler", r"kernel", r"database", r"postgres", r"sqlite", r"linux",
             r"\bgit\b", r"github", r"\bapi\b", r"framework", r"library",
             r"open[- ]source", r"releases?\b", r"programming", r"\bcode\b",
             r"developer", r"debug", r"performance", r"browser", r"webassembly",
             r"runtime", r"version control", r"notebook", r"\bhomebrew\b"]),
    ("trend", [r"startup", r"funding", r"acquisition", r"industry", r"\bmarket\b",
               r"hiring", r"remote work", r"community"]),
]
_CATEGORY_RE = [(cat, re.compile("|".join(pats), re.IGNORECASE)) for cat, pats in CATEGORY_RULES]

# 백필 제외 — 개발 카드로 부적절한 소재
EXCLUDE_PATTERNS = [
    r"^ask hn:.*\b(salary|job|hiring|who is)\b",
    r"\b(died|dies|death|obituary|passed away)\b",
    r"\b(war|shooting|invasion|terror)\b",
]

MIN_POINTS = 80
HITS_PER_DAY = 40
REQUEST_DELAY_S = 0.5


def log(msg: str) -> None:
    print(f"[backfill] {msg}", file=sys.stderr)


def find_gap_dates(end_date: dt.date) -> list[dt.date]:
    """page.tsx 의 created_at 을 읽어 첫 카드 ~ end_date 사이의 빈 날짜 반환."""
    text = PAGE_TSX.read_text()
    dates = {dt.date.fromisoformat(m) for m in re.findall(r'created_at: "([0-9-]+)"', text)}
    if not dates:
        return []
    gaps, cur = [], min(dates)
    while cur <= end_date:
        if cur not in dates:
            gaps.append(cur)
        cur += dt.timedelta(days=1)
    return gaps


def fetch_hn_day(day: dt.date, min_points: int) -> list[dict]:
    """해당 날짜(UTC) 하루치 HN 스토리를 포인트 조건으로 조회."""
    start = int(dt.datetime.combine(day, dt.time.min, dt.timezone.utc).timestamp())
    end = start + 86_400
    resp = requests.get(
        HN_SEARCH,
        params={
            "tags": "story",
            "numericFilters": f"created_at_i>{start},created_at_i<{end},points>{min_points}",
            "hitsPerPage": HITS_PER_DAY,
        },
        headers={"User-Agent": USER_AGENT},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json().get("hits", [])


def is_excluded(title: str) -> bool:
    low = title.lower()
    return any(re.search(p, low) for p in EXCLUDE_PATTERNS)


def classify_category(title: str, summary: str) -> str:
    blob = f"{title} {summary}"
    for category, pattern in _CATEGORY_RE:
        if pattern.search(blob):
            return category
    return "news"


def fetch_summary(url: str, fallback: str) -> str:
    """기사 페이지의 og:description / meta description 을 요약으로 사용."""
    if not url or not url.startswith("http"):
        return fallback
    try:
        resp = requests.get(
            url, headers={"User-Agent": USER_AGENT}, timeout=8, allow_redirects=True
        )
        if resp.status_code != 200 or "html" not in resp.headers.get("content-type", ""):
            return fallback
        head = resp.text[:200_000]
        for pattern in (
            r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']',
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)',
        ):
            m = re.search(pattern, head, re.IGNORECASE)
            if m:
                text = html.unescape(m.group(1)).strip()
                text = re.sub(r"\s+", " ", text)
                if len(text) > 30:
                    return text[:240]
    except requests.exceptions.RequestException:
        pass
    return fallback


def hit_to_candidate(hit: dict) -> dict:
    """HN hit → priority_score 가 이해하는 후보 dict (reddit 스코어 체계 재사용)."""
    return {
        "source": "reddit",  # base = min(points/25, 40) 스코어 체계 공유
        "title": (hit.get("title") or "").strip(),
        "selftext": (hit.get("story_text") or "")[:1500],
        "score": int(hit.get("points") or 0),
        "url": hit.get("url") or f"{HN_ITEM}{hit.get('objectID')}",
        "objectID": hit.get("objectID"),
    }


def build_entry(cand: dict, new_id: int, day: dt.date) -> dict:
    title = cand["title"]
    raw_summary = re.sub(r"<[^>]+>", " ", cand.get("selftext") or "").strip()
    summary = fetch_summary(cand["url"], raw_summary or title)[:240]
    tags = re.findall(r"[A-Z][a-zA-Z0-9.]+", title)[:3] or ["Tech", "Dev"]
    return {
        "id": new_id,
        "slug": slugify(title),
        "title": title,
        "summary": summary,
        "content": "",
        "category": classify_category(title, summary),
        "external_link": cand["url"],
        "tags": tags,
        "created_at": day.isoformat(),
        "span": "",
        "theme": detect_theme(title, summary),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="빈 날짜를 HN 과거 뉴스로 백필")
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--end", type=dt.date.fromisoformat,
                    default=dt.date.today() - dt.timedelta(days=1),
                    help="백필 종료일 (기본: 어제)")
    ap.add_argument("--min-points", type=int, default=MIN_POINTS)
    ap.add_argument("--limit", type=int, help="처리할 최대 날짜 수 (테스트용)")
    ap.add_argument("--dry-run", action="store_true", help="선정 결과만 출력")
    ap.add_argument("--shortlist", type=int, metavar="N",
                    help="날짜별 상위 N개 후보를 JSON 으로 출력 (사람/LLM 최종 선정용)")
    ap.add_argument("--picks", type=Path,
                    help="{날짜: url} 형태의 확정 선정 JSON — 이 항목으로 엔트리 생성")
    args = ap.parse_args()

    gaps = find_gap_dates(args.end)
    if args.limit:
        gaps = gaps[: args.limit]
    if not gaps:
        log("빈 날짜 없음")
        return 0

    existing_slugs, max_id = existing_slugs_and_max_id()
    log(f"빈 날짜 {len(gaps)}일 / 기존 카드 {len(existing_slugs)}건 (max_id={max_id})")

    used_slugs = set(existing_slugs)
    used_urls: set[str] = set()
    entries: list[dict] = []
    next_id = max_id + 1
    shortlist: dict[str, list[dict]] = {}
    picks = json.loads(args.picks.read_text()) if args.picks else None

    for day in gaps:
        try:
            hits = fetch_hn_day(day, args.min_points)
        except requests.exceptions.RequestException as e:
            log(f"{day} 조회 실패: {e}")
            continue

        ranked = sorted(
            (c for c in (hit_to_candidate(h) for h in hits) if c["title"]),
            key=priority_score,
            reverse=True,
        )
        available = [
            c for c in ranked
            if slugify(c["title"])
            and slugify(c["title"]) not in used_slugs
            and c["url"] not in used_urls
            and not is_excluded(c["title"])
        ]

        if args.shortlist:
            shortlist[day.isoformat()] = [
                {"title": c["title"], "url": c["url"], "points": c["score"],
                 "score": round(priority_score(c))}
                for c in available[: args.shortlist]
            ]
            time.sleep(REQUEST_DELAY_S)
            continue

        if picks is not None:
            wanted = picks.get(day.isoformat())
            picked = next((c for c in available if c["url"] == wanted), None)
            if picked is None and wanted:
                log(f"{day} 확정 선정 URL 을 후보에서 못 찾음 — 점수 1위로 대체")
        else:
            picked = None
        if picked is None:
            picked = available[0] if available else None

        if not picked:
            log(f"{day} 후보 없음 (hits={len(hits)}) — 건너뜀")
            continue

        if args.dry_run:
            log(f"{day} → [{priority_score(picked):.0f}] {picked['title'][:60]}")
        else:
            entry = build_entry(picked, next_id, day)
            entries.append(entry)
            log(f"{day} → id={entry['id']} [{entry['category']}] {entry['title'][:55]}")
            next_id += 1

        used_slugs.add(slugify(picked["title"]))
        used_urls.add(picked["url"])
        time.sleep(REQUEST_DELAY_S)

    if args.shortlist:
        args.output.write_text(json.dumps(shortlist, ensure_ascii=False, indent=2))
        log(f"후보 {sum(len(v) for v in shortlist.values())}건 / {len(shortlist)}일 → {args.output}")
        return 0

    if args.dry_run:
        return 0

    args.output.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
    log(f"{len(entries)}건 → {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
