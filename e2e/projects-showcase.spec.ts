/**
 * 프로젝트 목록·상세(케이스 스터디 각주, 개발 기록, 외부 링크) + 쇼케이스 목록·상세.
 */
import { getCaseStudy } from "../src/lib/case-studies";
import { POST_PROJECT_LINKS } from "../src/lib/series";
import { PRODUCTION_ORIGIN, blogs, projects, showcase } from "./support/site";
import { expect, headerBottom, test } from "./support/fixtures";

test.use({ viewport: { width: 1440, height: 900 } });

test("프로젝트 목록: 모든 공개 프로젝트가 featured 우선 순서로 나오고 상세로 이동한다", async ({ page, diag }) => {
  await page.goto("/projects");
  const hrefs = await page.locator('main a[href^="/projects/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(projects.map((p) => `/projects/${p.slug}`));
  for (const p of projects) {
    const study = getCaseStudy(p.slug);
    if (study?.outcomes[0]) await expect(page.locator(`a[href="/projects/${p.slug}"]`)).toContainText(study.outcomes[0].value);
  }
  await page.locator(`a[href="/projects/${projects[1].slug}"]`).click();
  await expect(page.locator("h1")).toHaveText(projects[1].title);
  diag.assertClean();
});

for (const [i, project] of projects.entries()) {
  test(`프로젝트 상세 ${project.slug}: 케이스 시트·각주·링크·개발 기록·JSON-LD`, async ({ page, diag }) => {
    const path = `/projects/${project.slug}`;
    await page.goto(path);
    await expect(page.locator("h1")).toHaveText(project.title);
    await expect(page.locator(".entry-stamp")).toContainText(`P-${String(i + 1).padStart(2, "0")}`);
    await expect(page.locator("#case-title")).toBeVisible();

    // 측정값 각주: 위첨자 → 근거 항목으로 이동, 헤더에 가리지 않음
    const study = getCaseStudy(project.slug);
    const refs = page.locator('a.fn-ref[href^="#case-fn-"]');
    const noted = study?.outcomes.filter((o) => o.note).length ?? 0;
    await expect(refs).toHaveCount(noted);
    for (let n = 0; n < noted; n++) {
      const ref = refs.nth(n);
      const href = (await ref.getAttribute("href"))!;
      await ref.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      const target = page.locator(href);
      await expect(target).toBeInViewport();
      expect((await target.boundingBox())!.y).toBeGreaterThanOrEqual(await headerBottom(page));
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 외부 링크는 새 탭
    if (project.demoUrl) {
      const demo = page.getByRole("link", { name: /라이브 데모/ });
      await expect(demo).toHaveAttribute("href", project.demoUrl);
      await expect(demo).toHaveAttribute("target", "_blank");
    }
    if (project.repoUrl) {
      const repo = page.getByRole("link", { name: /소스 코드/ });
      await expect(repo).toHaveAttribute("href", project.repoUrl);
      await expect(repo).toHaveAttribute("rel", /noopener/);
    }

    // 개발 기록 — POST_PROJECT_LINKS 로 연결된 공개 글 (최신순)
    const posts = blogs.filter((b) => (POST_PROJECT_LINKS[b.slug] ?? []).includes(project.slug)).map((b) => `/blog/${b.slug}`);
    const devLog = page.locator("section", { has: page.locator("#dev-log-title") });
    if (posts.length) expect(await devLog.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(posts);
    else await expect(devLog).toHaveCount(0);

    // 쇼케이스 연결이 있으면 실제 쇼케이스로
    const toShowcase = page.getByRole("link", { name: /쇼케이스에서 보기/ });
    if ((await toShowcase.count()) > 0) {
      const href = (await toShowcase.getAttribute("href"))!;
      expect(showcase.map((s) => `/showcase/${s.slug}`)).toContain(href);
    }

    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!) as Record<string, unknown>[];
    expect(ld[0].name).toBe(project.title);
    expect(ld[0].url).toBe(`${PRODUCTION_ORIGIN}${path}`);
    expect(ld[1]["@type"]).toBe("BreadcrumbList");

    await page.getByRole("link", { name: /프로젝트 전체 보기/ }).click();
    await expect(page).toHaveURL(/\/projects$/);
    diag.assertClean();
  });
}

test("쇼케이스 목록: 모든 공개 항목이 나오고 상세·프로젝트·외부 링크가 올바르다", async ({ page, diag }) => {
  await page.goto("/showcase");
  const hrefs = await page.locator('main a[href^="/showcase/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  // showcase/page.tsx 규칙: 데모 링크 있는 운영 중(live) 항목 먼저, 그다음 상태 순(live→wip→archived)
  const order: Record<string, number> = { live: 0, wip: 1, archived: 2 };
  const want = [...showcase].sort((a, b) => {
    const live = Number(!!b.externalUrl && b.status === "live") - Number(!!a.externalUrl && a.status === "live");
    return live || (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
  expect(hrefs).toEqual(want.map((s) => `/showcase/${s.slug}`));
  const external = page.locator('main a[target="_blank"]');
  for (const a of await external.all()) await expect(a).toHaveAttribute("rel", /noopener/);
  const projectLinks = await page.locator('main a[href^="/projects/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
  for (const h of projectLinks) expect(projects.map((p) => `/projects/${p.slug}`)).toContain(h);
  await page.locator(`a[href="/showcase/${showcase[0].slug}"]`).click();
  await expect(page.locator("h1")).toHaveText(showcase[0].title);
  diag.assertClean();
});

for (const item of showcase) {
  test(`쇼케이스 상세 ${item.slug}`, async ({ page, diag }) => {
    await page.goto(`/showcase/${item.slug}`);
    await expect(page.locator("h1")).toHaveText(item.title);
    if (item.externalUrl) {
      const a = page.locator(`main a[href="${item.externalUrl}"]`).first();
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
    }
    if (item.repoUrl) await expect(page.locator(`main a[href="${item.repoUrl}"]`).first()).toHaveAttribute("target", "_blank");
    const projectLink = page.locator('main a[href^="/projects/"]').first();
    if ((await projectLink.count()) > 0) {
      const href = (await projectLink.getAttribute("href"))!;
      await projectLink.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await page.goBack();
    }
    await page.locator('main a[href="/showcase"]').last().click();
    await expect(page).toHaveURL(/\/showcase$/);
    diag.assertClean();
  });
}
