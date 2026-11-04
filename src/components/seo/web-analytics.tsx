import { CF_WEB_ANALYTICS_TOKEN } from "@/lib/constants";
import { CSP_SOURCES } from "@/lib/security/headers";

/** Cloudflare Web Analytics 비컨 — 토큰이 있을 때만. CSP 의 script-src·connect-src 에 출처가 열려 있다 */
export function WebAnalytics() {
  if (!CF_WEB_ANALYTICS_TOKEN) return null;
  return (
    <script
      defer
      src={`${CSP_SOURCES.cfBeaconScript}/beacon.min.js`}
      data-cf-beacon={JSON.stringify({ token: CF_WEB_ANALYTICS_TOKEN })}
    />
  );
}
