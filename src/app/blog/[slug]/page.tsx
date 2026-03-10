import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/mdx/toc";
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAdjacentBlogs,
  getReadingTime,
  extractToc,
  formatDate,
} from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description ?? `${post.title} — gotech.lab 블로그`,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? undefined,
      publishedTime: post.date,
    },
  };
}

export function generateStaticParams() {
  return getPublishedBlogs().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post || post.draft) {
    notFound();
  }

  const { prev, next } = getAdjacentBlogs(slug);
  const readingTime = getReadingTime(post.body);
  const toc = extractToc(post.body);

  return (
    <PageContainer className="max-w-3xl">
      <article>
        {/* 메타 영역 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time>{formatDate(post.date)}</time>
            {post.category && (
              <>
                <span>·</span>
                <span>{post.category}</span>
              </>
            )}
            <span>·</span>
            <span>{readingTime}분 읽기</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
          {post.description && (
            <p className="mt-3 text-muted-foreground">{post.description}</p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 목차 */}
        {toc.length > 0 && <Toc items={toc} />}

        {/* 본문 */}
        <div className="prose-custom">
          <MDXContent code={post.body} />
        </div>
      </article>

      {/* 이전/다음 글 네비게이션 */}
      {(prev || next) && (
        <nav className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <span className="text-xs text-muted-foreground">← 이전 글</span>
              <p className="mt-1 font-medium group-hover:text-primary">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="group rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50"
            >
              <span className="text-xs text-muted-foreground">다음 글 →</span>
              <p className="mt-1 font-medium group-hover:text-primary">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </PageContainer>
  );
}
