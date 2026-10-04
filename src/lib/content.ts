import { blogs, projects, showcase } from "@/.velite";
import type { Blog, Project, Showcase } from "@/.velite";
import { SERIES, POST_PROJECT_LINKS, type SeriesDef } from "@/lib/series";

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
  // 컴파일된 MDX: x.h2,{children:"텍스트"} — velite minify 로 변수명(t/h/…)이 빌드마다 달라진다
  const re = /\b[A-Za-z_$][\w$]*\.(h[23]),\{children:"((?:[^"\\]|\\.)+)"\}/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    const level = match[1] === "h2" ? 2 : 3;
    const text = JSON.parse(`"${match[2]}"`) as string;
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

/* ── 시리즈 · 관련 글 · 관련 프로젝트 ───────────────────────── */

export interface SeriesInfo {
  def: SeriesDef;
  /** 시리즈 순서대로 정렬된 공개 글 */
  posts: Blog[];
  /** 현재 글의 1부터 시작하는 위치 */
  position: number;
}

function seriesOrder(def: SeriesDef, slug: string): number | null {
  const m = def.pattern.exec(slug);
  return m ? Number(m[1]) : null;
}

/** 글이 속한 시리즈 (공개 글 2편 이상일 때만) */
export function getSeriesForPost(slug: string): SeriesInfo | null {
  const def = SERIES.find((d) => d.pattern.test(slug));
  if (!def) return null;
  const posts = getPublishedBlogs()
    .filter((p) => def.pattern.test(p.slug))
    .sort((a, b) => (seriesOrder(def, a.slug) ?? 0) - (seriesOrder(def, b.slug) ?? 0));
  if (posts.length < 2) return null;
  const position = posts.findIndex((p) => p.slug === slug) + 1;
  return position > 0 ? { def, posts, position } : null;
}

/** 시리즈 배지 문구 (목록용) — 예: "Karpathy LLM Wiki 연재 2/5" */
export function getSeriesLabel(slug: string): string | null {
  const info = getSeriesForPost(slug);
  return info ? `${info.def.title} ${info.position}/${info.posts.length}` : null;
}

/** 태그 겹침 점수로 관련 글 (같은 시리즈 제외) */
export function getRelatedPosts(slug: string, limit = 3): Blog[] {
  const post = getBlogBySlug(slug);
  if (!post) return [];
  const seriesSlugs = new Set(getSeriesForPost(slug)?.posts.map((p) => p.slug) ?? []);
  const tagSet = new Set(post.tags.map((t) => t.toLowerCase()));
  return getPublishedBlogs()
    .filter((p) => p.slug !== slug && !seriesSlugs.has(p.slug))
    .map((p) => ({
      p,
      score:
        p.tags.filter((t) => tagSet.has(t.toLowerCase())).length +
        (post.category && p.category === post.category ? 0.5 : 0),
    }))
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score || new Date(b.p.date).getTime() - new Date(a.p.date).getTime())
    .slice(0, limit)
    .map(({ p }) => p);
}

/** 글에 연결된 공개 프로젝트 */
export function getRelatedProjectsForPost(slug: string): Project[] {
  const slugs = POST_PROJECT_LINKS[slug] ?? [];
  return slugs
    .map((s) => getProjectBySlug(s))
    .filter((p): p is Project => !!p && !p.draft);
}

/** 프로젝트에 연결된 공개 글 (최신순) */
export function getPostsForProject(projectSlug: string): Blog[] {
  return getPublishedBlogs().filter((p) => (POST_PROJECT_LINKS[p.slug] ?? []).includes(projectSlug));
}
