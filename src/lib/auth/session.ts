/**
 * Web Crypto API 기반 세션 토큰 생성/검증
 * Cloudflare Workers 환경에서 동작
 */

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24시간

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 세션 토큰 생성: "{timestamp}.{hmac}" */
export async function createSessionToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString();
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp));
  return `${timestamp}.${toHex(sig)}`;
}

/** 세션 토큰 검증 (서명 + 만료 확인) */
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot === -1) return false;

  const timestamp = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // 만료 확인
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Date.now() - ts > SESSION_TTL) return false;

  // 서명 검증
  const key = await getKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp));
  return toHex(expected) === sig;
}
