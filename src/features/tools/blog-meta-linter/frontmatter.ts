/**
 * 블로그 frontmatter 의 작은 YAML 부분집합 파서 — 의존성 없이 브라우저에서 돈다.
 * 지원: `키: 값`(문자열·따옴표·불리언·숫자), 인라인 배열 `[a, "b"]`, 블록 배열(`- 항목`), 주석·빈 줄.
 * 그 밖(중첩 객체, `|`·`>` 블록 문자열 등)은 추측하지 않고 줄 번호와 함께 unsupported 로 돌려준다.
 */
export type FrontmatterValue = string | number | boolean | string[] | null;
export type FrontmatterData = Record<string, FrontmatterValue>;

export type FrontmatterError =
  | { kind: "missing" }
  | { kind: "unclosed" }
  | { kind: "unsupported"; line: number; text: string };

export type ParseResult =
  | { ok: true; data: FrontmatterData; body: string; bodyStartLine: number }
  | { ok: false; error: FrontmatterError };

const FENCE = "---";
const KEY_LINE = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/;
const LIST_ITEM = /^\s*-\s+(.*)$/;
const NUMBER = /^-?\d+(?:\.\d+)?$/;
const BLOCK_SCALAR = /^[|>][+-]?$/;

export function parseFrontmatter(text: string): ParseResult {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0]?.trim() !== FENCE) return { ok: false, error: { kind: "missing" } };
  const close = lines.findIndex((line, i) => i > 0 && line.trim() === FENCE);
  if (close === -1) return { ok: false, error: { kind: "unclosed" } };

  const parsed = parseLines(lines.slice(1, close));
  if ("error" in parsed) return { ok: false, error: parsed.error };
  return { ok: true, data: parsed.data, body: lines.slice(close + 1).join("\n"), bodyStartLine: close + 2 };
}

function parseLines(lines: string[]): { data: FrontmatterData } | { error: FrontmatterError } {
  const data: FrontmatterData = {};
  let listKey: string | null = null;

  for (const [i, raw] of lines.entries()) {
    const lineNo = i + 2; // 여는 --- 가 1번째 줄
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const item = LIST_ITEM.exec(raw);
    if (item && listKey) {
      const current = data[listKey];
      data[listKey] = [...(Array.isArray(current) ? current : []), String(parseScalar(item[1].trim()))];
      continue;
    }
    const pair = raw.startsWith(" ") ? null : KEY_LINE.exec(raw);
    if (!pair) return { error: { kind: "unsupported", line: lineNo, text: trimmed } };

    const [, key, rawValue = ""] = pair;
    const value = rawValue.trim();
    if (BLOCK_SCALAR.test(value)) return { error: { kind: "unsupported", line: lineNo, text: trimmed } };
    listKey = value === "" ? key : null;
    data[key] = value === "" ? null : parseValue(value);
  }
  return { data };
}

function parseValue(value: string): FrontmatterValue {
  if (value.startsWith("[") && value.endsWith("]")) {
    return splitInline(value.slice(1, -1)).map((part) => String(parseScalar(part)));
  }
  return parseScalar(value);
}

function parseScalar(value: string): string | number | boolean {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\(["\\n])/g, (_, ch: string) => (ch === "n" ? "\n" : ch));
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (value === "true" || value === "false") return value === "true";
  if (NUMBER.test(value)) return Number(value);
  return value;
}

/** 따옴표 안의 쉼표는 나누지 않는다 */
function splitInline(inner: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: string | null = null;
  for (const ch of inner) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ",") {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") parts.push(current.trim());
  return parts;
}

/** 다시 읽어도 같은 값이 나오는 정규화된 frontmatter (문자열은 큰따옴표, 배열은 인라인) */
export function serializeFrontmatter(data: FrontmatterData): string {
  const body = Object.entries(data).map(([key, value]) => {
    if (value === null) return `${key}:`;
    if (Array.isArray(value)) return `${key}: [${value.map((v) => JSON.stringify(v)).join(", ")}]`;
    if (typeof value === "string") return `${key}: ${JSON.stringify(value)}`;
    return `${key}: ${String(value)}`;
  });
  return [FENCE, ...body, FENCE].join("\n");
}
