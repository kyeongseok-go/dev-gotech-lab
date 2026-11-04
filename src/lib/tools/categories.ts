/**
 * 도구 카테고리 — 허브 그룹의 단일 원천(HANDOFF §6.2). velite.config.ts 스키마와 허브가 함께 읽는다.
 * 카테고리를 늘릴 때는 여기에만 추가한다(라벨은 한국어 UI 문구).
 */
export const TOOL_CATEGORIES = ["writing", "docs", "visual", "content", "devtools"] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  writing: "글쓰기·윤문",
  docs: "설명·문서",
  visual: "다이어그램·시각화",
  content: "콘텐츠 제작",
  devtools: "개발 생산성",
};

/** slug 규칙 — /tools/<slug> 경로와 src/app/tools/<slug>/ 디렉터리 이름이 같아야 한다 */
export const TOOL_PATH_PATTERN = /^\/tools\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
