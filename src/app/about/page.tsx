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
  description: "오피스 SW 엔진 개발자의 기술 블로그 · 포트폴리오 · AI 실험 공간입니다.",
  alternates: { canonical: "/about" },
};

const PROFILE = {
  name: "고경석",
  role: "AI Builder · Full-stack Developer",
  email: "kugll9606@gmail.com",
  github: "https://github.com/kyeongseok-go",
} as const;

const CAREER = [
  { idx: "01", year: "2019", title: "Office SW 안정화 & QA 시스템", role: "초급 개발자", highlight: "ToHangul·WaplPoint 안정화, TestLink 기반 QA 자동화" },
  { idx: "02", year: "2020", title: "공통 엔진 & 클라우드 연동", role: "백엔드 개발자", highlight: "PieceTree 텍스트 엔진, Node.js + Tibero ODBC, Docker 환경" },
  { idx: "03", year: "2021", title: "양식개체 & 검색 성능", role: "프론트엔드", highlight: "EditBox·ComboBox DOM/Render, Find/Replace 검색 50% ↑" },
  { idx: "04", year: "2022", title: "SuperPoint Architecture", role: "아키텍트", highlight: "프레젠테이션 엔진 React 전환, Slide 계층 구조 설계", active: true },
  { idx: "05", year: "2023", title: "공동편집 & 썸네일 최적화", role: "성능 최적화", highlight: "실시간 공동편집, html-to-image + pdf.js 썸네일 40% ↑" },
  { idx: "06", year: "2024", title: "Theme/ClrMap & 테스트 자동화", role: "풀스택", highlight: "색상 오차 0%, Jest 커버리지 95%, 완전 문서화" },
] as const;

const SKILLS = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "Java", "Node.js"] },
  { label: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS"] },
  { label: "Backend & DB", items: ["Tibero ODBC", "Docker", "Liquibase", "REST API"] },
  { label: "Tools & QA", items: ["Git", "Jest", "TestLink", "pdf.js", "html-to-image"] },
] as const;

const INTERESTS = [
  { label: "AI 활용 개발", desc: "AI로 빠르게 MVP를 만들고 실험하는 워크플로우" },
  { label: "웹 풀스택", desc: "Next.js + Cloudflare 기반 서비스 구축" },
  { label: "개발 기록", desc: "블로그를 통한 학습 과정 공유와 포트폴리오 관리" },
  { label: "그 외", desc: "운동, 신앙, 취미 활동을 통한 균형 잡힌 생활" },
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
            Tmax A&amp;C에서 <span className="text-em">5년간 오피스 SW 엔진</span>을 개발한 경험 위에,
            <span className="text-em-coral"> AI와 함께 빠르게 빌드</span>하는 개발자로 전환 중입니다.
          </>
        }
      />

      {/* ── 프로필 카드 ── */}
      <Reveal className="mb-20" as="section">
        <div className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-12 md:col-span-5 relative">
            <div className="ambient-glow absolute -inset-2" />
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden ghost-border">
              <Image
                src="/images/profile-id.jpg"
                alt="고경석"
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
                  AI Builder &<br />Full-stack Developer
                </h2>
                <p className="type-small c-sub leading-relaxed">
                  엔진 개발의 정밀함과 AI 빠른 빌드 사이클을 결합합니다. 디자인부터
                  배포까지 한 사람이 책임지는 사이클을 좋아합니다.
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
              <SectionLabel className="mb-3">Employer · Tmax A&C</SectionLabel>
              <h3 className="font-headline text-2xl md:text-3xl font-semibold text-on-surface mb-2">
                Office SW <span className="display-accent">Engine</span> Dev
              </h3>
              <p className="font-code text-sm text-do-primary mb-4 tracking-wide">
                2019.08 – 2024.12 · 5년 5개월
              </p>
              <p className="type-small text-on-surface-variant leading-relaxed">
                프레젠테이션 엔진, 공동편집, 양식개체 시스템, 테마/색상 시스템 등
                <span className="text-em"> 핵심 모듈 설계 및 구현</span>.
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
                      {c.year} · {c.role}
                    </span>
                  </div>
                  <p className="type-small c-sub leading-relaxed">{c.highlight}</p>
                </div>
                <ArrowUpRight size={18} className="opacity-50" />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Skills ── */}
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

      {/* ── Interests ── */}
      <section className="mb-24">
        <Reveal>
          <SectionLabel count={INTERESTS.length} className="mb-10">Interests</SectionLabel>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTERESTS.map((it, i) => (
            <Reveal key={it.label} index={i} as="div">
              <article className="process-row tilt-card">
                <span className="idx">// 0{i + 1}</span>
                <div className="flex-1">
                  <h4 className="font-headline font-semibold mb-1 text-on-surface">{it.label}</h4>
                  <p className="type-small c-sub">{it.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 이 사이트에 대해 ── */}
      <Reveal className="mb-24" as="section">
        <SectionLabel className="mb-5">About this site</SectionLabel>
        <p className="type-body text-on-surface-variant leading-relaxed max-w-3xl">
          <strong className="text-on-surface">GoTechy</strong>는 기술 블로그,
          포트폴리오, <span className="text-em">AI 실험 결과</span>, 그리고 작은 서비스들을
          한 곳에 모아 공유하기 위해 만들었습니다.
          <span className="text-em-coral"> Next.js 16 + Tailwind CSS v4 + Velite MDX</span>로
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
