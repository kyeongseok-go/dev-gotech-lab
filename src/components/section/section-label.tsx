interface SectionLabelProps {
  children: string;
  count?: string | number;
  className?: string;
}

/**
 * san.framer 풍 작은 트래킹 대문자 섹션 라벨 + 카운트.
 * 예: "FEAT WORKS (04)"
 */
export function SectionLabel({ children, count, className }: SectionLabelProps) {
  return (
    <span className={`section-label ${className ?? ""}`}>
      {children}
      {count != null && (
        <span className="count">({String(count).padStart(2, "0")})</span>
      )}
    </span>
  );
}
