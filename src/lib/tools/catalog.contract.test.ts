/**
 * 실제 카탈로그 계약 — `pnpm content` 산출물(.velite)과 src/app/tools/ 디렉터리를 대조한다.
 * CI 에서는 콘텐츠 빌드 뒤에 돈다.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findCatalogProblems, type CatalogEntry } from "./catalog";
import { isKnownToolIcon } from "./icons";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const TOOLS_DIR = path.join(ROOT, "src/app/tools");
const VELITE_SHOWCASE = path.join(ROOT, ".velite/showcase.json");

function routeSlugs(): string[] {
  if (!existsSync(TOOLS_DIR)) return [];
  return readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("_"))
    .map((d) => d.name);
}

describe("도구 카탈로그 계약", () => {
  it("showcase toolPath 와 src/app/tools/<slug>/ 가 1:1 이고 아이콘·날짜 규칙을 지킨다", () => {
    expect(existsSync(VELITE_SHOWCASE), "먼저 pnpm content 를 실행한다").toBe(true);
    const entries: CatalogEntry[] = JSON.parse(readFileSync(VELITE_SHOWCASE, "utf8"));
    expect(findCatalogProblems(entries, routeSlugs(), isKnownToolIcon)).toEqual([]);
  });
});
