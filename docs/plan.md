# 구현 계획

## 진행 규칙
- 맨 위의 미완료 항목부터 수행한다.
- 완료되면 [x]로 체크하고, 어떤 파일을 수정했는지 한 줄로 남긴다.
- 가능하면 GitHub Issue 번호 또는 작업 단위를 함께 메모한다.

## 이번 주 플랜
- [x] Day 0: GitHub 저장소 / Claude Code / 규칙 파일 / Cloudflare 인증 초기화 — 55b4e87
- [x] Day 1: Next.js + Cloudflare + Tailwind + shadcn 기본 구성 — 19c16aa~31145db
  - shadcn/ui 초기화 (radix-nova, CSS variables), ESLint next lint→eslint CLI 마이그레이션
  - SiteHeader / SiteFooter / PageContainer 컴포넌트 생성, RootLayout 연결
  - 페이지 라우트 스텁: /, /blog, /blog/[slug], /projects, /showcase, /about
  - pnpm preview (Cloudflare Workers 로컬) 기동 확인
- [x] Day 2: Velite + MDX + 기본 라우트 + 레이아웃 — 4db4971~현재
  - Velite 설치 및 3개 컬렉션 스키마 (blog/projects/showcase), next.config.ts 연동
  - MDXContent 렌더링 컴포넌트, src/lib/content.ts 조회 유틸
  - /blog 목록·상세 (SSG 3개), /projects 목록·상세 (SSG 2개), /showcase 목록 (3개)
  - 홈 최신 콘텐츠 섹션 (blog 3 / projects 2 / showcase 3 + 더보기)
  - ESLint ignore에 .open-next, .velite 추가
- [x] Day 3: 블로그 목록/상세 + MDX 컴포넌트 — 780328f~af570b5
  - rehype-pretty-code + Shiki 코드 하이라이팅 (github-dark-default 테마)
  - MDX 커스텀 컴포넌트: Callout(info/warning/tip), Table 스타일링, Image(figure) 래퍼
  - 읽기 시간 표시 + 이전/다음 글 네비게이션
  - h2/h3 기반 정적 TOC (anchor 링크)
  - /blog 카테고리·태그 필터 (URL searchParams 기반)
- [x] Day 4: 프로젝트 / 소개 / 구독 / AI Showcase 목록 — 6d70eff~b30b37e
  - /about 실내용: 경력 타임라인(2019–2024), 기술 스택, 관심 분야, 사이트 소개
  - 구독 폼 UI: SubscribeForm 재사용 컴포넌트, /subscribe 페이지 + /about 하단
  - /showcase/[slug] 상세 페이지 (SSG, status 뱃지, 외부 링크, 목록 네비게이션)
  - 프로젝트 상세 메타 보강 (techStack 뱃지, repo/demo 링크, 목록 네비게이션)
- [x] Day 5: D1 + R2 연결 + 서비스 목록 페이지 — 299cfac~bceafbf
  - D1 스키마: service_registry, news_cache, feature_flags + 시드 데이터
  - D1 접근 레이어: src/lib/db/ (services, news, flags 조회 함수)
  - R2 바인딩 + src/lib/storage/ (경로 빌더 + put/get/delete 헬퍼)
  - /services 목록 페이지 (D1 기반, 헤더 네비게이션 추가)
  - /services/news 뉴스 애그리게이터 MVP (카테고리 필터, fallback UI)
- [x] Day 6: 홈 페이지 폴리싱 + 선택적 3D/2D 히어로
  - 2D 히어로 섹션: 도트 패턴 배경 + 카피 + 키워드 태그 + CTA 버튼
  - 키워드 태그 CSS float 애니메이션 (prefers-reduced-motion 대응)
  - 홈 섹션 정리: 프로젝트·Showcase 카드에 상세 Link 추가
  - 서비스 섹션 추가 (D1 getServices 기반, fallback UI)
  - 구독 CTA 섹션 (SubscribeForm 포함, 하단 배치)
  - 광고 placeholder 컴포넌트 (AdPlaceholder, 블로그↔프로젝트 사이)
  - 3D는 성능·일정 리스크 판단 후 의도적 제외 (Phase 2 검토)
- [ ] Day 7: SEO + QA + GitHub 정리 + 배포 + README

## 메모
- Day 2에서 Day 3 범위(블로그 MDX 컴포넌트)와 Day 4 범위(프로젝트/Showcase 목록)를 일부 선행 완료
- Day 3에서 블로그 UX 고도화 완료 (코드 하이라이팅, Callout, TOC, 필터, 네비게이션)
- Day 4에서 about 실내용 + 구독 UI + showcase 상세 + projects 상세 보강 완료
- 구독 백엔드 연동은 Phase 2 (MailerLite/Buttondown/자체 API)
- Day 5에서 D1/R2 인프라 + 서비스 허브 + 뉴스 MVP 완료
- 뉴스 실제 외부 수집 자동화는 Phase 2 (크롤러/RSS/스케줄러)
- Day 6에서 홈 히어로 + 섹션 정리 + 구독 CTA + 광고 placeholder 완료
- 다크모드 토글, 3D 히어로는 Phase 2 검토 대상
