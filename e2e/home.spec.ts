/**
 * 홈 — FIG.01 사진, 이 페이지 목차(§), CTA, 숫자 티커 최종값, 섹션 링크, 최신 카드 미리보기.
 */
import { blogs, cards, projects, showcase } from "./support/site";
import { expect, headerBottom, test, gotoReady } from "./support/fixtures";

/** 홈 숫자 스트립 — page.tsx 의 ENGINE_MONTHS(5년 5개월)와 실제 콘텐츠 수 */
const STATS = [
  { label: "개발 기록", value: blogs.length },
  { label: "프로젝트", value: projects.length },
  { label: "AI 쇼케이스", value: showcase.length },
  { label: "엔진 개발", value: 65 },
];
const pad2 = (n: number) => String(n).padStart(2, "0");

test.describe("홈 (데스크톱)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("FIG.01 인물 사진이 실제로 로드되고 4:5 비율·대체 텍스트를 가진다", async ({ page, diag }) => {
    await gotoReady(page, "/");
    const img = page.getByRole("img", { name: /고경석 — 검은 재킷/ });
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("fetchpriority", "high");
    const info = await img.evaluate((el: HTMLImageElement) => ({
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      w: el.getBoundingClientRect().width,
      h: el.getBoundingClientRect().height,
      src: el.currentSrc,
    }));
    expect(info.complete).toBe(true);
    expect(info.naturalWidth).toBeGreaterThan(300);
    expect(info.naturalWidth / info.naturalHeight).toBeCloseTo(0.8, 1);
    expect(info.w / info.h).toBeCloseTo(0.8, 1);
    expect(info.w).toBeGreaterThan(300);
    expect(info.src).toContain("/_next/image");
    await expect(page.locator("figcaption").first()).toContainText("Fig. 01");
    diag.assertClean();
  });

  test("이 페이지 목차(§01~§05)가 각 섹션 제목으로 이동하고 제목이 헤더에 가리지 않는다", async ({ page, diag }) => {
    await gotoReady(page, "/");
    const toc = page.getByRole("navigation", { name: "이 페이지 목차" });
    const links = toc.getByRole("link");
    await expect(links).toHaveCount(5);
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    expect(hrefs).toEqual(["#works-title", "#method-title", "#insights-title", "#showcase-title", "#cardnews-title"]);
    for (const href of hrefs) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await toc.locator(`a[href="${href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      const target = page.locator(href);
      await expect(target).toBeInViewport();
      await expect
        .poll(async () => (await target.boundingBox())!.y, { message: `${href} 제목이 고정 헤더 아래에 보여야 함` })
        .toBeGreaterThanOrEqual(await headerBottom(page));
    }
    diag.assertClean();
  });

  test("숫자 티커는 실제 콘텐츠 수(최종값)에서 멈춘다", async ({ page, diag }) => {
    await gotoReady(page, "/");
    const strip = page.getByRole("region", { name: "주요 수치" });
    await strip.scrollIntoViewIfNeeded();
    for (const s of STATS) {
      const dd = strip.locator("div", { has: page.locator("dt", { hasText: s.label }) }).locator("dd");
      // 스크린리더용 최종값 + 애니메이션 숫자 둘 다 최종값이어야 한다
      await expect(dd.locator(".sr-only")).toHaveText(pad2(s.value));
      await expect(dd.locator('span[aria-hidden="true"]')).toHaveText(pad2(s.value), { timeout: 8000 });
    }
    diag.assertClean();
  });

  test("히어로 CTA·섹션 더보기·마무리 CTA 가 올바른 곳으로 이동한다", async ({ page, diag }) => {
    const cases: { name: RegExp; url: RegExp }[] = [
      { name: /^프로젝트 보기/, url: /\/projects$/ },
      { name: /^기록 읽기$/, url: /\/blog$/ },
      { name: /^카드뉴스 전체 보기/, url: /\/card-news$/ },
      { name: /^소식 받기/, url: /\/subscribe$/ },
      { name: /^프로젝트 상의하기$/, url: /\/about$/ },
      { name: new RegExp(`^전체 ${pad2(projects.length)}`), url: /\/projects$/ },
      { name: new RegExp(`^전체 ${String(blogs.length).padStart(3, "0")}`), url: /\/blog$/ },
      { name: new RegExp(`^전체 ${pad2(showcase.length)}`), url: /\/showcase$/ },
    ];
    for (const c of cases) {
      await gotoReady(page, "/");
      await page.locator("main").getByRole("link", { name: c.name }).first().click();
      await expect(page).toHaveURL(c.url);
    }
    diag.assertClean();
  });

  test("프로젝트·최신 기록·쇼케이스 목록이 실제 데이터 순서로 링크된다", async ({ page, diag }) => {
    await gotoReady(page, "/");
    const works = page.locator("section", { has: page.locator("#works-title") });
    const workHrefs = await works.locator('a[href^="/projects/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(workHrefs).toEqual(projects.slice(0, 4).map((p) => `/projects/${p.slug}`));

    const insights = page.locator("section", { has: page.locator("#insights-title") });
    const postHrefs = await insights.locator('a[href^="/blog/"]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href")))]);
    expect(postHrefs).toEqual(blogs.slice(0, 4).map((b) => `/blog/${b.slug}`));

    const sc = page.locator("section", { has: page.locator("#showcase-title") });
    const scHrefs = await sc.locator('a[href^="/showcase/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(scHrefs).toEqual(showcase.slice(0, 3).map((s) => `/showcase/${s.slug}`));

    await works.locator(`a[href="/projects/${projects[0].slug}"]`).click();
    await expect(page.locator("h1")).toHaveText(projects[0].title);
    diag.assertClean();
  });

  test("최신 카드 미리보기 3장이 최신 카드 상세로 연결된다", async ({ page, diag }) => {
    await gotoReady(page, "/");
    const section = page.locator("section", { has: page.locator("#cardnews-title") });
    const links = section.locator('a[href^="/card-news/"]');
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).toEqual(cards.slice(0, 3).map((c) => `/card-news/${c.id}`));
    await expect(links).toHaveCount(3);
    for (const l of await links.all()) await expect(l).toBeVisible();
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`/card-news/${cards[0].id}$`));
    await expect(page.locator("h1")).toBeVisible();
    diag.assertClean();
  });
});

test.describe("홈 (모바일·태블릿)", () => {
  test("모바일에서는 제목 → 사진 → 리드 순서로 보이고 페이지 목차는 숨는다", async ({ page, diag }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, "/");
    await expect(page.getByRole("navigation", { name: "이 페이지 목차" })).toBeHidden();
    const h1 = await page.locator("#hero-title").boundingBox();
    const fig = await page.getByRole("img", { name: /고경석 — 검은 재킷/ }).boundingBox();
    const cta = await page.getByRole("link", { name: /^프로젝트 보기/ }).boundingBox();
    expect(h1!.y).toBeLessThan(fig!.y);
    expect(fig!.y).toBeLessThan(cta!.y);
    diag.assertClean();
  });

  test("태블릿 폭(sm~md)에서는 카드 미리보기 2장만 보인다", async ({ page, diag }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoReady(page, "/");
    const links = page.locator("section", { has: page.locator("#cardnews-title") }).locator('a[href^="/card-news/"]');
    await expect(links.nth(0)).toBeVisible();
    await expect(links.nth(1)).toBeVisible();
    await expect(links.nth(2)).toBeHidden();
    diag.assertClean();
  });

  test("동작 줄이기(reduced-motion)에서도 숫자 티커가 0이 아닌 최종값을 보여 준다", async ({ page, diag }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, "/");
    const strip = page.getByRole("region", { name: "주요 수치" });
    for (const s of STATS) {
      const dd = strip.locator("div", { has: page.locator("dt", { hasText: s.label }) }).locator("dd");
      await expect(dd.locator('span[aria-hidden="true"]')).toHaveText(pad2(s.value));
    }
    diag.assertClean();
  });
});
