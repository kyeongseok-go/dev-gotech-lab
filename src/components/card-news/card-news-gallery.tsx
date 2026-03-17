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

const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  ai: { label: "AI", className: "card-news-badge card-news-badge-ai" },
  trend: { label: "\ud2b8\ub80c\ub4dc", className: "card-news-badge card-news-badge-trend" },
  dev: { label: "\uac1c\ubc1c", className: "card-news-badge card-news-badge-dev" },
  news: { label: "\ub274\uc2a4", className: "card-news-badge card-news-badge-news" },
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  ai: <Cpu className="w-8 h-8" />,
  dev: <Code2 className="w-8 h-8" />,
  trend: <TrendingUp className="w-8 h-8" />,
  news: <Newspaper className="w-8 h-8" />,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  ai: "from-[#00E5FF]/30 to-[#7C3AED]/20",
  dev: "from-[#00FF88]/30 to-[#00E5FF]/20",
  trend: "from-[#7C3AED]/30 to-[#FF6B9D]/20",
  news: "from-[#FF6B9D]/30 to-[#00E5FF]/20",
};

/* ── \ubaa8\ub2ec ── */
function CardNewsModal({
  item,
  onClose,
}: {
  item: CardNewsItem;
  onClose: () => void;
}) {
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.news;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* \ubc30\uacbd \ub529 */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* \ubcf8\ubb38 */}
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden"
        initial={{ scale: 0.92, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* \uc774\ubbf8\uc9c0 */}
        {item.image_url ? (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`aspect-video w-full bg-gradient-to-br ${CATEGORY_GRADIENT[item.category]} flex items-center justify-center text-[var(--primary)]/40`}
          >
            {CATEGORY_ICON[item.category]}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={badge.className}>{badge.label}</span>
            <time className="text-xs text-[var(--muted-foreground)]">
              {item.created_at?.slice(0, 10)}
            </time>
          </div>

          <h2 className="text-xl font-bold text-[var(--foreground)] leading-snug">
            {item.title}
          </h2>

          <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            {item.summary}
          </p>

          {item.content && (
            <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {item.content}
            </p>
          )}

          {item.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="tag-badge">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.external_link && (
            <a
              href={item.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20"
            >
              \uc6d0\ubb38 \ubcf4\uae30
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* \ub2eb\uae30 \ubc84\ud2bc */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── \uac1c\ubcc4 \uce74\ub4dc ── */
function BentoCard({ item, index }: { item: CardNewsItem; index: number }) {
  const badge = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.news;
  const hasExternalLink = !!item.external_link;
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (hasExternalLink) {
      window.open(item.external_link!, "_blank", "noopener,noreferrer");
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <motion.article
        className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] cursor-pointer ${item.span}`}
        variants={{
          hidden: { y: 40, scale: 0.95, opacity: 0 },
          visible: {
            y: 0,
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 350,
              damping: 25,
              delay: index * 0.06,
            },
          },
        }}
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        onClick={handleClick}
      >
        {/* \ubc30\uacbd \uc774\ubbf8\uc9c0 / \uadf8\ub77c\ub514\uc5b8\ud2b8 */}
        <div className="absolute inset-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${CATEGORY_GRADIENT[item.category]} flex items-center justify-center`}
            >
              <div className="text-[var(--primary)] opacity-20">
                {CATEGORY_ICON[item.category]}
              </div>
            </div>
          )}

          {/* \uadf8\ub77c\ub514\uc5b8\ud2b8 \uc624\ubc84\ub808\uc774 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </div>

        {/* \ucf58\ud150\uce20 */}
        <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
          {/* \uc0c1\ub2e8 \ubc30\uc9c0 */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={badge.className}>{badge.label}</span>
            {hasExternalLink && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/70">
                <ExternalLink className="w-2.5 h-2.5" />
                \uc678\ubd80
              </span>
            )}
          </div>

          {/* \ub0a0\uc9dc */}
          <time className="mb-1.5 text-[11px] text-white/50">
            {item.created_at?.slice(0, 10)}
          </time>

          {/* \uc81c\ubaa9 */}
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-[#00E5FF] transition-colors duration-200">
            {item.title}
          </h2>

          {/* \uc694\uc57d */}
          <p className="mt-1.5 text-xs text-white/60 leading-relaxed line-clamp-2">
            {item.summary}
          </p>

          {/* \ud0dc\uadf8 */}
          {item.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* \ud638\ubc84 \uae00\ub85c\uc6b0 */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.08)]" />
      </motion.article>

      {/* \ubaa8\ub2ec (\uc678\ubd80 \ub9c1\ud06c \uc5c6\uc744 \ub54c) */}
      <AnimatePresence>
        {showModal && (
          <CardNewsModal item={item} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── \uac24\ub7ec\ub9ac \uba54\uc778 ── */
export default function CardNewsGallery({
  items,
}: {
  items: CardNewsItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
        <p className="text-[var(--muted-foreground)]">
          \ub4f1\ub85d\ub41c \uce74\ub4dc\ub274\uc2a4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[60px]"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {items.map((item, index) => (
        <BentoCard key={item.id} item={item} index={index} />
      ))}
    </motion.div>
  );
}
