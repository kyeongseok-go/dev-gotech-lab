import { describe, expect, it } from "vitest";
import { findCatalogProblems, getHubStage, toolSlugFromPath, type CatalogEntry } from "./catalog";

const entry = (over: Partial<CatalogEntry>): CatalogEntry => ({
  slug: "sample",
  status: "live",
  draft: false,
  requiresKey: false,
  ...over,
});

describe("toolSlugFromPath", () => {
  it("/tools/<slug> 에서 slug 를 꺼낸다", () => {
    expect(toolSlugFromPath("/tools/korean-lint")).toBe("korean-lint");
  });

  it("규칙에 맞지 않는 경로는 null", () => {
    expect(toolSlugFromPath("/showcase/x")).toBeNull();
    expect(toolSlugFromPath("/tools/Bad_Slug")).toBeNull();
  });
});

describe("findCatalogProblems", () => {
  it("toolPath 와 라우트가 1:1 이면 문제 0건", () => {
    const entries = [entry({ toolPath: "/tools/a", icon: "wrench", releasedAt: "2026-11-04" }), entry({ slug: "intro-only" })];
    expect(findCatalogProblems(entries, ["a"], (n) => n === "wrench")).toEqual([]);
  });

  it("라우트가 없는 toolPath 를 잡는다", () => {
    const problems = findCatalogProblems([entry({ toolPath: "/tools/a", releasedAt: "2026-11-04" })], [], () => true);
    expect(problems).toEqual(["sample: toolPath /tools/a 에 해당하는 src/app/tools/a/page.tsx 가 없다"]);
  });

  it("카탈로그에 없는 라우트(고아 도구)를 잡는다", () => {
    expect(findCatalogProblems([], ["orphan"], () => true)).toEqual([
      "src/app/tools/orphan/ 에 해당하는 showcase 항목(toolPath /tools/orphan)이 없다",
    ]);
  });

  it("초안 항목의 toolPath 는 공개 라우트로 세지 않는다", () => {
    const problems = findCatalogProblems([entry({ toolPath: "/tools/a", draft: true })], ["a"], () => true);
    expect(problems).toEqual(["src/app/tools/a/ 에 해당하는 showcase 항목(toolPath /tools/a)이 없다"]);
  });

  it("같은 toolPath 중복·허용 목록 밖 아이콘·live 인데 releasedAt 없음을 잡는다", () => {
    const entries = [
      entry({ slug: "x", toolPath: "/tools/a", icon: "nope", releasedAt: "2026-11-04" }),
      entry({ slug: "y", toolPath: "/tools/a" }),
    ];
    expect(findCatalogProblems(entries, ["a"], (n) => n === "wrench")).toEqual([
      "x: icon nope 이 src/lib/tools/icons.ts 허용 목록에 없다",
      "y: toolPath /tools/a 가 x 와 겹친다",
      "y: live 도구인데 releasedAt 이 없다",
    ]);
  });

  it("규칙에 맞지 않는 toolPath 를 잡는다", () => {
    expect(findCatalogProblems([entry({ toolPath: "/tools/A" })], [], () => true)).toEqual([
      "sample: toolPath /tools/A 가 /tools/<kebab-slug> 형식이 아니다",
    ]);
  });
});

describe("getHubStage", () => {
  it.each([
    [0, "T0"],
    [6, "T0"],
    [7, "T1"],
    [15, "T1"],
    [16, "T2"],
    [30, "T2"],
    [31, "T3"],
  ])("도구 %i 개 → %s", (count, stage) => {
    expect(getHubStage(count)).toBe(stage);
  });
});
