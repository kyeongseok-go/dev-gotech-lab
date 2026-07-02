#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

git pull --ff-only origin main

if ! uv run scripts/card-news-pipeline/auto_daily.py; then
  echo "[cron] auto_daily failed — abort" >&2
  exit 1
fi

git add src/app/card-news/page.tsx public/card-news/*.png 2>/dev/null || true
if git diff --cached --quiet; then
  echo "[cron] no changes — skip commit"
  exit 0
fi

pnpm install --frozen-lockfile 2>&1 | tail -3
if ! pnpm exec velite build 2>&1 | tail -3; then
  echo "[cron] velite build failed — abort" >&2
  git restore --staged .
  exit 1
fi

TODAY=$(date '+%Y-%m-%d')
TITLE=$(grep -A2 'id: ' src/app/card-news/page.tsx | grep -m1 'title:' | sed 's/.*title: "\([^"]*\)".*/\1/')
git commit -m "chore(card-news): ${TODAY} 자동 업데이트 — ${TITLE}"
git push origin main

echo "[cron] done: ${TITLE}"
