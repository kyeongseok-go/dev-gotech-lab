/**
 * 운영 보안 헤더 (HANDOFF §6.3·§12-7, rules/web/security.md).
 *
 * script-src 에 'unsafe-inline' 이 남는 이유: 이 사이트는 전부 미리 렌더한 정적 페이지다(G3b, scripts/render-allowlist.json).
 * 요청마다 nonce 를 만들려면 미들웨어로 모든 페이지를 동적 렌더해야 해서 운영 CPU 계약을 깬다. Next 가 넣는 인라인
 * RSC 스크립트·테마 스크립트 때문에 해시 방식도 유지가 어렵다. 대신 외부 스크립트 출처를 비컨 1곳으로 묶고,
 * 프레임·object·base·form 출처를 막아 주입 경로를 줄인다.
 */
export const CSP_SOURCES = {
  cfBeaconScript: "https://static.cloudflareinsights.com",
  cfBeaconReport: "https://cloudflareinsights.com",
  pretendardCdn: "https://cdn.jsdelivr.net",
} as const;

const HSTS_MAX_AGE = 31_536_000; // 1년. 커스텀 도메인 전환 때 includeSubDomains·preload 를 다시 검토한다

/**
 * @param extraConnect BYO-key 도구가 브라우저에서 직접 부르는 공급자 API 출처(https 만). 도구를 낼 때만 추가한다
 */
export function buildCsp(extraConnect: readonly string[] = []): string {
  const bad = extraConnect.find((origin) => !origin.startsWith("https://"));
  if (bad) throw new Error(`connect-src 에는 https 출처만 넣는다: ${bad}`);

  const policy: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", CSP_SOURCES.cfBeaconScript],
    "style-src": ["'self'", "'unsafe-inline'", CSP_SOURCES.pretendardCdn],
    "font-src": ["'self'", "data:", CSP_SOURCES.pretendardCdn],
    // 글 본문(MDX)이 외부 https 이미지를 쓴다
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": ["'self'", CSP_SOURCES.cfBeaconReport, ...extraConnect],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return [...Object.entries(policy).map(([k, v]) => `${k} ${v.join(" ")}`), "upgrade-insecure-requests"].join("; ");
}

export function securityHeaders(extraConnect: readonly string[] = []): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: buildCsp(extraConnect) },
    { key: "Strict-Transport-Security", value: `max-age=${HSTS_MAX_AGE}` },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ];
}
