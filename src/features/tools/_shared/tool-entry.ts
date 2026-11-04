import { notFound } from "next/navigation";
import type { Showcase } from "@/.velite";
import { getPublishedShowcase } from "@/lib/content";

/** /tools/<slug> 라우트가 자기 카탈로그 항목을 찾는다. 없으면(초안·오타) 404 — 계약 테스트가 CI 에서 먼저 잡는다 */
export function getToolEntry(slug: string): Showcase {
  const entry = getPublishedShowcase().find((item) => item.toolPath === `/tools/${slug}`);
  if (!entry) notFound();
  return entry;
}
