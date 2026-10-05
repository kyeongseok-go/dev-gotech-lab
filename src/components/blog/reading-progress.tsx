"use client";

import { useEffect, useRef } from "react";

/**
 * 읽기 진행 바 — 헤더 바로 아래 2px. transform: scaleX 만 갱신(레이아웃 없음).
 * 스크롤마다 rAF 한 번으로 묶고, reduced-motion 환경에서는 렌더하지 않는다(CSS).
 * targetId 요소(본문)의 시작~끝 구간 기준으로 0→1.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      const bar = barRef.current;
      if (!target || !bar) return;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // 본문이 화면보다 짧으면 "본문 끝이 화면에 들어온 만큼"으로 계산 — 맨 위에서 바로 100% 가 되지 않게
      const ratio =
        total > 0
          ? Math.min(1, Math.max(0, -rect.top / total))
          : Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, rect.height)));
      bar.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-16 md:top-[72px] z-40 h-[3px] motion-reduce:hidden">
      <div ref={barRef} className="h-full origin-left bg-do-primary" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
