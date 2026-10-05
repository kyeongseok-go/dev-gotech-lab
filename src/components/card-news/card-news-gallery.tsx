"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  SOURCE_KIND_LABEL,
  type CardNewsItem,
  type GalleryCard,
  type SourceKind,
} from "@/lib/card-news";

export type { CardNewsItem };

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI" },
  { key: "dev", label: "개발" },
  { key: "trend", label: "트렌드" },
  { key: "news", label: "뉴스" },
] as const;

const SOURCE_FILTERS: { key: SourceKind | "all"; label: string }[] = [
  { key: "all", label: "모든 출처" },
  { key: "official", label: SOURCE_KIND_LABEL.official },
  { key: "community", label: SOURCE_KIND_LABEL.community },
  { key: "korean", label: SOURCE_KIND_LABEL.korean },
  { key: "media", label: SOURCE_KIND_LABEL.media },
];

/** 벤토 상단: 최신 1건(커버) + 4건 */
const BENTO_COUNT = 5;
/** 아카이브 한 번에 보여줄 개수 */
const PAGE_SIZE = 24;

interface Filters {
  q: string;
  cat: string;
  tag: string;
  src: string;
}
const EMPTY: Filters = { q: "", cat: "all", tag: "", src: "all" };

/** URL ?q=&cat=&tag=&src= ↔ 상태. 정적 페이지 그대로 두기 위해 history API 로만 동기화 */
function readFilters(): Filters {
  const sp = new URLSearchParams(window.location.search);
  return {
    q: sp.get("q") ?? "",
    cat: sp.get("cat") ?? "all",
    tag: sp.get("tag") ?? "",
    src: sp.get("src") ?? "all",
  };
}
function writeFilters(f: Filters) {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.cat !== "all") sp.set("cat", f.cat);
  if (f.tag) sp.set("tag", f.tag);
  if (f.src !== "all") sp.set("src", f.src);
  const qs = sp.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

