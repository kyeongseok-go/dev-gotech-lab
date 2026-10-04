import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogFilter } from "@/components/blog/blog-filter";
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

interface Props {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { category, tag } = await searchParams;

  const allPosts = getPublishedBlogs();
  const categories = getAllCategories();
  const tags = getAllTags();
  const counts = Object.fromEntries(
    categories.map((c) => [c, allPosts.filter((p) => p.category === c).length]),
  );

  // 번호는 전체 기록 기준(오래된 글 = 001)으로 고정 — 필터해도 같은 글은 같은 번호
  const numberOf = new Map(allPosts.map((p, i) => [p.slug, allPosts.length - i]));

  const filtered = allPosts.filter((post) => {
    if (category && post.category !== category) return false;
    if (tag && !post.tags.includes(tag)) return false;
    return true;
  });
  const isFiltered = Boolean(category || tag);

  const list =
    filtered.length === 0 ? (
      <p className="py-16 type-body text-on-surface-variant">
        {isFiltered ? "해당 조건에 맞는 글이 없습니다." : "아직 작성된 글이 없습니다."}
      </p>
    ) : (
      <div className="border-b border-hairline">
        {filtered.map((post, i) => (
          <PostRow
            key={post.slug}
            post={post}
            number={numberOf.get(post.slug) ?? 0}
            dateLabel={formatDateDot(post.date)}
            readingMinutes={getReadingTime(post.body)}
                seriesLabel={getSeriesLabel(post.slug)}
            isLead={i === 0 && !isFiltered}
          />
        ))}
      </div>
    );

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="Blog · Contents"
        count={filtered.length}
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

      <Suspense fallback={list}>
        <BlogFilter categories={categories} tags={tags} counts={counts} total={allPosts.length}>
          {list}
        </BlogFilter>
      </Suspense>
    </main>
  );
}
