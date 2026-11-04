/**
 * 도구 공용 브라우저 저장 규칙(HANDOFF §6.3). 서버 저장은 없다.
 * 키 이름은 `gotechy:tool:<slug>:<종류>` — "모든 저장 데이터 삭제"가 이 접두사만 지운다(테마 등 사이트 설정은 남긴다).
 */
export const STORAGE_PREFIX = "gotechy:tool:";
export const HISTORY_LIMIT = 20;

export interface HistoryEntry<T> {
  id: string;
  /** ISO 시각 */
  at: string;
  /** 목록에 보일 한 줄 */
  label: string;
  value: T;
}

type StorageLike = Pick<Storage, "length" | "key" | "removeItem">;

export const historyKey = (slug: string) => `${STORAGE_PREFIX}${slug}:history`;

export function pushHistory<T>(list: readonly HistoryEntry<T>[], next: HistoryEntry<T>): HistoryEntry<T>[] {
  const sameValue = (e: HistoryEntry<T>) => JSON.stringify(e.value) === JSON.stringify(next.value);
  return [next, ...list.filter((e) => !sameValue(e))].slice(0, HISTORY_LIMIT);
}

function isEntry(v: unknown): v is HistoryEntry<unknown> {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return typeof e.id === "string" && typeof e.at === "string" && typeof e.label === "string" && "value" in e;
}

/** 저장된 문자열을 믿지 않는다 — 형식이 틀린 항목은 버린다 */
export function parseHistory<T>(raw: string | null): HistoryEntry<T>[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? (data.filter(isEntry) as HistoryEntry<T>[]) : [];
  } catch {
    return [];
  }
}

export function clearAllToolData(storage: StorageLike): number {
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (k): k is string => k !== null && k.startsWith(STORAGE_PREFIX),
  );
  keys.forEach((k) => storage.removeItem(k));
  return keys.length;
}
