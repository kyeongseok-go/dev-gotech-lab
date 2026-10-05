/**
 * 프로젝트 케이스 스터디 요약 (문제 → 접근 → 결과 수치 → 스택 → 링크).
 * 규칙: 모든 문장·수치는 content/projects/*.mdx 의 summary 또는 본문에 이미 적힌 것만 옮긴다.
 * 새 수치를 지어내지 않는다 — 근거가 없으면 칸을 비우고 화면에서 숨긴다.
 * (콘텐츠 MDX 를 고치지 않기 위해 스키마 대신 코드 데이터로 둔다. 근거 위치는 각 항목 주석)
 */
export interface Outcome {
  label: string;
  value: string;
  /** 근거 표기 (화면에 작게 노출) */
  note?: string;
}

export interface CaseStudy {
  problem: string;
  approach: string[];
  outcomes: Outcome[];
  /** 본문 "현재 상태" 절 요약 */
  status?: string;
}

export const CASE_STUDIES: Readonly<Record<string, CaseStudy>> = {
  // park-mate.mdx: 프로젝트 소개 / 10단계 검색 파이프라인 / 핵심 기술 결정 / 트러블슈팅 / 현재 상태, summary "5개 외부 API"
  "park-mate": {
    problem: "주차 정보가 네이버 지도, 카카오 맵, 공공데이터, 실시간 잔여석 서비스에 흩어져 있다.",
    approach: [
      "네이버 → 카카오 → 지역검색 3-레이어 폴백 Geocoding",
      "Claude Haiku 리뷰 분석 + pgvector RAG 의미 검색",
      "SSE 토큰 스트리밍과 Redis 장애 시 캐시 없이 응답하는 graceful degradation",
    ],
    outcomes: [
      { label: "외부 API 연동", value: "5개", note: "summary" },
      { label: "검색 파이프라인", value: "10단계", note: "본문 파이프라인 절" },
      { label: "비장소 제외어 사전", value: "130+ 단어", note: "본문 트러블슈팅" },
    ],
    status: "Streaming(Phase A) 완료, RAG(Phase B) 구현 완료 및 검증 중",
  },
  // youtube-short-automation.mdx: 프로젝트 소개 / 11단계 파이프라인 / AI 모델 표(6행) / "14가지 카테고리" / 현재 상태
  "youtube-short-automation": {
    problem: "YouTube 영상의 인사이트만 뽑아 스크립트·음성·비주얼을 새로 만든 오리지널 쇼츠를 자동으로 만들고 싶다.",
    approach: [
      "Celery 단계별 실행 + PostgreSQL JSONB 체크포인트로 실패한 단계부터 재개",
      "키워드 스코어링으로 카테고리를 감지해 Claude(창작)·Gemini(실시간) 라우팅",
      "실제 음성 길이(actual_duration)를 자막·타임라인·렌더의 기준값으로 고정",
    ],
    outcomes: [
      { label: "파이프라인", value: "11단계", note: "본문" },
      { label: "오케스트레이션 AI 모델", value: "6개", note: "본문 모델 표" },
      { label: "자동 감지 카테고리", value: "14가지", note: "본문" },
    ],
    status: "Milestone v1.0 완료, YouTube 자동 업로드는 v2 로드맵",
  },
  // safe-share.mdx: 프로젝트 소개 / 핵심 플로우(rate-limit, 30일) / 현재 상태
  "safe-share": {
    problem: "선생님이 학부모에게 가정통신문 PDF를 보낼 때 가입 없이 쓸 수 있는 쉬운 방법이 없다.",
    approach: [
      "Node 의존성을 걷어낸 Edge Runtime 전체 채택(Cloudflare Workers)",
      "R2 비공개 버킷 + API proxy 서빙으로 만료·삭제 정책 강제",
      "MIME 대신 %PDF 매직 바이트를 클라이언트·서버에서 이중 검증",
    ],
    outcomes: [
      { label: "서버비", value: "$0/월", note: "summary" },
      { label: "업로드 제한", value: "10/시 · 50/일", note: "본문 핵심 플로우" },
      { label: "하드 삭제 유예", value: "30일", note: "본문 핵심 플로우" },
    ],
    status: "서비스 운영 중 (본문 기준), QR·문서함·신고는 Phase 2",
  },
  // work-mate.mdx: 프로젝트 소개 / 8가지 AI 기능 / 모델 폴백 체인(600ms~10s, 최대 3회) / 화이트라벨 구조(두 파일) / 현재 상태
  "work-mate": {
    problem: "그룹웨어 메신저에 AI를 붙이면 어떤 기능이 실제 체감 차이를 만드는지 토글로 비교해 보고 싶다.",
    approach: [
      "Edge Runtime 에서 SDK 없이 fetch 로 Claude API 직접 호출",
      "모델 폴백 체인 + 지수 백오프로 529·모델 은퇴 장애 대응",
      "잘린 JSON 응답을 복구하는 parseLenientJson",
    ],
    outcomes: [
      { label: "AI 기능", value: "8가지", note: "본문 기능 표" },
      { label: "재시도", value: "최대 3회", note: "본문 (600ms~10s 백오프)" },
      { label: "화이트라벨 교체 파일", value: "2개", note: "본문 화이트라벨 구조" },
    ],
    status: "8가지 기능 구현 완료, 라이브 데모 운영 중",
  },
  // project-b.mdx: 프로젝트 소개 / 주요 기능 / XSS 2단계 검증 / 현재 상태, 테이블 수는 블로그 projectb-dev-chapter2 "13개 테이블"
  "project-b": {
    problem: "핸드메이드 소품샵에서 상품 상세페이지 만들기가 가장 노동집약적인 작업이다.",
    approach: [
      "@dnd-kit 블록형 CMS 상세페이지 편집기 (Zod discriminated union + JSONB)",
      "Supabase RLS 로 고객·관리자 2-role 을 DB 레벨에서 분리",
      "PortOne V2 결제 금액·상태를 서버에서 재검증",
    ],
    outcomes: [
      { label: "Supabase 테이블", value: "13개", note: "블로그 Ch.2" },
      { label: "RLS 역할", value: "2-role", note: "summary" },
      { label: "XSS 검증", value: "2단계", note: "본문 기술 결정" },
    ],
    status: "기본 쇼핑몰 플로우(목록 → 상세 → 결제 → 주문 관리) 완성",
  },
  // gotech-lab.mdx: 프로젝트 소개 / 핵심 기술 결정 / 현재 상태, summary "1주일 MVP 스프린트"
  "gotech-lab": {
    problem: "블로그·포트폴리오·AI 쇼케이스·서비스를 한 사이트에서 운영할 개인 허브가 필요하다.",
    approach: [
      "Velite 빌드타임 MDX 컴파일 + Zod 스키마 검증",
      "OpenNext 어댑터로 Next.js App Router 를 Cloudflare Workers 에서 실행",
      "서비스 데이터·캐시는 D1, 파일은 R2 로 분리",
    ],
    outcomes: [{ label: "첫 배포까지", value: "1주일", note: "summary (MVP 스프린트)" }],
    status: "프로덕션 배포 중, 구독 백엔드·뉴스 크롤러는 Phase 2",
  },
  // eco-devassist.mdx: 프로젝트 소개(4가지 작업) / 6탭 워크플로우 / Mock 데이터(SW 모듈 11개)
  "eco-devassist": {
    problem: "R&D 현장에서 ECO 가 생기면 영향 분석·코드 수정·테스트 작성·보고서를 개발자가 수작업으로 처리한다.",
    approach: [
      "작업별로 특화한 Claude Sonnet 프롬프트 4종",
      "BOM(자재명세서) 트리로 형상변경 영향 시각화",
      "6탭 UI 에서 ECO 선택 컨텍스트를 공유하는 useReducer 상태 관리",
    ],
    outcomes: [
      { label: "자동화한 작업", value: "4가지", note: "본문 프로젝트 소개" },
      { label: "워크플로우 탭", value: "6탭", note: "본문" },
      { label: "Mock SW 모듈", value: "11개", note: "본문 기술 하이라이트" },
    ],
    status: "실무면접 시연용 데모",
  },
  // time-record.mdx: 프로젝트 소개(하루 24슬롯) / 배운 패턴들
  "time-record": {
    problem: "앱 자체보다, 잘 짜인 오픈소스 코드 구조에서 함수형 아키텍처 패턴을 몸으로 익히고 싶다.",
    approach: [
      "Impure-Pure-Impure Sandwich 로 부수효과를 바깥으로",
      "throw 대신 Result 태그드 유니온",
      "Branded Types 와 커스텀 하루 경계(04:00)로 도메인 값 혼용 차단",
    ],
    outcomes: [{ label: "하루 기록 슬롯", value: "24개", note: "본문 (04:00~익일 03:59)" }],
    status: "코드 분석·배포 설정 학습 프로젝트",
  },
};

/** 쇼케이스 ↔ 프로젝트 중복 연결 (내용은 프로젝트 케이스 스터디에 두고 서로 링크만) */
export const SHOWCASE_PROJECT_LINKS: Readonly<Record<string, string>> = {
  parkmate: "park-mate",
  safeshare: "safe-share",
  "projectb-shop": "project-b",
};

export function getCaseStudy(slug: string): CaseStudy | null {
  return CASE_STUDIES[slug] ?? null;
}

export function getShowcaseForProject(projectSlug: string): string | null {
  return Object.entries(SHOWCASE_PROJECT_LINKS).find(([, p]) => p === projectSlug)?.[0] ?? null;
}
