"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Cpu, Code2, TrendingUp, Newspaper } from "lucide-react";

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

const CATEGORY_BADGE: Record<string, { label: string; color: string }> = {
  ai:    { label: "AI",     color: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" },
  dev:   { label: "개발",   color: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  trend: { label: "트렌드", color: "bg-violet-500/20 text-violet-300 border border-violet-500/30" },
  news:  { label: "뉴스",   color: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  ai:    <Cpu className="w-7 h-7" />,
  dev:   <Code2 className="w-7 h-7" />,
  trend: <TrendingUp className="w-7 h-7" />,
  news:  <Newspaper className="w-7 h-7" />,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  ai:    "from-cyan-500/20 to-violet-600/15",
  dev:   "from-emerald-500/20 to-cyan-500/15",
  trend: "from-violet-500/20 to-rose-500/15",
  news:  "from-rose-500/20 to-cyan-500/15",
};

/* ── 모달 ── */
function CardNewsModal({ item, onClose }: { item: CardNewsItem; onClose: () => void }) {
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.news;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--do-surface-container)" }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {item.image_url && (
          <div className="relative h-48 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-on-surface leading-snug mb-3">{item.title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{item.summary}</p>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs text-on-surface-variant border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {item.external_link && (
            <a
              href={item.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-do-primary/10 text-do-primary border border-do-primary/20 hover:bg-do-primary/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              원문 보기
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 개별 카드 ── */
function CardNewsCard({ item, spanClass }: { item: CardNewsItem; spanClass: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.news;
  const gradient = CATEGORY_GRADIENT[item.category] ?? CATEGORY_GRADIENT.news;
  const icon = CATEGORY_ICON[item.category];

  return (
    <>
      <motion.div
        className={`relative rounded-2xl overflow-hidden cursor-pointer group ${spanClass}`}
        style={{ background: "var(--do-surface-container-low)" }}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={() => setIsOpen(true)}
      >
        {/* 배경 이미지 또는 그라디언트 */}
        {item.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        {/* 테두리 글로우 */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors" />

        {/* 콘텐츠 */}
        <div className="relative z-10 p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-auto">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <div className="opacity-30 group-hover:opacity-60 transition-opacity text-on-surface-variant">
              {icon}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-on-surface leading-snug text-sm line-clamp-3 mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant/60">{item.created_at}</span>
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-on-surface-variant/50">#{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && <CardNewsModal item={item} onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ── 메인 갤러리 ── */
const SPAN_PATTERNS = [
  "md:col-span-2 md:row-span-4 col-span-2 row-span-3",
  "md:col-span-1 md:row-span-3 col-span-1 row-span-2",
  "md:col-span-2 md:row-span-3 col-span-2 row-span-2",
  "md:col-span-1 md:row-span-3 col-span-1 row-span-2",
  "md:col-span-1 md:row-span-3 col-span-1 row-span-2",
  "md:col-span-2 md:row-span-4 col-span-2 row-span-3",
];

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI" },
  { key: "dev", label: "개발" },
  { key: "trend", label: "트렌드" },
  { key: "news", label: "뉴스" },
];

export default function CardNewsGallery({ items }: { items: CardNewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  const withSpan = filtered.map((item, idx) => ({
    ...item,
    span: SPAN_PATTERNS[idx % SPAN_PATTERNS.length],
  }));

  return (
    <div>
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveCategory(filter.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === filter.key
                ? "bg-do-primary text-black"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-white/10"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 벤토 그리드 */}
      <motion.div
        className="grid grid-cols-3 auto-rows-[120px] gap-3"
        layout
      >
        <AnimatePresence mode="popLayout">
          {withSpan.map((item) => (
            <motion.div
              key={item.id}
              className={item.span}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <CardNewsCard item={item} spanClass="w-full h-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-on-surface-variant">
          해당 카테고리의 카드뉴스가 없습니다.
        </div>
      )}
    </div>
  );
}
