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


# ── 개발자 관점 우선순위 스코어링 ──────────────────────────────
# 목표: "개발자에게 가장 중요한 소식"을 하루 1건 선정.
# 출처 점수(0~40) + 키워드 가점/감점의 합으로 순위를 매긴다. LLM 없이 결정적으로 동작.
PRIORITY_BOOSTS: list[tuple[int, list[str]]] = [
    # 모델/제품 출시·발표 — 개발자에게 가장 실질적인 뉴스
    (25, ["release", "launch", "announc", "출시", "발표", "공개", "unveil", "ships",
          "now available", "weights"]),
    # 주요 AI 개발사/모델
    (20, ["claude", "anthropic", "openai", "gpt", "gemini", "llama", "deepseek",
          "mistral", "qwen", "kimi"]),
    # 개발 도구·생태계
    (15, ["open source", "open-source", "오픈소스", "sdk", "api", "mcp", "agent",
          "cli", "framework", "dev tool", "copilot", "ide"]),
    # 기술 심층/연구
    (10, ["benchmark", "paper", "research", "연구", "아키텍처", "최적화", "성능 개선"]),
]
PRIORITY_PENALTIES: list[tuple[int, list[str]]] = [
    # 개발과 거리가 먼 소재
    (-25, ["politic", "regulation", "lawsuit", "sues", "billionaire", "election",
           "stock", "share price", "주가", "소송"]),
    (-10, ["opinion", "unpopular", "meme", "rant"]),
]

_REDDIT_SCORE_CAP = 40      # reddit upvote → 0~40 정규화 상한
_RSS_WEIGHT_SCALE = 40      # rss feed weight(0.0~1.0) → 0~40


def priority_score(c: dict) -> float:
    """출처 기본 점수 + 키워드 가점/감점."""
    if c.get("source") == "reddit":
        # 실제 upvote(수백~수천) 와 .rss 폴백 합성 score(999-i) 모두 40점 근처로 수렴
        base = min(c.get("score", 0) / 25, _REDDIT_SCORE_CAP)
    else:
        base = float(c.get("weight", 0.5)) * _RSS_WEIGHT_SCALE

    blob = f"{c.get('title', '')} {c.get('summary', '') or c.get('selftext', '')}".lower()
    for points, keywords in PRIORITY_BOOSTS + PRIORITY_PENALTIES:
        if any(kw in blob for kw in keywords):
            base += points
    return base


def pick_best(candidates: list[dict], existing_slugs: set[str]) -> dict | None:
    """중복되지 않는 후보 중 개발자 우선순위 점수 최고 항목 선정."""
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
        elif src == "rss":
            url = c.get("link") or c.get("url")
        else:
            return None
        return {**c, "_slug": slug, "_url": url, "_score": priority_score(c)}

    pool = [x for x in (normalize(c) for c in candidates) if x is not None]
    pool.sort(key=lambda x: x["_score"], reverse=True)
    if pool:
        top = pool[0]
        print(
            f"[auto_daily] priority top3: "
            + " | ".join(f"{p['_score']:.0f}:{p['title'][:40]}" for p in pool[:3]),
            file=sys.stderr,
        )
        return top
    return None


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
