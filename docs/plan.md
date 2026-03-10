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
- [ ] Day 5: D1 + R2 연결 + 서비스 목록 페이지
- [ ] Day 6: 홈 페이지 폴리싱 + 선택적 3D/2D 히어로
- [ ] Day 7: SEO + QA + GitHub 정리 + 배포 + README

## 메모
- Day 2에서 Day 3 범위(블로그 MDX 컴포넌트)와 Day 4 범위(프로젝트/Showcase 목록)를 일부 선행 완료
- Day 3에서 블로그 UX 고도화 완료 (코드 하이라이팅, Callout, TOC, 필터, 네비게이션)
- Day 4에서 about 실내용 + 구독 UI + showcase 상세 + projects 상세 보강 완료
- 구독 백엔드 연동은 Phase 2 (MailerLite/Buttondown/자체 API)
