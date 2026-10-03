import type { Metadata } from "next";
import Image from "next/image";
import { SubscribeForm } from "@/components/subscribe-form";
import { Mail, Github, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/section/page-heading";
import { LabHead } from "@/components/section/lab-head";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/constants";
import { padNumber } from "@/lib/format";
import portraitFront from "../../../public/images/portrait-front.webp";
import avatar from "../../../public/images/avatar.webp";

export const metadata: Metadata = {
  title: "소개",
  description: "오피스 SW 엔진 5년 5개월 · AI 응용 풀스택 엔지니어 고경석의 소개·경력·기술 스택.",
  alternates: { canonical: "/about" },
};

const PROFILE = {
  name: "고경석",
  nameEn: "Go Kyeongseok",
  role: "Office SW Engine 5y 5m · AI-native Full-stack",
  email: "kugll9606@gmail.com",
  github: "https://github.com/kyeongseok-go",
  edu: "광운대학교 컴퓨터 소프트웨어 전공",
  service: "공군 15특수임무비행단 만기제대",
} as const;

/** 이력서의 5가지 핵심 역량 */
const STRENGTHS = [
  {
    idx: "01",
    title: "외부 스펙 매핑",
    desc: "OOXML·HWP·HWPX 등 복잡한 문서 포맷과 외부 스펙을 분석해 자사 시스템에 매핑하는 설계 역량.",
  },
  {
    idx: "02",
    title: "풀스택 구현",
    desc: "DB 스키마부터 서버 로직·클라이언트 렌더링·공동편집까지 전 계층을 연결하는 풀스택 구현 역량.",
  },
  {
    idx: "03",
    title: "안정성 중심",
    desc: "성능 최적화·테스트 환경 자동화·Docker 운영 환경까지 고려하는 안정성 중심 개발 역량.",
  },
  {
    idx: "04",
    title: "자기주도 학습",
    desc: "AI 결과물의 품질을 검증·판단하고, 새 AI 기술을 자료가 아닌 코드로 익히는 자기주도 학습 자세.",
  },
  {
    idx: "05",
    title: "자산화·문서화",
    desc: "아키텍처 문서·이관 가이드·인수인계 자료를 체계화해, 팀이 이어갈 수 있는 형태로 자산화하는 문화.",
  },
] as const;

/** 이력서의 주요 프로젝트 (티맥스 5y 5m 동안의 4단계) */
const CAREER = [
  {
    idx: "01",
    period: "2019.08 – 2021.06",
    team: "PK팀 → PK3-3팀",
    title: "한글 워드프로세서 신규 기능 + QA 체계",
    highlight:
      "각주·미주·새로 객체(31개 속성)·문서화·표 바꾸기·조회부호·메모 등 9개 기능을 HWP 바이너리 스펙 분석부터 DOM·매니저·다이얼로그·명령 처리기까지 단독 책임. TestLink 기반 QA로 5년간 350건+ 케이스 누적.",
  },
  {
    idx: "02",
    period: "2020.07 – 2020.12",
    team: "PK3-3팀",
    title: "KERIS 클라우드 환경 연동 인프라",
    highlight:
      "온프레미스 오피스 SW 제품을 한국교육학술정보원 클라우드에 제공. Node.js + Tibero ODBC segfault를 libtbodbc 라이브러리 버전으로 좁혀 해결, 서버 4종을 환경변수 기반으로 일원화. Docker 가이드 2종 사내 배포.",
  },
  {
    idx: "03",
    period: "2022.01 – 2023.09",
    team: "OF2-3팀",
    title: "차세대 워드프로세서 공동편집 + 댓글 시스템",
    highlight:
      "공동편집 7개 기능(댓글·텍스트 상자·그룹 댓글·그림·줄바꿈·탭·하이퍼링크)을 insert/update/delete 3-command 체계로 통일 설계. 댓글 시스템 단독 담당, hwpx 파일 30개+ 구현. 페이지 썸네일을 pdf.js / html-to-image 두 버전으로 동시 설계.",
    active: true,
  },
  {
    idx: "04",
    period: "2023.10 – 2024.12",
    team: "GA2-3팀",
    title: "차세대 프레젠테이션 풀스택 + 팀장 대행",
    highlight:
      "글머리 기호(ListStyle)를 DB 스키마부터 클라이언트·동시편집까지 풀스택 메인 담당, 49건+ 이슈 처리. ColorMap ClrMap 1:N 관계를 별도 테이블 신규 설계로 풀어냄. Jest 환경 7~9초 → 3초 단축, 슬라이드 엔진 72페이지 아키텍처 문서화, 3주 팀장 대행 + 인수인계 4건 완료.",
  },
] as const;

const POST_TMAX = [
  {
    name: "WorkMate",
    desc: "그룹웨어 환경 AI 통합 데모. Claude Code 기반 SDD로 8개 기능 단독 기획·배포. 모델 retire를 단일 소스 수정으로 6개 LLM 라우트 동시 복구.",
    tag: "Next.js 14 · Claude API · Zustand",
  },
  {
    name: "ParkMate",
    desc: "AI 기반 주차 탐색 웹앱. 카카오·네이버·공공데이터 멀티소스 + Claude Haiku로 TOP 3 추천. v2에서 pgvector RAG + SSE 토큰 스트리밍 진행.",
    tag: "Vercel · Railway · pgvector",
  },
  {
    name: "Gotechy-Wiki",
    desc: "Karpathy의 LLM Wiki 패턴을 Obsidian에 적용한 개인 지식 파이프라인. raw/wiki/Output 3-layer + ingest·query·lint 자동화.",
    tag: "Obsidian · RAG · LLM Wiki",
  },
  {
    name: "ProjectB",
    desc: "이커머스 플랫폼. AI 생성 상품 상세를 관리자 검수 흐름과 분리해, 할루시네이션이 최종 사용자에 도달하기 전에 명시적으로 검토되도록 설계.",
    tag: "Admin Flow · AI Curation",
  },
] as const;

const SKILLS = [
  { label: "Language", items: ["TypeScript", "JavaScript / Node.js", "C++", "Java"] },
  { label: "Frontend", items: ["Next.js 14 (App Router)", "React", "Tailwind CSS", "shadcn/ui", "Zustand", "MobX"] },
  { label: "Backend / DB", items: ["Node.js", "Express", "Tibero ODBC", "PostgreSQL", "pgvector", "Redis", "MyBatis", "Liquibase"] },
  { label: "Infra / Hosting", items: ["Docker", "Vercel", "Railway", "Cloudflare Workers"] },
  { label: "Testing", items: ["Jest", "TestLink"] },
  { label: "AI / LLM", items: ["Anthropic Claude API (Haiku)", "OpenAI API", "ElevenLabs TTS"] },
  { label: "Domain", items: ["OOXML / HWP / HWPX", "공동편집 시스템", "RAG", "SSE Streaming"] },
] as const;

const AI_TOOLS = [
  { label: "Development", items: ["Claude Code", "Cursor", "GitHub Copilot", "Replit"] },
  { label: "Productivity", items: ["Cowork", "Gamma", "Figma", "Sora"] },
  { label: "Research", items: ["Perplexity", "Genspark", "ChatGPT", "Gemini", "Grok"] },
] as const;

/** 티맥스 5년 5개월 동안 담당한 제품 계보 (경력 블록 — 인물 사진 대신) */
const PRODUCT_LINEAGE = [
  { name: "ToHangul", note: "한글 워드프로세서" },
  { name: "SuperWord", note: "WaplWord · 차세대 워드" },
  { name: "SuperPoint", note: "WaplPoint / A.Point · 프레젠테이션" },
] as const;

export default function AboutPage() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PROFILE.name,
    alternateName: PROFILE.nameEn,
    url: `${SITE_URL}/about`,
    jobTitle: "풀스택 엔지니어",
    email: `mailto:${PROFILE.email}`,
    sameAs: [PROFILE.github],
    alumniOf: { "@type": "CollegeOrUniversity", name: "광운대학교" },
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <JsonLd data={person} />
      <PageHeading
        eyebrow="About · 고경석"
        size="xl"
        title={
          <>
            Hello, <span className="marker">기술</span>자.
          </>
        }
        lead={
          <>
            오피스 SW 엔진을 <span className="text-em">5년 5개월</span> 다룬 풀스택 엔지니어이자,
            <span className="text-em"> AI를 페어 파트너로 빠르게 빌드</span>하는 1인 개발자입니다.
          </>
        }
      />

      {/* ── 프로필: 정면 상반신 누끼(베이지 재킷)를 청사진 도판 위에 — 홈(착석·검은 재킷)과 다른 포즈 ── */}
      <section aria-labelledby="profile-title" className="grid grid-cols-12 gap-x-6 lg:gap-x-12 gap-y-10 items-stretch">
        <figure className="col-span-12 sm:col-span-8 sm:col-start-3 md:col-span-6 md:col-start-auto lg:col-span-5">
          <div className="crop-frame">
            <span aria-hidden className="crop crop-tl" />
            <span aria-hidden className="crop crop-tr" />
            <span aria-hidden className="crop crop-bl" />
            <span aria-hidden className="crop crop-br" />
            {/* 청사진(중간 명도) 도판: 밝은 재킷과 검은 머리가 모두 바탕과 분리된다 */}
            <div className="plate plate-b pt-[12%]">
              <span className="plate-label left-3 top-3">Fig. 02</span>
              <span className="plate-label right-3 top-3 opacity-80">Portrait · front</span>
              <span aria-hidden className="plate-scale left-3 top-8 w-[18%]" />
              <Image
                src={portraitFront}
                alt="고경석 — 베이지 재킷에 흰 티셔츠 차림으로 정면을 보며 웃는 상반신 사진"
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 36vw, (min-width: 768px) 46vw, (min-width: 640px) 64vw, 92vw"
                className="relative z-[1] mx-auto block h-auto w-full"
              />
            </div>
          </div>
          <figcaption className="fig-cap mt-6">
            <span className="fig-no">Fig. 02</span>
            <span>
              <span className="font-semibold text-on-surface">고경석</span> · Go Kyeongseok — 서울에서 기록하는 풀스택 엔지니어.
            </span>
          </figcaption>
        </figure>

        <div className="col-span-12 md:col-span-6 lg:col-span-7 flex flex-col justify-between gap-10">
          <dl className="spec-table">
            {[
              { k: "Name", v: `${PROFILE.name} · ${PROFILE.nameEn}` },
              { k: "Role", v: PROFILE.role },
              { k: "Base", v: "Seoul, KR" },
              { k: "Mail", v: PROFILE.email },
              { k: "Edu.", v: PROFILE.edu },
              { k: "Mil.", v: PROFILE.service },
            ].map(({ k, v }) => (
              <div key={k} className="contents">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="abstract-box">
            <h2 id="profile-title" className="font-code text-xs uppercase tracking-[0.12em] text-on-surface-muted">Currently · 지금</h2>
            <p className="mt-4 type-headline text-on-surface">AI-native Full-stack Engineer</p>
            <p className="mt-4 type-body text-on-surface-variant">
              엔진 개발의 정밀함과 AI 빠른 빌드 사이클을 결합합니다. 문서 포맷 분석부터 DB·서버·클라이언트·동시편집까지
              풀스택으로 책임지던 사고를, 지금은 AI 페어 환경에서 동일하게 굴립니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${PROFILE.email}`} className="btn-primary inline-flex h-11 px-5 text-sm">
                <Mail aria-hidden size={14} /> 이메일 보내기
              </a>
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex h-11 px-5 text-sm">
                <Github aria-hidden size={14} /> GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 슬로건: 제사(epigraph) — 잉크 룰 사이 큰 인용 ── */}
      <section aria-labelledby="slogan-title" className="epigraph mt-24 grid grid-cols-12 gap-x-6 gap-y-6">
        <p className="col-span-12 lg:col-span-3 font-code text-xs uppercase tracking-[0.12em] text-on-surface-muted">
          Epigraph · 슬로건
        </p>
        <div className="col-span-12 lg:col-span-9">
          <h2 id="slogan-title" className="type-display text-on-surface">
            Go! Build the <span className="marker">Technology,</span>
            <br />
            more Easy.
          </h2>
          <p className="lead-rule mt-8 type-body text-on-surface-variant max-w-xl">기술이 사람의 삶에 닿을 때, 비로소 쉬워집니다.</p>
        </div>
      </section>

      {/* ── 강점 ── */}
      <section aria-labelledby="strengths-title" className="mt-24 md:mt-32">
        <LabHead index="01" id="strengths-title" title="Strengths · 핵심 역량" meta={padNumber(STRENGTHS.length, 2)} />
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {STRENGTHS.map((s) => (
            <li key={s.idx} className="process-row">
              <span className="idx">{s.idx}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-[-0.015em] text-on-surface">{s.title}</h3>
                <p className="mt-1 type-small c-sub">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 경력: 제품 계보 + 4단계 ── */}
      <section aria-labelledby="career-title" className="mt-24 md:mt-32">
        <LabHead index="02" id="career-title" title="Career · 티맥스 A&C → 티맥스가이아" meta="2019.08 – 2024.12 · 5y 5m" />
        <div className="abstract-box">
          <p className="font-code text-xs uppercase tracking-[0.12em] text-on-surface-muted">Office SW Engine Dev · 담당 제품 계보</p>
          <ol className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline border border-hairline">
            {PRODUCT_LINEAGE.map((p, i) => (
              <li key={p.name} className="bg-surface-container-low p-5">
                <p className="font-code text-xs tabular text-do-primary">{String(i + 1).padStart(2, "0")} <span className="text-on-surface-muted">{i < PRODUCT_LINEAGE.length - 1 ? "→" : ""}</span></p>
                <p className="mt-2 type-title text-on-surface">{p.name}</p>
                <p className="mt-1 type-small text-on-surface-variant">{p.note}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 type-small text-on-surface-variant">
            문서 포맷 파서/라이터, 공동편집, 색상/테마 시스템, 성능 최적화, 문서화까지 풀스택으로 수행.
          </p>
        </div>

        <ol className="mt-8">
          {CAREER.map((c) => (
            <li key={c.idx} className={`process-row ${"active" in c && c.active ? "process-row--active" : ""}`}>
              <span className="idx">{c.idx}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-[-0.015em] text-on-surface">{c.title}</h3>
                  <span className="font-code text-xs tabular text-on-surface-muted">
                    {c.period} · {c.team}
                  </span>
                </div>
                <p className="mt-1 type-small c-sub">{c.highlight}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 퇴사 후 AI 협업 프로젝트 ── */}
      <section aria-labelledby="post-title" className="mt-24 md:mt-32">
        <LabHead index="03" id="post-title" title="Post-Tmax · 2025 ~ AI 협업 1인 개발" meta={padNumber(POST_TMAX.length, 2)} />
        <ul className="grid grid-cols-1 md:grid-cols-2 border-l border-t border-hairline">
          {POST_TMAX.map((p) => (
            <li key={p.name} className="flex flex-col border-r border-b border-hairline p-6 md:p-7">
              <h3 className="type-title text-on-surface">{p.name}</h3>
              <p className="mt-2 flex-1 type-small text-on-surface-variant">{p.desc}</p>
              <p className="mt-5 font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">{p.tag}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 기술 스택 ── */}
      <section aria-labelledby="skills-title" className="mt-24 md:mt-32">
        <LabHead index="04" id="skills-title" title="Skills · 기술 스택" meta={padNumber(SKILLS.length, 2)} />
        <dl className="border-b border-hairline">
          {SKILLS.map((s) => (
            <div key={s.label} className="grid grid-cols-12 gap-x-6 gap-y-3 border-t border-hairline py-5">
              <dt className="col-span-12 md:col-span-3 type-label text-on-surface pt-1.5">{s.label}</dt>
              <dd className="col-span-12 md:col-span-9 flex flex-wrap gap-1.5">
                {s.items.map((skill) => (
                  <span key={skill} className="tag-chip font-code !text-xs !font-medium">{skill}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── AI 도구 ── */}
      <section aria-labelledby="tools-title" className="mt-24 md:mt-32">
        <LabHead index="05" id="tools-title" title="AI Toolbox" meta={padNumber(AI_TOOLS.length, 2)} />
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-10">
          {AI_TOOLS.map((g, i) => (
            <li key={g.label} className="process-row">
              <span className="idx">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <h3 className="font-bold text-on-surface">{g.label}</h3>
                <p className="mt-1 font-code text-xs leading-relaxed text-on-surface-variant">{g.items.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 희망 직무 + 이 사이트 ── */}
      <section aria-labelledby="looking-title" className="mt-24 md:mt-32 grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 id="looking-title" className="section-label">Looking for</h2>
          <p className="mt-5 type-headline text-on-surface">
            <span className="marker">AI 응용 개발자</span> · SW 아키텍트 · 풀스택 엔지니어
          </p>
          <p className="mt-3 font-code text-sm text-on-surface-muted">Node.js · React · TypeScript · Next.js · Claude API</p>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <h2 className="section-label">About this site</h2>
          <p className="mt-5 type-small text-on-surface-variant">
            <strong className="text-on-surface">GoTechy</strong>는 기술 블로그, 포트폴리오, AI 실험 결과, 작은 서비스들을 한 곳에
            모아 공유하기 위해 만들었습니다. Next.js 16 (App Router) + Tailwind CSS v4 + Velite MDX 로 구성하고 Cloudflare
            에 배포합니다.
          </p>
        </div>
      </section>

      {/* ── 구독 ── */}
      <section aria-labelledby="newsletter-title" className="mt-24 md:mt-32 cta-atmos p-8 md:p-12">
        <p className="type-label text-on-surface-muted">Newsletter</p>
        <h2 id="newsletter-title" className="mt-4 type-headline text-on-surface">
          소식 <span className="marker">받기</span>.
        </h2>
        <p className="mt-3 mb-7 type-small text-on-surface-variant max-w-md">AI 실험, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.</p>
        <SubscribeForm />
      </section>

      {/* ── 연락 ── */}
      <section aria-labelledby="contact-title" className="mt-24 md:mt-32">
        <LabHead index="06" id="contact-title" title="Contact · 연락" />
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-4 flex items-center gap-4">
            <div className="plate size-20 flex-none">
              <Image src={avatar} alt="" width={80} height={80} sizes="80px" className="relative z-[1] size-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-on-surface">{PROFILE.name}</p>
              <p className="font-code text-xs text-on-surface-muted">{PROFILE.nameEn}</p>
            </div>
          </div>
          <ul className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 border-l border-t border-hairline">
            <li className="border-r border-b border-hairline">
              <a href={`mailto:${PROFILE.email}`} className="group flex items-center gap-3 p-5 transition-colors hover:bg-surface-container-low active:bg-surface-container focus-visible:outline-offset-[-2px]">
                <Mail aria-hidden size={18} className="text-on-surface" />
                <span className="flex-1 font-code text-sm text-on-surface">{PROFILE.email}</span>
                <ArrowUpRight aria-hidden size={16} className="text-on-surface-muted" />
              </a>
            </li>
            <li className="border-r border-b border-hairline">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-5 transition-colors hover:bg-surface-container-low active:bg-surface-container focus-visible:outline-offset-[-2px]">
                <Github aria-hidden size={18} className="text-on-surface" />
                <span className="flex-1 font-code text-sm text-on-surface">github.com/kyeongseok-go</span>
                <ArrowUpRight aria-hidden size={16} className="text-on-surface-muted" />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
