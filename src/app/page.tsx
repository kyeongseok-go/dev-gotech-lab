import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/layout/page-container";
import {
  getPublishedBlogs,
  getPublishedProjects,
  getPublishedShowcase,
  formatDate,
  STATUS_LABEL,
} from "@/lib/content";
import { getServices } from "@/lib/db/services";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { SubscribeForm } from "@/components/subscribe-form";
import { FadeIn } from "@/components/fade-in";

const SERVICE_STATUS_LABEL: Record<string, string> = {
  live: "운영중",
  wip: "준비중",
  archived: "종료",
};

const SERVICE_STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  live: { bg: "rgba(0, 255, 136, 0.1)", text: "#00ff88" },
  wip: { bg: "rgba(255, 229, 0, 0.1)", text: "#fbbf24" },
  archived: { bg: "rgba(136, 146, 164, 0.1)", text: "#8892a4" },
};

export default async function Home() {
  const blogs = getPublishedBlogs().slice(0, 3);
  const projects = getPublishedProjects().slice(0, 2);
  const showcaseItems = getPublishedShowcase().slice(0, 3);
  const services = await getServices();
  const displayServices = services.slice(0, 2);

  return (
    <PageContainer>
      {/* ── 히어로 ── */}
      <FadeIn>
      <section className="relative -mx-4 mb-20 overflow-hidden rounded-2xl px-6 py-20 sm:px-12 sm:py-28">
        {/* 배경 레이어 */}
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/15"
        />

        <div className="relative flex items-center gap-10">
          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            {/* 서브 라벨 */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
              오피스 SW 엔진 5년 → AI 빌더
            </div>

            {/* 메인 타이틀 */}
            <h1 className="hero-title text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              만들고, 기록하고,
              <br />
              공유합니다.
            </h1>

            {/* 슬로건 — Go/Technology/Easier = 고텍이 */}
            <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-muted-foreground sm:text-xl">
              <span className="gradient-text font-bold">Go</span>!! Build The{" "}
              <span className="gradient-text font-bold">Technology</span>. Live{" "}
              <span className="gradient-text font-bold">Easier</span>.
            </p>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              5년간의 오피스 SW 엔진 개발 경험 위에,
              <br />
              AI를 활용해 빠르게 만들고 기록하는 사람의 공간입니다.
            </p>

            {/* 태그 뱃지 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: "기술 블로그", color: "#00e5ff" },
                { label: "포트폴리오", color: "#a78bfa" },
                { label: "AI 실험", color: "#00ff88" },
                { label: "서비스", color: "#ff6b9d" },
              ].map(({ label, color }, i) => (
                <span
                  key={label}
                  className="hero-tag rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: `${color}14`,
                    border: `1px solid ${color}33`,
                    color,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* CTA 버튼 */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="btn-glow rounded-lg px-6 py-2.5 text-sm"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                소개 보기
              </Link>
            </div>

            {/* 메트릭 수치 */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:max-w-lg">
              {[
                { value: "9개", label: "핵심 모듈 설계" },
                { value: "5년", label: "엔진 개발 경력" },
                { value: "95%", label: "테스트 커버리지" },
              ].map(({ value, label }) => (
                <div key={label} className="metric-box">
                  <span className="metric-value" style={{ fontSize: "1.5rem" }}>
                    {value}
                  </span>
                  <span className="metric-label">{label}</span>
                </div>
              ))}
            </div>
          </div>{/* 텍스트 영역 끝 */}

          {/* 캐릭터 — 라이트모드 + sm 이상에서만 표시 */}
          <div className="hidden dark:hidden sm:flex flex-shrink-0 items-end self-end">
            <div className="relative h-80 w-64 lg:h-96 lg:w-72">
              <Image
                src="/images/character/front.png"
                alt="고텍이 캐릭터"
                fill
                className="object-contain object-bottom drop-shadow-2xl"
                priority
                sizes="(min-width:1024px) 288px, 256px"
              />
              {/* 하단 페이드 */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      {/* ── 최신 블로그 ── */}
      <FadeIn delay={100}>
      <HomeSection
        title="최신 블로그"
        href="/blog"
        label="전체 보기"
        characterSrc="/images/character/typing.png"
        characterAlt="타이핑하는 고텍이"
      >
        {blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 작성된 글이 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {blogs.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="brand-card block p-4"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time>{formatDate(post.date)}</time>
                    {post.category && (
                      <>
                        <span>·</span>
                        <span className="text-primary">{post.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-semibold text-foreground">{post.title}</h3>
                  {post.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>
      </FadeIn>

      {/* 광고 자리 */}
      <AdPlaceholder className="mb-14" />

      {/* ── 프로젝트 ── */}
      <FadeIn delay={100}>
      <HomeSection
        title="프로젝트"
        href="/projects"
        label="전체 보기"
        characterSrc="/images/character/presentation.png"
        characterAlt="발표하는 고텍이"
      >
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 프로젝트가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="brand-card block p-5"
                >
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {project.summary}
                  </p>
                  {project.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-[var(--brand-lavender)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>
      </FadeIn>

      {/* ── AI Showcase ── */}
      <FadeIn delay={100}>
      <HomeSection
        title="AI Showcase"
        href="/showcase"
        label="전체 보기"
        characterSrc="/images/character/codereview.png"
        characterAlt="코드리뷰하는 고텍이"
      >
        {showcaseItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 항목이 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-3">
            {showcaseItems.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/showcase/${item.slug}`}
                  className="brand-card block p-5"
                >
                  <span className="rounded-full bg-[rgba(0,255,136,0.1)] px-2 py-0.5 text-xs font-medium text-[#00ff88]">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>
      </FadeIn>

      {/* ── 서비스 ── */}
      <FadeIn delay={100}>
      <HomeSection title="서비스" href="/services" label="전체 보기">
        {displayServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 서비스가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {displayServices.map((svc) => (
              <li key={svc.slug}>
                <div className="brand-card p-5">
                  {(() => {
                    const sc =
                      SERVICE_STATUS_COLOR[svc.status] ??
                      SERVICE_STATUS_COLOR.archived;
                    return (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                      </span>
                    );
                  })()}
                  <h3 className="mt-2 font-semibold text-foreground">{svc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {svc.description}
                  </p>
                  {svc.url && (
                    <Link
                      href={svc.url}
                      className="mt-3 inline-block text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      바로가기 →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>
      </FadeIn>

      {/* ── 구독 CTA ── */}
      <FadeIn delay={100}>
      <section className="relative mb-12 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-accent/8 p-8 sm:p-10">
        <div className="relative z-10 flex items-start gap-8">
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Newsletter
            </div>
            <h2 className="text-xl font-bold text-foreground">새 소식 받아보기</h2>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
              AI 실험 결과, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
              <br />
              스팸 없이, 새 글이 올라올 때만 보내드립니다.
            </p>
            <SubscribeForm />
            <p className="mt-4 text-xs text-muted-foreground">
              <Link
                href="/about"
                className="text-[var(--brand-lavender)] underline underline-offset-4 transition-colors hover:text-primary"
              >
                만든 사람 보기 →
              </Link>
            </p>
          </div>

          {/* 완성! 캐릭터 — 라이트모드에서만 */}
          <div className="hidden dark:hidden sm:block relative h-48 w-40 flex-shrink-0 self-center">
            <Image
              src="/images/character/completion.png"
              alt="기뻐하는 고텍이"
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
        </div>
      </section>
      </FadeIn>
    </PageContainer>
  );
}

/* ─────────────────────────────────────────────────── */
/* 공통 섹션 래퍼 (캐릭터 일러스트 옵션)                  */
/* ─────────────────────────────────────────────────── */
function HomeSection({
  title,
  href,
  label,
  children,
  characterSrc,
  characterAlt,
}: {
  title: string;
  href: string;
  label: string;
  children: React.ReactNode;
  characterSrc?: string;
  characterAlt?: string;
}) {
  return (
    <section className="mb-14">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-3">
          {/* 섹션 옆 작은 캐릭터 */}
          {characterSrc && (
            <div className="relative hidden h-10 w-12 dark:hidden sm:block">
              <Image
                src={characterSrc}
                alt={characterAlt ?? ""}
                fill
                className="object-contain object-bottom"
                sizes="48px"
              />
            </div>
          )}
          <h2 className="section-heading text-xl font-bold text-foreground" style={{ fontFamily: "Pretendard, sans-serif" }}>
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {label} →
        </Link>
      </div>
      {children}
    </section>
  );
}
