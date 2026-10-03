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

/**
 * 케이스 스터디 한눈 카드 — 문제 → 접근 → 결과 수치 → 스택 → 링크.
 * 값이 없는 칸은 렌더하지 않는다(가짜 수치 금지). 결과 수치에는 근거 위치를 작게 표기.
 */
export function CaseStudyCard({ study, techStack, repoUrl, demoUrl, showcaseSlug }: CaseStudyCardProps) {
  return (
    <section aria-labelledby="case-title" className="card-color">
      <h2 id="case-title" className="sr-only">케이스 스터디 요약</h2>
      <dl className="grid grid-cols-12">
        {study && (
          <div className="col-span-12 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-hairline p-5 md:p-7">
            <dt className="type-label text-on-surface-muted">01 · 문제</dt>
            <dd className="mt-3 text-[1.1875rem] font-light leading-snug text-on-surface">{study.problem}</dd>
            {study.status && (
              <>
                <dt className="mt-6 type-label text-on-surface-muted">현재 상태</dt>
                <dd className="mt-2 type-small text-on-surface-variant">{study.status}</dd>
              </>
            )}
          </div>
        )}
        {study && study.approach.length > 0 && (
          <div className="col-span-12 lg:col-span-7 border-b border-hairline p-5 md:p-7">
            <dt className="type-label text-on-surface-muted">02 · 접근</dt>
            <dd className="mt-3">
              <ol className="space-y-2">
                {study.approach.map((a, i) => (
                  <li key={a} className="grid grid-cols-[1.75rem_1fr] gap-2 text-on-surface-variant">
                    <span className="font-code text-xs font-bold tabular text-on-surface pt-1">{String(i + 1).padStart(2, "0")}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </dd>
          </div>
        )}
        {study && study.outcomes.length > 0 && (
          <div className="col-span-12 border-b border-hairline p-5 md:p-7">
            <dt className="type-label text-on-surface-muted">03 · 결과 수치 <span className="font-normal normal-case tracking-normal">(본문에 적힌 값)</span></dt>
            <dd className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline border border-hairline">
              {study.outcomes.map((o) => (
                <div key={o.label} className="bg-surface-container-low p-4">
                  <p className="font-code text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-bold leading-none tabular text-on-surface">{o.value}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">{o.label}</p>
                  {o.note && <p className="mt-1 font-code text-[11px] text-on-surface-muted">근거: {o.note}</p>}
                </div>
              ))}
            </dd>
          </div>
        )}
        {techStack.length > 0 && (
          <div className="col-span-12 lg:col-span-8 p-5 md:p-7">
            <dt className="type-label text-on-surface-muted">04 · 스택</dt>
            <dd className="mt-3 flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <span key={t} className="tag-chip font-code !text-xs !font-medium">{t}</span>
              ))}
            </dd>
          </div>
        )}
        <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-hairline p-5 md:p-7">
          <dt className="type-label text-on-surface-muted">05 · 링크</dt>
          <dd className="mt-3 flex flex-col items-start gap-2">
            {demoUrl && (
              <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex h-11 px-5 text-sm">
                라이브 데모 <ArrowUpRight aria-hidden size={14} />
              </a>
            )}
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex h-11 px-5 text-sm">
                소스 코드 <ArrowUpRight aria-hidden size={14} />
              </a>
            )}
            {showcaseSlug && (
              <Link href={`/showcase/${showcaseSlug}`} className="text-link inline-flex items-center gap-1 text-sm">
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
