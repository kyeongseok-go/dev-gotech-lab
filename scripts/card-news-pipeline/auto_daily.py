#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10.0", "PyYAML>=6.0", "requests>=2.31", "feedparser>=6.0", "python-dateutil>=2.9"]
# ///
"""오늘자 카드뉴스 1건을 자동으로 추가하는 데일리 엔드투엔드 스크립트.

흐름:
  1. collect → /tmp/news_daily_<YYYY-MM-DD>.json
  2. 후보 중 page.tsx 와 중복되지 않는 최고 score Reddit 항목 1개 선택
  3. 한국어 제목/요약/태그 자동 생성 (LLM 없이 원제 매핑)
  4. backfill 으로 이미지 생성
  5. merge_and_publish → publish.py
  6. (호출자가 git commit/push)

환경변수:
  REPO_ROOT   레포 루트 (기본: 스크립트 위치 기반)
"""
from __future__ import annotations

import datetime
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
LIB = SCRIPT_DIR / "lib"
REPO_ROOT = Path(os.environ.get("REPO_ROOT", str(SCRIPT_DIR.parent.parent)))
PAGE_TSX = REPO_ROOT / "src" / "app" / "card-news" / "page.tsx"

# theme 추정용 키워드 매핑
THEME_KEYWORDS = {
    "robotics": ["robot", "humanoid", "atlas", "figure", "boston dynamic"],
    "anthropic": ["anthropic", "claude"],
    "openai": ["openai", "gpt", "sam altman"],
    "google_gemini": ["gemini", "google"],
    "meta_llama": ["meta", "llama"],
    "nvidia_gpu": ["nvidia", "gpu", "cuda"],
    "security": ["security", "vulnerab", "exploit", "breach"],
    "video_gen": ["video", "sora", "veo"],
    "kakao": ["kakao", "카카오"],
    "korea_tech": ["toss", "naver", "라인", "line", "쿠팡", "배민", "우아한", "무신사", "여기어때"],
    "agent": ["agent", "tool use", "mcp", "adk"],
    "frontend": ["react", "next.js", "vue", "tailwind"],
    "backend_devops": ["kubernetes", "docker", "aws", "gcp", "azure"],
    "mobile": ["ios", "android", "swift", "kotlin"],
    "news": ["billionaire", "regulation", "politic", "pope"],
}


def slugify(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9가-힣\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip()).lower()
    return s[:60]


def existing_slugs_and_max_id() -> tuple[set[str], int]:
    """page.tsx 에서 기존 slug 와 최대 id 추출."""
    text = PAGE_TSX.read_text()
    slugs = set(re.findall(r'slug:\s*"([^"]+)"', text))
    ids = [int(m) for m in re.findall(r'id:\s*(\d+)', text)]
    return slugs, (max(ids) if ids else 0)


def detect_theme(title: str, summary: str) -> str:
    blob = (title + " " + summary).lower()
    for theme, kws in THEME_KEYWORDS.items():
        for kw in kws:
            if kw in blob:
                return theme
    return "ai_general"


def pick_best(candidates: list[dict], existing_slugs: set[str]) -> dict | None:
    """중복 안 되는 후보 중 Reddit 우선 + score 최고."""
    def normalize(c: dict) -> dict | None:
        title = c.get("title", "").strip()
        if not title:
            return None
        slug = slugify(title)
        if slug in existing_slugs:
            return None
        src = c.get("source")
        if src == "reddit":
            url = c.get("url") or c.get("permalink")
            score = c.get("score", 0)
        elif src == "rss":
            url = c.get("link") or c.get("url")
            score = -1  # rss는 score 없음, 후순위
        else:
            return None
        return {**c, "_slug": slug, "_url": url, "_score": score}

    pool = [x for x in (normalize(c) for c in candidates) if x is not None]
    pool.sort(key=lambda x: x["_score"], reverse=True)
    return pool[0] if pool else None


def build_entry(picked: dict, new_id: int, today: str) -> dict:
    title_raw = picked["title"].strip()
    summary = (picked.get("selftext") or picked.get("summary") or "").strip()
    if not summary:
        summary = title_raw
    summary = summary[:240]
    tags_seed = re.findall(r"[A-Z][a-zA-Z]+", title_raw)[:3] or ["AI", "기술", "트렌드"]
    return {
        "id": new_id,
        "slug": picked["_slug"],
        "title": title_raw,
        "summary": summary,
        "content": "",
        "category": "ai" if picked.get("subreddit") in {"artificial", "MachineLearning"} else "news",
        "external_link": picked["_url"],
        "tags": tags_seed,
        "created_at": today,
        "span": "",
        "theme": detect_theme(title_raw, summary),
    }


def run(cmd: list[str]) -> None:
    print(f"$ {' '.join(cmd)}", file=sys.stderr)
    subprocess.check_call(cmd)


def main() -> int:
    today = datetime.date.today().isoformat()
    collect_out = Path(f"/tmp/news_daily_{today}.json")
    entry_out = Path(f"/tmp/entry_{today}.json")
    entry_done = Path(f"/tmp/entry_{today}_done.json")
    all_entries = Path(f"/tmp/all_entries_{today}.json")

    # 1) collect
    run(["uv", "run", "--quiet", str(LIB / "pipeline.py"),
         "--mode", "collect", "--output", str(collect_out)])

    candidates = json.loads(collect_out.read_text())
    print(f"[auto_daily] {len(candidates)} candidates", file=sys.stderr)

    existing_slugs, max_id = existing_slugs_and_max_id()
    picked = pick_best(candidates, existing_slugs)
    if not picked:
        print("[auto_daily] no new candidate — skip", file=sys.stderr)
        return 0

    entry = build_entry(picked, max_id + 1, today)
    entry_out.write_text(json.dumps([entry], ensure_ascii=False, indent=2))
    print(f"[auto_daily] picked: id={entry['id']} slug={entry['slug']}", file=sys.stderr)

    # 2) backfill image
    run(["uv", "run", "--quiet", str(LIB / "pipeline.py"),
         "--mode", "backfill", "--input", str(entry_out), "--output", str(entry_done)])

    # 3) merge with existing page.tsx entries
    run(["python3", str(LIB / "merge_and_publish.py"), str(entry_done), str(all_entries)])

    # 4) publish to page.tsx
    run(["uv", "run", "--quiet", str(LIB / "publish.py"),
         "--entries", str(all_entries)])

    print(f"[auto_daily] done: {entry['slug']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
