import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * R2 최소 헬퍼
 *
 * - Public URL: R2_PUBLIC_URL 환경변수 + object key
 * - 추후 signed URL로 전환 시 getPublicUrl만 교체
 */

function getBucket() {
  const { env } = getCloudflareContext();
  return env.STORAGE;
}

/** 파일 업로드 */
export async function putObject(
  key: string,
  body: ReadableStream | ArrayBuffer | string,
  contentType?: string,
): Promise<boolean> {
  try {
    const bucket = getBucket();
    await bucket.put(key, body, {
      httpMetadata: contentType ? { contentType } : undefined,
    });
    return true;
  } catch {
    return false;
  }
}

/** 파일 조회 (메타 + body) */
export async function getObject(key: string) {
  try {
    const bucket = getBucket();
    return await bucket.get(key);
  } catch {
    return null;
  }
}

/** 파일 삭제 */
export async function deleteObject(key: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    await bucket.delete(key);
    return true;
  } catch {
    return false;
  }
}

/** 파일 존재 여부 (head) */
export async function headObject(key: string) {
  try {
    const bucket = getBucket();
    return await bucket.head(key);
  } catch {
    return null;
  }
}

/**
 * Public URL 생성
 * R2 커스텀 도메인 또는 Workers 경유 URL 기준
 * 환경변수 미설정 시 상대 경로 fallback
 */
export function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL ?? "/storage";
  return `${base}/${key}`;
}
