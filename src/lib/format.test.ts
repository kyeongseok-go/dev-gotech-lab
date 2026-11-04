import { describe, expect, it } from "vitest";
import { formatDateDot, padNumber } from "./format";

describe("formatDateDot", () => {
  it("ISO 날짜의 앞 10자리를 점 표기로 바꾼다", () => {
    expect(formatDateDot("2026-09-30T12:00:00+09:00")).toBe("2026.09.30");
  });
});

describe("padNumber", () => {
  it("기본 3자리로 앞을 0으로 채운다", () => {
    expect(padNumber(7)).toBe("007");
  });

  it("자릿수보다 긴 숫자는 그대로 둔다", () => {
    expect(padNumber(1234, 2)).toBe("1234");
  });
});
