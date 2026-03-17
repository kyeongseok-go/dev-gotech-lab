import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { BlogFilter } from "@/components/blog/blog-filter";
import {
  getPublishedBlogs,
  getAllCategories,
  getAllTags,
  formatDate,
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
        <ul className="space-y-4">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="list-card block"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time>{formatDate(post.date)}</time>
                  {post.category && (
                    <>
                      <span className="text-border">|</span>
                      <span className="font-medium text-primary">{post.category}</span>
                    </>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>
                {post.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <span key={t} className="tag-badge">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
