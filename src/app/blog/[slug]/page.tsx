import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <main className="pt-32 pb-24">
      <article className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-4">
            <time>{formatDate(post.date)}</time>
            {post.category && (
              <>
                <span>&bull;</span>
                <span className="text-do-primary font-bold uppercase tracking-widest text-[10px]">
                  {post.category}
                </span>
              </>
            )}
            <span>&bull;</span>
            <span>{readingTime}분 읽기</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-on-surface leading-tight mb-6">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              {post.description}
            </p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-code text-do-primary bg-do-primary/10 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* TOC */}
        {toc.length > 0 && <Toc items={toc} />}

        {/* Body */}
        <div className="prose-custom">
          <MDXContent code={post.body} />
        </div>
        {/* Author Block */}
        <div className="mt-16 pt-8 border-t border-outline-variant/15 flex gap-6 items-center">
          <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src="/images/profile-id.jpg"
              alt="고경석"
              fill
              className="object-cover object-[center_20%]"
              sizes="64px"
            />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">고경석</p>
            <p className="text-sm text-on-surface-variant">AI Builder &middot; Full-stack Developer</p>
            <p className="text-xs text-on-surface-variant mt-1">gotech.lab 운영자</p>
          </div>
        </div>
      </article>

      {/* Prev/Next Navigation */}
      {(prev || next) && (
        <nav className="max-w-4xl mx-auto px-8 mt-16 grid gap-4 border-t border-outline-variant/15 pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="obsidian-card p-6 group"
            >
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <ArrowLeft size={12} /> 이전 글
              </span>
              <p className="mt-2 font-headline font-bold text-on-surface group-hover:text-do-primary transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="obsidian-card p-6 text-right group"
            >
              <span className="text-xs text-on-surface-variant flex items-center gap-1 justify-end">
                다음 글 <ArrowRight size={12} />
              </span>
              <p className="mt-2 font-headline font-bold text-on-surface group-hover:text-do-primary transition-colors">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
