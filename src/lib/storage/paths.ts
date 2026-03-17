/**
 * R2 object key 경로 빌더
 *
 * 규칙:
 *   blog/{slug}/cover.{ext}
 *   projects/{slug}/thumbnail.{ext}
 *   showcase/{slug}/cover.{ext}
 *   og/{type}/{slug}.png
 *   uploads/{yyyy}/{mm}/{filename}
 */

type ContentType = "blog" | "projects" | "showcase";

/** 블로그/프로젝트/showcase 커버·썸네일 키 */
export function coverKey(type: ContentType, slug: string, ext = "png"): string {
  const name = type === "projects" ? "thumbnail" : "cover";
  return `${type}/${slug}/${name}.${ext}`;
}

/** OG 이미지 키 */
export function ogKey(type: ContentType, slug: string): string {
  return `og/${type}/${slug}.png`;
}

/** 카드뉴스 커버 이미지 키 */
export function cardNewsKey(slug: string, ext = "png"): string {
  return `card-news/${slug}/cover.${ext}`;
}

/** 일반 업로드 키 (날짜 기반) */
export function uploadKey(filename: string, date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `uploads/${yyyy}/${mm}/${filename}`;
}
