# Day 0~7 Claude 프롬프트

## Day 0 시작 프롬프트

지금부터 이 저장소의 초기 구조를 세팅한다.

반드시 먼저:
1. docs/techspec.md를 읽고
2. docs/plan.md를 읽고
3. 현재 작업 범위를 5줄 이내로 요약해라.

이번 작업 범위:
- Next.js 15 App Router + TypeScript + Tailwind CSS v4 프로젝트 초기화
- pnpm 사용
- Cloudflare Pages/Workers 배포를 위한 OpenNext Cloudflare 설정
- src/ 디렉토리 구조
- 기본 라우트 생성: /(home), /blog, /projects, /about, /subscribe, /services, /showcase
- GitHub 기준 README와 .gitignore 점검
- wrangler.toml 초안 생성

제약:
- 한 번에 너무 많은 파일을 만들지 말고, 먼저 생성할 파일 목록을 보여줘.
- 구현 후 실행 명령어와 검증 방법을 적어줘.
- 설명은 전부 한국어로 해라.

## Day 1 디자인 시스템 프롬프트

다음 작업만 수행해라.

범위:
- shadcn/ui 초기화
- 기본 레이아웃
- Navbar
- Footer
- 다크모드
- Inter + JetBrains Mono 폰트 적용

제약:
- Aceternity UI는 아직 넣지 말고 shadcn/ui 기본만 사용
- globals.css와 layout 관련 파일만 우선 수정
- 완료 후 어떤 컴포넌트를 다음 단계에서 추가하면 좋은지 3개만 추천

## Day 2 Velite + MDX 프롬프트

이번 작업은 콘텐츠 파이프라인만 만든다.

목표:
- Velite 설정
- blog / projects / showcase 컬렉션 정의
- content/blog/hello-world/index.mdx 샘플 생성
- content/projects/first-project/index.mdx 샘플 생성
- content/showcase/ai-tool-demo/index.mdx 샘플 생성
- 리스트에서 읽어올 수 있는 최소 데이터 구조 완성

제약:
- 아직 검색, RSS, OG는 구현하지 말 것
- 타입 안정성을 유지할 것
- 나중에 category 페이지를 만들기 쉬운 구조로 설계할 것

## Day 3 블로그 시스템 프롬프트

이번 작업은 블로그 목록/상세만 구현한다.

필수:
- /blog 목록
- /blog/[slug] 상세
- 카테고리 배지
- 날짜
- 태그
- 읽는 시간
- TOC
- 코드 하이라이팅
- 관련 글 3개

제약:
- 서비스 페이지나 3D 코드는 건드리지 말 것
- MDX 커스텀 컴포넌트는 필요한 최소 3개만 먼저 구현
- 변경 파일이 많아지면 단계로 나눠서 진행안 제시 후 코드 작성

## Day 4 프로젝트/About/Subscribe/Showcase 프롬프트

이번 작업은 다음 페이지를 구현한다.

- /projects
- /projects/[slug]
- /about
- /subscribe
- /showcase
- /showcase/[slug]

요구사항:
- 프로젝트는 케이스 스터디 카드 중심
- About은 Tmax A&C 5년 경력과 이후 개인 프로젝트 방향이 드러나야 함
- Subscribe는 아직 UI만 구현
- Showcase는 AI로 개발한 웹/앱 기능을 계속 추가할 수 있는 목록형 구조
- 각 카드에는 GitHub 링크, 데모 링크, 기술 스택, 한 줄 요약이 들어간다

제약:
- 과한 애니메이션 금지
- 접근성과 가독성 우선
- 각 페이지의 핵심 섹션 구조를 먼저 요약하고 구현

## Day 5 D1 + R2 + Services 프롬프트

이번 작업은 데이터 레이어와 서비스 목록 뼈대만 구현한다.

목표:
- D1 마이그레이션 파일 생성
- 공개 데이터용 테이블 최소 설계
- R2 helper 초안
- /services 목록 페이지 구현

주의:
- 콘텐츠 원문은 절대 D1에 넣지 말 것
- 파일 저장은 R2 단일 원천으로 유지할 것
- Supabase는 아직 연결하지 말 것
- 실서비스는 아직 만들지 말고 카드/상태/설명만 구현할 것

## Day 6 홈 폴리싱 프롬프트

이번 작업은 홈 화면 품질을 높인다.

목표:
- 최신 글
- 최신 프로젝트
- 최신 AI Showcase
- 서비스 바로가기
- 뉴스레터 CTA
- 2D 히어로 또는 여유가 있으면 가벼운 3D 히어로

제약:
- 초기 로딩 성능을 해치지 말 것
- 3D는 선택 기능이며 실패 시 바로 2D로 폴백할 것
- 퍼스트 뷰는 텍스트 가독성을 우선할 것

## Day 7 SEO/QA/GitHub 정리 프롬프트

이번 작업은 배포 가능한 상태 마무리다.

필수:
- metadata 정리
- sitemap
- robots
- RSS
- README
- GitHub PR 템플릿/이슈 템플릿 점검
- Cloudflare 배포 스크립트 점검
- 수동 QA 체크리스트 작성

제약:
- 빌드 실패 가능성이 있는 장식 요소보다 안정성을 우선
- 최종적으로 다음 주 backlog 5개를 제안
