import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { CARD_NEWS_DATA } from "../page";
import { CardSlides } from "@/components/card-news/card-slides";
import { ShareButtons } from "@/components/card-news/share-buttons";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORY_LABEL, SOURCE_KIND_LABEL, isMeaningfulTag, toCardView } from "@/lib/card-news";
import { getPublishedBlogs } from "@/lib/content";
import { formatDateDot } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

function findCard(id: string) {
  const n = Number(id);
  const index = CARD_NEWS_DATA.findIndex((c) => c.id === n);
  return index >= 0 ? { index, card: toCardView(CARD_NEWS_DATA[index]) } : null;
}

export function generateStaticParams() {
  return CARD_NEWS_DATA.map((c) => ({ id: String(c.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = findCard(id);
  if (!found) return {};
  const { card } = found;
  const description = card.excerpt || `${card.title} — GoTechy 카드뉴스`;
  return {
    title: `${card.title} · 카드뉴스 ${card.serial}`,
    description,
    alternates: { canonical: `/card-news/${card.id}` },
    openGraph: {
      type: "article",
      title: card.title,
      description,
      publishedTime: card.created_at,
      ...(card.image_url ? { images: [{ url: card.image_url, width: 600, height: 600, alt: `${card.title} 카드 썸네일` }] } : {}),
    },
    twitter: { card: "summary", title: card.title, description },
  };
}

/** 카드 태그와 정확히 같은 태그를 가진 블로그 글 (일반어 태그 제외) */
function relatedPosts(tags: string[]) {
  const set = new Set(tags.filter(isMeaningfulTag).map((t) => t.toLowerCase()));
  if (set.size === 0) return [];
  return getPublishedBlogs()
    .filter((p) => p.tags.some((t) => set.has(t.toLowerCase())))
    .slice(0, 3);
}

export default async function CardNewsDetailPage({ params }: Props) {
  const { id } = await params;
  const found = findCard(id);
  if (!found) notFound();
  const { card, index } = found;

  const newer = index > 0 ? toCardView(CARD_NEWS_DATA[index - 1]) : null;
  const older = index < CARD_NEWS_DATA.length - 1 ? toCardView(CARD_NEWS_DATA[index + 1]) : null;
  const posts = relatedPosts(card.tags);
  const url = `${SITE_URL}/card-news/${card.id}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "카드뉴스", item: `${SITE_URL}/card-news` },
      { "@type": "ListItem", position: 3, name: card.title, item: url },
    ],
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <JsonLd data={breadcrumb} />

      <header className="mb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-on-surface pt-3 font-code text-xs uppercase tracking-[0.08em]">
          <nav aria-label="위치" className="text-on-surface-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-on-surface">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/card-news" className="hover:text-on-surface">Card News</Link></li>
            </ol>
          </nav>
          <p className="tabular text-on-surface-muted">
            <span className="font-bold text-on-surface">{card.serial}</span>
            {" · "}
            <time dateTime={card.created_at}>{card.dateDot}</time>
            {" · "}
            {CATEGORY_LABEL[card.category] ?? card.category}
          </p>
        </div>
        <h1 className="mt-8 max-w-[24em] type-article-title text-on-surface">{card.title}</h1>
        {card.source && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">{card.source.name}</span>
            <span className="tag-chip !min-h-0 !py-0 text-xs">{SOURCE_KIND_LABEL[card.source.kind]}</span>
            {card.source.isMediaLink && <span className="tag-chip !min-h-0 !py-0 text-xs">원문 미디어</span>}
          </p>
        )}
      </header>

      <CardSlides card={card} />

      <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10">
        {/* 원문 발췌 · 출처 링크 */}
        <section aria-labelledby="excerpt-title" className="col-span-12 lg:col-span-8">
          <h2 id="excerpt-title" className="type-label text-on-surface">원문 발췌 · 출처 링크</h2>
          {card.excerpt && (
            <blockquote className="mt-4 border-l-2 border-do-primary bg-surface-container-low py-4 pl-5 pr-4 type-body text-on-surface-variant">
              {card.excerpt}
              {card.excerptTruncated && <span className="text-on-surface-muted"> …</span>}
            </blockquote>
          )}
          <p className="mt-3 type-small text-on-surface-muted">
            위 문장은 원문 일부를 짧게 옮긴 것이며 저작권은 원저작자에게 있습니다. 전체 내용은 출처에서 확인하세요.
            {card.source?.isMediaLink && " 이 카드의 원문 링크는 기사 본문이 아니라 Reddit 에 올라온 이미지·영상 파일입니다."}
          </p>
          {card.external_link && (
            <a href={card.external_link} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 inline-flex h-12 px-6 text-[15px]">
              {card.source?.isMediaLink ? "원문 미디어 열기" : "원문 보기"}
              <span className="font-code text-xs font-normal">{card.source?.host}</span>
              <ArrowUpRight aria-hidden size={16} />
            </a>
          )}
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div>
            <h2 className="type-label text-on-surface">공유</h2>
            <div className="mt-4">
              <ShareButtons url={url} title={card.title} />
            </div>
          </div>
          {card.tags.length > 0 && (
            <div>
              <h2 className="type-label text-on-surface">태그</h2>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/card-news?tag=${encodeURIComponent(tag)}`} className="tag-chip">#{tag}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {posts.length > 0 && (
        <section aria-labelledby="related-posts-title" className="mt-20">
          <div className="lab-head mb-6">
            <span className="lab-index">§R</span>
            <h2 id="related-posts-title" className="type-label text-on-surface">이 주제로 쓴 글</h2>
            <span className="font-code text-xs text-on-surface-muted">같은 태그</span>
          </div>
          <ul className="grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug} className="bg-page">
                <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col gap-3 p-6 hover:bg-surface-container-low transition-colors">
                  <time dateTime={p.date} className="font-code text-xs text-on-surface-muted tabular">{formatDateDot(p.date)}</time>
                  <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="이전·다음 카드" className="mt-20 grid gap-px bg-hairline border border-hairline sm:grid-cols-2">
        {older ? (
          <Link href={`/card-news/${older.id}`} className="group bg-page p-6 hover:bg-surface-container-low transition-colors">
            <span className="flex items-center gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
              <ArrowLeft aria-hidden size={12} /> 이전 카드 {older.serial}
            </span>
            <p className="mt-2 type-title text-on-surface line-clamp-2 group-hover:text-do-primary transition-colors">{older.title}</p>
          </Link>
        ) : (
          <div className="hidden sm:block bg-page" />
        )}
        {newer ? (
          <Link href={`/card-news/${newer.id}`} className="group bg-page p-6 text-right hover:bg-surface-container-low transition-colors">
            <span className="flex items-center justify-end gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
              다음 카드 {newer.serial} <ArrowRight aria-hidden size={12} />
            </span>
            <p className="mt-2 type-title text-on-surface line-clamp-2 group-hover:text-do-primary transition-colors">{newer.title}</p>
          </Link>
        ) : (
          <div className="hidden sm:block bg-page" />
        )}
      </nav>

      <p className="mt-10">
        <Link href="/card-news" className="text-link inline-flex items-center gap-1 text-sm">
          <ArrowLeft aria-hidden size={14} /> 카드뉴스 전체 보기
        </Link>
      </p>
    </main>
  );
}
