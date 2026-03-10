-- 0002_seed_data.sql
-- 최소 시드 데이터

-- 서비스 레지스트리
INSERT INTO service_registry (slug, title, description, status, url, featured, sort_order) VALUES
  ('news-aggregator', 'AI 뉴스 애그리게이터', 'AI·개발 관련 뉴스를 자동으로 수집하고 요약합니다.', 'wip', '/services/news', 1, 1),
  ('url-shortener', 'URL 단축기', '긴 URL을 짧은 링크로 변환하는 간단한 유틸리티.', 'wip', NULL, 0, 2);

-- 뉴스 캐시 (샘플)
INSERT INTO news_cache (title, url, summary, source, category, published_at) VALUES
  ('Claude 4.5 출시 — 새로운 AI 코딩 경험', 'https://example.com/claude-4-5', 'Anthropic이 Claude 4.5를 출시했습니다. 코드 생성과 분석 능력이 대폭 향상되었습니다.', 'Anthropic Blog', 'ai', '2026-03-08'),
  ('Next.js 16 App Router 변경점 정리', 'https://example.com/nextjs-16', 'Next.js 16에서 변경된 App Router 관련 주요 사항을 정리합니다.', 'Vercel Blog', 'dev', '2026-03-07'),
  ('Cloudflare D1 GA — 서버리스 SQL의 미래', 'https://example.com/d1-ga', 'Cloudflare D1이 정식 출시되었습니다. SQLite 기반 서버리스 데이터베이스의 가능성을 살펴봅니다.', 'Cloudflare Blog', 'dev', '2026-03-06');

-- 기능 플래그
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('subscribe_form', 1, '구독 폼 활성화 여부'),
  ('news_fetcher', 0, '뉴스 자동 수집 활성화 여부'),
  ('dark_mode_toggle', 1, '다크모드 토글 표시 여부');
