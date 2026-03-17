import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { BlogFilter } from "@/components/blog/blog-filter";
import { BlogCard } from "@/components/blog/blog-card";
import {
  getPublishedBlogs,
  getAllCategories,
  getAllTags,
} from "@/lib/content";

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
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight">블로그</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        개발 기록과 기술 이야기를 공유합니다.
      </p>

      <Suspense>
        <BlogFilter categories={categories} tags={tags} />
      </Suspense>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {category || tag
            ? "해당 조건에 맞는 글이 없습니다."
            : "아직 작성된 글이 없습니다."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              thumbnail={(post as Record<string, unknown>).thumbnail as string | undefined}
              category={post.category}
              tags={post.tags}
              date={post.date}
              body={post.body}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
