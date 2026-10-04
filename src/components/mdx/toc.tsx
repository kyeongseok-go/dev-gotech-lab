import type { TocItem } from "@/lib/content";

interface TocProps {
  items: TocItem[];
}

export function Toc({ items }: TocProps) {
  if (items.length === 0) return null;

  return (
    <nav className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
      <p className="mb-2 text-sm font-semibold">목차</p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
