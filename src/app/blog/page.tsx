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

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <header className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
              Blog
            </h1>
            <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
              최신 기술 트렌드와 개발 경험을 공유합니다.
              <br />
              주로 Full-stack 개발, Cloud Infrastructure, 그리고 UI/UX에 대해
              이야기합니다.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-12">
          <Suspense>
            <BlogFilter categories={categories} tags={tags} />
          </Suspense>
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="text-on-surface-variant">
          {category || tag
            ? "해당 조건에 맞는 글이 없습니다."
            : "아직 작성된 글이 없습니다."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Featured Article */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="md:col-span-12 group obsidian-card overflow-hidden flex flex-col md:flex-row card-accent-bar"
            >
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {featured.category && (
                    <span className="text-do-primary text-[10px] font-bold uppercase tracking-widest">
                      {featured.category}
                    </span>
                  )}
                  <span className="text-on-surface-variant text-xs font-medium">
                    {formatDate(featured.date)}
                  </span>
                  <span className="text-on-surface-variant text-xs font-medium">
                    &bull; {getReadingTime(featured.body)} min read
                  </span>
                </div>
                <h2 className="font-headline text-3xl font-bold tracking-tight text-white mb-4 group-hover:text-do-primary transition-colors">
                  {featured.title}
                </h2>
                {featured.description && (
                  <p className="text-on-surface-variant leading-relaxed mb-6 line-clamp-2">
                    {featured.description}
                  </p>
                )}
                {featured.tags.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2">
                    {featured.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-code text-do-primary bg-do-primary/10 px-2 py-1 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Rest of posts — Bento grid */}
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="md:col-span-6 group obsidian-card overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-on-surface-variant text-xs">
                    {formatDate(post.date)}
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    &bull; {getReadingTime(post.body)} min read
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold tracking-tight text-white mb-4 group-hover:text-do-primary transition-colors">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.description}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-code text-do-primary bg-do-primary/10 px-2 py-1 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
