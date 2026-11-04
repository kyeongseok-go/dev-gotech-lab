import { describe, expect, it } from "vitest";
import { DEFAULT_LIMITS, lintPost, summarize } from "./rules";
import { SAMPLE_POST } from "./sample";

const GOOD = `---
title: "블로그 메타 검사기를 만들며"
description: "frontmatter 와 제목 길이, 이미지 대체 텍스트를 브라우저에서 바로 검사합니다."
date: 2026-11-04
category: devtools
tags: ["도구"]
---

## 왜 만들었나

![검사 화면](/a.png)
`;

const statusOf = (text: string, id: string, limits = DEFAULT_LIMITS) =>
  lintPost(text, limits).results.find((r) => r.id === id)?.status;

describe("lintPost", () => {
  it("모든 규칙을 지킨 글은 실패 0건", () => {
    const report = lintPost(GOOD, DEFAULT_LIMITS);
    expect(report.parseError).toBeNull();
    expect(summarize(report.results)).toEqual({ pass: 8, warn: 0, fail: 0 });
  });

  it("필수 필드가 빠지면 어떤 필드인지 알려 준다", () => {
    const report = lintPost("---\ntitle: a\n---\n", DEFAULT_LIMITS);
    expect(report.results.find((r) => r.id === "required")).toMatchObject({
      status: "fail",
      detail: "빠진 필드: description, date, tags",
    });
  });

  it("제목·설명 길이 기준을 넘으면 실패, 기준은 바꿀 수 있다", () => {
    const long = GOOD.replace("블로그 메타 검사기를 만들며", "가".repeat(41));
    expect(statusOf(long, "title-length")).toBe("fail");
    expect(statusOf(long, "title-length", { ...DEFAULT_LIMITS, titleMax: 60 })).toBe("pass");
    expect(statusOf(GOOD, "description-length", { ...DEFAULT_LIMITS, descriptionMax: 10 })).toBe("fail");
  });

  it("날짜는 실제로 있는 YYYY-MM-DD 여야 한다", () => {
    expect(statusOf(GOOD.replace("2026-11-04", "2026-02-30"), "date-format")).toBe("fail");
    expect(statusOf(GOOD.replace("2026-11-04", "11/04/2026"), "date-format")).toBe("fail");
  });

  it("tags 는 1개 이상의 배열이어야 한다", () => {
    expect(statusOf(GOOD.replace('tags: ["도구"]', "tags: []"), "tags")).toBe("fail");
    expect(statusOf(GOOD.replace('tags: ["도구"]', "tags: 도구"), "tags")).toBe("fail");
  });

  it("category 가 없으면 경고(필수는 아님)", () => {
    expect(statusOf(GOOD.replace("category: devtools\n", ""), "category")).toBe("warn");
  });

  it("본문 H1 이 2개 이상이면 실패, 코드 블록 안의 # 는 세지 않는다", () => {
    expect(statusOf(`${GOOD}\n# 하나\n# 둘\n`, "h1-count")).toBe("fail");
    expect(statusOf(`${GOOD}\n# 하나\n\`\`\`sh\n# 주석\n\`\`\`\n`, "h1-count")).toBe("pass");
  });

  it("대체 텍스트 없는 이미지(마크다운·img 태그)를 줄 번호와 함께 잡는다", () => {
    const report = lintPost(`${GOOD}![](/b.png)\n<img src="/c.png">\n<img src="/d.png" alt="설명">\n`, DEFAULT_LIMITS);
    expect(report.results.find((r) => r.id === "image-alt")).toMatchObject({
      status: "fail",
      detail: "대체 텍스트 없는 이미지 2개 (12, 13번째 줄)",
    });
  });

  it("frontmatter 를 읽지 못하면 parseError 만 돌려준다", () => {
    expect(lintPost("본문만", DEFAULT_LIMITS)).toEqual({ parseError: { kind: "missing" }, results: [], data: null });
  });
});

describe("SAMPLE_POST (예시 넣기)", () => {
  it("일부러 제목 길이·이미지 대체 텍스트 실패와 카테고리 경고를 보여 준다", () => {
    const report = lintPost(SAMPLE_POST, DEFAULT_LIMITS);
    expect(summarize(report.results)).toEqual({ pass: 5, warn: 1, fail: 2 });
    const failed = report.results.filter((r) => r.status === "fail").map((r) => [r.id, r.detail]);
    expect(failed).toEqual([
      ["title-length", "49자 / 기준 40자 이내"],
      ["image-alt", "대체 텍스트 없는 이미지 1개 (12번째 줄)"],
    ]);
  });
});