function matches(card: GalleryCard, f: Filters): boolean {
  if (f.cat !== "all" && card.category !== f.cat) return false;
  if (f.src !== "all" && card.source?.kind !== f.src) return false;
  if (f.tag && !card.tags.some((t) => t.toLowerCase() === f.tag.toLowerCase())) return false;
  if (f.q) {
    const needle = f.q.trim().toLowerCase();
    const hay = `${card.title} ${card.excerpt} ${card.tags.join(" ")} ${card.source?.name ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

/* ── 카드 ── */
function SourceLine({ card }: { card: GalleryCard }) {
  if (!card.source) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="font-bold text-on-surface">{card.source.name}</span>
      {card.source.isMediaLink && (
        <span className="border border-outline px-1 text-[10px] uppercase tracking-[0.06em] text-on-surface-muted">원문 미디어</span>
      )}
    </span>
  );
}

function CardNewsCard({ card, variant }: { card: GalleryCard; variant: "lead" | "bento" | "archive" }) {
  const isLead = variant === "lead";
  return (
    <Link
      href={`/card-news/${card.id}`}
      className={cn(
        "group flex h-full w-full flex-col bg-page transition-colors hover:bg-surface-container-low focus-visible:bg-surface-container-low focus-visible:outline-offset-[-2px] active:bg-surface-container",
        isLead ? "p-4 md:p-5" : "p-3 md:p-4",
      )}
    >
      <div className="relative overflow-hidden bg-surface-container">
        {card.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image_url}
            alt={`${card.title} 카드 썸네일`}
            loading={isLead ? "eager" : "lazy"}
            fetchPriority={isLead ? "high" : "auto"}
            decoding="async"
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="lab-grid aspect-square w-full" />
        )}
        {isLead && (
          <span className="absolute left-0 top-0 bg-do-primary px-2 py-1 font-code text-[11px] font-bold uppercase tracking-[0.08em] text-on-primary">
            Latest
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", isLead ? "pt-5" : "pt-3")}>
        <p className="font-code text-[11px] tabular text-on-surface-muted">
          <span className={isLead ? "" : "hidden sm:inline"}>{card.serial} · </span>
          {card.dateDot} · {CATEGORY_LABEL[card.category] ?? card.category}
        </p>
        <h3
          className={cn(
            "mt-2 text-on-surface transition-colors group-hover:text-do-primary",
            isLead ? "type-headline line-clamp-3" : "text-[15px] font-semibold leading-snug line-clamp-3",
          )}
        >
          {card.title}
        </h3>
        {isLead && card.excerpt && <p className="mt-3 type-small text-on-surface-variant line-clamp-3">{card.excerpt}</p>}
        <p className="mt-auto pt-3 font-code text-[11px] text-on-surface-muted">
          <SourceLine card={card} />
        </p>
      </div>
    </Link>
  );
}

/* ── 메인 갤러리 ── */
/** cards·popularTags 는 서버에서 미리 계산해 넘긴다(toGalleryCard·getPopularTags) */
export default function CardNewsGallery({ cards, popularTags }: { cards: GalleryCard[]; popularTags: string[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [ready, setReady] = useState(false);

  // 첫 렌더 후 URL 의 필터를 반영 (서버 HTML 은 기본 필터 그대로 정적 생성)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(readFilters());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeFilters(filters);
  }, [filters, ready]);

  const update = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE_SIZE);
  };

  const filtered = cards.filter((c) => matches(c, filters));
  const isNarrowed = Boolean(filters.q || filters.tag || filters.src !== "all");
  const bento = isNarrowed ? [] : filtered.slice(0, BENTO_COUNT);
  const archive = isNarrowed ? filtered : filtered.slice(BENTO_COUNT);
  const shownArchive = archive.slice(0, visible);
  const countOf = (key: string) => (key === "all" ? cards.length : cards.filter((c) => c.category === key).length);

  return (
    <div>
      {/* 필터 막대 */}
      <div className="border-y border-hairline">
        <div className="flex flex-col gap-0 md:flex-row md:items-stretch">
          <div role="group" aria-label="분류" className="flex overflow-x-auto [scrollbar-width:none] md:flex-1">
            {CATEGORY_FILTERS.map((f) => {
              const active = filters.cat === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ cat: f.key })}
                  className={cn(
                    "relative inline-flex h-12 flex-none items-center gap-2 px-3 md:px-4 text-sm transition-colors",
                    active
                      ? "font-semibold text-on-surface after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-do-primary"
                      : "font-medium text-on-surface-muted hover:text-on-surface",
                  )}
                >
                  {f.label}
                  <span className="font-code tabular text-[10px] text-on-surface-muted">{String(countOf(f.key)).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>
          <label className="flex h-12 items-center gap-2 border-t border-hairline md:w-80 md:border-l md:border-t-0 md:pl-4">
            <Search aria-hidden size={16} className="text-on-surface-muted" />
            <span className="sr-only">카드뉴스 검색</span>
            <input
              type="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="제목·요약·태그·출처 검색"
              className="h-full w-full min-w-0 bg-transparent text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 py-4 md:flex-row md:items-start md:gap-6">
        <div role="group" aria-label="출처 유형" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-code text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-muted">Source</span>
          {SOURCE_FILTERS.map((s) => (
            <button key={s.key} type="button" aria-pressed={filters.src === s.key} onClick={() => update({ src: s.key })} className="tag-chip">
              {s.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="태그" className="flex flex-wrap items-center gap-1.5 md:ml-auto md:max-w-[52%] md:justify-end">
          <span className="mr-1 font-code text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-muted">Tags</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={filters.tag === tag}
              onClick={() => update({ tag: filters.tag === tag ? "" : tag })}
              className="tag-chip"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {isNarrowed && (
        <div className="mb-6 flex flex-wrap items-center gap-3 font-code text-xs text-on-surface-muted" aria-live="polite">
          <span className="tabular">
            결과 <span className="font-bold text-on-surface">{filtered.length}</span>건
          </span>
          <button type="button" onClick={() => update({ ...EMPTY, cat: filters.cat })} className="text-link inline-flex items-center gap-1">
            <X aria-hidden size={12} /> 필터 해제
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-20 text-center type-body text-on-surface-variant">조건에 맞는 카드뉴스가 없습니다.</p>
      ) : (
        <>
          {bento.length > 0 && (
            <section aria-labelledby="latest-title" className="mt-4 grid grid-cols-2 lg:grid-cols-12 gap-px bg-hairline border border-hairline">
              <h2 id="latest-title" className="sr-only">최신 카드뉴스</h2>
              {bento.map((card, i) => (
                <div key={card.id} className={cn(i === 0 ? "col-span-2 lg:col-span-6 lg:row-span-2" : "col-span-1 lg:col-span-3")}>
                  <CardNewsCard card={card} variant={i === 0 ? "lead" : "bento"} />
                </div>
              ))}
            </section>
          )}

          {archive.length > 0 && (
            <section aria-labelledby="archive-title" className={bento.length > 0 ? "mt-16" : "mt-2"}>
              <div className="lab-head mb-6">
                <span className="lab-index">§A</span>
                <h2 id="archive-title" className="type-label text-on-surface">
                  {isNarrowed ? "Results · 검색 결과" : "Archive · 지난 카드"}
                </h2>
                <span className="font-code text-xs text-on-surface-muted tabular">
                  {Math.min(visible, archive.length)} / {archive.length}
                </span>
              </div>
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-hairline">
                {shownArchive.map((card) => (
                  <li key={card.id} className="border-r border-b border-hairline">
                    <CardNewsCard card={card} variant="archive" />
                  </li>
                ))}
              </ul>
              {visible < archive.length && (
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-outline inline-flex h-11 px-6 text-sm">
                    더 보기
                    <span className="font-code text-xs tabular">+{Math.min(PAGE_SIZE, archive.length - visible)}</span>
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
