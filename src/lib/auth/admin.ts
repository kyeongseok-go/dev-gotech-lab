import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionToken, verifySessionToken } from "./session";

const COOKIE_NAME = "admin_session";

function getEnv() {
  const { env } = getCloudflareContext();
  const e = env as unknown as Record<string, string>;
  return {
    password: e.ADMIN_PASSWORD ?? "",
    secret: e.ADMIN_SESSION_SECRET ?? "fallback-dev-secret",
  };
}

/** 비밀번호 검증 (timing-safe하게 비교) */
export function verifyPassword(input: string): boolean {
  const { password } = getEnv();
  if (!password || !input) return false;
  if (input.length !== password.length) return false;

  let mismatch = 0;
  for (let i = 0; i < input.length; i++) {
    mismatch |= input.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return mismatch === 0;
}

/** 세션 쿠키에서 인증 상태 확인 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { secret } = getEnv();
    return verifySessionToken(token, secret);
  } catch {
    return false;
  }
}

/** 세션 쿠키 생성용 토큰 + Set-Cookie 헤더 값 반환 */
export async function createSessionCookie(): Promise<string> {
  const { secret } = getEnv();
  const token = await createSessionToken(secret);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=86400`;
}

/** 세션 쿠키 삭제용 Set-Cookie 헤더 값 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0`;
}

/** Server Component에서 사용 — 미인증 시 login으로 redirect */
export async function requireAdmin(): Promise<void> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}
