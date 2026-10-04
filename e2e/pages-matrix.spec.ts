/**
 * 공통 검사 — 공개된 모든 페이지 × 폭(320·390·768·1440) × 테마(다크·라이트).
 * 각 조합에서: 콘솔 에러 0 · 가로 넘침 0 · 이미지 로드 실패 0 · axe serious/critical 0.
 */
import { ALL_ROUTES } from "./support/site";
import {
  brokenImages,
  expect,
  horizontalOverflow,
  isKnownExternalFailure,
  presetTheme,
  scrollThrough,
  seriousA11yViolations,
  settleAnimations,
  test,
  type Theme,
  waitForHydration,
} from "./support/fixtures";

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;
const THEMES: Theme[] = ["dark", "light"];

test.describe.configure({ mode: "parallel" });

for (const route of ALL_ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      test(`${route} @${vp.width} ${theme}`, async ({ page, diag }) => {
        await page.setViewportSize(vp);
        await presetTheme(page, theme);
        const res = await page.goto(route, { waitUntil: "load" });
        expect(res?.status(), "문서 응답 200").toBe(200);
        await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
        await expect(page.locator("h1").first()).toBeVisible();
        await waitForHydration(page); // 하이드레이션 오류가 콘솔에 나올 시점까지 확실히 기다린다

        await scrollThrough(page);
        const broken = (await brokenImages(page)).filter((src) => !isKnownExternalFailure(route, src));
        expect(broken, "깨진 이미지 0").toEqual([]);

        const { overflow, culprits } = await horizontalOverflow(page);
        expect(overflow, `가로 넘침 0px — 원인: ${culprits.join(", ")}`).toBeLessThanOrEqual(0);

        await settleAnimations(page);
        expect(await seriousA11yViolations(page), "axe serious·critical 0").toEqual([]);

        diag.assertClean(`${route} @${vp.width} ${theme}`);
      });
    }
  }
}
