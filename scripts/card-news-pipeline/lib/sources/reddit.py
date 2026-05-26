#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests>=2.31"]
# ///
"""Reddit hot posts fetcher.

Reddit 공개 JSON 엔드포인트(.json suffix)를 통해 인증 없이 핫 글을 수집한다.
실제 글 URL(`permalink` 기반)과 본문 미리보기, 점수 등을 구조화하여 반환.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import asdict, dataclass
from typing import Iterable

import requests

DEFAULT_SUBREDDITS = [
    "artificial",
    "technology",
    "MachineLearning",
    "LocalLLaMA",
    "OpenAI",
    "ClaudeAI",
    "singularity",
]
USER_AGENT = "tech-news-pipeline/0.1 (by /u/eunsukko128)"
BASE = "https://www.reddit.com"


@dataclass
class RedditPost:
    id: str
    subreddit: str
    title: str
    selftext: str
    score: int
    num_comments: int
    created_utc: float
    permalink: str           # https://www.reddit.com/r/.../comments/<id>/...
    url: str                 # 외부 링크 (있으면) 또는 permalink 와 동일
    author: str
    flair: str | None


def fetch_subreddit(subreddit: str, limit: int = 10, time_filter: str = "day") -> list[RedditPost]:
    """top.json + hot.json 둘 다 시도하여 핫 글 수집."""
    url = f"{BASE}/r/{subreddit}/top.json?t={time_filter}&limit={limit}"
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    posts: list[RedditPost] = []
    for child in data.get("data", {}).get("children", []):
        d = child.get("data", {})
        if d.get("stickied"):
            continue
        permalink = f"{BASE}{d.get('permalink', '')}"
        posts.append(
            RedditPost(
                id=d.get("id", ""),
                subreddit=subreddit,
                title=d.get("title", ""),
                selftext=d.get("selftext", "")[:1500],
                score=int(d.get("score", 0)),
                num_comments=int(d.get("num_comments", 0)),
                created_utc=float(d.get("created_utc", 0)),
                permalink=permalink,
                url=d.get("url_overridden_by_dest") or d.get("url") or permalink,
                author=d.get("author", ""),
                flair=d.get("link_flair_text"),
            )
        )
    return posts


def fetch_all(
    subreddits: Iterable[str] = DEFAULT_SUBREDDITS,
    limit_per_sub: int = 5,
    time_filter: str = "day",
    min_score: int = 50,
) -> list[RedditPost]:
    """모든 서브레딧을 순회하며 핫 글을 수집. 서브레딧 간 1s 간격 (rate-limit 회피)."""
    all_posts: list[RedditPost] = []
    for sr in subreddits:
        try:
            posts = fetch_subreddit(sr, limit=limit_per_sub, time_filter=time_filter)
            filtered = [p for p in posts if p.score >= min_score]
            all_posts.extend(filtered)
        except requests.HTTPError as e:
            print(f"[reddit] {sr} skipped: {e}", file=sys.stderr)
        time.sleep(1)
    all_posts.sort(key=lambda p: p.score, reverse=True)
    return all_posts


def main() -> int:
    ap = argparse.ArgumentParser(description="Fetch hot Reddit posts as structured JSON.")
    ap.add_argument("--subreddits", nargs="+", default=DEFAULT_SUBREDDITS)
    ap.add_argument("--limit", type=int, default=5, help="per subreddit")
    ap.add_argument("--time", default="day", choices=["hour", "day", "week"])
    ap.add_argument("--min-score", type=int, default=50)
    args = ap.parse_args()

    posts = fetch_all(args.subreddits, args.limit, args.time, args.min_score)
    json.dump([asdict(p) for p in posts], sys.stdout, ensure_ascii=False, indent=2)
    print(f"\n[reddit] {len(posts)} posts collected", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
