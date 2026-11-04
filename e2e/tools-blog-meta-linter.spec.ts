/**
 * /tools/blog-meta-linter — RUBRIC C1(핵심 흐름 조작 수)·C2(결과 처리)·C3(4개 상태)·C4(뷰포트)·C8(axe).
 */
import { expect, gotoReady, horizontalOverflow, seriousA11yViolations, test } from "./support/fixtures";

const PATH = "/tools/blog-meta-linter";
const VIEWPORTS = [320, 375, 768, 1024, 1440] as const;

const VALID = `---
title: "짧은 제목"
description: "설명입니다"
date: 2026-11-04
category: devtools
tags: ["도구"]
---

## 본문
`;

const input = (page: import("@playwright/test").Page) => page.getByLabel("MDX·Markdown 원문");
const summary = (page: import("@playwright/test").Page) => page.getByTestId("summary");

test.use({ viewport: { width: 1440, height: 900 } });

test("핵심 흐름(조작 1번): 예시 넣기만 눌러도 규칙별 결과와 실패 이유가 나온다", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  await page.getByRole("button", { name: "예시 넣기" }).click();
  await expect(summary(page)).toHaveText("통과 5 · 경고 1 · 실패 2");
  await expect(page.locator('[data-rule="title-length"]')).toHaveAttribute("data-status", "fail");
  await expect(page.locator('[data-rule="image-alt"]')).toContainText("12번째 줄");
  diag.assertClean();
});

test("빈 상태: 입력 전에는 안내 문구만 보이고 결과·버튼은 없다", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  await expect(page.getByText("원문을 붙여 넣으면 바로 검사합니다")).toBeVisible();
  await expect(summary(page)).toHaveCount(0);
  await expect(page.getByText("아직 저장한 기록이 없습니다.")).toBeVisible();
  diag.assertClean();
});

test("에러 상태: frontmatter 가 없거나 지원하지 않는 구문이면 이유와 줄 번호를 알린다", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  await input(page).fill("# 제목만 있는 글");
  await expect(page.locator("main").getByRole("alert")).toContainText("frontmatter 를 찾지 못했습니다");
  await input(page).fill("---\ntitle: a\nseo:\n  title: b\n---\n");
  await expect(page.locator("main").getByRole("alert")).toContainText("4번째 줄: title: b");
  diag.assertClean();
});

test("로딩 상태: 스크립트가 붙기 전에는 입력을 막고 불러오는 중이라고 알린다", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  // JS 만 붙잡는다(Turbopack 은 CSS 도 chunks/ 아래에 둔다 — CSS 를 막으면 화면 자체가 그려지지 않는다)
  await page.route(/\/_next\/static\/chunks\/.*\.js(\?|$)/, async (route) => {
    await gate;
    await route.continue();
  });
  // 스크립트를 붙잡으면 DOMContentLoaded 가 오지 않으므로 응답 시작(commit)까지만 기다린다
  await page.goto(PATH, { waitUntil: "commit" });
  await expect(page.getByText("도구를 불러오는 중입니다…")).toBeVisible();
  await expect(input(page)).toBeDisabled();
  release();
  await expect(input(page)).toBeEnabled();
  await expect(page.getByText("도구를 불러오는 중입니다…")).toHaveCount(0);
});

test("오프라인 상태: 페이지를 연 뒤 네트워크가 끊겨도 검사는 그대로 동작한다", async ({ page, context, diag }) => {
  await gotoReady(page, PATH);
  await context.setOffline(true);
  await input(page).fill(VALID);
  await expect(summary(page)).toHaveText("통과 8 · 경고 0 · 실패 0");
  await context.setOffline(false);
  // 오프라인 동안 헤더 링크 프리페치가 실패하는 것(요청 실패·콘솔 기록)은 정상 — 그 밖의 오류는 0건이어야 한다
  const offlineNoise = (i: (typeof diag.issues)[number]) =>
    i.kind === "requestfailed" || (i.kind === "console" && i.text.includes("ERR_INTERNET_DISCONNECTED"));
  expect(diag.issues.filter((i) => !offlineNoise(i))).toEqual([]);
});

test("길이 기준을 바꾸면 결과가 바로 다시 계산된다", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  await page.getByRole("button", { name: "예시 넣기" }).click();
  await page.getByLabel("제목 최대 글자").fill("60");
  await expect(page.locator('[data-rule="title-length"]')).toHaveAttribute("data-status", "pass");
  diag.assertClean();
});

test("결과 처리: 정리된 frontmatter 복사 · 결과 내려받기", async ({ page, context, diag }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await gotoReady(page, PATH);
  await input(page).fill(VALID);
  await page.getByRole("button", { name: "정리된 frontmatter 복사" }).click();
  await expect(page.getByText("복사했습니다")).toBeAttached();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('title: "짧은 제목"');

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "결과 내려받기" }).click();
  expect((await download).suggestedFilename()).toBe("blog-meta-linter-report.json");
  diag.assertClean();
});

test("기록: 저장 → 다시 불러오기 → JSON 내보내기 → 모든 저장 데이터 삭제", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  await input(page).fill(VALID);
  await page.getByRole("button", { name: "기록에 저장" }).click();
  const item = page.getByRole("button", { name: /짧은 제목/ });
  await expect(item).toBeVisible();

  await input(page).fill("");
  await item.click();
  await expect(input(page)).toHaveValue(VALID);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON 내보내기" }).click();
  expect((await download).suggestedFilename()).toBe("blog-meta-linter-history.json");

  await page.evaluate(() => localStorage.setItem("site-setting", "keep"));
  await page.getByRole("button", { name: "모든 저장 데이터 삭제" }).click();
  await expect(page.getByText("아직 저장한 기록이 없습니다.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("site-setting"))).toBe("keep");
  diag.assertClean();
});

test("기록은 최근 20건까지만 남는다", async ({ page, diag }) => {
  await gotoReady(page, PATH);
  for (let i = 0; i < 22; i++) {
    await input(page).fill(VALID.replace("짧은 제목", `제목 ${i}`));
    await page.getByRole("button", { name: "기록에 저장" }).click();
  }
  await expect(page.getByText("20/20")).toBeVisible();
  diag.assertClean();
});

for (const width of VIEWPORTS) {
  test(`반응형 ${width}px: 가로 넘침 0 · axe serious/critical 0`, async ({ page, diag }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoReady(page, PATH);
    await page.getByRole("button", { name: "예시 넣기" }).click();
    await expect(summary(page)).toBeVisible();
    expect(await horizontalOverflow(page)).toEqual({ overflow: 0, culprits: [] });
    expect(await seriousA11yViolations(page)).toEqual([]);
    await page.screenshot({ path: info.outputPath(`blog-meta-linter-${width}.png`), fullPage: true });
    diag.assertClean();
  });
}
