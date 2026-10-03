import rehypePrettyCode from "rehype-pretty-code";
import { defineCollection, defineConfig, s } from "velite";

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
