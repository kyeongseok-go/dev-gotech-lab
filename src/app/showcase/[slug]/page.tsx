import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { MDXContent } from "@/components/mdx/mdx-content";
import {
  getPublishedShowcase,
  getShowcaseBySlug,
  STATUS_LABEL,
} from "@/lib/content";

const STATUS_COLOR: Record<string, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  wip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  archived: "bg-muted text-muted-foreground",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getShowcaseBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/showcase/${slug}` },
  };
}

export function generateStaticParams() {
  return getPublishedShowcase().map((item) => ({ slug: item.slug }));
}

export default async function ShowcaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getShowcaseBySlug(slug);

  if (!item || item.draft) {
    notFound();
  }

  return (
    <PageContainer className="max-w-3xl">
      <article>
        {/* 메타 영역 */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-0.5 font-medium ${STATUS_COLOR[item.status] ?? STATUS_COLOR.archived}`}
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
            {item.type && (
              <span className="text-muted-foreground">{item.type}</span>
            )}
            {item.featured && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-primary-foreground">
                Featured
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold">{item.title}</h1>
          <p className="mt-3 text-muted-foreground">{item.summary}</p>

          {/* 기술 스택 */}
          {item.stack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.stack.map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* 외부 링크 */}
          {(item.externalUrl || item.repoUrl) && (
            <div className="mt-4 flex gap-3">
              {item.externalUrl && (
                <Link
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  사이트 보기
                </Link>
              )}
              {item.repoUrl && (
                <Link
                  href={item.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  GitHub
                </Link>
              )}
            </div>
          )}
        </header>

        {/* 본문 */}
        <div className="prose-custom">
          <MDXContent code={item.body} />
        </div>
      </article>

      {/* 목록으로 돌아가기 */}
      <div className="mt-12 border-t border-border pt-8">
        <Link
          href="/showcase"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Showcase 목록으로
        </Link>
      </div>
    </PageContainer>
  );
}
