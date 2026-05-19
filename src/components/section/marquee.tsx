import type { ReactNode } from "react";

interface MarqueeProps {
  items: ReadonlyArray<ReactNode>;
  /** 트랙 좌→우 스피드 (초). 기본 32s */
  durationSec?: number;
  className?: string;
}

/**
 * san.framer 풍 무한 가로 마퀴 — 키워드/로고 스트립.
 * 트랙을 2번 복제해 끊김 없이 순환. hover 시 정지. reduced-motion 자동 무효.
 */
export function Marquee({ items, durationSec = 32, className }: MarqueeProps) {
  const track = (
    <div
      className="marquee-track items-center"
      style={{ animationDuration: `${durationSec}s` }}
    >
      {items.map((item, i) => (
        <span key={`a${i}`} className="inline-flex items-center">
          {item}
        </span>
      ))}
      {items.map((item, i) => (
        <span key={`b${i}`} className="inline-flex items-center" aria-hidden>
          {item}
        </span>
      ))}
    </div>
  );
  return <div className={`marquee py-6 ${className ?? ""}`}>{track}</div>;
}
