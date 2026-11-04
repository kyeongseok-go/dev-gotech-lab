"use client";

import { useId, useMemo, useState } from "react";
import { FileInput, Save } from "lucide-react";
import { HistoryPanel } from "../_shared/history-panel";
import { CopyButton, DownloadButton } from "../_shared/result-actions";
import { useHydrated, useToolHistory } from "../_shared/use-tool-history";
import { serializeFrontmatter, type FrontmatterError } from "./frontmatter";
import { ResultList } from "./result-list";
import { DEFAULT_LIMITS, LIMIT_RANGE, lintPost, summarize, type LintLimits } from "./rules";
import { SAMPLE_POST } from "./sample";

const SLUG = "blog-meta-linter";
const LABEL_MAX = 40;

const PARSE_ERROR_TEXT: Record<FrontmatterError["kind"], string> = {
  missing: "맨 첫 줄이 --- 로 시작하는 frontmatter 를 찾지 못했습니다.",
  unclosed: "frontmatter 를 닫는 --- 줄이 없습니다.",
  unsupported: "이 도구가 읽지 못하는 YAML 구문이 있습니다.",
};

function errorMessage(error: FrontmatterError): string {
  const base = PARSE_ERROR_TEXT[error.kind];
  return error.kind === "unsupported" ? `${base} (${error.line}번째 줄: ${error.text}) 중첩 객체와 | > 블록 문자열은 지원하지 않습니다.` : base;
}

const clampLimit = (n: number) => Math.min(LIMIT_RANGE.max, Math.max(LIMIT_RANGE.min, Math.round(n) || LIMIT_RANGE.min));

interface Saved {
  text: string;
  limits: LintLimits;
}

export function BlogMetaLinter() {
  const hydrated = useHydrated();
  const inputId = useId();
  const [text, setText] = useState("");
  const [limits, setLimits] = useState<LintLimits>(DEFAULT_LIMITS);
  const [saved, setSaved] = useState("");
  const history = useToolHistory<Saved>(SLUG);

  const report = useMemo(() => (text.trim() === "" ? null : lintPost(text, limits)), [text, limits]);
  const counts = report ? summarize(report.results) : null;
  const fixed = report?.data ? serializeFrontmatter(report.data) : "";

  const save = () => {
    const title = typeof report?.data?.title === "string" ? report.data.title : text.trim();
    const ok = history.add(Array.from(title).slice(0, LABEL_MAX).join(""), { text, limits });
    setSaved(ok ? "기록에 저장했습니다" : "이 브라우저는 저장을 막고 있습니다");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label htmlFor={inputId} className="text-sm font-semibold text-on-surface">
            MDX·Markdown 원문
          </label>
          <button type="button" onClick={() => setText(SAMPLE_POST)} disabled={!hydrated} className="btn-outline inline-flex h-11 px-4 text-sm disabled:opacity-50">
            <FileInput aria-hidden size={16} /> 예시 넣기
          </button>
        </div>
        <textarea
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!hydrated}
          rows={16}
          spellCheck={false}
          placeholder={"---\ntitle: \"글 제목\"\ndescription: \"한 줄 설명\"\ndate: 2026-11-04\ntags: [\"태그\"]\n---\n\n본문"}
          className="min-h-[18rem] w-full resize-y border border-input bg-page p-4 font-code text-sm text-on-surface placeholder:text-on-surface-muted focus:border-on-surface focus:outline-2 focus:outline-do-primary disabled:opacity-50"
        />
        <fieldset className="flex flex-wrap gap-6">
          <legend className="sr-only">길이 기준</legend>
          {([
            ["titleMax", "제목 최대 글자"],
            ["descriptionMax", "설명 최대 글자"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-on-surface-variant">
              {label}
              <input
                type="number"
                min={LIMIT_RANGE.min}
                max={LIMIT_RANGE.max}
                value={limits[key]}
                onChange={(e) => setLimits((prev) => ({ ...prev, [key]: clampLimit(e.target.valueAsNumber) }))}
                className="h-11 w-20 border border-input bg-page px-2 font-code text-sm text-on-surface focus:border-on-surface focus:outline-2 focus:outline-do-primary"
              />
            </label>
          ))}
        </fieldset>
        <p className="type-small text-on-surface-muted">기준값은 고텍이 블로그 기준(제목 40자·설명 120자)입니다. 검색엔진의 공식 기준이 아닙니다.</p>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-5" aria-live="polite">
        <h2 className="type-title text-on-surface">검사 결과</h2>
        {!hydrated && <p className="type-small text-on-surface-muted">도구를 불러오는 중입니다…</p>}
        {hydrated && !report && (
          <p className="type-small text-on-surface-variant">원문을 붙여 넣으면 바로 검사합니다. 처음이라면 &lsquo;예시 넣기&rsquo;를 눌러 보세요.</p>
        )}
        {report?.parseError && (
          <p role="alert" className="border-l-2 border-on-surface pl-3 type-small text-on-surface">
            {errorMessage(report.parseError)}
          </p>
        )}
        {report && counts && !report.parseError && (
          <>
            <p className="font-code text-sm tabular text-on-surface" data-testid="summary">
              통과 {counts.pass} · 경고 {counts.warn} · 실패 {counts.fail}
            </p>
            <ResultList results={report.results} />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={fixed} label="정리된 frontmatter 복사" />
              <DownloadButton filename={`${SLUG}-report.json`} text={JSON.stringify({ limits, results: report.results }, null, 2)} label="결과 내려받기" />
              <button type="button" onClick={save} className="btn-outline inline-flex h-11 px-4 text-sm">
                <Save aria-hidden size={16} /> 기록에 저장
              </button>
            </div>
            <p className="type-small text-on-surface-muted" aria-live="polite">
              {saved}
            </p>
          </>
        )}
      </div>

      <div className="lg:col-span-12">
        <HistoryPanel
          slug={SLUG}
          entries={history.entries}
          onClearAll={history.clearAll}
          onSelect={(entry) => {
            setText(entry.value.text);
            setLimits(entry.value.limits);
          }}
        />
      </div>
    </div>
  );
}
