import type { Metadata } from "next";
import { Suspense } from "react";
import { ALL_CATEGORIES, BlogCount, BlogFilter, BlogFilterView, type BlogEntry } from "@/components/blog/blog-filter";
import { PostRow } from "@/components/blog/post-row";
import {
  getPublishedBlogs,
  getAllCategories,
  getAllTags,
  getReadingTime,
  getSeriesLabel,
} from "@/lib/content";
import { formatDateDot } from "@/lib/format";
import { PageHeading } from "@/components/section/page-heading";

export const metadata: Metadata = {
  title: "블로그",
  description: "AI 실험, 개발 기록, 기술 인사이트를 공유합니다.",
  alternates: { canonical: "/blog" },
};

/**
 * 정적 페이지 — searchParams 를 읽지 않는다(읽으면 요청마다 SSR 되는 동적 경로가 된다).
 * 행 마크업·읽기 시간·번호는 빌드 때 한 번 계산하고, ?category=&tag= 필터는 클라이언트(BlogFilter)가 URL 로 처리한다.
 */
export default function BlogPage() {
  const allPosts = getPublishedBlogs();
  const categories = getAllCategories();
  const tags = getAllTags();
  const counts = Object.fromEntries(
    categories.map((c) => [c, allPosts.filter((p) => p.category === c).length]),
  );

  // 번호는 전체 기록 기준(오래된 글 = 001)으로 고정 — 필터해도 같은 글은 같은 번호
  const entries: BlogEntry[] = allPosts.map((post, i) => {
    const rowProps = {
      post,
      number: allPosts.length - i,
      dateLabel: formatDateDot(post.date),
      readingMinutes: getReadingTime(post.body),
      seriesLabel: getSeriesLabel(post.slug),
    };
    return {
      slug: post.slug,
      category: post.category,
      tags: post.tags,
      row: <PostRow {...rowProps} />,
      leadRow: i === 0 ? <PostRow {...rowProps} isLead /> : undefined,
    };
  });

  const filterProps = { categories, tags, counts, entries };

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="Blog · Contents"
        count={
          <Suspense fallback={String(entries.length).padStart(3, "0")}>
            <BlogCount entries={entries} />
          </Suspense>
        }
        size="xl"
        title={
          <>
            <span className="marker">Writing</span> the craft.
          </>
        }
        lead={
          <>
            AI 실험, 개발 기록, 기술 인사이트. 주로 <span className="text-em">Full-stack</span>,{" "}
            <span className="text-em">Cloud Infrastructure</span>, 그리고 <span className="text-em">UI/UX</span>.
          </>
        }
      />

      {/* 정적 HTML 에는 필터 없는 기본 화면이 들어가고, 하이드레이션 뒤 URL 의 필터가 반영된다 */}
      <Suspense fallback={<BlogFilterView {...filterProps} activeCategory={ALL_CATEGORIES} activeTag="" />}>
        <BlogFilter {...filterProps} />
      </Suspense>
    </main>
  );
}
