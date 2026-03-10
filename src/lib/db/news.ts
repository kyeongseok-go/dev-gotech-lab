import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface NewsItem {
  id: number;
  title: string;
  url: string;
  summary: string | null;
  source: string;
  category: string;
  published_at: string | null;
  fetched_at: string;
}

function getDB() {
  const { env } = getCloudflareContext();
  return env.DB;
}

/** 뉴스 목록 조회 (최신 수집순, limit 기본 20) */
export async function getNewsItems(limit = 20): Promise<NewsItem[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM news_cache ORDER BY fetched_at DESC LIMIT ?",
    ).bind(limit).all<NewsItem>();
    return results;
  } catch {
    return [];
  }
}

/** 카테고리별 뉴스 조회 */
export async function getNewsByCategory(
  category: string,
  limit = 20,
): Promise<NewsItem[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM news_cache WHERE category = ? ORDER BY fetched_at DESC LIMIT ?",
    ).bind(category, limit).all<NewsItem>();
    return results;
  } catch {
    return [];
  }
}
