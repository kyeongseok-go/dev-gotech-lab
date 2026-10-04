/**
 * 서비스·AI 뉴스·소개·구독 폼(검증 메시지, 제출은 네트워크 가로채기)·RSS·sitemap·robots·404.
 */
import { ALL_ROUTES, PRODUCTION_ORIGIN, blogs, cards, projects, showcase } from "./support/site";
import { expect, test, gotoReady } from "./support/fixtures";

test.use({ viewport: { width: 1440, height: 900 } });

test("서비스: 등록부가 보이고 AI 뉴스로 이동한다", async ({ page, diag }) => {
  await gotoReady(page, "/services");
  await expect(page.locator("h1")).toContainText("Registry");
  await page.locator('main a[href="/services/news"]').first().click();
  await expect(page).toHaveURL(/\/services\/news$/);
  await expect(page.locator("h1")).toContainText("뉴스");
  await page.locator('main a[href="/services"]').first().click();
  await expect(page).toHaveURL(/\/services$/);
  diag.assertClean();
});

test("소개: 프로필 사진·연락 링크(메일·GitHub 새 탭)", async ({ page, diag }) => {
  await gotoReady(page, "/about");
  const photo = page.getByRole("img", { name: /고경석 — 베이지 재킷/ });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const mails = page.locator('main a[href="mailto:kugll9606@gmail.com"]');
  expect(await mails.count()).toBeGreaterThanOrEqual(1);
  for (const gh of await page.locator('main a[href="https://github.com/kyeongseok-go"]').all()) {
    await expect(gh).toHaveAttribute("target", "_blank");
    await expect(gh).toHaveAttribute("rel", /noopener/);
  }
  diag.assertClean();
});

for (const path of ["/subscribe", "/about"]) {
  test(`구독 폼(${path}): 빈 값·잘못된 형식은 브라우저 검증 메시지, 올바른 값은 저장 안 됨을 정직하게 알린다`, async ({ page, diag }) => {
    // 혹시라도 실제 전송이 일어나면 가로채서 기록 (운영 데이터 쓰기 금지)
    const sent: string[] = [];
    await page.route("**/*", (route) => {
      const req = route.request();
      if (req.method() !== "GET" && req.method() !== "HEAD") {
        sent.push(`${req.method()} ${req.url()}`);
        return route.fulfill({ status: 204, body: "" });
      }
      return route.fallback();
    });
    await gotoReady(page, path);
    const input = page.getByRole("textbox", { name: "이메일 주소" });
    const submit = page.getByRole("button", { name: "구독하기" });
    await input.scrollIntoViewIfNeeded();

    await submit.click();
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    expect(await input.evaluate((el: HTMLInputElement) => el.validationMessage)).not.toBe("");

    await input.fill("not-an-email");
    await submit.click();
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.typeMismatch)).toBe(true);
    expect(await input.evaluate((el: HTMLInputElement) => el.validationMessage)).not.toBe("");
    await expect(page.getByText(/구독 신청이 완료/)).toHaveCount(0);

    await input.fill("e2e-test@example.com");
    await submit.click();
    await expect(page.getByText("아직 이메일 구독 서버가 연결되지 않아 신청이 저장되지 않았습니다.", { exact: false })).toBeVisible();
    await expect(page.getByText(/구독 신청이 완료/)).toHaveCount(0);
    await expect(input).toHaveValue("e2e-test@example.com");
    await expect(page.locator('main a[href="/rss.xml"]').last()).toBeVisible();
    // 다시 입력하면 안내가 사라진다
    await input.fill("e2e-test2@example.com");
    await expect(page.getByText(/구독 서버가 연결되지 않아/)).toHaveCount(0);
    expect(sent, "구독 폼은 아무 데이터도 전송하지 않아야 함").toEqual([]);
    diag.assertClean();
  });
}

