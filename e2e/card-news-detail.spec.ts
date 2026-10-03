/**
 * 카드 상세 — 슬라이드 넘김(버튼·끝 비활성·키보드), 링크 복사, 공유 링크 형식, 이전/다음 카드,
 * 관련 글, OG·canonical 메타, 원문 링크(외부 이동은 URL·속성만 검증), 없는 카드 404.
 */
import type { Page } from "@playwright/test";
import { isMeaningfulTag } from "../src/lib/card-news";
import { PRODUCTION_ORIGIN, blogs, cardViews } from "./support/site";
import { expect, test, gotoReady } from "./support/fixtures";

const counter = (page: Page) => page.locator("p[aria-live=polite]", { hasText: "/" }).first();
const rail = (page: Page) => page.getByRole("region", { name: "카드 슬라이드 — 좌우로 넘겨 보기" });

/** 상세 테스트 대상: 최신·가장 오래된·중간·원문 미디어 링크·출처 없음(있으면) */
const picks = [
  cardViews[0],
  cardViews[cardViews.length - 1],
  cardViews[Math.floor(cardViews.length / 2)],
  cardViews.find((c) => c.source?.isMediaLink),
  cardViews.find((c) => !c.external_link),
].filter((c, i, arr): c is (typeof cardViews)[number] => !!c && arr.findIndex((x) => x?.id === c.id) === i);

