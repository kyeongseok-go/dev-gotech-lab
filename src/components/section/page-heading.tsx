import type { ReactNode } from "react";

interface PageHeadingProps {
  /** 작은 트래킹 대문자 라벨 (예: "Blog · 2026") */
  eyebrow?: string;
  /** 거대 디스플레이 제목 */
  title: ReactNode;
  /** 본문 (선택) */
  lead?: ReactNode;
  /** 우상단 카운트 (예: "04") */
  count?: string | number;
  /** XL 사이즈 (홈 히어로) vs 기본 (페이지 타이틀) */
  size?: "xl" | "default";
}

/**
 * san.framer 풍 페이지 타이틀.
 * - 초대형 압축 그로테스크
 * - 라벨 + 거대 제목 + 본문 + 카운트
 * - 진입 마스크 리빌 (CSS rise-in)
 */
export function PageHeading({
  eyebrow,
  title,
  lead,
  count,
  size = "default",
}: PageHeadingProps) {
  return (
    <header className="relative mb-16 md:mb-24">
      <div className="flex items-start justify-between gap-6 mb-6">
        {eyebrow && (
          <span className="section-label">
            {eyebrow}
            {count != null && (
              <span className="count">
                ({String(count).padStart(2, "0")})
              </span>
            )}
          </span>
        )}
        {count != null && !eyebrow && (
          <span className="font-code text-on-surface-faint text-sm tracking-widest">
            ({String(count).padStart(2, "0")})
          </span>
        )}
      </div>
      <h1
        className={`${size === "xl" ? "type-display-xl" : "type-display"} rise-in text-on-surface mb-6`}
      >
        {title}
      </h1>
      {lead && (
        <p className="type-body text-on-surface-variant max-w-2xl rise-in" style={{ animationDelay: "120ms" }}>
          {lead}
        </p>
      )}
    </header>
  );
}
