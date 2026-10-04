/**
 * 테스트가 기대값을 계산할 때 쓰는 사이트 데이터.
 * 화면이 쓰는 원본(.velite JSON, 카드뉴스 page.tsx 데이터 마커 구간)을 그대로 읽어
 * "데이터에 있는 만큼 화면에 나와야 한다"를 검증한다. (`pnpm content` 이후 실행)
 */
import fs from "node:fs";
import path from "node:path";
import { toCardView, type CardNewsItem } from "../../src/lib/card-news";

const ROOT = path.resolve(__dirname, "..", "..");

/** 운영 주소 — canonical·사이트맵·공유 링크가 가리켜야 하는 곳 */
export const PRODUCTION_ORIGIN = (process.env.E2E_SITE_URL ?? "https://dev-gotech-lab.kugll9606.workers.dev").replace(/\/$/, "");

export interface BlogDoc {
  title: string;
  slug: string;
  date: string;
  description?: string;
  category?: string;
  tags: string[];
  draft: boolean;
  body: string;
  tldr?: string[];
}

export interface ProjectDoc {
  title: string;
  slug: string;
  summary: string;
  draft: boolean;
  featured: boolean;
  repoUrl?: string;
  demoUrl?: string;
}

export interface ShowcaseDoc {
  title: string;
  slug: string;
  summary: string;
  draft: boolean;
  featured: boolean;
  status: string;
  externalUrl?: string;
  repoUrl?: string;
}

function readJson<T>(rel: string): T {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    throw new Error(`${rel} 이 없습니다. E2E 전에 \`pnpm content\`(또는 \`pnpm build\`)를 실행하세요.`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

const byDateDesc = (a: BlogDoc, b: BlogDoc) => new Date(b.date).getTime() - new Date(a.date).getTime();
const featuredFirst = <T extends { featured: boolean }>(a: T, b: T) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1);

const allBlogs = readJson<BlogDoc[]>(".velite/blogs.json");
/** 공개 글 — 화면과 같은 최신순 */
export const blogs = allBlogs.filter((b) => !b.draft).sort(byDateDesc);
export const draftBlogs = allBlogs.filter((b) => b.draft);
export const projects = readJson<ProjectDoc[]>(".velite/projects.json").filter((p) => !p.draft).sort(featuredFirst);
export const showcase = readJson<ShowcaseDoc[]>(".velite/showcase.json").filter((s) => !s.draft).sort(featuredFirst);

/** 카드뉴스 원본 — publish.py 가 관리하는 마커 구간을 merge_and_publish.py 와 같은 방식으로 파싱 */
function readCards(): CardNewsItem[] {
  const src = fs.readFileSync(path.join(ROOT, "src/app/card-news/page.tsx"), "utf8");
  const m = src.match(/\/\* TECH-NEWS-PIPELINE-DATA:START \*\/([\s\S]*?)\/\* TECH-NEWS-PIPELINE-DATA:END \*\//);
  if (!m) throw new Error("카드뉴스 데이터 마커를 찾지 못했습니다");
  const json = `[${m[1]}]`
    .replace(/^\s*(\w+):/gm, (_, k: string) => `"${k}":`)
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(json) as CardNewsItem[];
}
export const cards = readCards();
export const cardViews = cards.map(toCardView);

export const STATIC_ROUTES = [
  "/",
  "/blog",
  "/card-news",
  "/projects",
  "/showcase",
  "/services",
  "/services/news",
  "/about",
  "/subscribe",
] as const;

export const blogRoutes = blogs.map((b) => `/blog/${b.slug}`);
export const projectRoutes = projects.map((p) => `/projects/${p.slug}`);
export const showcaseRoutes = showcase.map((s) => `/showcase/${s.slug}`);
export const cardRoutes = cards.map((c) => `/card-news/${c.id}`);

/** 공개된 모든 페이지 */
export const ALL_ROUTES: string[] = [...STATIC_ROUTES, ...blogRoutes, ...projectRoutes, ...showcaseRoutes, ...cardRoutes];

/** 컴파일된 MDX 본문에 코드 블록(rehype-pretty-code)이 있는지 */
export function hasCodeBlock(doc: { body: string }): boolean {
  return doc.body.includes("data-rehype-pretty-code-figure");
}
