/**
 * 카드뉴스 목록 — 검색·분류·출처·태그 필터, URL 상태(쓰기·복원), 결과 없음, 필터 해제, 더 보기.
 * 기대값은 화면과 같은 표시 모델(toCardView·getPopularTags)로 원본 데이터에서 계산한다.
 */
import type { Page } from "@playwright/test";
import { CARD_INDEX_URL, getPopularTags, SOURCE_KIND_LABEL, type CardView } from "../src/lib/card-news";
import { cardViews, cards } from "./support/site";
import { expect, test, gotoReady, reloadReady } from "./support/fixtures";

const BENTO = 5;
const PAGE = 24;

interface F {
  q?: string;
  cat?: string;
  tag?: string;
  src?: string;
}
/** card-news-gallery.tsx 의 matches 와 같은 규칙 */
function match(c: CardView, f: F): boolean {
  if (f.cat && f.cat !== "all" && c.category !== f.cat) return false;
  if (f.src && f.src !== "all" && c.source?.kind !== f.src) return false;
  if (f.tag && !c.tags.some((t) => t.toLowerCase() === f.tag!.toLowerCase())) return false;
  if (f.q) {
    const hay = `${c.title} ${c.excerpt} ${c.tags.join(" ")} ${c.source?.name ?? ""}`.toLowerCase();
    if (!hay.includes(f.q.trim().toLowerCase())) return false;
  }
  return true;
}
const ids = (f: F) => cardViews.filter((c) => match(c, f)).map((c) => `/card-news/${c.id}`);

const shownHrefs = (page: Page) =>
  page.locator('main a[href^="/card-news/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
const params = (page: Page) => Object.fromEntries(new URL(page.url()).searchParams);
const search = (page: Page) => page.getByRole("searchbox", { name: "카드뉴스 검색" });

test.use({ viewport: { width: 1440, height: 900 } });

test("기본 화면: 최신 5장(벤토) + 아카이브 24장, 카운터·분류 숫자가 데이터와 같다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  await expect(page.locator("#latest-title")).toBeAttached();
  expect(await shownHrefs(page)).toEqual(ids({}).slice(0, BENTO + PAGE));
  await expect(page.locator('section[aria-labelledby="archive-title"]')).toContainText(`${PAGE} / ${cards.length - BENTO}`);
  for (const [key, label] of [["all", "전체"], ["ai", "AI"], ["dev", "개발"], ["trend", "트렌드"], ["news", "뉴스"]] as const) {
    const n = key === "all" ? cards.length : cards.filter((c) => c.category === key).length;
    await expect(page.getByRole("group", { name: "분류" }).getByRole("button", { name: new RegExp(`^${label}`) })).toContainText(String(n).padStart(2, "0"));
  }
  diag.assertClean();
});

test("더 보기를 누를 때마다 24장씩 늘고, 끝에서 버튼이 사라진다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  const archiveTotal = cards.length - BENTO;
  let shown = PAGE;
  while (shown < archiveTotal) {
    const more = page.getByRole("button", { name: /더 보기/ });
    await expect(more).toContainText(`+${Math.min(PAGE, archiveTotal - shown)}`);
    await more.click();
    shown = Math.min(shown + PAGE, archiveTotal);
    await expect(page.locator('section[aria-labelledby="archive-title"]')).toContainText(`${shown} / ${archiveTotal}`);
  }
  await expect(page.getByRole("button", { name: /더 보기/ })).toHaveCount(0);
  expect(await shownHrefs(page)).toEqual(ids({}));
  diag.assertClean();
});

test("검색: 입력하면 즉시 거르고 ?q= 를 남기며, 새로고침해도 복원된다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  const q = "Anthropic";
  await search(page).fill(q);
  await expect.poll(() => params(page)).toEqual({ q });
  const want = ids({ q });
  expect(want.length).toBeGreaterThan(0);
  await expect(page.getByText(new RegExp(`결과\\s*${want.length}\\s*건`))).toBeVisible();
  await expect.poll(() => shownHrefs(page)).toEqual(want.slice(0, PAGE));
  await expect(page.locator("#latest-title")).toHaveCount(0); // 좁히면 벤토 대신 결과 목록

  await reloadReady(page);
  // 정적 페이지라 URL 필터는 하이드레이션 직후 반영된다 — 부하가 큰 전체 실행에서도 기다릴 수 있게 여유를 둔다
  await expect(search(page)).toHaveValue(q, { timeout: 30_000 });
  await expect.poll(() => shownHrefs(page)).toEqual(want.slice(0, PAGE));
  diag.assertClean();
});

test("검색 결과가 없으면 안내 문구, '필터 해제'로 처음 상태로 돌아간다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  await search(page).fill("zzzz-없는-검색어-e2e");
  await expect(page.getByText("조건에 맞는 카드뉴스가 없습니다.")).toBeVisible();
  await expect(page.getByText(/결과\s*0\s*건/)).toBeVisible();
  await page.getByRole("button", { name: /필터 해제/ }).click();
  await expect(search(page)).toHaveValue("");
  await expect.poll(() => params(page)).toEqual({});
  await expect(page.locator("#latest-title")).toBeAttached();
  diag.assertClean();
});

