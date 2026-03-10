import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface FeatureFlag {
  key: string;
  enabled: number;
  description: string;
}

function getDB() {
  const { env } = getCloudflareContext();
  return env.DB;
}

/** 특정 기능 플래그 조회 (없으면 비활성 취급) */
export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const db = getDB();
    const row = await db.prepare(
      "SELECT enabled FROM feature_flags WHERE key = ?",
    ).bind(key).first<{ enabled: number }>();
    return row?.enabled === 1;
  } catch {
    return false;
  }
}

/** 전체 플래그 목록 조회 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM feature_flags ORDER BY key ASC",
    ).all<FeatureFlag>();
    return results;
  } catch {
    return [];
  }
}
