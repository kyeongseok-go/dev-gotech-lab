import rehypePrettyCode from "rehype-pretty-code";
import { defineCollection, defineConfig, s } from "velite";
import { TOOL_CATEGORIES, TOOL_PATH_PATTERN } from "./src/lib/tools/categories";

// ------------------------------------------------------------------ blog --
const blogs = defineCollection({
  name: "Blog",
  pattern: "blog/**/*.mdx",
  schema: s.object({
    title: s.string().max(99),
    slug: s.slug("blogs"),
    date: s.isodate(),
    description: s.string().max(999).optional(),
    /** 3줄 요약 (선택). 없으면 상세의 요약 박스는 description 을 보여준다 */
    tldr: s.array(s.string().max(200)).max(3).optional(),
    category: s.string().optional(),
    tags: s.array(s.string()).default([]),
    draft: s.boolean().default(false),
    body: s.mdx(),
  }),
});

// --------------------------------------------------------------- projects --
const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: s.object({
    title: s.string().max(99),
    slug: s.slug("projects"),
    summary: s.string().max(999),
    period: s.string().optional(),
    role: s.string().optional(),
    techStack: s.array(s.string()).default([]),
    repoUrl: s.string().url().optional(),
    demoUrl: s.string().url().optional(),
    featured: s.boolean().default(false),
    draft: s.boolean().default(false),
    body: s.mdx(),
  }),
});

// -------------------------------------------------------------- showcase --
const showcase = defineCollection({
  name: "Showcase",
  pattern: "showcase/**/*.mdx",
  schema: s.object({
    title: s.string().max(99),
    slug: s.slug("showcase"),
    summary: s.string().max(999),
    type: s.string().optional(),
    status: s.enum(["live", "wip", "archived"]).default("wip"),
    stack: s.array(s.string()).default([]),
    externalUrl: s.string().url().optional(),
    repoUrl: s.string().url().optional(),
    featured: s.boolean().default(false),
    draft: s.boolean().default(false),
    // ---- 도구 카탈로그 필드 (HANDOFF §6.2, 전부 선택 — 기존 항목 호환) ----
    /** 허브 그룹 */
    category: s.enum(TOOL_CATEGORIES).optional(),
    /** lucide 아이콘 이름 — src/lib/tools/icons.ts 허용 목록, 없으면 기본 아이콘 */
    icon: s.string().optional(),
    /** 실행 도구 경로 /tools/<slug>. 없으면 소개만 있는 항목 */
    toolPath: s.string().regex(TOOL_PATH_PATTERN).optional(),
    /** 카드 한 줄 소개 (summary 는 소개 페이지용) */
    tagline: s.string().max(40).optional(),
    tags: s.array(s.string()).default([]),
    /** 최초 live 날짜 */
    releasedAt: s.isodate().optional(),
    /** 최근 업데이트 정렬 기준 */
    updatedAt: s.isodate().optional(),
    version: s.string().optional(),
    /** 방문자 API 키(BYO-key)가 필요한 도구 */
    requiresKey: s.boolean().default(false),
    body: s.mdx(),
  }),
});

// ----------------------------------------------------------------- config --
export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6][ext]",
    clean: true,
  },
  mdx: {
    rehypePlugins: [
      // 두 테마 색을 --shiki-dark / --shiki-light 변수로 함께 내보내고 globals.css 에서 테마별로 고른다
      [rehypePrettyCode, { theme: { dark: "github-dark-default", light: "github-light-default" }, keepBackground: false, defaultLang: { block: "plaintext" } }],
    ],
  },
  collections: { blogs, projects, showcase },
});
