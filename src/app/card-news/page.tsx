import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedCardNews, getCardNewsByCategory } from "@/lib/db/card-news";

export const metadata: Metadata = {
  title: "카드뉴스",
  description: "최신 기술 동향과 트렌드를 카드뉴스로 빠르게 만나보세요.",
  alternates: { canonical: "/card-news" },
};

const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  ai: { label: "AI", className: "card-news-badge card-news-badge-ai" },
  trend: { label: "트렌드", className: "card-news-badge card-news-badge-trend" },
  dev: { label: "개발", className: "card-news-badge card-news-badge-dev" },
  news: { label: "뉴스", className: "card-news-badge card-news-badge-news" },
};

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI" },
  { key: "dev", label: "개발" },
  { key: "trend", label: "트렌드" },
  { key: "news", label: "뉴스" },
];

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CardNewsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const activeCategory = category || "all";

  const items = activeCategory === "all"
    ? await getPublishedCardNews()
    : await getCardNewsByCategory(activeCategory);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          매일 업데이트
        </div>
        <h1 className="text-3xl font-bold tracking-tight">기술 트렌드 카드뉴스</h1>
        <p className="mt-2 text-muted-foreground">
          최신 기술 동향과 트렌드를 한눈에 파악하세요.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={key === "all" ? "/card-news" : `/card-news?category=${key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === key
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* 카드뉴스 그리드 */}
      {items.length === 0 ? (
        <div className="list-card py-12 text-center">
          <p className="text-muted-foreground">
            {activeCategory === "all"
              ? "등록된 카드뉴스가 없습니다."
              : "해당 카테고리의 카드뉴스가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.news;
            const tags: string[] = (() => {
              try { return JSON.parse(item.tags); } catch { return []; }
            })();
            const href = item.external_link ?? `#${item.slug}`;
            const isExternal = !!item.external_link;

            return (
              <article key={item.id} id={item.slug} className="card-news-item flex flex-col overflow-hidden">
                {/* 썸네일 이미지 */}
                {item.image_url && (
                  <a
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </a>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* 상단: 카테고리 + 날짜 */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={badge.className}>{badge.label}</span>
                    <time className="text-xs text-muted-foreground">
                      {item.created_at?.slice(0, 10)}
                    </time>
                  </div>

                  {/* 제목 (클릭 시 외부 링크) */}
                  <a
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group"
                  >
                    <h2 className="mt-3 text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                      {isExternal && (
                        <svg className="ml-1 inline-block h-3.5 w-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      )}
                    </h2>
                  </a>

                  {/* 설명 */}
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>

                  {/* 태그 */}
                  {tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 구독 유도 */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="pointer-events-none mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">카드뉴스 구독하기</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          매일 새로운 기술 트렌드를 이메일로 받아보세요.
        </p>
        <div className="mt-4">
          <Link
            href="/subscribe"
            className="btn-glow inline-block rounded-xl px-6 py-2.5 text-sm"
          >
            구독 신청 &rarr;
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
