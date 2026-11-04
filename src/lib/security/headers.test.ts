import { describe, expect, it } from "vitest";
import { buildCsp, CSP_SOURCES, securityHeaders } from "./headers";

const directives = (csp: string) => new Map(csp.split("; ").map((d) => [d.split(" ")[0], d.split(" ").slice(1)]));

describe("buildCsp", () => {
  it("외부 스크립트는 Cloudflare 비컨만, 프레임·object 는 막는다", () => {
    const csp = directives(buildCsp());
    expect(csp.get("script-src")).toEqual(["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"]);
    expect(csp.get("frame-src")).toEqual(["'none'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
  });

  it("BYO-key 도구가 쓰는 공급자 도메인은 connect-src 에만 더한다", () => {
    const csp = directives(buildCsp(["https://api.anthropic.com"]));
    expect(csp.get("connect-src")).toEqual(["'self'", "https://cloudflareinsights.com", "https://api.anthropic.com"]);
    expect(csp.get("script-src")).not.toContain("https://api.anthropic.com");
  });

  it("https 가 아닌 출처는 받지 않는다", () => {
    expect(() => buildCsp(["http://evil.example"])).toThrow("https 출처만");
  });

  it("Pretendard CDN 은 스타일·폰트에만 열려 있다", () => {
    const csp = directives(buildCsp());
    expect(csp.get("style-src")).toContain(CSP_SOURCES.pretendardCdn);
    expect(csp.get("font-src")).toContain(CSP_SOURCES.pretendardCdn);
    expect(csp.get("script-src")).not.toContain(CSP_SOURCES.pretendardCdn);
  });
});

describe("securityHeaders", () => {
  it("CSP 와 기본 보안 헤더 6개를 돌려준다", () => {
    const keys = securityHeaders().map((h) => h.key);
    expect(keys).toEqual([
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]);
  });
});
