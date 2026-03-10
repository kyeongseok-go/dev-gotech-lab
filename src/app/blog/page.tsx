import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedBlogs, formatDate } from "@/lib/content";

export default function BlogPage() {
  const posts = getPublishedBlogs();

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">블로그</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        개발 기록과 기술 이야기를 공유합니다.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">아직 작성된 글이 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-border p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time>{formatDate(post.date)}</time>
                  {post.category && (
                    <>
                      <span>·</span>
                      <span>{post.category}</span>
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
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                      >
                        {tag}
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
