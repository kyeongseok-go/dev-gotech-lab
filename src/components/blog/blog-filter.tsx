"use client";

import { Fragment, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/reui/badge";

/** 목록 한 줄 — 행 마크업은 서버(빌드 시점)에서 만들고, 필터 판정에 필요한 값만 같이 둔다 */
export interface BlogEntry {
  slug: string;
  category?: string;
  tags: string[];
  row: ReactNode;
  /** 필터가 없을 때 첫 줄에 쓰는 강조 행 (첫 글만) */
  leadRow?: ReactNode;
}

interface BlogFilterProps {
  categories: string[];
  tags: string[];
  /** 카테고리별 글 수 */
  counts: Record<string, number>;
  entries: BlogEntry[];
}

export const ALL_CATEGORIES = "__all__";
const VISIBLE_TAGS = 8;

function filterEntries(entries: BlogEntry[], category: string, tag: string) {
  return entries.filter((e) => {
    if (category !== ALL_CATEGORIES && e.category !== category) return false;
    if (tag && !e.tags.includes(tag)) return false;
    return true;
  });
}

/**
 * URL(?category=&tag=)을 고쳐 쓴다. 페이지는 정적이므로 서버로 다시 요청하지 않고 history API 만 쓴다
 * (Next 라우터가 pushState 를 받아 useSearchParams 를 갱신 — 뒤로 가기도 그대로 동작).
 */
function pushParams(next: URLSearchParams) {
  const qs = next.toString();
  window.history.pushState(null, "", qs ? `/blog?${qs}` : "/blog");
}

/** 현재 URL 기준 필터 결과 수 — 페이지 제목의 N 표시용 */
export function BlogCount({ entries }: { entries: BlogEntry[] }) {
  const sp = useSearchParams();
  const n = filterEntries(entries, sp.get("category") ?? ALL_CATEGORIES, sp.get("tag") ?? "").length;
  return <>{String(n).padStart(3, "0")}</>;
}

/** URL 을 읽어 필터 화면을 그린다. 정적 HTML 에는 Suspense 대체(BlogFilterView 기본 상태)가 들어간다 */
export function BlogFilter(props: BlogFilterProps) {
  const sp = useSearchParams();
  return <BlogFilterView {...props} activeCategory={sp.get("category") ?? ALL_CATEGORIES} activeTag={sp.get("tag") ?? ""} />;
}

/**
 * 블로그 필터 — ReUI "Tabs with line variant"(@reui/c-tabs-2, MIT) 패턴.
 * 카테고리 = 라인 탭(URL ?category=), 태그 = ReUI Badge 칩(URL ?tag=).
 * 상태는 URL 이 단일 원천 — 공유·뒤로가기 그대로 동작.
 */
export function BlogFilterView({
  categories,
  tags,
  counts,
  entries,
  activeCategory,
  activeTag,
}: BlogFilterProps & { activeCategory: string; activeTag: string }) {
  const current = () => new URLSearchParams(window.location.search);

  const onCategoryChange = (value: string) => {
    const params = current();
    if (value === ALL_CATEGORIES) params.delete("category");
    else params.set("category", value);
    pushParams(params);
  };

  const toggleTag = (tag: string) => {
    const params = current();
    if (params.get("tag") === tag) params.delete("tag");
    else params.set("tag", tag);
    pushParams(params);
  };

  const filtered = filterEntries(entries, activeCategory, activeTag);
  const isFiltered = activeCategory !== ALL_CATEGORIES || Boolean(activeTag);
  const tabs = [
    { value: ALL_CATEGORIES, label: "All", count: entries.length },
    ...categories.map((c) => ({ value: c, label: c, count: counts[c] ?? 0 })),
  ];

  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="gap-0">
      <div className="border-b border-hairline overflow-x-auto [scrollbar-width:none]">
        <TabsList variant="line" aria-label="카테고리" className="h-auto gap-0 p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="h-11 flex-none gap-2 rounded-none px-3 md:px-4 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted hover:text-on-surface data-active:text-on-surface after:!bottom-[-1px] after:!h-[2px] after:bg-do-primary"
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
        {filtered.length === 0 ? (
          <p className="py-16 type-body text-on-surface-variant">
            {isFiltered ? "해당 조건에 맞는 글이 없습니다." : "아직 작성된 글이 없습니다."}
          </p>
        ) : (
          <div className="border-b border-hairline">
            {filtered.map((e, i) => (
              <Fragment key={e.slug}>{i === 0 && !isFiltered && e.leadRow ? e.leadRow : e.row}</Fragment>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
