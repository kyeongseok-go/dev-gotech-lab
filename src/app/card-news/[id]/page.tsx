import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { CARD_NEWS_DATA } from "../page";
import { CardSlides } from "@/components/card-news/card-slides";
import { ShareButtons } from "@/components/card-news/share-buttons";
import { JsonLd } from "@/components/seo/json-ld";
import { DocHeader } from "@/components/section/doc-header";
import { CATEGORY_LABEL, SOURCE_KIND_LABEL, isMeaningfulTag, toCardView } from "@/lib/card-news";
import { getPublishedBlogs } from "@/lib/content";
import { formatDateDot } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

/* dynamicParams = false 를 두지 않는다: OpenNext(Cloudflare)는 증분 캐시를 설정하지 않으면 미리 만든 HTML 을
   런타임에 읽지 않아, 요청 시 렌더가 금지된 이 경로가 전부 404 가 됐다. 없는 번호는 아래 notFound() 가 404 로 처리한다. */

function findCard(id: string) {
  // "0185"·"185.0" 같은 다른 표기는 같은 카드의 중복 주소가 되므로 404
  if (!/^[1-9]\d*$/.test(id)) return null;
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
  const shownTags = card.tags.filter(isMeaningfulTag);
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

      <DocHeader
        crumbs={[{ href: "/card-news", label: "Card News" }]}
        stamp={{ k: "Card", v: card.serial }}
        meta={[
          <time key="d" dateTime={card.created_at}>{card.dateDot}</time>,
          CATEGORY_LABEL[card.category] ?? card.category,
          card.source ? SOURCE_KIND_LABEL[card.source.kind] : "출처 없음",
        ]}
        title={card.title}
        titleWidth="24em"
      >
        {card.source && (
          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
            <span className="font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">Source</span>
            <span className="font-semibold text-on-surface">{card.source.name}</span>
            {card.source.isMediaLink && <span className="tag-chip tag-chip-sm">원문 미디어</span>}
          </p>
        )}
      </DocHeader>

      <CardSlides card={card} />

      <div className="mt-16 grid grid-cols-12 gap-x-6 lg:gap-x-12 gap-y-12">
        {/* §A 원문 발췌 · 각주 */}
        <section aria-labelledby="excerpt-title" className="col-span-12 lg:col-span-7">
          <div className="lab-head mb-6">
            <span className="lab-index">§A</span>
            <h2 id="excerpt-title" className="type-label text-on-surface">원문 발췌</h2>
            <span className="font-code text-xs text-on-surface-muted">원문 표기 그대로</span>
          </div>
          {card.excerpt ? (
            <blockquote className="quote-specimen">
              {card.excerpt}
              {card.excerptTruncated && <span className="text-on-surface-muted"> …</span>}
              {card.source && (
                <a href="#fn-1" id="fn-ref-1" className="fn-ref" aria-label="각주 1: 출처">
                  1
                </a>
              )}
            </blockquote>
          ) : (
            <p className="type-small text-on-surface-muted">발췌할 원문 문장이 없는 카드입니다.</p>
          )}
          {card.source && (
            <ol className="footnotes" aria-label="각주">
              <li id="fn-1">
                <span>1</span>
                <span>
                  {card.source.name} — <span className="font-code">{card.source.host}</span>.{" "}
                  {card.source.isMediaLink
                    ? "기사 본문이 아니라 Reddit 에 올라온 이미지·영상 파일 링크입니다."
                    : "위 문장은 원문 일부를 짧게 옮긴 것이며 저작권은 원저작자에게 있습니다."}{" "}
                  <a href="#fn-ref-1" className="text-link font-normal" aria-label="본문으로 돌아가기">↩</a>
                </span>
              </li>
            </ol>
          )}
          {card.external_link && (
            <a
              href={card.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-8 inline-flex h-12 max-w-full px-6 text-[15px]"
            >
              {card.source?.isMediaLink ? "원문 미디어 열기" : "원문 보기"}
              <span className="truncate font-code text-xs font-normal opacity-80">{card.source?.host}</span>
              <ArrowUpRight aria-hidden size={16} className="btn-arrow flex-none" />
            </a>
          )}
        </section>

        {/* 기록 카드 — 사양 표 + 공유 */}
        <aside aria-labelledby="record-title" className="col-span-12 lg:col-span-5 flex flex-col gap-10">
          <div>
            <h2 id="record-title" className="type-label text-on-surface mb-3">기록 카드</h2>
            <dl className="spec-table">
              <dt>No.</dt>
              <dd className="font-code tabular">{card.serial}</dd>
              <dt>Date</dt>
              <dd className="font-code tabular">{card.dateDot}</dd>
              <dt>분류</dt>
              <dd>{CATEGORY_LABEL[card.category] ?? card.category}</dd>
              {card.source && (
                <>
                  <dt>출처</dt>
                  <dd>
                    {card.source.name}
                    <span className="ml-2 font-code text-xs text-on-surface-muted">{SOURCE_KIND_LABEL[card.source.kind]}</span>
                  </dd>
                </>
              )}
              {shownTags.length > 0 && (
                <>
                  <dt>Tags</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-1.5">
                      {shownTags.map((tag) => (
                        <li key={tag}>
                          <Link href={`/card-news?tag=${encodeURIComponent(tag)}`} className="tag-chip tag-chip-sm">
                            #{tag}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          </div>
          <div>
            <h2 className="type-label text-on-surface">공유</h2>
            <div className="mt-4">
              <ShareButtons url={url} title={card.title} />
            </div>
          </div>
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
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group cell-link">
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
          <Link href={`/card-news/${older.id}`} className="group cell-link">
            <span className="flex items-center gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
              <ArrowLeft aria-hidden size={12} /> 이전 카드 <span className="tabular">{older.serial}</span>
            </span>
            <span className="type-title text-on-surface line-clamp-2 group-hover:text-do-primary transition-colors">{older.title}</span>
          </Link>
        ) : (
          <div className="hidden sm:block bg-page" />
        )}
        {newer ? (
          <Link href={`/card-news/${newer.id}`} className="group cell-link items-end text-right">
            <span className="flex items-center justify-end gap-1 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
              다음 카드 <span className="tabular">{newer.serial}</span> <ArrowRight aria-hidden size={12} />
            </span>
            <span className="type-title text-on-surface line-clamp-2 group-hover:text-do-primary transition-colors">{newer.title}</span>
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
