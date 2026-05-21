import Link from "next/link";
import Image from "next/image";
import {
  getPublishedBlogs,
  getPublishedProjects,
  getPublishedShowcase,
  formatDate,
  STATUS_LABEL,
} from "@/lib/content";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Reveal, Magnetic } from "@/components/motion/reveal";
import { ColorCard } from "@/components/section/color-card";
import { SectionLabel } from "@/components/section/section-label";
import { Marquee } from "@/components/section/marquee";
import { SpinBadge } from "@/components/section/spin-badge";

const SKILLS = [
  "TypeScript",
  "Next.js 14",
  "React",
  "Tailwind CSS",
  "Node.js",
  "C++",
  "Java",
  "Docker",
  "PostgreSQL",
  "pgvector",
  "Claude API",
  "Cloudflare",
] as const;

const OFFERS = [
  { idx: "01", title: "Full-stack Web", desc: "Next.js 14 · App Router · TypeScript" },
  { idx: "02", title: "AI Integration", desc: "Claude API · RAG · SSE Streaming" },
  { idx: "03", title: "Doc / Format Engine", desc: "OOXML · HWP · HWPX · Parser" },
  { idx: "04", title: "Edge Deploy", desc: "Vercel · Railway · Cloudflare Workers" },
] as const;

/** 5년의 본인 개발 사이클(분석·설계·개발·안정화·배포)을
 *  AI 협업 환경에 그대로 옮긴 5단계.
 *  각 단계는 "5년의 무기" + "AI 가속" 두 줄로 표현. */
const PROCESS = [
  {
    idx: "01",
    title: "Analyze",
    kr: "분석",
    sub: "외부 스펙과 도메인을 깊이 읽는다. Claude가 코드베이스 단서를 빠르게 좁힌다.",
  },
  {
    idx: "02",
    title: "Design",
    kr: "설계",
    sub: "DB부터 클라이언트까지 한 줄로 잇는다. AI 페어가 트레이드오프를 검증한다.",
  },
  {
    idx: "03",
    title: "Build",
    kr: "개발",
    sub: "한 사람이 끝까지 짠다. SDD(Spec-Driven Development) 플로우로 AI와 페어 코딩.",
    active: true,
  },
  {
    idx: "04",
    title: "Stabilize",
    kr: "테스트 · 안정화",
    sub: "5년간 350건+ 케이스로 다진 감각으로 끝낸다. AI가 회귀·엣지 케이스를 발굴한다.",
  },
  {
    idx: "05",
    title: "Ship",
    kr: "배포",
    sub: "Docker · Vercel · Cloudflare로 끝맺는다. 배포와 동시에 블로그·Wiki로 자산화한다.",
  },
] as const;

const CARD_NEWS_TEASER = [
  { title: "Claude Sonnet 4 — 에이전트 메모리 시스템 공개", tag: "AI" },
  { title: "Next.js 16 RC — PPR 정식 출시, LCP 3배 향상", tag: "개발" },
  { title: "EU AI Act 1차 집행 — 48개 기업 조사 착수", tag: "뉴스" },
] as const;

