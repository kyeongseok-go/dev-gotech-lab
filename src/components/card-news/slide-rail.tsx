"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideRailProps {
  count: number;
  label: string;
  children: ReactNode;
}

/**
 * 가로 스냅 슬라이드 레일 — 스크롤(터치·트랙패드·키보드 화살표)과 이전/다음 버튼 둘 다 지원.
 * 현재 장은 스크롤 위치로 계산(rAF 한 번으로 묶음), 끝에서는 버튼을 disabled 로 둔다.
 * reduced-motion 이면 부드러운 스크롤 대신 즉시 이동.
 */
export function SlideRail({ count, label, children }: SlideRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.querySelector<HTMLElement>("[data-slide]");
    const step = first ? first.offsetWidth + 16 : rail.clientWidth;
    setCurrent(Math.min(count - 1, Math.round(rail.scrollLeft / step)));
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  }, [count]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); });
    };
    measure();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  const go = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.querySelector<HTMLElement>("[data-slide]");
    const step = first ? first.offsetWidth + 16 : rail.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div
        ref={railRef}
        tabIndex={0}
        role="region"
        aria-label={label}
        className="slide-rail -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-4 snap-x snap-mandatory scroll-px-[var(--gutter)]"
      >
        <ol className="flex gap-4">{children}</ol>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-hairline pt-3">
        <p className="font-code text-xs tabular text-on-surface-muted" aria-live="polite">
          <span className="text-on-surface">{String(current + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
          <span className="ml-3 hidden sm:inline">← → 키 또는 옆으로 밀어서 넘기기</span>
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-square" onClick={() => go(-1)} disabled={current === 0} aria-label="이전 장">
            <ArrowLeft aria-hidden size={16} />
          </button>
          <button type="button" className="btn-square" onClick={() => go(1)} disabled={atEnd} aria-label="다음 장">
            <ArrowRight aria-hidden size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
