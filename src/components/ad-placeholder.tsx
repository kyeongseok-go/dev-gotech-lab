interface AdPlaceholderProps {
  className?: string;
}

export function AdPlaceholder({ className }: AdPlaceholderProps) {
  return (
    <aside
      className={`rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center ${className ?? ""}`}
    >
      <p className="text-xs text-muted-foreground">
        추천 콘텐츠 · 파트너
      </p>
    </aside>
  );
}
