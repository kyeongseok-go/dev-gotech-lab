import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BlogFilter } from "@/components/blog/blog-filter";
import {
  getPublishedBlogs,
  getAllCategories,
  getAllTags,
  formatDate,
  getReadingTime,
} from "@/lib/content";
import { PageHeading } from "@/components/section/page-heading";
import { SectionLabel } from "@/components/section/section-label";
import { ColorCard, COLOR_VARIANTS } from "@/components/section/color-card";
import { Reveal } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";

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

  const filtered = allPosts.filter((post) => {
    if (category && post.category !== category) return false;
    if (tag && !post.tags.includes(tag)) return false;
    return true;
  });

  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      <PageHeading
        eyebrow="Blog · Insights"
        count={filtered.length}
        size="xl"
        title={
          <>
            <span className="display-accent display-accent-emerald">Writing</span> the<br />
            craft.
          </>
        }
        lead={
          <>
            AI 실험, 개발 기록, 기술 인사이트를 공유합니다.
            <br className="hidden md:inline" />
            주로 <span className="text-em">Full-stack</span>,
            <span className="text-em"> Cloud Infrastructure</span>, 그리고
            <span className="text-em"> UI/UX</span>.
          </>
        }
      />

      <Reveal className="mb-14" as="section">
        <SectionLabel className="mb-4">Filter</SectionLabel>
        <Suspense>
          <BlogFilter categories={categories} tags={tags} />
        </Suspense>
      </Reveal>

      {filtered.length === 0 ? (
        <p className="type-body text-on-surface-variant">
          {category || tag
            ? "해당 조건에 맞는 글이 없습니다."
            : "아직 작성된 글이 없습니다."}
        </p>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {filtered.map((post, i) => {
            // 12-col 메이슨리 — 7/5/5/7 패턴 반복
            const pattern = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
            const colSpan = pattern[i % 4];
            const colorIdx = i % COLOR_VARIANTS.length;
            return (
              <Reveal key={post.slug} index={i} className={`col-span-12 ${colSpan}`} as="div">
                <Link href={`/blog/${post.slug}`} className="tilt-card block h-full">
                  <ColorCard index={colorIdx} className="p-7 md:p-8 h-full flex flex-col min-h-[260px]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-code text-[10px] uppercase tracking-widest opacity-85">
                        {post.category ?? "Blog"} · {formatDate(post.date)} · {getReadingTime(post.body)}min
                      </span>
                      <ArrowUpRight size={18} className="opacity-75" />
                    </div>
                    <h2 className="font-headline text-2xl md:text-3xl font-semibold leading-tight mb-3">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="type-small c-sub line-clamp-3 mb-5">
                        {post.description}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="font-code text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-black/15"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </ColorCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
