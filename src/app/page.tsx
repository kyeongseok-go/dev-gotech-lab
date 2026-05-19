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
  "Next.js",
  "React",
  "Tailwind CSS",
  "Cloudflare",
  "Node.js",
  "Docker",
  "Java",
  "AI Prototyping",
  "MDX",
] as const;

const OFFERS = [
  { idx: "01", title: "Web & Mobile", desc: "Next.js · App Router · PWA" },
  { idx: "02", title: "UI/UX", desc: "Editorial · 디자인 시스템" },
  { idx: "03", title: "AI Prototyping", desc: "Claude · 빠른 MVP" },
  { idx: "04", title: "Edge Deploy", desc: "Cloudflare · OpenNext" },
] as const;

const PROCESS = [
  { idx: "01", title: "Discover", sub: "사용자 리서치 / 도메인 파악", active: false },
  { idx: "02", title: "Define", sub: "스펙 · 유저 플로우 · 정보 구조", active: false },
  { idx: "03", title: "Design", sub: "디자인 시스템 · 컴포넌트 빌드", active: true },
  { idx: "04", title: "Deliver", sub: "Edge 배포 · 모니터링 · 회고", active: false },
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
      <section className="relative grid grid-cols-12 gap-4 items-start mb-32 md:mb-44 min-h-[80vh]">
        {/* top eyebrow row */}
        <div className="col-span-12 flex items-center justify-between mb-2">
          <SectionLabel count="2026">GOTECH·LAB</SectionLabel>
          <ArrowDownRight className="corner-arrow hidden md:block" strokeWidth={1} />
        </div>

        {/* 1행: 큰 헤드라인 시작 — 핀은 분리해서 자연스럽게 */}
        <h1 className="col-span-12 type-display-xl text-on-surface rise-in">
          <span className="block">Build the</span>
          <span className="block">
            <span className="display-accent">Visual</span> Technology
          </span>
        </h1>

        {/* 인물 + 흩뿌린 핀 + 본문 */}
        <div className="col-span-12 grid grid-cols-12 gap-4 items-end mt-4">
          <div className="col-span-12 md:col-span-5 relative">
            <p className="type-body text-on-surface-variant max-w-md mb-7 rise-in" style={{ animationDelay: "120ms" }}>
              5년간 오피스 SW 엔진을 다룬 경험 위에,
              <span className="text-em"> AI와 함께 빠르게 빌드</span>합니다.
              한국어 본문은 <span className="text-on-surface font-semibold">Pretendard</span>,
              영문 디스플레이는 <span className="text-on-surface font-semibold">Space Grotesk</span>.
            </p>
            <div className="flex flex-wrap gap-3 rise-in" style={{ animationDelay: "220ms" }}>
              <Magnetic>
                <Link href="/projects" className="btn-primary inline-flex px-7 py-3.5 rounded-full text-sm">
                  프로젝트 보기
                </Link>
              </Magnetic>
              <Link href="/about" className="btn-outline inline-flex px-7 py-3.5 rounded-full text-sm">
                Make it Future
              </Link>
            </div>

            {/* 인라인 스탯 */}
            <div className="mt-12 flex items-end gap-10">
              <div>
                <div className="type-display text-on-surface" style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}>
                  05<span className="text-do-primary">+</span>
                </div>
                <p className="font-code text-xs text-on-surface-muted tracking-wider uppercase">years experience</p>
              </div>
              <div>
                <div className="type-display text-on-surface" style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}>
                  12
                </div>
                <p className="font-code text-xs text-on-surface-muted tracking-wider uppercase">projects shipped</p>
              </div>
            </div>
          </div>

          {/* 포트레이트 카드 + 떠다니는 핀 */}
          <div className="col-span-12 md:col-span-7 relative min-h-[460px] md:min-h-[600px]">
            {/* 분위기 글로우 (뒤로) */}
            <div aria-hidden className="ambient-glow absolute -inset-6 z-0" />

            {/* 포트레이트 카드 — 라운드, 라이트한 톤은 그라데이션으로 자연 융합 */}
            <div className="relative z-10 mx-auto md:ml-auto md:mr-2 w-[88%] md:w-[82%] aspect-[3/4] rounded-3xl overflow-hidden hero-portrait rise-in" style={{ animationDelay: "180ms" }}>
              <Image
                src="/images/hero-main.jpg"
                alt="고경석"
                fill
                priority
                sizes="(max-width: 768px) 88vw, 45vw"
                className="object-cover object-[50%_15%]"
              />
              {/* 위/아래 그라데이션 페더 — 페이지와 자연 융합 */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1/4 pointer-events-none"
                style={{ background: "linear-gradient(180deg, var(--do-page), transparent)" }}
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                style={{ background: "linear-gradient(0deg, var(--do-page) 5%, transparent 95%)" }}
              />
              {/* 컬러풀 액센트 링 (san 시그니처) */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px var(--do-hairline), inset 0 0 0 4px color-mix(in oklch, var(--do-primary) 22%, transparent)" }}
              />
            </div>

            {/* 떠다니는 주석 핀 (san.framer 시그니처) */}
            <span className="pill-tag pill-green absolute -top-2 left-4 z-20 rise-in" style={{ animationDelay: "200ms" }}>
              ✦ 5y engine
            </span>
            <span className="pill-tag pill-coral absolute top-16 -left-2 z-20 rise-in" style={{ animationDelay: "260ms" }}>
              ⚡ AI prototyping
            </span>
            <span className="pill-tag pill-violet absolute left-2 bottom-24 z-20 rise-in" style={{ animationDelay: "340ms" }}>
              ✦ Cloudflare deploy
            </span>
            <span className="pill-tag pill-surface absolute right-2 top-1/3 z-20 rise-in" style={{ animationDelay: "420ms" }}>
              <span className="text-do-primary">●</span> Next.js 16
            </span>

            {/* 좌하단 회전 배지 */}
            <div className="absolute -left-2 md:-left-6 -bottom-4 z-30 hidden md:block">
              <SpinBadge text="BUILD · GOTECH · 2026" centerEmoji="✦" />
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
                        {project.techStack.slice(0, 4).map((tech) => (
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
            <span className="font-code text-xs text-on-surface-muted">Discover → Deliver</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4">
            <h2 className="type-headline text-on-surface mb-3">
              한 손엔 <span className="display-accent">엔진</span>,<br /> 한 손엔 AI.
            </h2>
            <p className="type-small text-on-surface-variant">
              5년 엔진 개발의 정밀함과 AI 빠른 빌드 사이클을 결합합니다.
              디자인부터 배포까지 한 사람이 책임지는 사이클.
            </p>
          </div>
          <div className="md:col-span-8 space-y-3">
            {PROCESS.map((p, i) => (
              <Reveal key={p.idx} index={i} as="div">
                <div className={`process-row ${p.active ? "process-row--active" : ""}`}>
                  <span className="idx">// {p.idx}</span>
                  <div className="flex-1">
                    <h3 className="font-headline text-xl font-semibold">{p.title}</h3>
                    <p className="font-code text-xs tracking-wide c-sub mt-1">{p.sub}</p>
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
                        {item.stack.slice(0, 3).map((s) => (
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
            "Tmax A&C",
            "PieceTree Engine",
            "React Architecture",
            "Co-edit Engine",
            "Theme System",
            "PWA",
            "Next.js + Cloudflare",
            "Velite MDX",
            "Claude Code",
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
