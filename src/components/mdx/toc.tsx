"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content";
import { cn } from "@/lib/utils";

interface TocProps {
  items: TocItem[];
  /** "sidebar" = 데스크톱 고정 목차, "inline" = 모바일 접이식 */
  variant?: "sidebar" | "inline";
}

/** 현재 읽는 절을 IntersectionObserver 로 추적 (스크롤 핸들러 없음) */
function useActiveHeading(idKey: string): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const ids = idKey ? idKey.split("|") : [];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idKey]);
  return active;
}

function TocList({ items, active }: { items: TocItem[]; active: string | null }) {
  return (
    <ol className="space-y-0.5 text-sm">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block border-l-2 py-1.5 pl-3 leading-snug transition-colors",
                isActive
                  ? "border-do-primary font-bold text-on-surface"
                  : "border-transparent text-on-surface-muted hover:text-on-surface hover:border-hairline",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * 글 목차 — 데스크톱: 본문 옆 sticky + 현재 절 강조(주홍 2px 선) / 모바일: <details> 접이식.
 */
export function Toc({ items, variant = "sidebar" }: TocProps) {
  const active = useActiveHeading(items.map((i) => i.id).join("|"));
  if (items.length === 0) return null;

  if (variant === "inline") {
    return (
      <details className="group mb-10 border-y border-hairline">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-code text-xs font-bold uppercase tracking-[0.12em] text-on-surface">
          목차 · Contents
          <span aria-hidden className="tabular text-on-surface-muted group-open:hidden">+{String(items.length).padStart(2, "0")}</span>
          <span aria-hidden className="hidden text-on-surface-muted group-open:inline">−</span>
        </summary>
        <div className="pb-4">
          <TocList items={items} active={active} />
        </div>
      </details>
    );
  }

  return (
    <nav aria-label="글 목차" className="max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">
      <p className="mb-3 font-code text-xs font-bold uppercase tracking-[0.12em] text-on-surface">목차 · Contents</p>
      <TocList items={items} active={active} />
    </nav>
  );
}
