import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/lib/case-studies";

interface CaseStudyCardProps {
  study: CaseStudy | null;
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  showcaseSlug?: string | null;
}

/** 기록지 한 줄 머리 — "01 · 문제" */
function RowHead({ no, label, note }: { no: string; label: string; note?: string }) {
  return (
    <dt className="flex items-baseline gap-3 font-code text-xs uppercase tracking-[0.1em] text-on-surface-muted">
      <span className="tabular text-do-primary">§{no}</span>
      <span className="text-on-surface">{label}</span>
      {note && <span className="normal-case tracking-normal">{note}</span>}
    </dt>
  );
}

/**
 * 케이스 스터디 한눈 카드 — 연구 노트 "실험 기록지".
 * §01 문제 → §02 접근 → §03 측정값(근거는 각주) → §04 스택 → §05 링크.
 * 값이 없는 칸은 렌더하지 않는다(가짜 수치 금지).
 */
export function CaseStudyCard({ study, techStack, repoUrl, demoUrl, showcaseSlug }: CaseStudyCardProps) {
  const outcomes = study?.outcomes ?? [];
  return (
    <section aria-labelledby="case-title" className="border-t border-on-surface">
      <div className="flex items-baseline justify-between gap-4 py-3 font-code text-xs uppercase tracking-[0.12em]">
        <h2 id="case-title" className="text-on-surface">Case sheet · 케이스 스터디 요약</h2>
        <span className="text-on-surface-muted">문제 → 접근 → 결과</span>
      </div>
      <dl className="grid grid-cols-12 border-t border-hairline">
        {study && (
          <div className="col-span-12 lg:col-span-5 border-b border-hairline py-6 lg:pr-8 lg:border-r">
            <RowHead no="01" label="문제" />
            <dd className="mt-4 text-[1.25rem] md:text-[1.375rem] font-semibold leading-[1.45] tracking-[-0.02em] text-on-surface">
              {study.problem}
            </dd>
            {study.status && (
              <dd className="mt-6 flex items-baseline gap-2 type-small text-on-surface-variant">
                <span className="flex-none font-code text-[11px] uppercase tracking-[0.1em] text-on-surface-muted">Status</span>
                {study.status}
              </dd>
            )}
          </div>
        )}
        {study && study.approach.length > 0 && (
          <div className="col-span-12 lg:col-span-7 border-b border-hairline py-6 lg:pl-8">
            <RowHead no="02" label="접근" />
            <dd className="mt-4">
              <ol className="border-t border-hairline">
                {study.approach.map((a, i) => (
                  <li key={a} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-hairline py-2.5 text-on-surface-variant">
                    <span className="font-code text-xs tabular text-on-surface-muted pt-1">{String(i + 1).padStart(2, "0")}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </dd>
          </div>
        )}
        {outcomes.length > 0 && (
          <div className="col-span-12 border-b border-hairline py-6">
            <RowHead no="03" label="측정값" note="(본문에 적힌 값만)" />
            <dd className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline border border-hairline">
              {outcomes.map((o, i) => (
                <div key={o.label} className="lab-grid bg-surface-container-low p-5">
                  <p className="font-code text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] font-semibold leading-none tabular text-on-surface">
                    {o.value}
                    {o.note && (
                      <a href={`#case-fn-${i + 1}`} id={`case-fn-ref-${i + 1}`} className="fn-ref" aria-label={`각주 ${i + 1}: 근거`}>
                        {i + 1}
                      </a>
                    )}
                  </p>
                  <p className="mt-3 text-sm text-on-surface-variant">{o.label}</p>
                </div>
              ))}
            </dd>
            {outcomes.some((o) => o.note) && (
              <dd>
                <ol className="footnotes" aria-label="측정값 근거">
                  {outcomes.map((o, i) =>
                    o.note ? (
                      <li key={o.label} id={`case-fn-${i + 1}`}>
                        <span>{i + 1}</span>
                        <span>
                          {o.label} — 근거: {o.note}
                        </span>
                      </li>
                    ) : null,
                  )}
                </ol>
              </dd>
            )}
          </div>
        )}
        {techStack.length > 0 && (
          <div className="col-span-12 lg:col-span-8 py-6 lg:pr-8">
            <RowHead no="04" label="스택" />
            <dd className="mt-4 flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <span key={t} className="tag-chip tag-chip-sm">
                  {t}
                </span>
              ))}
            </dd>
          </div>
        )}
        <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-hairline py-6 lg:pl-8">
          <RowHead no="05" label="링크" />
          <dd className="mt-4 flex flex-col items-start gap-2">
            {demoUrl && (
              <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex h-11 px-5 text-sm">
                라이브 데모 <ArrowUpRight aria-hidden size={14} className="btn-arrow" />
              </a>
            )}
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex h-11 px-5 text-sm">
                소스 코드 <ArrowUpRight aria-hidden size={14} />
              </a>
            )}
            {showcaseSlug && (
              <Link href={`/showcase/${showcaseSlug}`} className="text-link mt-1 inline-flex items-center gap-1 text-sm">
                쇼케이스에서 보기 <ArrowUpRight aria-hidden size={14} />
              </Link>
            )}
            {!demoUrl && !repoUrl && !showcaseSlug && <span className="type-small text-on-surface-muted">공개 링크 준비 중</span>}
          </dd>
        </div>
      </dl>
    </section>
  );
}
