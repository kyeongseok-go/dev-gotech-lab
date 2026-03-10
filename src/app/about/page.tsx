import { PageContainer } from "@/components/layout/page-container";
import { SubscribeForm } from "@/components/subscribe-form";

/* ----------------------------------------------------------------- */
/* 데이터 상수 — 추후 MDX 또는 외부 파일로 분리 가능                    */
/* ----------------------------------------------------------------- */

const PROFILE = {
  name: "고경석",
  headline:
    "Tmax A&C에서 5년간 오피스 SW 엔진을 개발한 경험을 토대로, AI를 활용해 빠르게 제품을 만들고 실험하는 AI Builder로 전환 중인 개발자입니다.",
  email: "kugll9606@gmail.com",
  github: "https://github.com/kyeongseok-go",
};

const CAREER = [
  {
    year: "2019",
    title: "Office SW 안정화 & QA 시스템 구축",
    role: "초급 개발자",
    highlight: "ToHangul·WaplPoint 안정화, TestLink 기반 QA 자동화",
  },
  {
    year: "2020",
    title: "공통 엔진 모듈 설계 & 클라우드 연동",
    role: "백엔드 개발자",
    highlight: "PieceTree 텍스트 엔진, Node.js + Tibero ODBC, Docker 환경 구축",
  },
  {
    year: "2021",
    title: "양식개체 시스템 & 검색 기능 고도화",
    role: "프론트엔드 개발자",
    highlight: "EditBox·ComboBox DOM/Render, Find/Replace 검색 성능 50% 향상",
  },
  {
    year: "2022",
    title: "SuperPoint Architecture 설계 & React 전환",
    role: "시스템 아키텍트",
    highlight: "프레젠테이션 엔진 React 전환, Slide 계층 구조 설계",
  },
  {
    year: "2023",
    title: "공동편집 Message Handler & 썸네일 최적화",
    role: "성능 최적화",
    highlight: "실시간 공동편집, html-to-image + pdf.js 썸네일 40% 성능 향상",
  },
  {
    year: "2024",
    title: "Theme/ClrMap 시스템 & 테스트 자동화",
    role: "풀스택 개발자",
    highlight: "색상 오차율 0% 달성, Jest 테스트 커버리지 95%, 완전 문서화",
  },
];

const SKILLS = {
  "Languages": ["TypeScript", "JavaScript", "Java", "Node.js"],
  "Frontend": ["React", "Next.js", "Tailwind CSS", "HTML/CSS"],
  "Backend & DB": ["Tibero ODBC", "Docker", "Liquibase", "REST API"],
  "Tools & QA": ["Git", "Jest", "TestLink", "pdf.js", "html-to-image"],
};

const INTERESTS = [
  { label: "AI 활용 개발", desc: "AI로 빠르게 MVP를 만들고 실험하는 워크플로우" },
  { label: "웹 풀스택", desc: "Next.js + Cloudflare 기반 서비스 구축" },
  { label: "개발 기록", desc: "블로그를 통한 학습 과정 공유와 포트폴리오 관리" },
  { label: "그 외", desc: "운동, 신앙, 취미 활동을 통한 균형 잡힌 생활" },
];

/* ----------------------------------------------------------------- */
/* 페이지 컴포넌트                                                     */
/* ----------------------------------------------------------------- */

export default function AboutPage() {
  return (
    <PageContainer className="max-w-3xl">
      {/* 소개 */}
      <section className="mb-12">
        <h1 className="text-2xl font-semibold">{PROFILE.name}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {PROFILE.headline}
        </p>
      </section>

      {/* 경력 요약 */}
      <section className="mb-12">
        <h2 className="mb-6 text-lg font-semibold">경력 요약</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Tmax A&C · 오피스 SW 엔진 개발 (2019.08 – 2024.12)
        </p>
        <ol className="relative border-l border-border pl-6 space-y-6">
          {CAREER.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute -left-[1.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {item.year.slice(-2)}
              </span>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{item.title}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {item.role}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.highlight}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 기술 스택 */}
      <section className="mb-12">
        <h2 className="mb-6 text-lg font-semibold">기술 스택</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(SKILLS).map(([category, items]) => (
            <div
              key={category}
              className="rounded-lg border border-border p-4"
            >
              <h3 className="mb-2 text-sm font-medium">{category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 관심 분야 */}
      <section className="mb-12">
        <h2 className="mb-6 text-lg font-semibold">관심 분야</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {INTERESTS.map((item) => (
            <li
              key={item.label}
              className="rounded-lg border border-border p-4"
            >
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 이 사이트에 대해 */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">이 사이트에 대해</h2>
        <p className="leading-7 text-muted-foreground">
          <strong className="text-foreground">gotech.lab</strong>은 기술 블로그,
          포트폴리오, AI 실험 결과, 그리고 작은 서비스들을 한 곳에 모아 공유하기
          위해 만들었습니다. Next.js 16 + Tailwind CSS v4 + Velite MDX로
          구성되어 있으며, Cloudflare Pages에 배포됩니다.
        </p>
      </section>

      {/* 구독 */}
      <section className="mb-12 rounded-lg border border-border bg-muted/30 p-6">
        <h2 className="mb-2 text-lg font-semibold">소식 받기</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          AI 실험, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
        </p>
        <SubscribeForm />
      </section>

      {/* 연락 */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">연락</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href={`mailto:${PROFILE.email}`}
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {PROFILE.email}
            </a>
          </li>
          <li>
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub
            </a>
          </li>
        </ul>
      </section>
    </PageContainer>
  );
}
