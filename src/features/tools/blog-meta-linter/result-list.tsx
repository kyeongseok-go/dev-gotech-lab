import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { RuleResult, RuleStatus } from "./rules";

const STATUS_VIEW: Record<RuleStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  pass: { label: "통과", className: "badge-live", Icon: CheckCircle2 },
  warn: { label: "경고", className: "badge-wip", Icon: AlertTriangle },
  fail: { label: "실패", className: "bg-on-surface text-page font-code tracking-[0.04em]", Icon: XCircle },
};

/** 실패 → 경고 → 통과 순으로 (고칠 것이 위로) */
const ORDER: Record<RuleStatus, number> = { fail: 0, warn: 1, pass: 2 };

export function ResultList({ results }: { results: readonly RuleResult[] }) {
  const sorted = [...results].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <ol className="divide-y divide-hairline border-y border-hairline" aria-label="규칙별 결과">
      {sorted.map((r) => {
        const view = STATUS_VIEW[r.status];
        return (
          <li key={r.id} data-rule={r.id} data-status={r.status} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 py-3">
            <span className={`${view.className} inline-flex h-6 items-center gap-1 rounded-[0.125rem] px-2 text-[11px]`}>
              <view.Icon aria-hidden size={12} /> {view.label}
            </span>
            <span className="text-sm font-semibold text-on-surface">{r.label}</span>
            <span className="col-start-2 type-small text-on-surface-variant">{r.detail}</span>
          </li>
        );
      })}
    </ol>
  );
}
