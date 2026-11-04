import type { Metadata } from "next";
import { BlogMetaLinter } from "@/features/tools/blog-meta-linter/blog-meta-linter";
import { getToolEntry } from "@/features/tools/_shared/tool-entry";
import { ToolShell } from "@/features/tools/_shared/tool-shell";

const SLUG = "blog-meta-linter";

export function generateMetadata(): Metadata {
  const tool = getToolEntry(SLUG);
  return {
    title: tool.title,
    description: tool.tagline ?? tool.summary,
    alternates: { canonical: `/tools/${SLUG}` },
  };
}

export default function BlogMetaLinterPage() {
  return (
    <ToolShell tool={getToolEntry(SLUG)}>
      <BlogMetaLinter />
    </ToolShell>
  );
}
