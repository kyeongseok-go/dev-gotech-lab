#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests>=2.31"]
# ///
"""Reddit hot posts fetcher.

Reddit 핫 글을 OAuth 토큰으로 `oauth.reddit.com`에서 수집한다.
(공개 `.json` 엔드포인트는 2023년 API 정책 변경 이후 비인증 접근을 403으로 차단함)

인증:
  - app-only OAuth (`client_credentials` grant) — Reddit 비밀번호 불필요, client_id/secret만 필요
  - 자격증명은 환경변수 또는 gitignore된 `config/reddit_oauth.env` 파일에서 로드
  - 자격증명이 없으면 공개 엔드포인트로 폴백(대개 403 → 호출자가 skip 처리)
등록 방법: README.md 의 "Reddit OAuth 설정" 참고.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
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
BASE = "https://www.reddit.com"             # permalink / 토큰 엔드포인트
OAUTH_BASE = "https://oauth.reddit.com"     # 인증된 데이터 엔드포인트

# 자격증명 파일 (gitignore 대상). lib/sources/ → card-news-pipeline/config/
CREDS_FILE = Path(__file__).resolve().parents[2] / "config" / "reddit_oauth.env"
_CRED_KEYS = (
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET",
    "REDDIT_USERNAME",
    "REDDIT_PASSWORD",
)
_token_cache: dict = {}


def _load_creds() -> dict[str, str]:
    """파일 → 환경변수 순으로 자격증명 로드(환경변수가 파일을 덮어씀)."""
    creds: dict[str, str] = {}
    if CREDS_FILE.exists():
        for line in CREDS_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            creds[key.strip()] = val.strip().strip('"').strip("'")
    for key in _CRED_KEYS:
        env_val = os.environ.get(key)
        if env_val:
            creds[key] = env_val
    return creds


def _get_token() -> str | None:
    """OAuth access token 발급(캐시). 자격증명 없으면 None."""
    creds = _load_creds()
    client_id = creds.get("REDDIT_CLIENT_ID")
    client_secret = creds.get("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None

    now = time.time()
    if _token_cache.get("token") and _token_cache.get("exp", 0) > now + 30:
        return _token_cache["token"]

    username = creds.get("REDDIT_USERNAME")
    password = creds.get("REDDIT_PASSWORD")
    if username and password:
        # script 앱 + 계정 자격증명 (rate-limit 약간 더 높음)
        data = {"grant_type": "password", "username": username, "password": password}
    else:
        # app-only: 공개 읽기 전용. 비밀번호 불필요.
        data = {"grant_type": "client_credentials"}

    resp = requests.post(
        f"{BASE}/api/v1/access_token",
        data=data,
        auth=(client_id, client_secret),
        headers={"User-Agent": USER_AGENT},
        timeout=15,
    )
    resp.raise_for_status()
    payload = resp.json()
    token = payload.get("access_token")
    _token_cache["token"] = token
    _token_cache["exp"] = now + int(payload.get("expires_in", 3600))
    return token


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
    """인증된 oauth.reddit.com(토큰 있을 때) 또는 공개 엔드포인트(폴백)에서 핫 글 수집."""
    token = _get_token()
    headers = {"User-Agent": USER_AGENT}
    if token:
        host = OAUTH_BASE
        headers["Authorization"] = f"bearer {token}"
    else:
        host = BASE
    url = f"{host}/r/{subreddit}/top.json?t={time_filter}&limit={limit}"
    resp = requests.get(url, headers=headers, timeout=15)
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
        except requests.exceptions.RequestException as e:
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
