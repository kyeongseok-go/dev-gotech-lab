import { PenLine } from "lucide-react";
import { describe, expect, it } from "vitest";
import { DEFAULT_TOOL_ICON, getToolIcon, isKnownToolIcon } from "./icons";

describe("getToolIcon", () => {
  it("허용 목록의 이름은 해당 아이콘", () => {
    expect(getToolIcon("pen-line")).toBe(PenLine);
  });

  it("이름이 없거나 허용 목록 밖이면 기본 아이콘", () => {
    expect(getToolIcon(undefined)).toBe(DEFAULT_TOOL_ICON);
    expect(getToolIcon("not-an-icon")).toBe(DEFAULT_TOOL_ICON);
  });
});

describe("isKnownToolIcon", () => {
  it("허용 목록 포함 여부", () => {
    expect(isKnownToolIcon("workflow")).toBe(true);
    expect(isKnownToolIcon("toString")).toBe(false);
  });
});