test("분류 버튼: aria-pressed·?cat= 이 바뀌고 해당 분류 카드만 남는다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  const group = page.getByRole("group", { name: "분류" });
  for (const [key, label] of [["ai", "AI"], ["dev", "개발"], ["trend", "트렌드"], ["news", "뉴스"]] as const) {
    const btn = group.getByRole("button", { name: new RegExp(`^${label}`) });
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await expect(group.getByRole("button", { name: /^전체/ })).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => params(page)).toEqual({ cat: key });
    const want = ids({ cat: key });
    if (want.length === 0) {
      await expect(page.getByText("조건에 맞는 카드뉴스가 없습니다.")).toBeVisible();
    } else {
      await expect.poll(() => shownHrefs(page)).toEqual(want.slice(0, BENTO + PAGE));
    }
  }
  await group.getByRole("button", { name: /^전체/ }).click();
  await expect.poll(() => params(page)).toEqual({});
  diag.assertClean();
});

test("출처 필터: 유형별로 거르고 ?src= 를 남긴다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  const group = page.getByRole("group", { name: "출처 유형" });
  for (const kind of ["official", "community", "korean", "media"] as const) {
    await group.getByRole("button", { name: SOURCE_KIND_LABEL[kind], exact: true }).click();
    await expect(group.getByRole("button", { name: SOURCE_KIND_LABEL[kind], exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => params(page)).toEqual({ src: kind });
    const want = ids({ src: kind });
    await expect(page.getByText(new RegExp(`결과\\s*${want.length}\\s*건`))).toBeVisible();
    await expect.poll(() => shownHrefs(page)).toEqual(want.slice(0, PAGE));
  }
  await group.getByRole("button", { name: "모든 출처" }).click();
  await expect.poll(() => params(page)).toEqual({});
  diag.assertClean();
});

test("태그 칩: 누르면 거르고 다시 누르면 해제된다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  const tags = getPopularTags(cards);
  expect(tags.length).toBeGreaterThan(0);
  const group = page.getByRole("group", { name: "태그" });
  await expect(group.getByRole("button")).toHaveCount(tags.length);
  const tag = tags[0];
  const chip = group.getByRole("button", { name: `#${tag}`, exact: true });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => params(page)).toEqual({ tag });
  await expect.poll(() => shownHrefs(page)).toEqual(ids({ tag }).slice(0, PAGE));
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => params(page)).toEqual({});
  diag.assertClean();
});

test("여러 필터를 조합한 URL 로 바로 들어오면 모든 상태가 복원된다", async ({ page, diag }) => {
  const tag = getPopularTags(cards)[0];
  const combo = cardViews.find((c) => c.tags.includes(tag) && c.source)!;
  const f = { cat: combo.category, tag, src: combo.source!.kind };
  await gotoReady(page, `/card-news?cat=${f.cat}&tag=${encodeURIComponent(f.tag)}&src=${f.src}`);
  const want = ids(f);
  expect(want).toContain(`/card-news/${combo.id}`);
  await expect.poll(() => shownHrefs(page)).toEqual(want.slice(0, PAGE));
  await expect(page.getByRole("group", { name: "태그" }).getByRole("button", { name: `#${tag}`, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: "출처 유형" }).getByRole("button", { name: SOURCE_KIND_LABEL[f.src], exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(params(page)).toEqual(f);
  diag.assertClean();
});

test("카드를 누르면 상세로 이동한다", async ({ page, diag }) => {
  await gotoReady(page, "/card-news");
  await page.locator(`main a[href="/card-news/${cards[0].id}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/card-news/${cards[0].id}$`));
  await expect(page.locator("h1")).toHaveText(cardViews[0].title);
  diag.assertClean();
});

test("첫 화면은 전체 인덱스를 받지 않고, 처음 '더 보기'를 누를 때 한 번만 받는다", async ({ page, diag }) => {
  const indexRequests: string[] = [];
  page.on("request", (req) => {
    if (new URL(req.url()).pathname === CARD_INDEX_URL) indexRequests.push(req.url());
  });
  await gotoReady(page, "/card-news");
  await page.waitForLoadState("networkidle");
  expect(indexRequests, "첫 화면에서 인덱스를 받으면 목록 응답을 고정한 의미가 없다").toEqual([]);

  const more = page.getByRole("button", { name: /더 보기/ });
  await more.click();
  await expect(page.locator('section[aria-labelledby="archive-title"]')).toContainText(`${PAGE * 2} / ${cards.length - BENTO}`);
  await more.click();
  await expect(page.locator('section[aria-labelledby="archive-title"]')).toContainText(`${Math.min(PAGE * 3, cards.length - BENTO)} / ${cards.length - BENTO}`);
  await search(page).fill("Claude");
  await expect.poll(() => params(page)).toEqual({ q: "Claude" });
  expect(indexRequests).toHaveLength(1);
  diag.assertClean();
});

test("전체 인덱스를 받지 못하면 틀린 결과 대신 안내를 보여 준다", async ({ page }) => {
  await page.route(`**${CARD_INDEX_URL}`, (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await gotoReady(page, "/card-news");
  await search(page).fill("Anthropic");
  await expect(page.locator("main").getByRole("alert")).toContainText("카드 목록을 불러오지 못했습니다");
  await expect(page.locator('main a[href^="/card-news/"]')).toHaveCount(0);
});