export default async function Home() {
  const blogs = getPublishedBlogs().slice(0, 4);
  const projects = getPublishedProjects().slice(0, 4);
  const showcaseItems = getPublishedShowcase().slice(0, 3);

  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      {/* ════════ HERO ════════ */}
      <section className="hero-shell relative mb-32 md:mb-44 min-h-[80vh] md:min-h-[88vh]">
        {/* 누끼 인물 — 우측 배치, 얼굴 또렷, 부드러운 부유 애니메이션 */}
        <div className="hero-backdrop">
          <Image
            src="/images/hero-nobg.png"
            alt="고경석"
            fill
            priority
            sizes="(max-width: 768px) 75vw, 56vw"
          />
        </div>

        {/* 분위기 글로우 (뒤로) */}
        <div aria-hidden className="ambient-glow absolute right-[8%] top-[20%] w-[420px] h-[420px] z-0 pointer-events-none" />
        <div aria-hidden className="grid-texture absolute inset-0 z-0 opacity-25 pointer-events-none" />

        {/* 콘텐츠 그리드 */}
        <div className="relative z-10 grid grid-cols-12 gap-4">
          {/* eyebrow */}
          <div className="col-span-12 flex items-center justify-between mb-4">
            <SectionLabel count="2026">GoTechy</SectionLabel>
            <ArrowDownRight className="corner-arrow hidden md:block" strokeWidth={1} />
          </div>

          {/* 헤드라인 — 우측 인물 자리 비워두기 (얼굴 가리지 않게), 3줄 의도 유지 */}
          <h1
            className="col-span-12 md:col-span-8 type-display-xl text-on-surface rise-in relative"
            style={{ fontSize: "clamp(2.75rem, 0.5rem + 9.5vw, 8rem)", lineHeight: 0.95 }}
          >
            <span className="block whitespace-nowrap">
              <span className="text-em-soft">Go</span> Build the
            </span>
            <span className="block whitespace-nowrap">
              <span className="display-accent">Technology,</span>
            </span>
            <span className="block whitespace-nowrap">more easy.</span>
          </h1>

          {/* 본문 + CTA + Stats 하단 영역 */}
          <div className="col-span-12 grid grid-cols-12 gap-4 items-end mt-10 md:mt-16">
            <div className="col-span-12 md:col-span-6 relative">
              <p className="type-body text-on-surface-variant max-w-md mb-7 rise-in" style={{ animationDelay: "140ms" }}>
                오피스 SW 엔진을 <span className="text-em-emerald">5년 5개월</span> 다룬 풀스택 엔지니어가,
                <span className="text-em-coral"> AI를 페어 파트너로 빠르게 빌드</span>합니다.
              </p>
              <div className="flex flex-wrap gap-3 rise-in" style={{ animationDelay: "240ms" }}>
                <Magnetic>
                  <Link href="/projects" className="btn-primary inline-flex px-7 py-3.5 rounded-full text-sm">
                    프로젝트 보기
                  </Link>
                </Magnetic>
                <Link href="/about" className="btn-outline inline-flex px-7 py-3.5 rounded-full text-sm">
                  Make it Future
                </Link>
              </div>

              {/* 인라인 스탯 — 5년 5개월 + AI 프로젝트 수 */}
              <div className="mt-10 flex items-end gap-8">
                <div className="flex items-baseline gap-1">
                  <span className="type-display text-on-surface" style={{ fontSize: "clamp(2.25rem,4.4vw,3.8rem)", letterSpacing: "-0.04em" }}>
                    5
                  </span>
                  <span className="font-headline font-semibold text-do-primary" style={{ fontSize: "clamp(1rem,1.4vw,1.25rem)" }}>
                    y 5m
                  </span>
                </div>
                <span aria-hidden className="w-px self-stretch bg-hairline" style={{ minHeight: "3.5rem" }} />
                <div className="flex items-baseline gap-1">
                  <span className="type-display text-on-surface" style={{ fontSize: "clamp(2.25rem,4.4vw,3.8rem)", letterSpacing: "-0.04em" }}>
                    10
                  </span>
                  <span className="font-headline font-semibold text-do-primary" style={{ fontSize: "clamp(1rem,1.4vw,1.25rem)" }}>
                    +
                  </span>
                </div>
                <p className="font-code text-xs text-on-surface-muted tracking-wider self-end pb-2 hidden md:block">
                  엔진 개발 · AI 프로젝트
                </p>
              </div>
            </div>

            {/* 우측 빈 공간에 핀 + 회전 배지 */}
            <div className="col-span-12 md:col-span-6 relative min-h-[200px] md:min-h-[260px]">
              <span className="pill-tag pill-green absolute -top-4 right-12 md:right-20 rise-in" style={{ animationDelay: "200ms" }}>
                ✦ Office Engine 5y 5m
              </span>
              <span className="pill-tag pill-coral absolute top-16 right-2 rise-in" style={{ animationDelay: "260ms" }}>
                ⚡ Claude pair-coding
              </span>
              <span className="pill-tag pill-violet absolute right-24 md:right-40 top-32 rise-in" style={{ animationDelay: "340ms" }}>
                ✦ HWPX · OOXML parser
              </span>
              <span className="pill-tag pill-surface absolute right-0 bottom-20 rise-in" style={{ animationDelay: "420ms" }}>
                <span className="text-do-primary">●</span> Next.js 16 + Cloudflare
              </span>
              {/* 회전 배지 */}
              <div className="absolute right-0 -bottom-2 hidden md:block">
                <SpinBadge text="GO · BUILD · TECHNOLOGY · MORE EASY · " centerEmoji="✦" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ MARQUEE — 스킬 ════════ */}
      <Reveal className="mb-28 md:mb-36" as="section">
        <div className="border-y border-hairline">
          <Marquee
            items={SKILLS.map((s) => (
              <span key={s} className="type-display font-headline text-on-surface" style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)" }}>
                {s}
                <span className="text-do-primary"> ✦ </span>
              </span>
            ))}
          />
        </div>
      </Reveal>

      {/* ════════ OFFERS — "things I can help with" ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count="04">What I can help with</SectionLabel>
            <ArrowDownRight className="corner-arrow" strokeWidth={1} />
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFERS.map((o, i) => (
            <Reveal key={o.idx} index={i} as="div">
              <article className="process-row tilt-card">
                <span className="idx">{o.idx}</span>
                <div className="flex-1">
                  <h3 className="font-headline text-xl font-semibold mb-1 text-on-surface">{o.title}</h3>
                  <p className="font-code text-xs text-on-surface-muted tracking-wide c-sub">{o.desc}</p>
                </div>
                <ArrowUpRight size={18} className="opacity-50" />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ FEAT WORKS ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={projects.length}>Feat works</SectionLabel>
            <Link
              href="/projects"
              className="font-headline font-medium text-sm tracking-tight text-do-primary inline-flex items-center gap-1 group"
            >
              전체 보기
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
        {projects.length === 0 ? (
          <p className="type-small text-on-surface-muted">등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project, i) => (
              <Reveal key={project.slug} index={i} as="div">
                <Link
                  href={`/projects/${project.slug}`}
                  className={`tilt-card ${i % 2 === 1 ? "md:mt-10" : ""}`}
                >
                  <ColorCard index={i} className="p-8 block h-full" as="article">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-code text-[10px] uppercase tracking-widest opacity-80">
                        {project.period ?? "Project"}
                      </span>
                      <ArrowUpRight size={18} className="opacity-70" />
                    </div>
                    <h3 className="font-headline text-2xl md:text-3xl font-semibold leading-tight mb-3">
                      {project.title}
                    </h3>
                    <p className="type-small c-sub mb-5 line-clamp-3">
                      {project.summary}
                    </p>
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.slice(0, 4).map((tech: string) => (
                          <span
                            key={tech}
                            className="font-code text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-black/15"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </ColorCard>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ════════ MY PROCESS ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel>My process</SectionLabel>
            <span className="font-code text-xs text-on-surface-muted">Analyze → Ship</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4">
            <h2 className="type-headline text-on-surface mb-3">
              발견에서 <span className="display-accent">배포</span>까지,<br />
              <span className="text-em-coral">한 사람</span>이 끝낸다.
            </h2>
            <p className="type-small text-on-surface-variant leading-relaxed">
              분석·설계·개발·안정화·배포 — 5년 5개월간 다듬은 사이클을
              지금은 AI를 페어 파트너로 두고 동일하게 굴립니다.
              <span className="text-em"> 한 사이클을 한 사람이 끝까지 책임지는 1인 개발.</span>
            </p>
          </div>
          <div className="md:col-span-8 space-y-3">
            {PROCESS.map((p, i) => (
              <Reveal key={p.idx} index={i} as="div">
                <div className={`process-row ${"active" in p && p.active ? "process-row--active" : ""}`}>
                  <span className="idx">// {p.idx}</span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="font-headline text-xl font-semibold">{p.title}</h3>
                      <span className="font-code text-[11px] tracking-wider text-do-primary uppercase">· {p.kr}</span>
                    </div>
                    <p className="font-code text-xs tracking-wide c-sub mt-1.5 leading-relaxed">{p.sub}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ LATEST INSIGHTS — 컬러 메이슨리 ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={blogs.length}>Latest insights</SectionLabel>
            <Link
              href="/blog"
              className="font-headline font-medium text-sm tracking-tight text-do-primary inline-flex items-center gap-1 group"
            >
              전체 보기
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
        {blogs.length === 0 ? (
          <p className="type-small text-on-surface-muted">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-12 gap-4 md:gap-5">
            {blogs.map((post, i) => {
              const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
              const colors: Array<"card-c2" | "card-c1" | "card-c3" | "card-c5"> = ["card-c2", "card-c1", "card-c3", "card-c5"];
              return (
                <Reveal key={post.slug} index={i} className={`col-span-12 ${spans[i % 4]}`} as="div">
                  <Link href={`/blog/${post.slug}`} className="tilt-card block h-full">
                    <ColorCard variant={colors[i % 4]} className="p-7 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-code text-[10px] uppercase tracking-widest opacity-80">
                          {post.category ?? "Blog"} · {formatDate(post.date)}
                        </span>
                        <ArrowUpRight size={16} className="opacity-70" />
                      </div>
                      <h3 className="font-headline text-xl md:text-2xl font-semibold leading-tight mb-3">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="type-small c-sub line-clamp-3 mt-auto">
                          {post.description}
                        </p>
                      )}
                    </ColorCard>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ════════ AI SHOWCASE 컬러 메이슨리 ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={showcaseItems.length}>AI showcase</SectionLabel>
            <Link
              href="/showcase"
              className="font-headline font-medium text-sm tracking-tight text-do-primary inline-flex items-center gap-1 group"
            >
              전체 보기
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
        {showcaseItems.length === 0 ? (
          <p className="type-small text-on-surface-muted">등록된 항목이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showcaseItems.map((item, i) => (
              <Reveal key={item.slug} index={i} as="div">
                <Link href={`/showcase/${item.slug}`} className="tilt-card block h-full">
                  <ColorCard index={i + 2} className="p-7 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-code text-[10px] uppercase tracking-widest opacity-80">
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                      <ArrowUpRight size={16} className="opacity-70" />
                    </div>
                    <h3 className="font-headline text-xl md:text-2xl font-semibold leading-tight mb-3">
                      {item.title}
                    </h3>
                    <p className="type-small c-sub line-clamp-3 mb-4">{item.summary}</p>
                    {item.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.stack.slice(0, 3).map((s: string) => (
                          <span key={s} className="font-code text-[10px] uppercase tracking-wider opacity-80">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </ColorCard>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ════════ 카드뉴스 티저 ════════ */}
      <section className="mb-28 md:mb-40">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <SectionLabel count={CARD_NEWS_TEASER.length}>Card news</SectionLabel>
            <Link
              href="/card-news"
              className="font-headline font-medium text-sm tracking-tight text-do-primary inline-flex items-center gap-1 group"
            >
              전체 보기
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARD_NEWS_TEASER.map((item, i) => (
            <Reveal key={item.title} index={i} as="div">
              <Link href="/card-news" className="tilt-card block h-full">
                <ColorCard index={i + 1} className="p-7 h-full flex flex-col justify-between min-h-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="font-code text-[10px] uppercase tracking-widest opacity-80">{item.tag}</span>
                    <ArrowUpRight size={16} className="opacity-70" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold leading-snug mt-6">{item.title}</h3>
                </ColorCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ WORKED WITH — 키워드 마퀴 ════════ */}
      <Reveal className="mb-28 md:mb-40" as="section">
        <SectionLabel className="mb-6">Built with · 2019 — Now</SectionLabel>
        <Marquee
          durationSec={42}
          items={[
            "ToHangul",
            "SuperWord",
            "SuperPoint",
            "HWPX Parser",
            "OOXML",
            "ColorMap · ClrMap",
            "Co-edit 3-Command",
            "ListStyle Schema",
            "Tibero ODBC + Docker",
            "Jest · TestLink",
            "Next.js + Claude API",
            "pgvector RAG",
            "SSE Streaming",
            "Vercel · Railway · Cloudflare",
          ].map((w) => (
            <span key={w} className="font-headline text-on-surface-muted" style={{ fontSize: "clamp(1.2rem,2.4vw,2rem)" }}>
              {w}
              <span className="text-do-primary"> · </span>
            </span>
          ))}
        />
      </Reveal>

      {/* ════════ CTA — 그라데이션 분위기 ════════ */}
      <Reveal>
        <section className="cta-atmos px-8 py-16 md:py-24 text-center">
          <p className="section-label justify-center mb-6">Need a developer?</p>
          <h2 className="type-display text-on-surface mb-6">
            Let&apos;s <span className="display-accent">build</span> together.
          </h2>
          <p className="type-body text-on-surface-variant max-w-md mx-auto mb-10">
            가자!! 기술을 만들고, 더 쉽게 살자.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Magnetic>
              <Link href="/subscribe" className="btn-primary inline-flex px-8 py-4 rounded-full text-sm">
                소식 받기
              </Link>
            </Magnetic>
            <Link href="/about" className="btn-outline inline-flex px-8 py-4 rounded-full text-sm">
              Discuss project
            </Link>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
