import { blogs } from "@/.velite";
import type { Blog } from "@/.velite";

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

/** 날짜를 한국어 형식으로 포맷 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
