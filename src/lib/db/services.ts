import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  status: "live" | "wip" | "archived";
  url: string | null;
  repo_url: string | null;
  icon: string | null;
  featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function getDB() {
  const { env } = getCloudflareContext();
  return env.DB;
}

/** 전체 서비스 목록 (sort_order 순) */
export async function getServices(): Promise<Service[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM service_registry ORDER BY sort_order ASC",
    ).all<Service>();
    return results;
  } catch {
    return [];
  }
}

/** featured 서비스만 조회 */
export async function getFeaturedServices(): Promise<Service[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM service_registry WHERE featured = 1 ORDER BY sort_order ASC",
    ).all<Service>();
    return results;
  } catch {
    return [];
  }
}

/** slug로 서비스 1개 조회 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const db = getDB();
    return await db.prepare(
      "SELECT * FROM service_registry WHERE slug = ?",
    ).bind(slug).first<Service>();
  } catch {
    return null;
  }
}
