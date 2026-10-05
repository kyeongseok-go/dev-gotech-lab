#!/usr/bin/env node
/**
 * 빌드 출력 렌더 방식 검사 (G3b) — `next build` 뒤에 실행한다.
 *
 * 왜: OpenNext(Cloudflare)에서 동적(ƒ) 경로는 요청마다 Worker CPU 로 렌더된다. 로컬 workerd 는 CPU 한도를
 * 강제하지 않아 무거운 동적 경로가 테스트를 통과하고 운영에서만 Error 1102 로 터졌다(2026-10-04).
 * 그래서 "미리 렌더되는 경로"를 계약으로 고정한다.
 *
 * 실패 조건
 *  1. scripts/render-allowlist.json 에 없는 경로가 동적(ƒ)이다.
 *  2. 동적 세그먼트 경로(●)가 dynamicParams=false 가 아니다 → 없는 주소마다 런타임 렌더가 일어난다.
 *  3. 재검증(ISR, revalidate 숫자)이 있다 → 정적 자산 증분 캐시는 재검증을 지원하지 않는다.
 *  4. 허용 목록의 경로가 더는 동적이 아니다(목록이 낡음) 또는 앱에 없다.
 *  5. open-next.config.ts 에 정적 자산 증분 캐시·캐시 인터셉션 설정이 없다
 *     (없으면 빌드 표시는 ○/● 여도 운영에서는 전부 SSR 된다 — 이번 장애의 직접 원인).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const NEXT_DIR = path.join(ROOT, ".next");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/** 사람이 보는 표기 — next build 출력과 같은 기호 */
const MARK = { static: "○", ssg: "●", dynamic: "ƒ" };
/** Next 내부 경로(검사 대상 아님) */
const INTERNAL = new Set(["/_global-error", "/_not-found"]);

function classify(routes, dynamicRoutes, route) {
  if (dynamicRoutes[route]) return "ssg";
  if (routes[route]) return "static";
  return "dynamic";
}

function checkOpenNextConfig(errors) {
  const src = readFileSync(path.join(ROOT, "open-next.config.ts"), "utf8")
    // 주석 제거 후 검사 (주석 처리된 설정은 없는 것과 같다)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  if (!/incrementalCache\s*:\s*staticAssetsIncrementalCache\b/.test(src)) {
    errors.push("open-next.config.ts: incrementalCache 가 staticAssetsIncrementalCache 가 아니다 → 운영에서 모든 페이지가 요청마다 SSR 된다");
  }
  if (!/enableCacheInterception\s*:\s*true\b/.test(src)) {
    errors.push("open-next.config.ts: enableCacheInterception: true 가 없다 → 미리 렌더된 페이지도 Next 서버를 거친다");
  }
}

function main() {
  const manifestPath = path.join(NEXT_DIR, "prerender-manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("✗ .next/prerender-manifest.json 이 없다 — 먼저 `pnpm build` 를 실행하세요.");
    process.exit(2);
  }
  const { routes, dynamicRoutes } = readJson(manifestPath);
  const appRoutes = [...new Set(Object.values(readJson(path.join(NEXT_DIR, "app-path-routes-manifest.json"))))]
    .filter((r) => !INTERNAL.has(r))
    .sort();
  const allowlist = readJson(path.join(ROOT, "scripts", "render-allowlist.json")).dynamic ?? {};

  const errors = [];
  const rows = appRoutes.map((route) => {
    const mode = classify(routes, dynamicRoutes, route);
    const allowed = Object.hasOwn(allowlist, route);
    if (mode === "dynamic" && !allowed) {
      errors.push(`${route}: 동적(ƒ)인데 허용 목록에 없다 — searchParams·headers·cookies 사용이나 force-dynamic 을 확인하거나, 의도라면 scripts/render-allowlist.json 에 이유·시간 상한과 함께 추가`);
    }
    if (mode !== "dynamic" && allowed) {
      errors.push(`${route}: 허용 목록에 있지만 이제 정적이다 — scripts/render-allowlist.json 에서 지운다`);
    }
    if (mode === "ssg" && dynamicRoutes[route].fallback !== false) {
      errors.push(`${route}: dynamicParams = false 가 아니다 — 없는 주소마다 Worker 에서 렌더된다`);
    }
    return { route, mode, allowed };
  });

  for (const [route, entry] of Object.entries(routes)) {
    if (typeof entry.initialRevalidateSeconds === "number") {
      errors.push(`${route}: revalidate=${entry.initialRevalidateSeconds} (ISR) — 정적 자산 증분 캐시는 재검증을 지원하지 않는다`);
    }
  }
  for (const route of Object.keys(allowlist)) {
    if (!appRoutes.includes(route)) errors.push(`${route}: 허용 목록에 있지만 앱에 없는 경로다`);
  }
  checkOpenNextConfig(errors);

  const prerendered = Object.keys(routes).filter((r) => !INTERNAL.has(r)).length;
  console.log("렌더 방식 (○ 정적 · ● SSG · ƒ 동적)");
  for (const { route, mode, allowed } of rows) {
    console.log(`  ${MARK[mode]} ${route}${mode === "dynamic" && allowed ? "  (허용 목록)" : ""}`);
  }
  console.log(`미리 렌더된 페이지 ${prerendered}개, 동적 경로 ${rows.filter((r) => r.mode === "dynamic").length}개`);

  if (errors.length) {
    console.error(`\n✗ 렌더 방식 검사 실패 (${errors.length}건)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("✓ 렌더 방식 검사 통과");
}

main();