for (const card of picks) {
  const path = `/card-news/${card.id}`;
  const index = cardViews.findIndex((c) => c.id === card.id);
  const newer = cardViews[index - 1] ?? null;
  const older = cardViews[index + 1] ?? null;

  test.describe(`카드 상세 ${card.serial}`, () => {
    test("모바일: 버튼으로 끝까지 넘기고 처음·끝에서 버튼이 비활성된다", async ({ page, diag }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoReady(page, path);
      const total = await page.locator("li[data-slide]").count();
      expect(total).toBeGreaterThanOrEqual(2);
      const prev = page.getByRole("button", { name: "이전 장" });
      const next = page.getByRole("button", { name: "다음 장" });
      await expect(prev).toBeDisabled();
      await expect(next).toBeEnabled();
      await expect(counter(page)).toContainText(`01 / ${String(total).padStart(2, "0")}`);
      for (let i = 2; i <= total; i++) {
        await next.click();
        await expect(counter(page)).toContainText(`${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
      }
      await expect(next).toBeDisabled();
      await expect(prev).toBeEnabled();
      // 마지막 장이 실제로 화면에 보인다
      await expect(page.locator("li[data-slide]").last()).toBeInViewport({ ratio: 0.9 });
      for (let i = total - 1; i >= 1; i--) {
        await prev.click();
        await expect(counter(page)).toContainText(`${String(i).padStart(2, "0")} / `);
      }
      await expect(prev).toBeDisabled();
      diag.assertClean();
    });

    test("키보드: 레일에 포커스 후 → ← 로 넘긴다", async ({ page, diag }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoReady(page, path);
      await rail(page).focus();
      await expect(rail(page)).toBeFocused();
      const before = await rail(page).evaluate((el) => el.scrollLeft);
      await page.keyboard.press("ArrowRight");
      await expect.poll(() => rail(page).evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
      // → 를 계속 누르면 마지막 장까지 가고 '다음 장'이 비활성된다 (스냅 스크롤이라 한 번에 한 장)
      const total = await page.locator("li[data-slide]").count();
      const next = page.getByRole("button", { name: "다음 장" });
      for (let i = 0; i < total * 3 && (await next.isEnabled()); i++) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(120);
      }
      await expect(next).toBeDisabled();
      await expect(counter(page)).toContainText(`${String(total).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
      const prev = page.getByRole("button", { name: "이전 장" });
      for (let i = 0; i < total * 3 && (await prev.isEnabled()); i++) {
        await page.keyboard.press("ArrowLeft");
        await page.waitForTimeout(120);
      }
      await expect(prev).toBeDisabled();
      await expect(counter(page)).toContainText("01 / ");
      diag.assertClean();
    });

    test("데스크톱: 메타·원문 링크·공유·이전/다음·관련 글", async ({ page, context, diag }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await gotoReady(page, path);
      const url = `${PRODUCTION_ORIGIN}${path}`;

      await expect(page.locator("h1")).toHaveText(card.title);
      await expect(page.locator(".entry-stamp")).toContainText(card.serial);

      // 메타 — canonical·OG·Twitter 가 운영 주소와 카드 값을 가리킨다
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", card.title);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
      await expect(page).toHaveTitle(new RegExp(`${card.serial.replace("#", "\\#")}`));
      if (card.image_url) {
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${PRODUCTION_ORIGIN}${encodeURI(card.image_url)}`);
        // og:image 가 가리키는 파일이 실제로 있다
        const img = await page.request.get(encodeURI(card.image_url));
        expect(img.status()).toBe(200);
        expect(img.headers()["content-type"]).toMatch(/^image\//);
      }
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
      expect(ld["@type"]).toBe("BreadcrumbList");
      expect(ld.itemListElement[2].item).toBe(url);

      // 원문 링크 — 외부로 실제 이동하지 않고 주소·새 탭 속성만 확인
      const original = page.getByRole("link", { name: /원문 (보기|미디어 열기)/ });
      if (card.external_link) {
        await expect(original).toHaveAttribute("href", card.external_link);
        await expect(original).toHaveAttribute("target", "_blank");
        await expect(original).toHaveAttribute("rel", /noopener/);
        await expect(page.locator("#fn-1")).toContainText(card.source!.host);
        // 각주 왕복
        await page.locator("#fn-ref-1").click();
        await expect(page).toHaveURL(/#fn-1$/);
        await expect(page.locator("#fn-1")).toBeInViewport();
        await page.getByRole("link", { name: "본문으로 돌아가기" }).click();
        await expect(page).toHaveURL(/#fn-ref-1$/);
      } else {
        await expect(original).toHaveCount(0);
      }

      // 공유 — 링크 복사는 운영 주소, X·Threads 인텐트 형식
      await page.getByRole("button", { name: "링크 복사" }).click();
      await expect(page.getByRole("button", { name: "복사됨" })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
      await expect(page.getByRole("button", { name: "링크 복사" })).toBeVisible({ timeout: 4000 });

      const x = new URL((await page.getByRole("link", { name: "X에 공유" }).getAttribute("href"))!);
      expect(`${x.origin}${x.pathname}`).toBe("https://twitter.com/intent/tweet");
      expect(x.searchParams.get("text")).toBe(card.title);
      expect(x.searchParams.get("url")).toBe(url);
      const th = new URL((await page.getByRole("link", { name: "Threads에 공유" }).getAttribute("href"))!);
      expect(`${th.origin}${th.pathname}`).toBe("https://www.threads.net/intent/post");
      expect(th.searchParams.get("text")).toBe(`${card.title} ${url}`);
      for (const name of ["X에 공유", "Threads에 공유"]) {
        await expect(page.getByRole("link", { name })).toHaveAttribute("target", "_blank");
        await expect(page.getByRole("link", { name })).toHaveAttribute("rel", /noopener/);
      }

      // 태그 → 목록 필터
      const shownTags = card.tags.filter(isMeaningfulTag);
      for (const tag of shownTags) {
        await expect(page.locator(".spec-table").getByRole("link", { name: `#${tag}`, exact: true })).toHaveAttribute(
          "href",
          `/card-news?tag=${encodeURIComponent(tag)}`,
        );
      }

      // 이전(더 오래된)·다음(더 최신) 카드
      const adj = page.getByRole("navigation", { name: "이전·다음 카드" });
      if (older) await expect(adj.getByRole("link", { name: /이전 카드/ })).toHaveAttribute("href", `/card-news/${older.id}`);
      else await expect(adj.getByRole("link", { name: /이전 카드/ })).toHaveCount(0);
      if (newer) await expect(adj.getByRole("link", { name: /다음 카드/ })).toHaveAttribute("href", `/card-news/${newer.id}`);
      else await expect(adj.getByRole("link", { name: /다음 카드/ })).toHaveCount(0);

      // 이 주제로 쓴 글 — 같은(일반어 아닌) 태그를 가진 공개 글
      const set = new Set(shownTags.map((t) => t.toLowerCase()));
      const want = blogs.filter((b) => b.tags.some((t) => set.has(t.toLowerCase()))).slice(0, 3).map((b) => `/blog/${b.slug}`);
      const related = page.locator("section", { has: page.locator("#related-posts-title") });
      if (want.length > 0) expect(await related.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(want);
      else await expect(related).toHaveCount(0);

      diag.assertClean();
    });
  });
}

test("이전/다음 카드·전체 보기 링크를 따라가면 실제로 이동한다", async ({ page, diag }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page, `/card-news/${cardViews[1].id}`);
  await page.getByRole("navigation", { name: "이전·다음 카드" }).getByRole("link", { name: /다음 카드/ }).click();
  await expect(page).toHaveURL(new RegExp(`/card-news/${cardViews[0].id}$`));
  await page.getByRole("navigation", { name: "이전·다음 카드" }).getByRole("link", { name: /이전 카드/ }).click();
  await expect(page).toHaveURL(new RegExp(`/card-news/${cardViews[1].id}$`));
  await page.getByRole("link", { name: /카드뉴스 전체 보기/ }).click();
  await expect(page).toHaveURL(/\/card-news$/);
  diag.assertClean();
});

test("관련 글이 있는 카드에서 글로 이동한다", async ({ page, diag }) => {
  const withRelated = cardViews.find((c) => {
    const set = new Set(c.tags.filter(isMeaningfulTag).map((t) => t.toLowerCase()));
    return blogs.some((b) => b.tags.some((t) => set.has(t.toLowerCase())));
  });
  test.skip(!withRelated, "태그가 겹치는 카드·글 조합이 데이터에 없음");
  await gotoReady(page, `/card-news/${withRelated!.id}`);
  const link = page.locator("section", { has: page.locator("#related-posts-title") }).locator("a").first();
  const href = await link.getAttribute("href");
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  diag.assertClean();
});

test("없는 카드 번호는 404 다", async ({ page, diag }) => {
  const res = await page.goto("/card-news/999999");
  expect(res?.status()).toBe(404);
  diag.allowedStatusUrls.add(res!.url());
  diag.assertClean();
});
