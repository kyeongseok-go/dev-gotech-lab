import { parseFrontmatter, type FrontmatterData, type FrontmatterError, type FrontmatterValue } from "./frontmatter";

/**
 * 고텍이 블로그 기준(gotekie-blog-writer 스킬): 제목 40자·설명 120자 이내, 필수 필드, H1 1개 이하, 이미지 대체 텍스트.
 * 검색엔진 공식 기준이 아니라 이 블로그의 기준이다 — 화면에서도 그렇게 밝힌다.
 */
export interface LintLimits {
  titleMax: number;
  descriptionMax: number;
}

export const DEFAULT_LIMITS: LintLimits = { titleMax: 40, descriptionMax: 120 };
export const LIMIT_RANGE = { min: 10, max: 300 } as const;

export const REQUIRED_FIELDS = ["title", "description", "date", "tags"] as const;

export type RuleStatus = "pass" | "warn" | "fail";

export interface RuleResult {
  id: string;
  label: string;
  status: RuleStatus;
  detail: string;
}

export interface LintReport {
  parseError: FrontmatterError | null;
  results: RuleResult[];
  data: FrontmatterData | null;
}

const MAX_H1 = 1;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CODE_FENCE = /^\s*(```|~~~)/;
const H1 = /^#\s+\S/;
const MD_IMAGE_NO_ALT = /!\[\s*\]\(/;
const IMG_TAG = /<img\b[^>]*>/gi;
const IMG_ALT = /\balt\s*=\s*("([^"]*)"|'([^']*)')/i;

export function lintPost(text: string, limits: LintLimits): LintReport {
  const parsed = parseFrontmatter(text);
  if (!parsed.ok) return { parseError: parsed.error, results: [], data: null };

  const { data } = parsed;
  const bodyLines = proseLines(parsed.body, parsed.bodyStartLine);
  return {
    parseError: null,
    data,
    results: [
      requiredRule(data),
      lengthRule("title-length", "제목 길이", data.title, limits.titleMax),
      lengthRule("description-length", "설명 길이", data.description, limits.descriptionMax),
      dateRule(data.date),
      tagsRule(data.tags),
      categoryRule(data.category),
      h1Rule(bodyLines),
      imageAltRule(bodyLines),
    ],
  };
}

export function summarize(results: readonly RuleResult[]): Record<RuleStatus, number> {
  return {
    pass: results.filter((r) => r.status === "pass").length,
    warn: results.filter((r) => r.status === "warn").length,
    fail: results.filter((r) => r.status === "fail").length,
  };
}

const isBlank = (v: FrontmatterValue | undefined) => v === undefined || v === null || v === "";
const charCount = (s: string) => Array.from(s).length;

function requiredRule(data: FrontmatterData): RuleResult {
  const missing = REQUIRED_FIELDS.filter((key) => isBlank(data[key]));
  return missing.length === 0
    ? { id: "required", label: "필수 필드", status: "pass", detail: REQUIRED_FIELDS.join(", ") }
    : { id: "required", label: "필수 필드", status: "fail", detail: `빠진 필드: ${missing.join(", ")}` };
}

function lengthRule(id: string, label: string, value: FrontmatterValue | undefined, max: number): RuleResult {
  if (typeof value !== "string" || value === "") return { id, label, status: "fail", detail: "값이 없습니다" };
  const count = charCount(value);
  return { id, label, status: count <= max ? "pass" : "fail", detail: `${count}자 / 기준 ${max}자 이내` };
}

function dateRule(value: FrontmatterValue | undefined): RuleResult {
  const base = { id: "date-format", label: "날짜 형식" };
  const match = typeof value === "string" ? ISO_DATE.exec(value) : null;
  if (!match) return { ...base, status: "fail", detail: "YYYY-MM-DD 형식이 아닙니다" };
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return real ? { ...base, status: "pass", detail: String(value) } : { ...base, status: "fail", detail: "없는 날짜입니다" };
}

function tagsRule(value: FrontmatterValue | undefined): RuleResult {
  const base = { id: "tags", label: "태그" };
  if (!Array.isArray(value)) return { ...base, status: "fail", detail: '배열로 적습니다 — 예: tags: ["도구"]' };
  const tags = value.filter((t) => t.trim() !== "");
  return tags.length > 0
    ? { ...base, status: "pass", detail: `${tags.length}개` }
    : { ...base, status: "fail", detail: "태그가 1개 이상 필요합니다" };
}

function categoryRule(value: FrontmatterValue | undefined): RuleResult {
  const base = { id: "category", label: "카테고리" };
  return typeof value === "string" && value !== ""
    ? { ...base, status: "pass", detail: value }
    : { ...base, status: "warn", detail: "없어도 되지만 목록 필터에 쓰입니다" };
}

interface NumberedLine {
  no: number;
  text: string;
}

/** 코드 블록 밖의 본문 줄만 (코드 안의 `#`·`![]()` 는 글 구조가 아니다) */
function proseLines(body: string, startLine: number): NumberedLine[] {
  const lines: NumberedLine[] = [];
  let inCode = false;
  for (const [i, text] of body.split("\n").entries()) {
    if (CODE_FENCE.test(text)) {
      inCode = !inCode;
      continue;
    }
    if (!inCode) lines.push({ no: startLine + i, text });
  }
  return lines;
}

function h1Rule(lines: readonly NumberedLine[]): RuleResult {
  const count = lines.filter((l) => H1.test(l.text)).length;
  return {
    id: "h1-count",
    label: "본문 H1",
    status: count <= MAX_H1 ? "pass" : "fail",
    detail: `${count}개 / 기준 ${MAX_H1}개 이하`,
  };
}

function hasMissingAlt(text: string): boolean {
  if (MD_IMAGE_NO_ALT.test(text)) return true;
  return (text.match(IMG_TAG) ?? []).some((tag) => {
    const alt = IMG_ALT.exec(tag);
    return !alt || (alt[2] ?? alt[3] ?? "").trim() === "";
  });
}

function imageAltRule(lines: readonly NumberedLine[]): RuleResult {
  const bad = lines.filter((l) => hasMissingAlt(l.text)).map((l) => l.no);
  return bad.length === 0
    ? { id: "image-alt", label: "이미지 대체 텍스트", status: "pass", detail: "모든 이미지에 있음" }
    : {
        id: "image-alt",
        label: "이미지 대체 텍스트",
        status: "fail",
        detail: `대체 텍스트 없는 이미지 ${bad.length}개 (${bad.join(", ")}번째 줄)`,
      };
}
