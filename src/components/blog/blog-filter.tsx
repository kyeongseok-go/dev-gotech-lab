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
    <div className="flex flex-wrap gap-3">
      {/* All button */}
      <button
        onClick={() => {
          setFilter("category", "");
          setFilter("tag", "");
        }}
        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
          !activeCategory && !activeTag
            ? "bg-do-primary text-[#054345]"
            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
        }`}
      >
        All
      </button>

      {/* Category pills */}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setFilter("category", cat)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === cat
              ? "bg-do-primary text-[#054345]"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}

      {/* Active tag */}
      {activeTag && (
        <button
          onClick={() => setFilter("tag", "")}
          className="px-6 py-2 rounded-full text-sm font-medium bg-do-primary text-[#054345]"
        >
          #{activeTag} &times;
        </button>
      )}

      {/* Tag pills */}
      {tags
        .filter((t) => t !== activeTag)
        .slice(0, 6)
        .map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter("tag", tag)}
            className="px-6 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-white transition-all"
          >
            #{tag}
          </button>
        ))}
    </div>
  );
}
