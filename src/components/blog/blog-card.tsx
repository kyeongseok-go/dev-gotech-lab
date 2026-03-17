import Link from "next/link";
import { formatDate, getReadingTime } from "@/lib/content";

const CATEGORY_GRADIENTS: Record<string, string> = {
  general: "from-cyan-500/20 to-violet-500/20",
  ai: "from-cyan-500/30 to-emerald-500/20",
  dev: "from-violet-500/20 to-pink-500/20",
  tutorial: "from-amber-500/20 to-orange-500/20",
};

interface BlogCardProps {
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  tags: string[];
  date: string;
  body: string;
}

export function BlogCard({
  slug,
  title,
  description,
  thumbnail,
  category,
  tags,
  date,
  body,
}: BlogCardProps) {
  const readingTime = getReadingTime(body);
  const gradient = CATEGORY_GRADIENTS[category ?? ""] ?? CATEGORY_GRADIENTS.general;

  return (
    <Link href={`/blog/${slug}`} className="blog-card group">
      {/* 썸네일 / 플레이스홀더 */}
      <div className="aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`blog-card-gradient h-full w-full bg-gradient-to-br ${gradient}`}>
            {category && <span className="opacity-50">{category}</span>}
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h2>

        {description && (
          <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
        )}

        {/* 하단 메타 */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <time>{formatDate(date)}</time>
          <span>·</span>
          <span>{readingTime}분 읽기</span>
        </div>
      </div>
    </Link>
  );
}
