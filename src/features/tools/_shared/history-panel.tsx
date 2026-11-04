"use client";

import { useState } from "react";
import { History, Trash2 } from "lucide-react";
import { DownloadButton } from "./result-actions";
import { HISTORY_LIMIT, type HistoryEntry } from "./tool-storage";

interface HistoryPanelProps<T> {
  slug: string;
  entries: readonly HistoryEntry<T>[];
  onSelect: (entry: HistoryEntry<T>) => void;
  onClearAll: () => number;
}

const TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" });

/** 최근 기록(이 브라우저에만 저장) · JSON 내보내기 · 모든 저장 데이터 삭제 */
export function HistoryPanel<T>({ slug, entries, onSelect, onClearAll }: HistoryPanelProps<T>) {
  const [notice, setNotice] = useState("");
  return (
    <section aria-labelledby={`${slug}-history`} className="border-t border-hairline pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${slug}-history`} className="inline-flex items-center gap-2 type-title text-on-surface">
          <History aria-hidden size={18} /> 최근 기록
          <span className="font-code text-xs text-on-surface-muted tabular">
            {entries.length}/{HISTORY_LIMIT}
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <DownloadButton filename={`${slug}-history.json`} text={JSON.stringify(entries, null, 2)} label="JSON 내보내기" disabled={entries.length === 0} />
          <button
            type="button"
            onClick={() => setNotice(`저장 데이터 ${onClearAll()}건을 지웠습니다`)}
            className="btn-outline inline-flex h-11 px-4 text-sm"
          >
            <Trash2 aria-hidden size={16} /> 모든 저장 데이터 삭제
          </button>
        </div>
      </div>
      <p className="mt-2 type-small text-on-surface-muted">기록은 이 브라우저에만 남습니다. 개인정보·기밀은 입력하지 마세요.</p>
      <p aria-live="polite" className="mt-2 type-small text-on-surface-variant">
        {notice}
      </p>
      {entries.length === 0 ? (
        <p className="mt-4 type-small text-on-surface-muted">아직 저장한 기록이 없습니다.</p>
      ) : (
        <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="flex w-full items-baseline justify-between gap-4 px-1 py-3 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-offset-[-2px]"
              >
                <span className="min-w-0 truncate text-sm text-on-surface">{entry.label}</span>
                <time dateTime={entry.at} className="shrink-0 font-code text-xs text-on-surface-muted tabular">
                  {TIME_FORMAT.format(new Date(entry.at))}
                </time>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
