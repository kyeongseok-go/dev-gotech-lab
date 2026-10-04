/**
 * 블로그 목록 — 카테고리 탭(클릭·키보드 ←→), 태그 필터 토글, URL 상태 복원, 결과 없음.
 */
import type { Page } from "@playwright/test";
import { blogs } from "./support/site";
import { expect, test, gotoReady } from "./support/fixtures";

const categories = [...new Set(blogs.map((b) => b.category).filter((c): c is string => !!c))];
const tags = [...new Set(blogs.flatMap((b) => b.tags))];

const listHrefs = (page: Page) =>
  page.locator('[data-slot="tabs-content"] a[href^="/blog/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href")))]);
/** 현재 URL 의 쿼리를 객체로 (+ / %20 표기 차이 무시) */
const params = (page: Page) => Object.fromEntries(new URL(page.url()).searchParams);
const expected = (pred: (b: (typeof blogs)[number]) => boolean) => blogs.filter(pred).map((b) => `/blog/${b.slug}`);

test.use({ viewport: { width: 1440, height: 900 } });

test("전체 탭에 모든 공개 글이 최신순으로, 초안은 빠진 채 나온다", async ({ page, diag }) => {
  await gotoReady(page, "/blog");
  await expect(page.getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");
  expect(await listHrefs(page)).toEqual(expected(() => true));
  diag.assertClean();
});

test("카테고리 탭을 누르면 URL(?category=)과 목록이 바뀌고, 다시 All 로 돌아온다", async ({ page, diag }) => {
  await gotoReady(page, "/blog");
  for (const cat of categories) {
    await page.getByRole("tab", { name: new RegExp(`^${cat}`) }).click();
    await expect(page).toHaveURL(new RegExp(`\\?category=${encodeURIComponent(cat)}$`));
    await expect(page.getByRole("tab", { name: new RegExp(`^${cat}`) })).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => listHrefs(page)).toEqual(expected((b) => b.category === cat));
    // 탭 옆 숫자 = 해당 카테고리 글 수
    await expect(page.getByRole("tab", { name: new RegExp(`^${cat}`) })).toContainText(String(blogs.filter((b) => b.category === cat).length).padStart(2, "0"));
  }
  await page.getByRole("tab", { name: /^All/ }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect.poll(() => listHrefs(page)).toEqual(expected(() => true));
  diag.assertClean();
});

test("키보드 ← → 로 카테고리 탭을 옮기면 선택과 URL 이 함께 바뀐다", async ({ page, diag }) => {
  await gotoReady(page, "/blog");
  await page.getByRole("tab", { name: /^All/ }).focus();
  await page.keyboard.press("ArrowRight");
  const first = categories[0];
  await expect(page.getByRole("tab", { name: new RegExp(`^${first}`) })).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`\\?category=${encodeURIComponent(first)}$`));
  await expect(page.getByRole("tab", { name: new RegExp(`^${first}`) })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: /^All/ })).toBeFocused();
  await expect(page).toHaveURL(/\/blog$/);
  // 첫 탭에서 ← 는 마지막 탭으로 순환
  await page.keyboard.press("ArrowLeft");
  const last = categories[categories.length - 1];
  await expect(page.getByRole("tab", { name: new RegExp(`^${last}`) })).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`\\?category=${encodeURIComponent(last)}$`));
  diag.assertClean();
});

test("태그 칩을 누르면 ?tag= 로 거르고, 활성 칩을 다시 누르면 해제된다", async ({ page, diag }) => {
  await gotoReady(page, "/blog");
  const tag = tags[0];
  await page.getByRole("button", { name: `#${tag}`, exact: true }).click();
  await expect.poll(() => params(page)).toEqual({ tag });
  await expect.poll(() => listHrefs(page)).toEqual(expected((b) => b.tags.includes(tag)));
  const active = page.getByRole("button", { name: `태그 ${tag} 해제` });
  await expect(active).toBeVisible();
  await active.click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("button", { name: `태그 ${tag} 해제` })).toHaveCount(0);
  await expect.poll(() => listHrefs(page)).toEqual(expected(() => true));
  diag.assertClean();
});

test("카테고리+태그 조합 URL 로 바로 들어오면 상태가 복원되고, 뒤로 가기로 이전 상태가 돌아온다", async ({ page, diag }) => {
  const cat = categories[0];
  const tag = blogs.find((b) => b.category === cat)!.tags[0];
  await gotoReady(page, `/blog?category=${encodeURIComponent(cat)}&tag=${encodeURIComponent(tag)}`);
  await expect(page.getByRole("tab", { name: new RegExp(`^${cat}`) })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: `태그 ${tag} 해제` })).toBeVisible();
  expect(await listHrefs(page)).toEqual(expected((b) => b.category === cat && b.tags.includes(tag)));

  await page.getByRole("tab", { name: /^All/ }).click();
  await expect.poll(() => params(page)).toEqual({ tag });
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`category=${encodeURIComponent(cat)}`));
  await expect(page.getByRole("tab", { name: new RegExp(`^${cat}`) })).toHaveAttribute("aria-selected", "true");
  diag.assertClean();
});

test("조건에 맞는 글이 없으면 안내 문구를 보여 준다", async ({ page, diag }) => {
  const cat = categories.find((c) => blogs.some((b) => b.category !== c))!;
  const tagOutside = tags.find((t) => !blogs.some((b) => b.category === cat && b.tags.includes(t)))!;
  await gotoReady(page, `/blog?category=${encodeURIComponent(cat)}&tag=${encodeURIComponent(tagOutside)}`);
  await expect(page.getByText("해당 조건에 맞는 글이 없습니다.")).toBeVisible();
  expect(await listHrefs(page)).toEqual([]);
  diag.assertClean();
});

test("목록 행을 누르면 해당 글로 이동한다", async ({ page, diag }) => {
  await gotoReady(page, "/blog");
  await page.locator(`[data-slot="tabs-content"] a[href="/blog/${blogs[1].slug}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/blog/${blogs[1].slug}$`));
  await expect(page.locator("h1")).toHaveText(blogs[1].title);
  diag.assertClean();
});
