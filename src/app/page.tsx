import Link from "next/link";
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

const SERVICE_STATUS_LABEL: Record<string, string> = {
  live: "운영중",
  wip: "준비중",
  archived: "종료",
};

const SERVICE_STATUS_COLOR: Record<string, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  wip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  archived: "bg-muted text-muted-foreground",
};

export default async function Home() {
  const blogs = getPublishedBlogs().slice(0, 3);
  const projects = getPublishedProjects().slice(0, 2);
  const showcaseItems = getPublishedShowcase().slice(0, 3);
  const services = await getServices();
  const displayServices = services.slice(0, 2);

  return (
    <PageContainer>
      {/* 히어로 */}
      <section className="relative -mx-4 mb-16 overflow-hidden rounded-xl border border-border px-6 py-16 sm:px-10 sm:py-20">
        <div className="hero-dots pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            만들고, 기록하고, 공유합니다.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            5년간의 오피스 SW 엔진 개발 경험 위에,
            <br />
            AI를 활용해 빠르게 만들고 기록하는 사람의 공간입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["기술 블로그", "포트폴리오", "AI 실험", "서비스"].map((tag, i) => (
              <span
                key={tag}
                className="hero-tag rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/blog"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              블로그 보기
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              소개 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 최신 블로그 */}
      <HomeSection title="최신 블로그" href="/blog" label="전체 보기">
        {blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 작성된 글이 없습니다.
          </p>
        ) : (
          <ul className="space-y-4">
            {blogs.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time>{formatDate(post.date)}</time>
                    {post.category && (
                      <>
                        <span>·</span>
                        <span>{post.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-semibold">{post.title}</h3>
                  {post.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {post.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      {/* 추천 콘텐츠 placeholder */}
      <AdPlaceholder className="mb-12" />

      {/* 프로젝트 */}
      <HomeSection title="프로젝트" href="/projects" label="전체 보기">
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
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {project.summary}
                  </p>
                  {project.techStack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
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

      {/* AI Showcase */}
      <HomeSection title="AI Showcase" href="/showcase" label="전체 보기">
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
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      {/* 서비스 */}
      <HomeSection title="서비스" href="/services" label="전체 보기">
        {displayServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 서비스가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {displayServices.map((svc) => (
              <li key={svc.slug}>
                <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${SERVICE_STATUS_COLOR[svc.status] ?? SERVICE_STATUS_COLOR.archived}`}
                    >
                      {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">{svc.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {svc.description}
                  </p>
                  {svc.url && (
                    <Link
                      href={svc.url}
                      className="mt-3 inline-block text-sm text-primary underline underline-offset-4 hover:text-primary/80"
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

      {/* 구독 CTA */}
      <section className="mb-12 rounded-xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">새 소식 받아보기</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground leading-relaxed">
          AI 실험 결과, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
        </p>
        <SubscribeForm />
        <p className="mt-4 text-xs text-muted-foreground">
          스팸 없이, 새 글이 올라올 때만 보내드립니다.{" "}
          <Link
            href="/about"
            className="underline underline-offset-4 hover:text-foreground"
          >
            만든 사람 보기 →
          </Link>
        </p>
      </section>
    </PageContainer>
  );
}

/* ----------------------------------------------------------------- */
/* 공통 섹션 래퍼 (이 파일 내에서만 사용)                              */
/* ----------------------------------------------------------------- */
function HomeSection({
  title,
  href,
  label,
  children,
}: {
  title: string;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          href={href}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {label} →
        </Link>
      </div>
      {children}
    </section>
  );
}
