/**
 * 첫 화면 JS 전송량 예산 — scripts/js-budget.json 이 단일 원천.
 * 페이지가 load 될 때까지 받은 같은 출처 스크립트의 압축 본문 크기(encodedBodySize)를 더한다.
 * baselineKB 가 비어 있으면 측정만 하고 값을 출력한다(기준선 등록용).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, gotoReady, test } from "./support/fixtures";

interface RouteBudget {
  baselineKB: number | null;
  targetKB: number;
}
interface BudgetFile {
  tolerance: number;
  routes: Record<string, RouteBudget>;
}

const budget: BudgetFile = JSON.parse(readFileSync(path.resolve(__dirname, "..", "scripts", "js-budget.json"), "utf8"));

test.use({ viewport: { width: 1440, height: 900 } });

for (const [route, limits] of Object.entries(budget.routes)) {
  test(`JS 예산 ${route}: 첫 화면 스크립트 전송량이 기준선 +${budget.tolerance * 100}% 이내`, async ({ page }) => {
    await gotoReady(page, route);
    await page.waitForLoadState("load");
    const bytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((e): e is PerformanceResourceTiming => e instanceof PerformanceResourceTiming)
        .filter((e) => e.initiatorType === "script" && new URL(e.name).origin === location.origin)
        .reduce((sum, e) => sum + e.encodedBodySize, 0),
    );
    const kb = Math.round((bytes / 1024) * 10) / 10;
    test.info().annotations.push({ type: "js-kb", description: `${route}=${kb}` });
    console.log(`[js-budget] ${route} ${kb}KB (target ${limits.targetKB}KB, baseline ${limits.baselineKB ?? "미등록"})`);
    expect(kb, "스크립트를 하나도 못 잰 것은 측정 실패다").toBeGreaterThan(0);
    if (limits.baselineKB != null) {
      expect(kb).toBeLessThanOrEqual(Math.round(limits.baselineKB * (1 + budget.tolerance) * 10) / 10);
    }
  });
}
