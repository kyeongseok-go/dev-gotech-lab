/**
 * 내부 링크 크롤 — 공개된 모든 페이지의 모든 내부 링크가 200(또는 리다이렉트 후 200)이고,
 * 같은 페이지 앵커(#…)는 대상 요소가 실제로 있어야 한다.
 */
import { ALL_ROUTES } from "./support/site";
import { expect, test } from "./support/fixtures";

/** 워커별 캐시 — 같은 URL 을 여러 번 요청하지 않는다 */
const checked = new Map<string, number>();

test.describe.configure({ mode: "parallel" });

for (const route of ALL_ROUTES) {
  test(`링크 크롤 ${route}`, async ({ page, request, baseURL }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    const origin = new URL(baseURL!).origin;

    const { internal, missingAnchors } = await page.evaluate((o) => {
      const internal = new Set<string>();
      const missingAnchors: string[] = [];
      for (const a of Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
        const raw = a.getAttribute("href")!;
        if (raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
        const url = new URL(raw, location.href);
        if (url.origin !== o) continue;
        if (url.pathname === location.pathname && url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          if (!document.getElementById(id)) missingAnchors.push(raw);
          continue;
        }
        internal.add(url.pathname + url.search);
      }
      return { internal: [...internal], missingAnchors };
    }, origin);

    expect(missingAnchors, "대상이 없는 같은 페이지 앵커").toEqual([]);

    const broken: string[] = [];
    for (const target of internal) {
      if (!checked.has(target)) {
        const r = await request.get(`${origin}${target}`);
        checked.set(target, r.status());
      }
      const status = checked.get(target)!;
      if (status >= 400) broken.push(`${target} → ${status}`);
    }
    expect(broken, `${route} 의 깨진 내부 링크`).toEqual([]);
  });
}
