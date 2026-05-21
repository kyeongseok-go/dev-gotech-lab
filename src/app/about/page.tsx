import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SubscribeForm } from "@/components/subscribe-form";
import { Mail, Github, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeading } from "@/components/section/page-heading";
import { SectionLabel } from "@/components/section/section-label";
import { ColorCard } from "@/components/section/color-card";
import { Reveal } from "@/components/motion/reveal";

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

export default function AboutPage() {
  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
      {/* ── 헤더 ── */}
      <PageHeading
        eyebrow="About · 고경석"
        size="xl"
        title={
          <>
            Hello,<br />
            <span className="display-accent display-accent-violet">기술</span>자.
          </>
        }
        lead={
          <>
            오피스 SW 엔진을 <span className="text-em">5년 5개월</span> 다룬 풀스택 엔지니어이자,
            <span className="text-em-coral"> AI를 페어 파트너로 빠르게 빌드</span>하는 1인 개발자입니다.
          </>
        }
      />

      {/* ── 프로필 카드 ── */}
      <Reveal className="mb-24" as="section">
        <div className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 md:col-span-5 relative">
            <div className="ambient-glow absolute -inset-2" />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden ghost-border">
              <Image
                src="/images/profile-id.jpg"
                alt={PROFILE.name}
                fill
                className="object-cover"
                style={{ objectPosition: "50% 15%" }}
                sizes="(max-width:768px) 100vw, 40vw"
                priority
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 flex flex-col justify-between">
            <ColorCard variant="card-c2" className="p-7 md:p-9 flex flex-col h-full justify-between">
              <div>
                <SectionLabel className="mb-5 !text-black/70">Currently</SectionLabel>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold leading-tight mb-4">
                  AI-native<br />Full-stack Engineer
                </h2>
                <p className="type-small c-sub leading-relaxed mb-5">
                  엔진 개발의 정밀함과 AI 빠른 빌드 사이클을 결합합니다. 문서 포맷 분석부터
                  DB·서버·클라이언트·동시편집까지 풀스택으로 책임지던 사고를, 지금은 AI 페어 환경에서
                  동일하게 굴립니다.
                </p>
                <p className="font-code text-[11px] tracking-wide c-sub opacity-75 leading-relaxed">
                  {PROFILE.edu}<br />
                  {PROFILE.service}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href={`mailto:${PROFILE.email}`}
                  className="font-headline font-semibold text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/15 hover:bg-black/25 transition-colors"
                >
                  <Mail size={14} /> Email
                </Link>
                <Link
                  href={PROFILE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-headline font-semibold text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/15 hover:bg-black/25 transition-colors"
                >
                  <Github size={14} /> GitHub
                </Link>
              </div>
            </ColorCard>
          </div>
        </div>
      </Reveal>

      {/* ── Slogan ── */}
      <Reveal className="mb-24" as="section">
        <div className="cta-atmos p-8 md:p-12">
          <SectionLabel className="mb-5">Slogan</SectionLabel>
          <h2 className="font-headline text-3xl md:text-5xl font-semibold leading-tight text-on-surface mb-4">
            Go! Build the <span className="display-accent">Technology,</span><br />
            more <span className="display-accent display-accent-coral">Easy.</span>
          </h2>
          <p className="type-body text-on-surface-variant max-w-xl">
            기술이 사람의 삶에 닿을 때, 비로소 쉬워집니다.
          </p>
        </div>
      </Reveal>

      {/* ── Strengths (이력서 5가지 핵심 역량) ── */}
      <section className="mb-24">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={STRENGTHS.length}>Strengths</SectionLabel>
            <ArrowDownRight className="corner-arrow" strokeWidth={1} />
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRENGTHS.map((s, i) => (
            <Reveal key={s.idx} index={i} as="div">
              <article className="process-row tilt-card h-full">
                <span className="idx">// {s.idx}</span>
                <div className="flex-1">
                  <h3 className="font-headline text-lg font-semibold mb-1 text-on-surface">{s.title}</h3>
                  <p className="type-small c-sub leading-relaxed">{s.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Career ── */}
      <section className="mb-24">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={CAREER.length}>Career</SectionLabel>
            <span className="font-code text-xs text-on-surface-muted">2019 — 2024 · 5y 5m</span>
          </div>
        </Reveal>

        <Reveal className="mb-6" as="div">
          <div className="grid grid-cols-12 rounded-2xl overflow-hidden ghost-border bg-surface-container-low">
            <div className="col-span-12 md:col-span-4 relative min-h-[200px]">
              <Image
                src="/images/hero-main.jpg"
                alt="Tmax A&C"
                fill
                className="object-cover object-[center_18%]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="col-span-12 md:col-span-8 p-7 md:p-9 flex flex-col justify-center">
              <SectionLabel className="mb-3">티맥스 A&amp;C → 티맥스가이아</SectionLabel>
              <h3 className="font-headline text-2xl md:text-3xl font-semibold text-on-surface mb-2">
                Office SW <span className="display-accent">Engine</span> Dev
              </h3>
              <p className="font-code text-sm text-do-primary mb-4 tracking-wide">
                2019.08 – 2024.12 · 5년 5개월
              </p>
              <p className="type-small text-on-surface-variant leading-relaxed">
                담당 제품: <span className="text-em">ToHangul → SuperWord(WaplWord) → SuperPoint(WaplPoint/A.Point)</span>.
                문서 포맷 파서/라이터, 공동편집, 색상/테마 시스템, 성능 최적화, 문서화까지 풀스택으로 수행.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="space-y-3">
          {CAREER.map((c, i) => (
            <Reveal key={c.idx} index={i} as="div">
              <article className={`process-row ${"active" in c && c.active ? "process-row--active" : ""}`}>
                <span className="idx">// {c.idx}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h4 className="font-headline font-semibold text-lg">{c.title}</h4>
                    <span className="font-code text-[10px] tracking-wider opacity-75 c-sub">
                      {c.period} · {c.team}
                    </span>
                  </div>
                  <p className="type-small c-sub leading-relaxed">{c.highlight}</p>
                </div>
                <ArrowUpRight size={18} className="opacity-50 shrink-0" />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Post-Tmax · AI 협업 프로젝트 ── */}
      <section className="mb-24">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={POST_TMAX.length}>Post-Tmax · 2025 ~</SectionLabel>
            <span className="font-code text-xs text-on-surface-muted">AI 협업 1인 개발</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POST_TMAX.map((p, i) => (
            <Reveal key={p.name} index={i} as="div">
              <div className="tilt-card h-full">
                <ColorCard index={i + 1} className="p-7 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline text-xl md:text-2xl font-semibold">{p.name}</h3>
                    <ArrowUpRight size={16} className="opacity-60" />
                  </div>
                  <p className="type-small c-sub leading-relaxed mb-5 flex-1">{p.desc}</p>
                  <span className="font-code text-[10px] uppercase tracking-widest opacity-70">
                    {p.tag}
                  </span>
                </ColorCard>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Skills (이력서 7개 카테고리) ── */}
      <section className="mb-24">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={SKILLS.length}>Skills</SectionLabel>
            <ArrowDownRight className="corner-arrow" strokeWidth={1} />
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {SKILLS.map((s, i) => (
            <Reveal key={s.label} index={i} as="div">
              <div className="tilt-card h-full">
                <ColorCard index={i} className="p-7 h-full flex flex-col">
                  <SectionLabel className="mb-5 !text-black/70">{s.label}</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {s.items.map((skill) => (
                      <span
                        key={skill}
                        className="font-code text-xs px-3 py-1.5 rounded-full bg-black/15"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </ColorCard>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── AI Tools ── */}
      <section className="mb-24">
        <Reveal>
          <SectionLabel count={AI_TOOLS.length} className="mb-10">AI Toolbox</SectionLabel>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AI_TOOLS.map((g, i) => (
            <Reveal key={g.label} index={i} as="div">
              <article className="process-row tilt-card h-full">
                <span className="idx">// 0{i + 1}</span>
                <div className="flex-1">
                  <h4 className="font-headline font-semibold mb-2 text-on-surface">{g.label}</h4>
                  <p className="font-code text-[11px] tracking-wide c-sub leading-relaxed">
                    {g.items.join(" · ")}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 희망 직무 ── */}
      <Reveal className="mb-24" as="section">
        <SectionLabel className="mb-5">Looking for</SectionLabel>
        <p className="type-headline text-on-surface leading-snug mb-3">
          <span className="display-accent">AI 응용 개발자</span> · SW 아키텍트 · 풀스택 엔지니어
        </p>
        <p className="font-code text-sm text-on-surface-muted tracking-wide">
          Node.js · React · TypeScript · Next.js · Claude API
        </p>
      </Reveal>

      {/* ── 이 사이트에 대해 ── */}
      <Reveal className="mb-24" as="section">
        <SectionLabel className="mb-5">About this site</SectionLabel>
        <p className="type-body text-on-surface-variant leading-relaxed max-w-3xl">
          <strong className="text-on-surface">GoTechy</strong>는 기술 블로그,
          포트폴리오, <span className="text-em">AI 실험 결과</span>, 그리고 작은 서비스들을
          한 곳에 모아 공유하기 위해 만들었습니다.
          <span className="text-em-coral"> Next.js 16 (App Router) + Tailwind CSS v4 + Velite MDX</span>로
          구성, Cloudflare Pages에 배포됩니다.
        </p>
      </Reveal>

      {/* ── 구독 CTA ── */}
      <Reveal className="mb-16" as="section">
        <div className="cta-atmos p-8 md:p-12">
          <SectionLabel className="mb-4">Newsletter</SectionLabel>
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-on-surface mb-3">
            소식 <span className="display-accent">받기</span>.
          </h2>
          <p className="type-small text-on-surface-variant mb-7 max-w-md">
            AI 실험, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
          </p>
          <SubscribeForm />
        </div>
      </Reveal>

      {/* ── Contact ── */}
      <section>
        <Reveal>
          <SectionLabel className="mb-8">Contact</SectionLabel>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="process-row tilt-card group"
          >
            <Mail size={20} className="text-do-primary" />
            <span className="font-code text-sm text-on-surface flex-1">{PROFILE.email}</span>
            <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100" />
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="process-row tilt-card group"
          >
            <Github size={20} className="text-do-primary" />
            <span className="font-code text-sm text-on-surface flex-1">GitHub</span>
            <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100" />
          </a>
        </div>
      </section>
    </main>
  );
}
