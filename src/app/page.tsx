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

const SERVICE_STATUS_CLASS: Record<string, string> = {
  live: "status-badge status-live",
  wip: "status-badge status-wip",
  archived: "status-badge status-archived",
};

const BENTO_COLORS = ["bento-blue", "bento-green", "bento-purple", "bento-pink", "bento-yellow", "bento-mint"];

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
      <section className="relative -mx-4 mb-24 overflow-hidden rounded-3xl px-8 py-24 sm:px-14 sm:py-32">
        {/* 배경 레이어 */}
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="hero-glow pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-border" />

        <div className="relative flex items-center gap-10">
          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            {/* 서브 라벨 */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              오피스 SW 엔진 5년 &rarr; AI 빌더
            </div>

            {/* 메인 타이틀 */}
            <h1 className="hero-title text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              만들고, 기록하고,
              <br />
              공유합니다.
            </h1>

            {/* 슬로건 */}
            <p className="mt-5 font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-muted-foreground sm:text-xl">
              <span className="gradient-text font-bold">Go</span>!! Build The{" "}
              <span className="gradient-text font-bold">Technology</span>. Live{" "}
              <span className="gradient-text font-bold">Easier</span>.
            </p>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              5년간의 오피스 SW 엔진 개발 경험 위에,
              <br />
              AI를 활용해 빠르게 만들고 기록하는 사람의 공간입니다.
            </p>

            {/* 태그 뱃지 */}
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                { label: "기술 블로그", color: "#3b82f6" },
                { label: "포트폴리오", color: "#a78bfa" },
                { label: "AI 실험", color: "#22c55e" },
                { label: "서비스", color: "#f472b6" },
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
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="btn-glow rounded-xl px-6 py-2.5 text-sm"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                소개 보기
              </Link>
            </div>

            {/* 메트릭 수치 */}
            <div className="mt-14 grid grid-cols-3 gap-4 sm:max-w-lg">
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
          </div>

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
                  className="list-card block"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time>{formatDate(post.date)}</time>
                    {post.category && (
                      <>
                        <span className="text-border">|</span>
                        <span className="text-primary font-medium">{post.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{post.title}</h3>
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
      <AdPlaceholder className="mb-16" />

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
                  className="list-card block"
                >
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {project.summary}
                  </p>
                  {project.techStack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="tag-badge">
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

      {/* ── AI Showcase — 벤토 스타일 ── */}
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
            {showcaseItems.map((item, idx) => (
              <li key={item.slug}>
                <Link
                  href={`/showcase/${item.slug}`}
                  className={`bento-card block ${BENTO_COLORS[idx % BENTO_COLORS.length]}`}
                >
                  <span className="status-badge status-live text-[11px]">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm opacity-70">
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
                <div className="list-card">
                  <span className={SERVICE_STATUS_CLASS[svc.status] ?? SERVICE_STATUS_CLASS.archived}>
                    {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                  </span>
                  <h3 className="mt-2.5 font-semibold text-foreground">{svc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {svc.description}
                  </p>
                  {svc.url && (
                    <Link
                      href={svc.url}
                      className="mt-3 inline-block text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      바로가기 &rarr;
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
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10">
        <div className="relative z-10 flex items-start gap-8">
          <div className="flex-1">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Newsletter
            </div>
            <h2 className="text-xl font-bold text-foreground">새 소식 받아보기</h2>
            <p className="mt-3 mb-6 text-sm leading-relaxed text-muted-foreground">
              AI 실험 결과, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
              <br />
              스팸 없이, 새 글이 올라올 때만 보내드립니다.
            </p>
            <SubscribeForm />
            <p className="mt-4 text-xs text-muted-foreground">
              <Link
                href="/about"
                className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
              >
                만든 사람 보기 &rarr;
              </Link>
            </p>
          </div>

          {/* 캐릭터 — 라이트모드에서만 */}
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
/* 공통 섹션 래퍼                                       */
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
    <section className="mb-16">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-3">
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
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {label} &rarr;
        </Link>
      </div>
      {children}
    </section>
  );
}
