/**
 * 블로그 상세 (공개 글 전부) — 제목·요약·태그, 목차(클릭 이동·현재 절 강조·모바일 접이식),
 * 읽기 진행 바, 연재 목록·이전/다음, 관련 글·관련 프로젝트, 코드 블록, JSON-LD.
 */
import type { Page } from "@playwright/test";
import { POST_PROJECT_LINKS, SERIES } from "../src/lib/series";
import { PRODUCTION_ORIGIN, blogs, draftBlogs, hasCodeBlock, projects } from "./support/site";
import { expect, headerBottom, test, gotoReady } from "./support/fixtures";

const progressBar = (page: Page) => page.locator("div.fixed[aria-hidden] > div.origin-left");
const scaleX = (page: Page) =>
  progressBar(page).evaluate((el) => {
    const m = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
    return m ? Number(m[1]) : el.style.transform === "scaleX(0)" ? 0 : 1;
  });

/** JSON-LD 블록을 모두 파싱 (파싱 실패 = 테스트 실패) */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.flatMap((t) => {
    const v = JSON.parse(t) as Record<string, unknown> | Record<string, unknown>[];
    return Array.isArray(v) ? v : [v];
  });
}

for (const [index, post] of blogs.entries()) {
  const path = `/blog/${post.slug}`;
  const series = SERIES.find((s) => s.pattern.test(post.slug));
  const seriesPosts = series
    ? blogs
        .filter((b) => series.pattern.test(b.slug))
        .sort((a, b) => Number(series.pattern.exec(a.slug)![1]) - Number(series.pattern.exec(b.slug)![1]))
    : [];
  const prev = blogs[index + 1] ?? null; // 더 오래된 글
  const next = blogs[index - 1] ?? null; // 더 최신 글
  const linkedProjects = (POST_PROJECT_LINKS[post.slug] ?? []).filter((s) => projects.some((p) => p.slug === s));

  test.describe(`블로그 상세 ${post.slug}`, () => {
    test("데스크톱: 머리·요약·목차 이동·현재 절 강조·진행 바·연재·이전/다음·관련·JSON-LD", async ({ page, diag }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoReady(page, path);

      // 머리
      await expect(page.locator("h1")).toHaveText(post.title);
      await expect(page.locator("main header").first().locator(`time[datetime="${post.date}"]`)).toBeVisible();
      await expect(page.getByRole("navigation", { name: "위치" }).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
      for (const tag of post.tags) {
        await expect(page.getByRole("list", { name: "태그" }).getByRole("link", { name: `#${tag}`, exact: true })).toHaveAttribute(
          "href",
          `/blog?tag=${encodeURIComponent(tag)}`,
        );
      }

      // 요약 상자 — tldr 우선, 없으면 description 원문 그대로
      if (post.tldr?.length || post.description) {
        const abstract = page.locator("section", { has: page.locator("#summary-title") });
        await expect(abstract).toBeVisible();
        if (post.tldr?.length) for (const line of post.tldr) await expect(abstract).toContainText(line);
        else await expect(abstract).toContainText(post.description!.trim().slice(0, 40));
      }

      // 목차 — 모든 항목의 대상이 본문에 정확히 하나 존재
      const toc = page.getByRole("navigation", { name: "글 목차" });
      const tocCount = await toc.count();
      if (tocCount > 0) {
        await expect(toc).toBeVisible();
        const hrefs = await toc.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
        expect(hrefs.length).toBeGreaterThan(0);
        for (const href of hrefs) {
          const id = decodeURIComponent(href.slice(1));
          expect(await page.evaluate((i) => document.querySelectorAll(`[id="${CSS.escape(i)}"]`).length, id), `목차 대상 ${href}`).toBe(1);
        }
        // 가운데쯤 항목을 눌러 이동 → 제목이 헤더 아래에 보이고, 그 항목이 현재 절로 강조된다
        const pick = hrefs[Math.floor(hrefs.length / 2)];
        await toc.locator(`a[href="${pick}"]`).click();
        await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(decodeURIComponent(pick));
        const heading = page.locator(`[id="${decodeURIComponent(pick.slice(1))}"]`);
        await expect(heading).toBeInViewport();
        expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(await headerBottom(page));
        await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", pick);
        // 목차는 따라오는 사이드바
        await expect(toc).toBeInViewport();
      }

      // 진행 바 — 맨 위에서는 본문 끝이 안 보이면 100% 미만(긴 글은 0 근처), 본문 끝까지 내리면 100%
      await page.evaluate(() => window.scrollTo(0, 0));
      const body = await page.locator("#article-body").boundingBox();
      if (body!.y + body!.height > 900) await expect.poll(() => scaleX(page)).toBeLessThan(0.99);
      if (body!.height > 900 * 2) await expect.poll(() => scaleX(page)).toBeLessThan(0.05);
      await page.evaluate(() => {
        const body = document.getElementById("article-body")!;
        window.scrollTo(0, body.getBoundingClientRect().bottom + window.scrollY);
      });
      await expect.poll(() => scaleX(page)).toBeGreaterThan(0.99);

      // 코드 블록 — 모든 pre 가 본문 폭 안에 있고(넘치면 블록 안 가로 스크롤), 언어가 있는 블록은 Shiki 토큰 색이 입혀진다
      if (hasCodeBlock(post)) {
        const pres = page.locator("#article-body figure[data-rehype-pretty-code-figure] pre");
        expect(await pres.count()).toBeGreaterThan(0);
        await expect(pres.first()).toBeVisible();
        await expect(pres.first().locator("code")).toHaveAttribute("data-language", /.+/);
        const layout = await pres.evaluateAll((els) => {
          const bodyRight = document.getElementById("article-body")!.getBoundingClientRect().right;
          return els.map((el) => ({
            fits: el.getBoundingClientRect().right <= bodyRight + 1,
            scrollable: el.scrollWidth <= el.clientWidth || ["auto", "scroll"].includes(getComputedStyle(el).overflowX),
          }));
        });
        expect(layout.every((l) => l.fits), "코드 블록이 본문 폭을 넘지 않음").toBe(true);
        expect(layout.every((l) => l.scrollable), "긴 코드는 블록 안에서 가로 스크롤").toBe(true);
        const highlighted = page.locator('#article-body pre:not([data-language="plaintext"]):not([data-language="text"]):not([data-language="txt"])');
        if ((await highlighted.count()) > 0) {
          const token = highlighted.first().locator('span[style*="--shiki-dark"]').first();
          await expect(token).toBeAttached();
          const color = await token.evaluate((el) => ({
            css: getComputedStyle(el).color,
            want: el.style.getPropertyValue("--shiki-dark").trim(),
          }));
          // 다크 테마에서는 --shiki-dark 색이 실제로 적용된다
          const hex = color.want.replace("#", "");
          const rgb = `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`;
          expect(color.css).toBe(rgb);
        }
      }

      // 연재 목록
      const seriesNav = page.locator('nav[aria-labelledby="series-title"]');
      if (series && seriesPosts.length >= 2) {
        await expect(seriesNav).toBeVisible();
        await expect(seriesNav.locator("li")).toHaveCount(seriesPosts.length);
        await expect(seriesNav.locator('[aria-current="page"]')).toContainText(post.title);
        const others = await seriesNav.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
        expect(others).toEqual(seriesPosts.filter((p) => p.slug !== post.slug).map((p) => `/blog/${p.slug}`));
        const pos = seriesPosts.findIndex((p) => p.slug === post.slug) + 1;
        await expect(page.locator("main header").first()).toContainText(
          `${String(pos).padStart(2, "0")}/${String(seriesPosts.length).padStart(2, "0")}`,
        );
      } else {
        await expect(seriesNav).toHaveCount(0);
      }

      // 이전·다음 글
      const adj = page.getByRole("navigation", { name: "이전·다음 글" });
      if (prev) await expect(adj.getByRole("link", { name: /이전 글/ })).toHaveAttribute("href", `/blog/${prev.slug}`);
      else await expect(adj.getByRole("link", { name: /이전 글/ })).toHaveCount(0);
      if (next) await expect(adj.getByRole("link", { name: /다음 글/ })).toHaveAttribute("href", `/blog/${next.slug}`);
      else await expect(adj.getByRole("link", { name: /다음 글/ })).toHaveCount(0);

      // 관련 프로젝트 — series.ts 에 연결된 공개 프로젝트만
      const relProj = page.locator("section", { has: page.locator("#related-projects-title") });
      if (linkedProjects.length > 0) {
        const hrefs = await relProj.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
        expect(hrefs).toEqual(linkedProjects.map((s) => `/projects/${s}`));
      } else {
        await expect(relProj).toHaveCount(0);
      }

      // 관련 글 — 태그 1개 이상 겹치고, 자기 자신·같은 연재는 제외
      const related = page.locator("section", { has: page.locator("#related-title") });
      if ((await related.count()) > 0) {
        const hrefs = await related.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
        expect(hrefs.length).toBeGreaterThan(0);
        expect(hrefs.length).toBeLessThanOrEqual(3);
        const tagSet = new Set(post.tags.map((t) => t.toLowerCase()));
        for (const h of hrefs) {
          const other = blogs.find((b) => `/blog/${b.slug}` === h)!;
          expect(other, `관련 글 ${h} 는 공개 글`).toBeTruthy();
          expect(other.slug).not.toBe(post.slug);
          expect(seriesPosts.some((s) => s.slug === other.slug)).toBe(false);
          expect(other.tags.some((t) => tagSet.has(t.toLowerCase())), `${h} 와 태그가 겹쳐야 함`).toBe(true);
        }
      }

      // JSON-LD
      const ld = await jsonLd(page);
      const posting = ld.find((d) => d["@type"] === "BlogPosting")!;
      expect(posting).toBeTruthy();
      expect(posting.headline).toBe(post.title);
      expect(posting.datePublished).toBe(post.date);
      expect(posting.url).toBe(`${PRODUCTION_ORIGIN}${path}`);
      expect(posting.inLanguage).toBe("ko-KR");
      const crumbs = ld.find((d) => d["@type"] === "BreadcrumbList") as { itemListElement: { position: number; item: string }[] };
      expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
      expect(crumbs.itemListElement[2].item).toBe(`${PRODUCTION_ORIGIN}${path}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${PRODUCTION_ORIGIN}${path}`);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");

      diag.assertClean();
    });

    test("모바일: 목차는 접혀 있다가 펼쳐지고, 항목을 누르면 해당 절로 이동한다", async ({ page, diag }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoReady(page, path);
      await expect(page.getByRole("navigation", { name: "글 목차" })).toBeHidden();
      const details = page.locator("article details", { has: page.locator("summary", { hasText: "목차" }) });
      if ((await details.count()) === 0) {
        // 목차 대상(h2/h3 텍스트 제목)이 없는 글
        return diag.assertClean();
      }
      await expect(details).not.toHaveAttribute("open", "");
      const firstLink = details.locator("a").first();
      await expect(firstLink).toBeHidden();
      await details.locator("summary").click();
      await expect(details).toHaveAttribute("open", "");
      await expect(firstLink).toBeVisible();
      const href = (await firstLink.getAttribute("href"))!;
      await firstLink.click();
      const heading = page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`);
      await expect(heading).toBeInViewport();
      expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(await headerBottom(page));
      // 다시 접기
      await details.locator("summary").click();
      await expect(details).not.toHaveAttribute("open", "");
      diag.assertClean();
    });
  });
}

test("이전/다음 글 링크를 따라가면 실제로 그 글이 열린다", async ({ page, diag }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoReady(page, `/blog/${blogs[1].slug}`);
  await page.getByRole("navigation", { name: "이전·다음 글" }).getByRole("link", { name: /다음 글/ }).click();
  await expect(page.locator("h1")).toHaveText(blogs[0].title);
  await page.getByRole("navigation", { name: "이전·다음 글" }).getByRole("link", { name: /이전 글/ }).click();
  await expect(page.locator("h1")).toHaveText(blogs[1].title);
  diag.assertClean();
});

test("초안·없는 글은 404 다", async ({ page, diag }) => {
  for (const slug of [...draftBlogs.map((d) => d.slug), "no-such-post-e2e"]) {
    const res = await page.goto(`/blog/${slug}`);
    expect(res?.status(), slug).toBe(404);
    diag.allowedStatusUrls.add(res!.url());
  }
  diag.assertClean();
});
