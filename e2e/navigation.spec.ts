/**
 * 헤더 내비·현재 위치 표시·모바일 메뉴·건너뛰기 링크·테마 토글(저장·새로고침 유지)·푸터 링크.
 */
import { blogs, cards, projects } from "./support/site";
import { expect, test } from "./support/fixtures";

const NAV = [
  { href: "/", label: "Home", heading: /Go Build the/ },
  { href: "/blog", label: "Blog", heading: /Writing/ },
  { href: "/card-news", label: "카드뉴스", heading: /hot/ },
  { href: "/projects", label: "Projects", heading: /Shipped/ },
  { href: "/showcase", label: "Showcase", heading: /./ },
  { href: "/about", label: "About", heading: /./ },
] as const;

const mainNav = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "주요 메뉴" });

test.describe("데스크톱 헤더 내비", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("모든 메뉴가 해당 페이지로 이동하고 현재 위치(aria-current)를 하나만 표시한다", async ({ page, diag }) => {
    await page.goto("/");
    for (const item of NAV) {
      await mainNav(page).getByRole("link", { name: new RegExp(`${item.label}$`) }).click();
      await expect(page).toHaveURL(item.href === "/" ? /\/$/ : new RegExp(`${item.href}$`));
      await expect(page.locator("h1").first()).toHaveText(item.heading);
      const current = mainNav(page).locator('a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute("href", item.href);
    }
    diag.assertClean();
  });

  test("상세 페이지에서도 상위 메뉴가 현재 위치로 표시된다", async ({ page, diag }) => {
    const cases = [
      { path: `/blog/${blogs[0].slug}`, href: "/blog" },
      { path: `/card-news/${cards[0].id}`, href: "/card-news" },
      { path: `/projects/${projects[0].slug}`, href: "/projects" },
    ];
    for (const c of cases) {
      await page.goto(c.path);
      await expect(mainNav(page).locator('a[aria-current="page"]')).toHaveAttribute("href", c.href);
    }
    diag.assertClean();
  });

  test("로고는 홈으로 이동한다", async ({ page, diag }) => {
    await page.goto("/about");
    await mainNav(page).getByRole("link", { name: "GoTechy 홈" }).click();
    await expect(page).toHaveURL(/\/$/);
    diag.assertClean();
  });

  test("본문으로 건너뛰기 링크가 첫 Tab 에 나타나고 #main 으로 이동한다", async ({ page, diag }) => {
    await page.goto("/blog");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "본문으로 건너뛰기" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    diag.assertClean();
  });
});

test.describe("모바일 메뉴", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("햄버거로 열고 닫으며, 항목을 누르면 이동 후 닫힌다", async ({ page, diag }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "메뉴 열기" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-nav")).toHaveCount(0);

    await toggle.click();
    const close = page.getByRole("button", { name: "메뉴 닫기" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mobile-nav");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(NAV.length);
    await expect(panel.locator('a[aria-current="page"]')).toHaveAttribute("href", "/");

    await close.click();
    await expect(panel).toHaveCount(0);

    for (const item of NAV.slice(1)) {
      await page.getByRole("button", { name: "메뉴 열기" }).click();
      await page.locator("#mobile-nav").getByRole("link", { name: new RegExp(`${item.label}$`) }).click();
      await expect(page).toHaveURL(new RegExp(`${item.href}$`));
      await expect(page.locator("#mobile-nav")).toHaveCount(0);
      await page.getByRole("button", { name: "메뉴 열기" }).click();
      await expect(page.locator('#mobile-nav a[aria-current="page"]')).toHaveAttribute("href", item.href);
      await page.getByRole("button", { name: "메뉴 닫기" }).click();
    }
    diag.assertClean();
  });
});

test.describe("테마 토글", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("기본은 다크, 토글하면 라이트로 바뀌고 새로고침·이동 후에도 유지된다", async ({ page, diag }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/\bdark\b/);

    await page.getByRole("button", { name: "라이트 모드로 전환" }).click();
    await expect(html).toHaveClass(/\blight\b/);
    await expect(html).not.toHaveClass(/\bdark\b/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
    // 배경색이 실제로 바뀌었는지 (토큰 적용)
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.reload();
    await expect(html).toHaveClass(/\blight\b/);
    await expect(page.getByRole("button", { name: "다크 모드로 전환" })).toBeVisible();

    await mainNav(page).getByRole("link", { name: /Blog$/ }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(html).toHaveClass(/\blight\b/);

    await page.getByRole("button", { name: "다크 모드로 전환" }).click();
    await expect(html).toHaveClass(/\bdark\b/);
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(darkBg).not.toBe(lightBg);
    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
    diag.assertClean();
  });

  test("첫 페인트부터 저장된 테마가 적용된다(깜빡임 없음)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    // 하이드레이션 전에 인라인 스크립트가 클래스를 정해야 한다 — JS 번들 실행 전 상태 확인
    await page.route("**/_next/static/chunks/**", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/\blight\b/);
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});

test.describe("푸터", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("사이트 목차 링크가 모두 이동하고, 외부 링크는 새 탭으로 연다", async ({ page, diag }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const index = footer.getByRole("navigation", { name: "사이트 목차" }).getByRole("link");
    const hrefs = await index.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).toEqual(["/blog", "/projects", "/showcase", "/card-news", "/about", "/subscribe"]);
    for (const href of hrefs) {
      await page.goto("/");
      await page.locator("footer").getByRole("link", { name: new RegExp(`^${href === "/card-news" ? "Card News" : href!.slice(1)}`, "i") }).first().click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    }
    await page.goto("/");
    const github = page.locator("footer").getByRole("link", { name: /GitHub/ });
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", /noopener/);
    await expect(page.locator("footer").getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
    await expect(page.locator("footer").getByRole("link", { name: /RSS/ })).toHaveAttribute("href", "/rss.xml");
    diag.assertClean();
  });
});
