"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/reui/badge";
import { cn } from "@/lib/utils";

export interface CardNewsItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: "ai" | "dev" | "trend" | "news";
  image_url: string | null;
  external_link: string | null;
  tags: string[];
  created_at: string;
  span: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  dev: "개발",
  trend: "트렌드",
  news: "뉴스",
};

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI" },
  { key: "dev", label: "개발" },
  { key: "trend", label: "트렌드" },
  { key: "news", label: "뉴스" },
] as const;

/** 벤토 상단: 최신 1건(커버) + 4건 */
const BENTO_COUNT = 5;
/** 아카이브 한 번에 보여줄 개수 */
const PAGE_SIZE = 24;

const dot = (d: string) => d.slice(0, 10).replaceAll("-", ".");

/* ── 모달 ── */
function CardNewsModal({ item, onClose }: { item: CardNewsItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const titleId = `card-news-title-${item.id}`;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 grid w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-page border border-outline sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        initial={prefersReduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReduced ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="aspect-square w-full object-cover sm:border-r border-hairline" />
        )}
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between gap-3 font-code text-xs text-on-surface-muted">
            <span className="tabular">
              #{String(item.id).padStart(3, "0")} · {dot(item.created_at)} ·{" "}
              <span className="text-do-primary">{CATEGORY_LABEL[item.category] ?? item.category}</span>
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center text-on-surface hover:text-do-primary transition-colors"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </div>

          <h2 id={titleId} className="mt-4 type-title text-on-surface">
            {item.title}
          </h2>
          <p className="mt-3 type-small text-on-surface-variant">{item.summary}</p>

          {item.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {Array.from(new Set(item.tags)).map((tag) => (
                <Badge key={tag} variant="outline" size="sm" className="normal-case">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {item.external_link && (
            <a
              href={item.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 self-start inline-flex h-11 px-5 text-sm"
            >
              원문 보기
              <ArrowUpRight aria-hidden size={16} className="btn-arrow" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 카드 ── */
interface CardProps {
  item: CardNewsItem;
  variant: "lead" | "bento" | "archive";
  onOpen: (item: CardNewsItem) => void;
}

function CardNewsCard({ item, variant, onOpen }: CardProps) {
  const isLead = variant === "lead";
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "group flex h-full w-full flex-col text-left bg-page transition-colors hover:bg-surface-container-low focus-visible:bg-surface-container-low",
        isLead ? "p-4 md:p-5" : "p-3 md:p-4",
      )}
    >
      <div className="relative overflow-hidden bg-surface-container">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            loading={isLead ? "eager" : "lazy"}
            decoding="async"
            width={600}
            height={600}
            className="aspect-square w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
          />
        ) : (
          <div className="lab-grid aspect-square w-full" />
        )}
        {isLead && (
          <span className="absolute left-0 top-0 bg-do-primary px-2 py-1 font-code text-[11px] uppercase tracking-[0.08em] text-on-primary">
            Latest
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", isLead ? "pt-5" : "pt-3")}>
        <p className="font-code text-[11px] tabular text-on-surface-muted">
          <span className={isLead ? "" : "hidden sm:inline"}>#{String(item.id).padStart(3, "0")} · </span>
          {dot(item.created_at)} ·{" "}
          <span className="text-do-primary">{CATEGORY_LABEL[item.category] ?? item.category}</span>
        </p>
        <h3
          className={cn(
            "mt-2 text-on-surface transition-colors group-hover:text-do-primary",
            isLead ? "type-headline line-clamp-3" : "text-[15px] font-semibold leading-snug line-clamp-2",
          )}
        >
          {item.title}
        </h3>
        {isLead && <p className="mt-3 type-small text-on-surface-variant line-clamp-3">{item.summary}</p>}
      </div>
    </button>
  );
}

/* ── 메인 갤러리 ── */
export default function CardNewsGallery({ items }: { items: CardNewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openItem, setOpenItem] = useState<CardNewsItem | null>(null);
  const closeModal = useCallback(() => setOpenItem(null), []);

  const filtered = activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);
  const bento = filtered.slice(0, BENTO_COUNT);
  const archive = filtered.slice(BENTO_COUNT);
  const shownArchive = archive.slice(0, visible);

  const countOf = (key: string) => (key === "all" ? items.length : items.filter((i) => i.category === key).length);

  const onCategoryChange = (value: string) => {
    setActiveCategory(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <Tabs value={activeCategory} onValueChange={onCategoryChange} className="gap-0">
        <div className="border-b border-hairline overflow-x-auto [scrollbar-width:none]">
          <TabsList variant="line" aria-label="카테고리" className="h-auto gap-0 p-0">
            {CATEGORY_FILTERS.map((f) => (
              <TabsTrigger
                key={f.key}
                value={f.key}
                className="h-11 flex-none gap-2 rounded-none px-3 md:px-4 text-sm font-medium text-on-surface-muted hover:text-on-surface data-active:text-on-surface after:!bottom-[-1px] after:!h-[2px] after:bg-do-primary"
              >
                {f.label}
                <span className="font-code tabular text-[10px] text-on-surface-faint">
                  {String(countOf(f.key)).padStart(2, "0")}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeCategory} className="pt-8 text-base">
          {filtered.length === 0 ? (
            <p className="py-20 text-center type-body text-on-surface-variant">해당 카테고리의 카드뉴스가 없습니다.</p>
          ) : (
            <>
              {/* 벤토 — 최신 1건 크게, 다음 4건 2×2 */}
              <section aria-label="최신 카드뉴스" className="grid grid-cols-2 lg:grid-cols-12 gap-px bg-hairline border border-hairline">
                {bento.map((item, i) => (
                  <div
                    key={item.id}
                    className={cn(
                      i === 0 ? "col-span-2 lg:col-span-6 lg:row-span-2" : "col-span-1 lg:col-span-3",
                    )}
                  >
                    <CardNewsCard item={item} variant={i === 0 ? "lead" : "bento"} onOpen={setOpenItem} />
                  </div>
                ))}
              </section>

              {/* 아카이브 */}
              {archive.length > 0 && (
                <section aria-labelledby="archive-title" className="mt-16">
                  <div className="lab-head mb-6">
                    <span className="lab-index">§A</span>
                    <h2 id="archive-title" className="type-label text-on-surface">
                      Archive · 지난 카드
                    </h2>
                    <span className="font-code text-xs text-on-surface-muted tabular">
                      {Math.min(visible, archive.length)} / {archive.length}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-hairline border border-hairline">
                    <AnimatePresence initial={false}>
                      {shownArchive.map((item) => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <CardNewsCard item={item} variant="archive" onOpen={setOpenItem} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  {visible < archive.length && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisible((v) => v + PAGE_SIZE)}
                        className="btn-outline inline-flex h-11 px-6 text-sm"
                      >
                        더 보기
                        <span className="font-code text-xs text-on-surface-muted tabular">
                          +{Math.min(PAGE_SIZE, archive.length - visible)}
                        </span>
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {openItem && <CardNewsModal item={openItem} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}
