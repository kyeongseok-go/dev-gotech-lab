-- 카드뉴스 테이블
CREATE TABLE IF NOT EXISTS card_news (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  summary       TEXT    NOT NULL DEFAULT '',
  content       TEXT    NOT NULL DEFAULT '',
  category      TEXT    NOT NULL DEFAULT 'news' CHECK (category IN ('ai', 'dev', 'trend', 'news')),
  image_url     TEXT,
  external_link TEXT,
  tags          TEXT    NOT NULL DEFAULT '[]',
  published     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_card_news_category ON card_news (category);
CREATE INDEX IF NOT EXISTS idx_card_news_published ON card_news (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_news_slug ON card_news (slug);
