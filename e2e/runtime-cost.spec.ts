/**
 * G3b 운영 런타임 비용 — OpenNext 로컬 프리뷰(workerd)에서만 의미가 있다.
 *
 * 왜: 로컬 workerd 는 Workers 의 요청당 CPU 한도를 강제하지 않는다. 증분 캐시가 없어 모든 요청이 SSR 되던 빌드가
 * 로컬 E2E 를 통과하고 운영에서 Error 1102 로 터졌다(2026-10-04). 그래서 "시간이 얼마나 걸리나" 대신
 * "요청이 Worker 에서 렌더되는가"를 직접 본다 — 렌더되지 않으면 CPU 한도에 걸릴 일이 없다.
 *
 * 캐시 표식(OpenNext 3.9 소스 기준 — @opennextjs/aws core/routing/cacheInterceptor.js):
 *  · `x-opennext-cache: HIT`  캐시 인터셉터가 Next 서버를 거치지 않고 증분 캐시에서 응답
 *  · `x-nextjs-cache: HIT`    Next 서버가 증분 캐시에서 응답(루트 `/` 는 인터셉터가 건너뛰어 이 경로로 온다)
 *  · 둘 다 없거나 MISS        요청마다 렌더 — 허용 목록(scripts/render-allowlist.json) 밖이면 실패
 *
 * 실행: `pnpm exec opennextjs-cloudflare build` 후 `pnpm test:e2e:runtime` (프리뷰를 직접 띄우고 이 파일만 워커 1개로)
 *       또는 E2E_BASE_URL=<떠 있는 프리뷰> E2E_RUNTIME=opennext E2E_TIMING=1 pnpm exec playwright test e2e/runtime-cost.spec.ts --workers=1
 * 시간 상한 검사는 E2E_TIMING=1 일 때만 — 다른 스펙과 함께 돌면 같은 workerd 를 나눠 써서 시간이 오염된다.
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { ALL_ROUTES } from "./support/site";

interface AllowEntry {
  reason: string;
  /** 콜드 요청을 뺀 서버 처리 시간 p95 하한 상한(ms) — 빠른 기계에서도 이 값까지는 허용 */
  maxP95Ms: number;
  /** 같은 실행에서 잰 캐시 기준 페이지 p95 의 몇 배까지 허용하는지 (기계 속도 보정) */
  maxRatioToReference?: number;
  /** 시간을 잴 주소(쿼리 포함). 없으면 경로 그대로 */
  samples?: string[];
}
const ALLOWLIST: Record<string, AllowEntry> = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "scripts", "render-allowlist.json"), "utf8"),
).dynamic;

/** 메타 라우트(사이트맵·RSS·robots·카드 인덱스)도 요청마다 렌더되면 안 된다 */
const META_ROUTES = ["/rss.xml", "/sitemap.xml", "/robots.txt", "/card-news/index.json"];
/** 동적 세그먼트에 없는 값 — 런타임 렌더 없이 404 여야 한다(카드 번호 비정규 표기 포함) */
const MISSING_ROUTES = ["/card-news/0185", "/card-news/185.0", "/card-news/abc", "/card-news/99999", "/blog/no-such-post", "/projects/no-such", "/showcase/no-such"];
/** 실제 브라우저로 열어 프리페치까지 포함한 요청을 보는 페이지 (장애 때 프리페치 팬아웃이 컸던 곳) */
const BROWSE_PAGES = ["/", "/card-news", "/blog", "/card-news/186"];
/** 시간 측정: 콜드 제외 워밍업 횟수와 표본 수 */
const WARMUP = 3;
const SAMPLES = 20;
/**
 * 시간 기준 페이지 — 작은 캐시 적중 페이지. 공유 기계에서는 같은 경로의 절대 시간이 하루에도 2~3배 흔들려서
 * (2026-10-05 실측: /services/news p95 15~20ms → 33~60ms, 같은 시점 /subscribe 14~21ms → 20~35ms)
 * 동적 경로 상한을 같은 실행에서 잰 기준 페이지 p95 에 비례하게 잡는다. 장애 유형(무거운 페이지 SSR)은 캐시 대비 약 5배였다.
 */
const TIMING_REFERENCE = "/subscribe";
/** 기계가 아무리 느려도 넘으면 안 되는 상한 */
const HARD_CEILING_MS = 250;

async function measureP95(url: string): Promise<number> {
  for (let i = 0; i < WARMUP; i++) expect((await timedGet(url)).res.status).toBe(200);
  const times: number[] = [];
  for (let i = 0; i < SAMPLES; i++) times.push((await timedGet(url)).ms);
  return p95(times);
}

const BASE = process.env.E2E_BASE_URL ?? `http://localhost:${process.env.E2E_PORT ?? 3372}`;
const isAllowed = (pathname: string) => Object.hasOwn(ALLOWLIST, pathname);

function cacheMarker(headers: Headers | Record<string, string>): string | null {
  const get = (k: string) => (headers instanceof Headers ? headers.get(k) : headers[k]) ?? null;
  if (get("x-opennext-cache") === "HIT") return "x-opennext-cache: HIT";
  if (get("x-nextjs-cache") === "HIT") return "x-nextjs-cache: HIT";
  return null;
}

