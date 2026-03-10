import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { MDXContent } from "@/components/mdx/mdx-content";
import { getPublishedBlogs, getBlogBySlug, formatDate } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
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

  return (
    <PageContainer className="max-w-3xl">
      <article>
        {/* 메타 영역 */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time>{formatDate(post.date)}</time>
            {post.category && (
              <>
                <span>·</span>
                <span>{post.category}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
          {post.description && (
            <p className="mt-3 text-muted-foreground">{post.description}</p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
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
        </header>

        {/* 본문 */}
        <div className="prose-custom">
          <MDXContent code={post.body} />
        </div>
      </article>
    </PageContainer>
  );
}
