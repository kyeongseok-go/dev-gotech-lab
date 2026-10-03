import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/mdx/toc";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAdjacentBlogs,
  getReadingTime,
  extractToc,
  getSeriesForPost,
  getRelatedPosts,
  getRelatedProjectsForPost,
} from "@/lib/content";
import { formatDateDot, padNumber } from "@/lib/format";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import avatar from "../../../../public/images/avatar.webp";

interface Props {
  params: Promise<{ slug: string }>;
}

const AUTHOR = { name: "고경석", url: `${SITE_URL}/about` } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description ?? `${post.title} — GoTechy 블로그`,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? undefined,
      publishedTime: post.date,
      authors: [AUTHOR.name],
      tags: post.tags,
    },
  };
}

export function generateStaticParams() {
  return getPublishedBlogs().map((post) => ({ slug: post.slug }));
}

/** 구조화 데이터 — BlogPosting + BreadcrumbList (본문에 있는 값만 사용) */
function buildJsonLd(post: NonNullable<ReturnType<typeof getBlogBySlug>>, seriesTitle?: string) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const posting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "ko-KR",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
    publisher: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
    keywords: post.tags.join(", "),
    ...(post.category ? { articleSection: post.category } : {}),
    ...(seriesTitle ? { isPartOf: { "@type": "CreativeWorkSeries", name: seriesTitle } } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "블로그", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  return [posting, breadcrumb];
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post || post.draft) {
    notFound();
  }

  const allPosts = getPublishedBlogs();
  const number = allPosts.length - allPosts.findIndex((p) => p.slug === slug);
  const { prev, next } = getAdjacentBlogs(slug);
  const readingTime = getReadingTime(post.body);
  const toc = extractToc(post.body);
  const series = getSeriesForPost(slug);
  const related = getRelatedPosts(slug);
  const relatedProjects = getRelatedProjectsForPost(slug);
  const tldr = post.tldr && post.tldr.length > 0 ? post.tldr : null;

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <ReadingProgress targetId="article-body" />
      <JsonLd data={buildJsonLd(post, series?.def.title)} />

      {/* 브레드크럼 + 메타 */}
      <header className="mb-12 md:mb-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-on-surface pt-3 font-code text-xs uppercase tracking-[0.08em]">
          <nav aria-label="위치" className="text-on-surface-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-on-surface">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="hover:text-on-surface">Blog</Link>
              </li>
              {post.category && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-on-surface">
                      {post.category}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <p className="tabular text-on-surface-muted">
            <span className="font-bold text-on-surface">No.{padNumber(number)}</span>
            {" · "}
            <time dateTime={post.date}>{formatDateDot(post.date)}</time>
            {" · "}
            {readingTime} min read
          </p>
        </div>

        {series && (
          <p className="mt-8 inline-flex items-center gap-2 border border-hairline px-3 py-1.5 font-code text-xs font-bold uppercase tracking-[0.08em] text-on-surface">
            <span aria-hidden className="inline-block size-2 bg-mark ring-1 ring-mark-edge" />
            연재 · {series.def.title}
            <span className="tabular text-on-surface-muted">
              {series.position}/{series.posts.length}
            </span>
          </p>
        )}

        <h1 className="mt-6 max-w-[22em] type-article-title text-on-surface">{post.title}</h1>

        {post.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="태그">
            {post.tags.map((tag: string) => (
              <li key={tag}>
                <Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="tag-chip">
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10">
        <article className="col-span-12 lg:col-span-8 min-w-0">
          {/* 요약 박스 — tldr(3줄)이 있으면 그것, 없으면 description 그대로 (지어내지 않음) */}
          {(tldr || post.description) && (
            <section aria-labelledby="summary-title" className="card-color mb-10 px-5 py-5 md:px-7 md:py-6">
              <h2 id="summary-title" className="type-label text-on-surface">
                {tldr ? "3줄 요약" : "요약 · Summary"}
              </h2>
              {tldr ? (
                <ol className="mt-4 space-y-2">
                  {tldr.map((line, i) => (
                    <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-2 text-on-surface-variant">
                      <span className="font-code text-xs font-bold text-on-surface pt-1 tabular">{i + 1}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 type-body text-on-surface-variant">{post.description}</p>
              )}
            </section>
          )}

          {/* 모바일·태블릿 목차 */}
          {toc.length > 0 && (
            <div className="lg:hidden">
              <Toc items={toc} variant="inline" />
            </div>
          )}

          <div id="article-body" className="max-w-[44rem]">
            <MDXContent collection="blogs" slug={slug} />
          </div>

          {/* 시리즈 전체 목록 */}
          {series && (
            <nav aria-labelledby="series-title" className="mt-16 border-t border-on-surface pt-4">
              <h2 id="series-title" className="type-label text-on-surface">
                연재 목록 · {series.def.title}
              </h2>
              <ol className="mt-4 border-b border-hairline">
                {series.posts.map((p, i) => {
                  const current = p.slug === slug;
                  return (
                    <li key={p.slug} className="border-t border-hairline">
                      {current ? (
                        <p aria-current="page" className="grid grid-cols-[2.5rem_1fr] gap-3 py-3 pl-2 border-l-4 border-mark">
                          <span className="font-code text-xs font-bold tabular text-on-surface pt-1">{padNumber(i + 1, 2)}</span>
                          <span className="font-bold text-on-surface">{p.title}</span>
                        </p>
                      ) : (
                        <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[2.5rem_1fr] gap-3 py-3 pl-3 hover:bg-surface-container-low transition-colors">
                          <span className="font-code text-xs tabular text-on-surface-muted pt-1">{padNumber(i + 1, 2)}</span>
                          <span className="text-on-surface-variant group-hover:text-do-primary transition-colors">{p.title}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {/* 저자 */}
          <section aria-label="글쓴이" className="mt-16 flex items-center gap-5 border-t border-hairline pt-8">
            <Image src={avatar} alt="고경석 증명사진" width={64} height={64} sizes="64px" className="size-16 object-cover" />
            <div>
              <p className="font-bold text-on-surface">고경석</p>
              <p className="type-small text-on-surface-variant">풀스택 엔지니어 · 오피스 SW 엔진 5년 5개월 · AI 페어 빌드</p>
              <Link href="/about" className="text-link mt-1 inline-flex items-center gap-1 text-sm">
                소개 보기 <ArrowUpRight aria-hidden size={14} />
              </Link>
            </div>
          </section>
        </article>

        {/* 데스크톱 목차 — 따라오는 사이드바 */}
        {toc.length > 0 && (
          <aside className="hidden lg:block lg:col-span-3 lg:col-start-10">
            <div className="sticky top-28">
              <Toc items={toc} />
            </div>
          </aside>
        )}
      </div>

      {/* 관련 프로젝트 */}
      {relatedProjects.length > 0 && (
        <section aria-labelledby="related-projects-title" className="mt-20">
          <div className="lab-head mb-6">
            <span className="lab-index">§P</span>
            <h2 id="related-projects-title" className="type-label text-on-surface">이 글의 프로젝트</h2>
            <span />
          </div>
          <ul className="grid gap-px bg-hairline border border-hairline md:grid-cols-2">
            {relatedProjects.map((p) => (
              <li key={p.slug} className="bg-page">
                <Link href={`/projects/${p.slug}`} className="group flex h-full flex-col gap-3 p-6 hover:bg-surface-container-low transition-colors">
                  <span className="font-code text-xs text-on-surface-muted tabular">{p.period ?? "Project"}</span>
                  <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{p.title}</span>
                  <span className="type-small text-on-surface-variant line-clamp-2">{p.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 관련 글 */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20">
          <div className="lab-head mb-6">
            <span className="lab-index">§R</span>
            <h2 id="related-title" className="type-label text-on-surface">함께 읽을 기록</h2>
            <span className="font-code text-xs text-on-surface-muted">태그 기준</span>
          </div>
          <ul className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug} className="bg-page">
                <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col gap-3 p-6 hover:bg-surface-container-low transition-colors">
                  <time dateTime={p.date} className="font-code text-xs text-on-surface-muted tabular">{formatDateDot(p.date)}</time>
                  <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 이전/다음 */}
      {(prev || next) && (
        <nav aria-label="이전·다음 글" className="mt-20 grid gap-px bg-hairline border border-hairline sm:grid-cols-2">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="group bg-page p-6 hover:bg-surface-container-low transition-colors">
              <span className="flex items-center gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
                <ArrowLeft aria-hidden size={12} /> 이전 글
              </span>
              <p className="mt-2 type-title text-on-surface group-hover:text-do-primary transition-colors">{prev.title}</p>
            </Link>
          ) : (
            <div className="hidden sm:block bg-page" />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="group bg-page p-6 text-right hover:bg-surface-container-low transition-colors">
              <span className="flex items-center justify-end gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
                다음 글 <ArrowRight aria-hidden size={12} />
              </span>
              <p className="mt-2 type-title text-on-surface group-hover:text-do-primary transition-colors">{next.title}</p>
            </Link>
          ) : (
            <div className="hidden sm:block bg-page" />
          )}
        </nav>
      )}
    </main>
  );
}
