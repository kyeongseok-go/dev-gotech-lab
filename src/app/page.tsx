import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  getPublishedBlogs,
  getPublishedProjects,
  getPublishedShowcase,
  formatDate,
  STATUS_LABEL,
} from "@/lib/content";

export default function Home() {
  const blogs = getPublishedBlogs().slice(0, 3);
  const projects = getPublishedProjects().slice(0, 2);
  const showcaseItems = getPublishedShowcase().slice(0, 3);

  return (
    <PageContainer>
      {/* 인사말 */}
      <section className="mb-12">
        <h1 className="text-2xl font-semibold">
          안녕하세요, gotech.lab입니다.
        </h1>
        <p className="mt-3 text-muted-foreground">
          개인 홈페이지 · 기술 블로그 · 서비스 플랫폼
        </p>
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

      {/* 추천 프로젝트 */}
      <HomeSection title="프로젝트" href="/projects" label="전체 보기">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            등록된 프로젝트가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li
                key={project.slug}
                className="rounded-lg border border-border p-4"
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
              <li
                key={item.slug}
                className="rounded-lg border border-border p-4"
              >
                <span className="text-xs text-muted-foreground">
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>
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