test("RSS: 유효한 XML 이고 블로그 전부 + 최근 카드 30건을 운영 주소 링크로 담는다", async ({ page, request }) => {
  const res = await request.get("/rss.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await res.text();
  await gotoReady(page, "/");
  const parsed = await page.evaluate((src) => {
    const doc = new DOMParser().parseFromString(src, "application/xml");
    const err = doc.querySelector("parsererror")?.textContent ?? null;
    const items = Array.from(doc.querySelectorAll("channel > item")).map((it) => ({
      title: it.querySelector("title")?.textContent ?? "",
      link: it.querySelector("link")?.textContent ?? "",
      guid: it.querySelector("guid")?.textContent ?? "",
      pubDate: it.querySelector("pubDate")?.textContent ?? "",
      category: it.querySelector("category")?.textContent ?? "",
    }));
    return { err, items, self: doc.querySelector("channel > link")?.textContent };
  }, xml);
  expect(parsed.err).toBeNull();
  expect(parsed.self).toBe(PRODUCTION_ORIGIN);
  const cardItems = parsed.items.filter((i) => i.category === "카드뉴스");
  expect(cardItems).toHaveLength(Math.min(30, cards.length));
  expect(cardItems.map((i) => i.link)).toEqual(expect.arrayContaining(cards.slice(0, 30).map((c) => `${PRODUCTION_ORIGIN}/card-news/${c.id}`)));
  expect(cardItems.every((i) => i.title.startsWith("[카드뉴스] "))).toBe(true);
  const blogLinks = parsed.items.filter((i) => i.link.includes("/blog/")).map((i) => i.link);
  expect(blogLinks.sort()).toEqual(blogs.map((b) => `${PRODUCTION_ORIGIN}/blog/${b.slug}`).sort());
  for (const it of parsed.items) {
    expect(it.guid).toBe(it.link);
    expect(Number.isNaN(Date.parse(it.pubDate)), `pubDate ${it.pubDate}`).toBe(false);
  }
  // 날짜 내림차순
  const times = parsed.items.map((i) => Date.parse(i.pubDate));
  expect([...times].sort((a, b) => b - a)).toEqual(times);
});

test("sitemap: 모든 공개 페이지를 운영 주소로 담고, 각 URL 이 200 이다", async ({ request, baseURL }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBe(7 + blogs.length + projects.length + showcase.length + cards.length);
  expect(new Set(locs).size).toBe(locs.length);
  for (const loc of locs) expect(loc.startsWith(PRODUCTION_ORIGIN), loc).toBe(true);
  const paths = locs.map((l) => decodeURI(l.slice(PRODUCTION_ORIGIN.length)) || "/");
  // 사이트맵 경로 ⊆ 공개 페이지, 공개 페이지(구독·뉴스 제외) ⊆ 사이트맵
  for (const p of paths) expect(ALL_ROUTES).toContain(p);
  const failures: string[] = [];
  const queue = [...paths];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let p = queue.shift(); p !== undefined; p = queue.shift()) {
        const r = await request.get(`${baseURL}${encodeURI(p)}`, { maxRedirects: 0 });
        if (r.status() !== 200) failures.push(`${p} → ${r.status()}`);
      }
    }),
  );
  expect(failures).toEqual([]);
});

test("robots.txt: 전체 허용·/api 차단·운영 사이트맵 주소", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const txt = await res.text();
  expect(txt).toMatch(/User-Agent: \*/i);
  expect(txt).toContain("Allow: /");
  expect(txt).toContain("Disallow: /api/");
  expect(txt).toContain(`Sitemap: ${PRODUCTION_ORIGIN}/sitemap.xml`);
});

test("404: 없는 주소는 404 상태로, 헤더·푸터가 있는 페이지를 보여 주고 홈으로 돌아갈 수 있다", async ({ page, diag }) => {
  const res = await page.goto("/this-page-does-not-exist-e2e");
  expect(res?.status()).toBe(404);
  diag.allowedStatusUrls.add(res!.url());
  await expect(page.getByText(/404|찾을 수 없/).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "GoTechy 홈" }).click();
  await expect(page).toHaveURL(/\/$/);
  diag.assertClean();
});
