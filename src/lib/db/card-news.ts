import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface CardNews {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: "ai" | "dev" | "trend" | "news";
  image_url: string | null;
  external_link: string | null;
  tags: string;
  published: number;
  created_at: string;
  updated_at: string;
}

function getDB() {
  const { env } = getCloudflareContext();
  return env.DB;
}

/* ── 공개 조회 ── */

export async function getPublishedCardNews(limit?: number): Promise<CardNews[]> {
  try {
    const db = getDB();
    const sql = limit
      ? "SELECT * FROM card_news WHERE published = 1 ORDER BY created_at DESC LIMIT ?"
      : "SELECT * FROM card_news WHERE published = 1 ORDER BY created_at DESC";
    const stmt = limit ? db.prepare(sql).bind(limit) : db.prepare(sql);
    const { results } = await stmt.all<CardNews>();
    return results;
  } catch {
    return [];
  }
}

export async function getCardNewsByCategory(category: string, limit?: number): Promise<CardNews[]> {
  try {
    const db = getDB();
    const sql = limit
      ? "SELECT * FROM card_news WHERE published = 1 AND category = ? ORDER BY created_at DESC LIMIT ?"
      : "SELECT * FROM card_news WHERE published = 1 AND category = ? ORDER BY created_at DESC";
    const stmt = limit ? db.prepare(sql).bind(category, limit) : db.prepare(sql).bind(category);
    const { results } = await stmt.all<CardNews>();
    return results;
  } catch {
    return [];
  }
}

export async function getCardNewsBySlug(slug: string): Promise<CardNews | null> {
  try {
    const db = getDB();
    return await db.prepare("SELECT * FROM card_news WHERE slug = ?").bind(slug).first<CardNews>();
  } catch {
    return null;
  }
}

/* ── Admin CRUD ── */

export async function getAllCardNews(): Promise<CardNews[]> {
  try {
    const db = getDB();
    const { results } = await db.prepare(
      "SELECT * FROM card_news ORDER BY created_at DESC",
    ).all<CardNews>();
    return results;
  } catch {
    return [];
  }
}

export async function getCardNewsById(id: number): Promise<CardNews | null> {
  try {
    const db = getDB();
    return await db.prepare("SELECT * FROM card_news WHERE id = ?").bind(id).first<CardNews>();
  } catch {
    return null;
  }
}

export async function createCardNews(data: {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  image_url?: string | null;
  external_link?: string | null;
  tags?: string;
  published?: number;
}): Promise<number | null> {
  try {
    const db = getDB();
    const result = await db.prepare(
      `INSERT INTO card_news (slug, title, summary, content, category, image_url, external_link, tags, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      data.slug,
      data.title,
      data.summary ?? "",
      data.content ?? "",
      data.category ?? "news",
      data.image_url ?? null,
      data.external_link ?? null,
      data.tags ?? "[]",
      data.published ?? 0,
    ).run();
    return result.meta?.last_row_id ?? null;
  } catch {
    return null;
  }
}

export async function updateCardNews(
  id: number,
  data: Partial<Omit<CardNews, "id" | "created_at">>,
): Promise<boolean> {
  try {
    const db = getDB();
    const fields: string[] = [];
    const values: unknown[] = [];

    const allowed = ["slug", "title", "summary", "content", "category", "image_url", "external_link", "tags", "published"] as const;
    for (const key of allowed) {
      if (key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key as keyof typeof data]);
      }
    }

    if (fields.length === 0) return false;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await db.prepare(
      `UPDATE card_news SET ${fields.join(", ")} WHERE id = ?`,
    ).bind(...values).run();
    return true;
  } catch {
    return false;
  }
}

export async function deleteCardNews(id: number): Promise<boolean> {
  try {
    const db = getDB();
    await db.prepare("DELETE FROM card_news WHERE id = ?").bind(id).run();
    return true;
  } catch {
    return false;
  }
}
