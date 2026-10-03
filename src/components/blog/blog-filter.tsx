"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/reui/badge";

interface BlogFilterProps {
  categories: string[];
  tags: string[];
  /** 카테고리별 글 수 */
  counts: Record<string, number>;
  total: number;
  /** 필터 결과 목록 (서버 렌더) */
  children: ReactNode;
}

const ALL = "__all__";
const VISIBLE_TAGS = 8;

/**
 * 블로그 필터 — ReUI "Tabs with line variant"(@reui/c-tabs-2, MIT) 패턴.
 * 카테고리 = 라인 탭(URL ?category=), 태그 = ReUI Badge 칩(URL ?tag=).
 * 상태는 URL 이 단일 원천 — 공유·뒤로가기 그대로 동작.
 */
export function BlogFilter({ categories, tags, counts, total, children }: BlogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? ALL;
  const activeTag = searchParams.get("tag") ?? "";

  const push = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.push(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    },
    [router],
  );

  const onCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete("category");
    else params.set("category", value);
    push(params);
  };

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("tag") === tag) params.delete("tag");
    else params.set("tag", tag);
    push(params);
  };

  const tabs = [{ value: ALL, label: "All", count: total }, ...categories.map((c) => ({ value: c, label: c, count: counts[c] ?? 0 }))];

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="gap-0">
      <div className="border-b border-hairline overflow-x-auto [scrollbar-width:none]">
        <TabsList variant="line" aria-label="카테고리" className="h-auto gap-0 p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="h-11 flex-none gap-2 rounded-none px-3 md:px-4 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted hover:text-on-surface data-active:text-on-surface after:!bottom-[-1px] after:!h-1 after:bg-on-surface"
            >
              {t.label}
              <span className="tabular text-[10px] text-on-surface-faint">{String(t.count).padStart(2, "0")}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 py-4">
        <span className="mr-2 font-code text-[11px] uppercase tracking-[0.1em] text-on-surface-muted">Tags</span>
        {activeTag && (
          <Badge asChild variant="default" size="lg">
            <button type="button" onClick={() => toggleTag(activeTag)} aria-label={`태그 ${activeTag} 해제`}>
              #{activeTag}
              <X aria-hidden />
            </button>
          </Badge>
        )}
        {tags
          .filter((t) => t !== activeTag)
          .slice(0, VISIBLE_TAGS)
          .map((tag) => (
            <Badge key={tag} asChild variant="outline" size="lg" className="normal-case hover:border-outline hover:text-on-surface">
              <button type="button" onClick={() => toggleTag(tag)}>
                #{tag}
              </button>
            </Badge>
          ))}
      </div>

      <TabsContent value={activeCategory} className="text-base">
        {children}
      </TabsContent>
    </Tabs>
  );
}
