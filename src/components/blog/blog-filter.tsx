"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface BlogFilterProps {
  categories: string[];
  tags: string[];
}

export function BlogFilter({ categories, tags }: BlogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeTag = searchParams.get("tag") ?? "";

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/blog?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="mb-8 space-y-3">
      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">카테고리</span>
          <button
            onClick={() => setFilter("category", "")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !activeCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter("category", cat)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 태그 필터 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">태그</span>
          {activeTag && (
            <button
              onClick={() => setFilter("tag", "")}
              className="rounded-full px-3 py-1 text-xs bg-primary text-primary-foreground"
            >
              {activeTag} ✕
            </button>
          )}
          {tags
            .filter((t) => t !== activeTag)
            .map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter("tag", tag)}
                className="rounded-full px-3 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {tag}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
