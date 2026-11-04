import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { getToolIcon } from "./icons";

/** frontmatter 아이콘 이름으로 그린다 — 허용 목록 밖이면 기본 아이콘(icons.ts) */
export function ToolIcon({ name, ...props }: LucideProps & { name: string | undefined }) {
  return createElement(getToolIcon(name), { "aria-hidden": true, ...props });
}
