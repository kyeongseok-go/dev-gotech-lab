#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["feedparser>=6.0", "PyYAML>=6.0", "python-dateutil>=2.9"]
# ///
"""RSS aggregator.

config/rss_feeds.yaml 의 enabled=true 피드만 수집한다.
각 글의 실제 원문 URL (피드의 <link>) 을 보존하여 카드 entry 의 source.original_url 로 사용.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import feedparser
import yaml
from dateutil import parser as dtp

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "rss_feeds.yaml"


@dataclass
class RssPost:
    feed_name: str
    publisher: str
    title: str
    summary: str
    link: str               # 실제 원문 URL
    published: str | None   # ISO8601
    tags: list[str]
    weight: float


def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    with path.open() as f:
        return yaml.safe_load(f)


def _parse_published(entry: feedparser.FeedParserDict) -> datetime | None:
    for key in ("published", "updated", "pubDate"):
        raw = entry.get(key)
        if not raw:
            continue
        try:
            dt = dtp.parse(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except (ValueError, TypeError):
            continue
    return None


def _strip_html(text: str, max_len: int = 500) -> str:
    """가벼운 태그 제거. BeautifulSoup 의존성 없이."""
    import re
    cleaned = re.sub(r"<[^>]+>", "", text or "")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:max_len]


def fetch_feed(feed_cfg: dict[str, Any], max_age_hours: int, max_items: int) -> list[RssPost]:
    parsed = feedparser.parse(feed_cfg["url"])
    if parsed.bozo and not parsed.entries:
        raise RuntimeError(f"feedparser failed: {feed_cfg['url']} ({parsed.bozo_exception})")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    posts: list[RssPost] = []
    for entry in parsed.entries[:max_items * 3]:  # 여유 있게 받아서 cutoff 로 거른다
        published = _parse_published(entry)
        if published and published < cutoff:
            continue
        posts.append(
            RssPost(
                feed_name=feed_cfg["name"],
                publisher=feed_cfg.get("publisher", ""),
                title=entry.get("title", "").strip(),
                summary=_strip_html(entry.get("summary", "") or entry.get("description", "")),
                link=entry.get("link", "").strip(),
                published=published.isoformat() if published else None,
                tags=feed_cfg.get("tags", []),
                weight=float(feed_cfg.get("weight", 1.0)),
            )
        )
        if len(posts) >= max_items:
            break
    return posts


def fetch_all(config: dict[str, Any] | None = None) -> list[RssPost]:
    cfg = config or load_config()
    coll = cfg.get("collection", {})
    max_age = int(coll.get("max_age_hours", 48))
    per_feed = int(coll.get("max_items_per_feed", 5))

    all_posts: list[RssPost] = []
    for feed_cfg in cfg.get("feeds", []):
        if not feed_cfg.get("enabled"):
            continue
        try:
            all_posts.extend(fetch_feed(feed_cfg, max_age, per_feed))
        except Exception as e:
            print(f"[rss] {feed_cfg['name']} skipped: {e}", file=sys.stderr)
        time.sleep(0.3)

    # 가중치 적용 후 정렬 (단순히 weight 기준; 후속 단계에서 Claude 가 큐레이션)
    all_posts.sort(key=lambda p: p.weight, reverse=True)
    return all_posts


def main() -> int:
    ap = argparse.ArgumentParser(description="Aggregate Korean tech blog RSS feeds.")
    ap.add_argument("--config", type=Path, default=CONFIG_PATH)
    args = ap.parse_args()

    posts = fetch_all(load_config(args.config))
    json.dump([asdict(p) for p in posts], sys.stdout, ensure_ascii=False, indent=2)
    print(f"\n[rss] {len(posts)} posts collected", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