async function timedGet(url: string, headers: Record<string, string> = {}) {
  const t0 = performance.now();
  const res = await fetch(url, { headers, redirect: "manual" });
  await res.arrayBuffer();
  return { res, ms: performance.now() - t0 };
}

function p95(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil(0.95 * s.length) - 1)];
}

test.skip(process.env.E2E_RUNTIME !== "opennext", "OpenNext 로컬 프리뷰 전용 (E2E_RUNTIME=opennext) — next start 에는 증분 캐시 계층이 없다");
// 같은 workerd 하나를 쓰므로 순서대로(브라우저 열람·시간 측정이 서로 부하를 주지 않게)
test.describe.configure({ mode: "serial" });

/** 경로 묶음 */
const GROUPS: Record<string, string[]> = {
  "정적·메타": [...ALL_ROUTES.filter((r) => !/^\/(blog|card-news|projects|showcase)\/./.test(r)), ...META_ROUTES],
  "블로그·프로젝트·쇼케이스 상세": ALL_ROUTES.filter((r) => /^\/(blog|projects|showcase)\/./.test(r)),
  "카드뉴스 상세": ALL_ROUTES.filter((r) => r.startsWith("/card-news/")),
};

for (const [name, routes] of Object.entries(GROUPS)) {
  test(`${name}: 문서·RSC 응답이 모두 미리 렌더된 캐시에서 나온다 (허용 목록 제외)`, async () => {
    const problems: string[] = [];
    for (const route of routes) {
      if (isAllowed(route)) continue;
      for (const [kind, headers] of [["문서", {}], ["RSC", { RSC: "1" }]] as const) {
        const { res } = await timedGet(BASE + route, headers);
        if (res.status !== 200) problems.push(`${route} [${kind}] HTTP ${res.status}`);
        else if (!cacheMarker(res.headers)) {
          problems.push(`${route} [${kind}] 캐시 표식 없음 (x-opennext-cache=${res.headers.get("x-opennext-cache")}, x-nextjs-cache=${res.headers.get("x-nextjs-cache")}) → 요청마다 Worker 렌더`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
}

for (const page of BROWSE_PAGES) {
  test(`${page} 1회 열람(스크롤·프리페치 포함) 동안 Worker 가 렌더한 요청이 0건이다`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const tab = await ctx.newPage();
    const rendered: string[] = [];
    let workerResponses = 0;
    tab.on("response", (res) => {
      const u = new URL(res.url());
      if (u.origin !== new URL(BASE).origin) return;
      const type = res.headers()["content-type"] ?? "";
      // 문서(HTML)·RSC 만 Worker 렌더 대상 — 정적 자산·이미지 변환은 별도
      if (!/text\/html|text\/x-component/.test(type)) return;
      workerResponses++;
      if (!cacheMarker(res.headers()) && !isAllowed(u.pathname)) rendered.push(`${res.status()} ${u.pathname}${u.search} (${type.split(";")[0]})`);
    });
    await tab.goto(BASE + page, { waitUntil: "networkidle" });
    for (let i = 0; i < 6; i++) {
      await tab.mouse.wheel(0, 1200);
      await tab.waitForLoadState("networkidle");
    }
    await ctx.close();
    expect(workerResponses, "문서·RSC 응답을 하나도 못 봤다 — 측정이 잘못됐다").toBeGreaterThan(0);
    expect(rendered, `캐시 없이 렌더된 요청 ${rendered.length}/${workerResponses}건:\n${rendered.join("\n")}`).toEqual([]);
  });
}

test("없는 주소는 404 다 (동적 세그먼트 dynamicParams=false)", async () => {
  const problems: string[] = [];
  for (const route of MISSING_ROUTES) {
    const { res } = await timedGet(BASE + route);
    if (res.status !== 404) problems.push(`${route} → HTTP ${res.status}`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

for (const [route, entry] of Object.entries(ALLOWLIST)) {
  const ratio = entry.maxRatioToReference ?? 2.5;
  test(`허용된 동적 경로 ${route}: 콜드 제외 p95 ≤ max(${entry.maxP95Ms}ms, 기준 페이지 p95 × ${ratio}), ≤ ${HARD_CEILING_MS}ms`, async () => {
    test.skip(process.env.E2E_TIMING !== "1", "시간 상한은 단독 실행(E2E_TIMING=1, --workers=1)에서만 잰다");
    const refP95 = await measureP95(BASE + TIMING_REFERENCE);
    const limit = Math.min(HARD_CEILING_MS, Math.max(entry.maxP95Ms, refP95 * ratio));
    const report: string[] = [`기준 ${TIMING_REFERENCE} p95 ${refP95.toFixed(1)}ms → 상한 ${limit.toFixed(1)}ms`];
    let worst = 0;
    for (const sample of entry.samples ?? [route]) {
      const v = await measureP95(BASE + sample);
      worst = Math.max(worst, v);
      report.push(`${sample}: p95 ${v.toFixed(1)}ms (n=${SAMPLES})`);
    }
    test.info().annotations.push({ type: "p95", description: report.join(" · ") });
    expect(worst, report.join("\n")).toBeLessThanOrEqual(limit);
  });
}
