# gotech.lab

개인 홈페이지 + 기술 블로그 + 서비스 플랫폼 MVP.

5년간의 오피스 SW 엔진 개발 경험과 AI를 활용한 빠른 프로토타이핑 과정을 기록하고 공유하는 공간입니다.

## 주요 기능

- **블로그** — MDX 기반 기술 글, 코드 하이라이팅(Shiki), 카테고리/태그 필터, TOC, RSS 피드
- **프로젝트** — 포트폴리오 프로젝트 목록 및 상세 (기술 스택, 데모/GitHub 링크)
- **AI Showcase** — AI를 활용해 만든 실험과 프로토타입 모음
- **서비스 허브** — D1 기반 서비스 목록, 뉴스 애그리게이터 MVP
- **구독** — 이메일 구독 폼 UI (백엔드 연동은 Phase 2)
- **SEO** — 페이지별 metadata, sitemap.xml, robots.txt, RSS 2.0

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui |
| 콘텐츠 | MDX + Velite (빌드 타임 컴파일) |
| 코드 하이라이팅 | rehype-pretty-code + Shiki |
| 데이터 | Cloudflare D1 (SQLite) |
| 파일 저장 | Cloudflare R2 |
| 배포 | Cloudflare Pages + Workers (OpenNext adapter) |
| 패키지 매니저 | pnpm |

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 9+

### 설치 및 개발

```bash
git clone https://github.com/kyeongseok-go/dev-gotech-lab.git
cd dev-gotech-lab
pnpm install

# 환경변수 설정
cp .env.example .env.local

# 개발 서버
pnpm dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### Cloudflare 로컬 프리뷰

```bash
# D1 마이그레이션 적용 (최초 1회)
pnpm wrangler d1 migrations apply gotech-lab-db --local

# Workers 런타임으로 로컬 실행
pnpm preview
```

### 배포

```bash
pnpm deploy
```

## 콘텐츠 관리

콘텐츠는 `content/` 디렉토리의 MDX 파일로 관리됩니다. Velite가 빌드 타임에 컴파일합니다.

```
content/
  blog/         # 블로그 글 (.mdx)
  projects/     # 프로젝트 (.mdx)
  showcase/     # AI Showcase (.mdx)
```

각 MDX 파일의 frontmatter에 title, date, description, tags 등을 정의합니다.
`draft: true`로 설정하면 빌드에서 제외됩니다.

## 데이터 인프라

| 저장소 | 역할 | 현재 상태 |
|--------|------|----------|
| **Velite (MDX)** | 블로그, 프로젝트, Showcase 원본 콘텐츠 | 사용 중 |
| **Cloudflare D1** | 서비스 목록, 뉴스 캐시, 피처 플래그 | 사용 중 |
| **Cloudflare R2** | 이미지, 썸네일, OG 이미지 | 헬퍼 구현 완료, 실사용 Phase 2 |
| **Supabase** | 인증, 댓글, 구독, 멤버십 | Phase 2 예정 |

D1 스키마는 `migrations/` 디렉토리에서 관리합니다.

## 폴더 구조

```
src/
  app/              # App Router 페이지 및 라우트
    blog/           # 블로그 목록/상세
    projects/       # 프로젝트 목록/상세
    showcase/       # AI Showcase 목록/상세
    services/       # 서비스 목록, 뉴스
    about/          # 소개
    subscribe/      # 구독
    sitemap.ts      # 사이트맵
    robots.ts       # robots.txt
    rss.xml/        # RSS 피드
  components/
    layout/         # SiteHeader, SiteFooter, PageContainer
    blog/           # BlogFilter
    mdx/            # MDXContent, Callout, Toc
  lib/
    constants.ts    # 사이트 상수 (URL, 이름)
    content.ts      # Velite 컬렉션 조회 유틸
    db/             # D1 접근 레이어 (services, news, flags)
    storage/        # R2 헬퍼 (경로 빌더, put/get/delete)
content/            # MDX 콘텐츠 원본
migrations/         # D1 SQL 마이그레이션
```

## 향후 계획 (Phase 2)

- [ ] Supabase 연동 (인증, 댓글, 구독 백엔드)
- [ ] 뉴스 외부 수집 자동화 (크롤러/RSS/스케줄러)
- [ ] R2 이미지 업로드 및 OG 이미지 동적 생성
- [ ] 다크모드 토글
- [ ] 3D 히어로 (성능 검증 후)
- [ ] 광고/파트너 콘텐츠 실연동
