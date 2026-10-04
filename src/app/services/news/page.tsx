import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/section/page-heading";
import {
  getNewsItems,
  getNewsByCategory,
  getNewsCategories,
} from "@/lib/db/news";

export const metadata: Metadata = {
  title: "AI 뉴스",
  description: "AI·개발 관련 뉴스를 한눈에 모아봅니다.",
  alternates: { canonical: "/services/news" },
};

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
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="Services · News"
        count={items.length}
        title={
          <>
            AI <span className="marker">뉴스</span> 애그리게이터
          </>
        }
        lead={
          <>
            AI·개발 관련 뉴스를 한눈에 모아봅니다.{" "}
            <Link href="/services" className="prose-link">서비스 목록</Link>
          </>
        }
      />

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-1.5" role="group" aria-label="분류">
          <Link
            href="/services/news"
            aria-current={!category ? "page" : undefined}
            className={`tag-chip ${!category ? "!bg-on-surface !text-page" : ""}`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/services/news?category=${cat}`}
              aria-current={category === cat ? "page" : undefined}
              className={`tag-chip ${category === cat ? "!bg-on-surface !text-page" : ""}`}
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </Link>
          ))}
        </div>
      )}

      {/* 뉴스 목록 */}
      {items.length === 0 ? (
        <div className="border border-hairline p-8 text-center">
          <p className="text-on-surface-variant">
            {category
              ? "해당 카테고리에 뉴스가 없습니다."
              : "수집된 뉴스가 없습니다."}
          </p>
          <p className="mt-2 text-sm text-on-surface-muted">
            뉴스가 수집되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="border-b border-hairline">
          {items.map((item) => (
            <li key={item.id} className="border-t border-hairline">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block px-2 py-5 transition-colors hover:bg-surface-container-low"
              >
                <div className="flex items-center gap-3 font-code text-xs text-on-surface-muted">
                  <span className="font-bold text-on-surface">
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
                <h2 className="mt-2 type-title text-on-surface group-hover:text-do-primary transition-colors">{item.title}</h2>
                {item.summary && (
                  <p className="mt-1 type-small text-on-surface-variant line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
