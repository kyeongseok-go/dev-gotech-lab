-- 0001_initial_schema.sql
-- D1 최소 스키마: 서비스 레지스트리 / 뉴스 캐시 / 기능 플래그

-- 서비스 목록 (/services 페이지용)
CREATE TABLE IF NOT EXISTS service_registry (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL UNIQUE,
  title      TEXT    NOT NULL,
  description TEXT   NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'wip' CHECK (status IN ('live', 'wip', 'archived')),
  url        TEXT,
  repo_url   TEXT,
  icon       TEXT,
  featured   INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 뉴스 캐시 (뉴스 애그리게이터 MVP)
CREATE TABLE IF NOT EXISTS news_cache (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  url          TEXT    NOT NULL UNIQUE,
  summary      TEXT,
  source       TEXT    NOT NULL,
  category     TEXT    NOT NULL DEFAULT 'general',
  published_at TEXT,
  fetched_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_cache_category ON news_cache (category);
CREATE INDEX IF NOT EXISTS idx_news_cache_fetched  ON news_cache (fetched_at DESC);

-- 기능 플래그 (배포 없이 기능 토글)
CREATE TABLE IF NOT EXISTS feature_flags (
  key         TEXT    PRIMARY KEY,
  enabled     INTEGER NOT NULL DEFAULT 0,
  description TEXT    NOT NULL DEFAULT ''
);
