import { describe, expect, it } from "vitest";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter";

const doc = (fm: string, body = "본문") => `---\n${fm}\n---\n${body}`;

describe("parseFrontmatter", () => {
  it("문자열·따옴표·불리언·숫자·인라인 배열·블록 배열을 읽는다", () => {
    const result = parseFrontmatter(
      doc(`title: "Hello — 시작"\nslug: hello\ndraft: false\norder: 3\ntags: ["소개", 블로그]\nseries:\n  - 하나\n  - '둘'`),
    );
    expect(result).toEqual({
      ok: true,
      data: { title: "Hello — 시작", slug: "hello", draft: false, order: 3, tags: ["소개", "블로그"], series: ["하나", "둘"] },
      body: "본문",
      bodyStartLine: 11,
    });
  });

  it("빈 줄·주석 줄은 건너뛰고 CRLF 도 읽는다", () => {
    const result = parseFrontmatter("---\r\n# 메모\r\n\r\ntitle: 제목\r\n---\r\n본문");
    expect(result.ok && result.data).toEqual({ title: "제목" });
  });

  it("값 안의 콜론은 값의 일부로 둔다", () => {
    const result = parseFrontmatter(doc("title: 정리: 1편"));
    expect(result.ok && result.data.title).toBe("정리: 1편");
  });

  it("frontmatter 가 없으면 missing 오류", () => {
    expect(parseFrontmatter("# 제목\n본문")).toEqual({ ok: false, error: { kind: "missing" } });
  });

  it("닫는 --- 가 없으면 unclosed 오류", () => {
    expect(parseFrontmatter("---\ntitle: a\n본문")).toEqual({ ok: false, error: { kind: "unclosed" } });
  });

  it("지원하지 않는 구문은 줄 번호와 함께 unsupported 오류", () => {
    expect(parseFrontmatter(doc("title: a\nseo:\n  title: b"))).toEqual({
      ok: false,
      error: { kind: "unsupported", line: 4, text: "title: b" },
    });
    expect(parseFrontmatter(doc("description: |"))).toEqual({
      ok: false,
      error: { kind: "unsupported", line: 2, text: "description: |" },
    });
  });

  it("키 없는 목록 항목은 unsupported", () => {
    expect(parseFrontmatter(doc("- 고아"))).toEqual({ ok: false, error: { kind: "unsupported", line: 2, text: "- 고아" } });
  });
});

describe("serializeFrontmatter", () => {
  it("문자열은 큰따옴표로, 배열은 인라인으로, 나머지는 그대로 쓴다", () => {
    expect(serializeFrontmatter({ title: '따옴표 "x"', tags: ["a", "b"], draft: false, order: 2 })).toBe(
      '---\ntitle: "따옴표 \\"x\\""\ntags: ["a", "b"]\ndraft: false\norder: 2\n---',
    );
  });

  it("빈 키 없이 다시 읽으면 같은 값이 나온다(왕복)", () => {
    const data = { title: "제목: 부제", tags: ["하나"], draft: true };
    const back = parseFrontmatter(`${serializeFrontmatter(data)}\n본문`);
    expect(back.ok && back.data).toEqual(data);
  });
});
