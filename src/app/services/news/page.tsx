import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  getNewsItems,
  getNewsByCategory,
  getNewsCategories,
} from "@/lib/db/news";

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  dev: "개발",
  general: "일반",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [items, categories] = await Promise.all([
    category ? getNewsByCategory(category) : getNewsItems(),
    getNewsCategories(),
  ]);

  return (
    <PageContainer>
      <div className="mb-2">
        <Link
          href="/services"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 서비스 목록
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">AI 뉴스 애그리게이터</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        AI·개발 관련 뉴스를 한눈에 모아봅니다.
      </p>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href="/services/news"
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !category
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/services/news?category=${cat}`}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </Link>
          ))}
        </div>
      )}

      {/* 뉴스 목록 */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {category
              ? "해당 카테고리에 뉴스가 없습니다."
              : "수집된 뉴스가 없습니다."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            뉴스가 수집되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                  <span>{item.source}</span>
                  {item.published_at && (
                    <>
                      <span>·</span>
                      <time>{item.published_at}</time>
                    </>
                  )}
                </div>
                <h2 className="mt-2 font-semibold">{item.title}</h2>
                {item.summary && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
