import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/mdx/toc";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { JsonLd } from "@/components/seo/json-ld";
import { DocHeader } from "@/components/section/doc-header";
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

/** 빌드 때 만든 글만 연다 — 없는·초안 slug 는 런타임 렌더 없이 404 (open-next.config.ts 정적 자산 캐시 전제) */
export const dynamicParams = false;

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

      <DocHeader
        crumbs={[
          { href: "/blog", label: "Blog" },
          ...(post.category ? [{ href: `/blog?category=${encodeURIComponent(post.category)}`, label: post.category }] : []),
        ]}
        stamp={{ k: "Entry", v: `No.${padNumber(number)}` }}
        meta={[
          <time key="d" dateTime={post.date}>{formatDateDot(post.date)}</time>,
          `${readingTime} min read`,
          ...(toc.length > 0 ? [`§ ${padNumber(toc.filter((t) => t.level === 2).length, 2)}`] : []),
        ]}
        kicker={
          series ? (
            <p className="inline-flex items-center gap-2 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
              <span aria-hidden className="inline-block size-2 bg-do-primary" />
              연재 · <span className="normal-case text-on-surface">{series.def.title}</span>
              <span className="tabular">
                {padNumber(series.position, 2)}/{padNumber(series.posts.length, 2)}
              </span>
            </p>
          ) : undefined
        }
        title={post.title}
      >
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
      </DocHeader>

      <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10">
        <article className="col-span-12 lg:col-span-8 min-w-0">
          {/* 요약 박스 — tldr(3줄)이 있으면 그것, 없으면 description 그대로 (지어내지 않음) */}
          {(tldr || post.description) && (
            <section aria-labelledby="summary-title" className="abstract-box mb-12">
              <h2 id="summary-title" className="flex items-baseline justify-between gap-4 font-code text-xs uppercase tracking-[0.12em] text-on-surface">
                <span>{tldr ? "Abstract · 3줄 요약" : "Abstract · 요약"}</span>
                <span className="text-on-surface-muted tabular">No.{padNumber(number)}</span>
              </h2>
              {tldr ? (
                <ol className="mt-4 space-y-2.5">
                  {tldr.map((line, i) => (
                    <li key={i} className="grid grid-cols-[2rem_1fr] gap-2 text-on-surface-variant">
                      <span className="font-code text-xs text-do-primary pt-1.5 tabular">{padNumber(i + 1, 2)}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 type-body text-on-surface-variant">{post.description}</p>
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
                        <p aria-current="page" className="grid grid-cols-[2.5rem_1fr] gap-3 py-3 pl-3 bg-surface-container-low shadow-[inset_2px_0_0_var(--do-primary)]">
                          <span className="font-code text-xs tabular text-do-primary pt-1">{padNumber(i + 1, 2)}</span>
                          <span className="font-semibold text-on-surface">{p.title} <span className="ml-1 font-code text-[11px] font-normal text-on-surface-muted">← 지금 읽는 글</span></span>
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

          {/* 기록자 */}
          <section aria-labelledby="author-title" className="mt-16 grid grid-cols-[auto_1fr] items-center gap-5 border-t border-on-surface pt-6">
            <div className="plate size-20 md:size-24">
              <Image src={avatar} alt="" width={96} height={96} sizes="96px" className="relative z-[1] size-full object-cover" />
            </div>
            <div>
              <p id="author-title" className="font-code text-[11px] uppercase tracking-[0.12em] text-on-surface-muted">Recorded by · 기록자</p>
              <p className="mt-1 text-lg font-semibold text-on-surface">고경석</p>
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
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group cell-link">
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
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group cell-link">
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
            <Link href={`/blog/${prev.slug}`} className="group cell-link">
              <span className="flex items-center gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
                <ArrowLeft aria-hidden size={12} /> 이전 글
              </span>
              <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{prev.title}</span>
            </Link>
          ) : (
            <div className="hidden sm:block bg-page" />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="group cell-link items-end text-right">
              <span className="flex items-center justify-end gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
                다음 글 <ArrowRight aria-hidden size={12} />
              </span>
              <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{next.title}</span>
            </Link>
          ) : (
            <div className="hidden sm:block bg-page" />
          )}
        </nav>
      )}
    </main>
  );
}
