import { blogs, projects, showcase } from "@/.velite";
import type { Blog, Project, Showcase } from "@/.velite";

/** 공개된 블로그 글을 최신순으로 반환 */
export function getPublishedBlogs(): Blog[] {
  return blogs
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** slug로 블로그 글 1개 검색 */
export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((post) => post.slug === slug);
}

/** 공개된 프로젝트를 featured 우선 → 나머지 순으로 반환 */
export function getPublishedProjects(): Project[] {
  return projects
    .filter((p) => !p.draft)
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
}

/** slug로 프로젝트 1개 검색 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** 공개된 showcase를 featured 우선 → 나머지 순으로 반환 */
export function getPublishedShowcase(): Showcase[] {
  return showcase
    .filter((s) => !s.draft)
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
}

/** slug로 showcase 1개 검색 */
export function getShowcaseBySlug(slug: string): Showcase | undefined {
  return showcase.find((s) => s.slug === slug);
}

/** showcase status enum → 한국어 라벨 */
export const STATUS_LABEL: Record<string, string> = {
  live: "배포완료",
  wip: "개발중",
  archived: "보관됨",
};

/** 현재 글 기준 이전/다음 글 반환 (날짜 내림차순 기준) */
export function getAdjacentBlogs(slug: string) {
  const posts = getPublishedBlogs();
  const idx = posts.findIndex((p) => p.slug === slug);
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null, // 이전(오래된) 글
    next: idx > 0 ? posts[idx - 1] : null, // 다음(최신) 글
  };
}

/** 읽기 시간 추정 (한국어 기준 ~500자/분) */
export function getReadingTime(body: string): number {
  const text = body.replace(/<[^>]*>/g, "").replace(/[{}()\[\];=]/g, "");
  return Math.max(1, Math.round(text.length / 500));
}

/** 컴파일된 MDX body에서 h2/h3 heading을 추출하여 TOC 생성 */
export interface TocItem {
  level: 2 | 3;
  text: string;
  id: string;
}

export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  // 컴파일된 MDX: t.h2,{children:"텍스트"} 또는 t.h3,{children:"텍스트"}
  const re = /t\.(h[23]),\{children:"([^"]+)"\}/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    const level = match[1] === "h2" ? 2 : 3;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "");
    items.push({ level: level as 2 | 3, text, id });
  }
  return items;
}

/** 공개된 블로그 글의 고유 카테고리 목록 */
export function getAllCategories(): string[] {
  const cats = getPublishedBlogs()
    .map((p) => p.category)
    .filter((c): c is string => !!c);
  return [...new Set(cats)];
}

/** 공개된 블로그 글의 고유 태그 목록 */
export function getAllTags(): string[] {
  const tags = getPublishedBlogs().flatMap((p) => p.tags);
  return [...new Set(tags)];
}

/** 날짜를 한국어 형식으로 포맷 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
