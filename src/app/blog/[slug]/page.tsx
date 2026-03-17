import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/mdx/toc";
import { StickyToc } from "@/components/blog/sticky-toc";
import { AuthorProfile } from "@/components/blog/author-profile";
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
    <div className="relative mx-auto max-w-[1100px] px-5 py-12">
      {/* ── 본문 영역 ── */}
      <article className="mx-auto max-w-[768px]">
        {/* 헤더 */}
        <header className="mb-10">
          {/* 제목 — Velog 스타일 (3rem, ExtraBold) */}
          <h1 className="text-[2.5rem] font-extrabold leading-tight tracking-tight sm:text-[3rem]">
            {post.title}
          </h1>

          {post.description && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {post.description}
            </p>
          )}

          {/* 저자 프로필 */}
          <div className="mt-6">
            <AuthorProfile date={formatDate(post.date)} readingTime={readingTime} />
          </div>

          {/* 태그 — Mint 칩 스타일 */}
          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="tag-chip-velog"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* 카테고리 */}
          {post.category && (
            <div className="mt-4">
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {post.category}
              </Link>
            </div>
          )}

          <hr className="mt-8 border-border" />
        </header>

        {/* 모바일 목차 (xl 이하에서만 표시) */}
        {toc.length > 0 && (
          <div className="xl:hidden">
            <Toc items={toc} />
          </div>
        )}

        {/* 본문 — Velog 타이포그래피 */}
        <div className="prose-velog">
          <MDXContent code={post.body} />
        </div>
      </article>

      {/* ── Desktop Sticky TOC ── */}
      {toc.length > 0 && (
        <aside className="absolute right-0 top-48 hidden w-56 xl:block" style={{ position: "sticky", top: "5rem", alignSelf: "start" }}>
          {/* position: sticky가 absolute 안에선 안 됨. 별도 구조 필요 */}
        </aside>
      )}

      {/* Desktop Sticky TOC — 고정 위치 */}
      {toc.length > 0 && (
        <div className="fixed right-[max(1rem,calc((100vw-1100px)/2-14rem))] top-24 hidden w-52 xl:block">
          <StickyToc items={toc} />
        </div>
      )}

      {/* ── 이전/다음 글 네비게이션 ── */}
      {(prev || next) && (
        <nav className="mx-auto mt-14 max-w-[768px] grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="list-card group"
            >
              <span className="text-xs text-muted-foreground">&larr; 이전 글</span>
              <p className="mt-1.5 font-medium group-hover:text-primary transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="list-card group text-right"
            >
              <span className="text-xs text-muted-foreground">다음 글 &rarr;</span>
              <p className="mt-1.5 font-medium group-hover:text-primary transition-colors">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
