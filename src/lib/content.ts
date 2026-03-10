import { blogs, projects } from "@/.velite";
import type { Blog, Project } from "@/.velite";

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

/** 날짜를 한국어 형식으로 포맷 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
