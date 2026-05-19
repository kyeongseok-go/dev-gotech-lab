import type { ElementType, ReactNode } from "react";

const PALETTE = ["card-c1", "card-c2", "card-c3", "card-c4", "card-c5"] as const;
type Variant = (typeof PALETTE)[number];

interface ColorCardProps {
  children: ReactNode;
  /** 명시 색상 또는 cycle 인덱스로 자동 배정 */
  variant?: Variant;
  index?: number;
  as?: ElementType;
  className?: string;
  href?: string;
  /** 컬러풀 솔리드 vs 뉴트럴 카드 토글 */
  neutral?: boolean;
}

/**
 * san.framer 컬러풀 메이슨리 카드.
 * index 기반 자동 컬러 사이클(5색). neutral=true 시 obsidian-card 사용.
 */
export function ColorCard({
  children,
  variant,
  index = 0,
  as: Tag = "div",
  className = "",
  neutral = false,
  ...rest
}: ColorCardProps) {
  const v: Variant = variant ?? PALETTE[index % PALETTE.length];
  const base = neutral ? "obsidian-card" : `card-color ${v}`;
  return (
    <Tag className={`${base} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export const COLOR_VARIANTS = PALETTE;
