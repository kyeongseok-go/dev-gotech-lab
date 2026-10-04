import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedProjects } from "@/lib/content";
import { getCaseStudy } from "@/lib/case-studies";
import { PageHeading } from "@/components/section/page-heading";
import { padNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "문제 → 접근 → 결과 수치로 정리한 프로젝트 케이스 스터디 목록입니다.",
  alternates: { canonical: "/projects" },
};

/**
 * 프로젝트 = 케이스 스터디 목록. 잡지 목차형 행:
 * [P-번호·기간] [제목·문제 1줄·대표 수치] [스택·링크 표시]
 */
export default function ProjectsPage() {
  const items = getPublishedProjects();

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="Projects · Case studies"
        count={items.length}
        size="xl"
        title={
          <>
            <span className="marker">Shipped</span> things.
          </>
        }
        lead={
          <>
            문제에서 출발해 어떻게 접근했고 무엇이 남았는지. <span className="text-em">Office SW 엔진</span>부터{" "}
            <span className="text-em">AI 빠른 빌드</span>까지의 케이스 스터디입니다.
          </>
        }
      />

      {items.length === 0 ? (
        <p className="type-body text-on-surface-variant">등록된 프로젝트가 없습니다.</p>
      ) : (
        <ol className="border-b border-hairline">
          {items.map((project, i) => {
            const study = getCaseStudy(project.slug);
            const lead = study?.outcomes[0];
            return (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group grid grid-cols-12 gap-x-6 gap-y-3 border-t border-hairline py-7 md:py-9 transition-colors hover:bg-surface-container-low"
                >
                  <div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline gap-3 md:gap-1 font-code text-xs tabular text-on-surface-muted md:pl-3">
                    <span className="font-bold text-on-surface">P-{padNumber(i + 1, 2)}</span>
                    <span>{project.period ?? "—"}</span>
                    {project.featured && <span className="text-[11px] uppercase tracking-[0.08em]">Featured</span>}
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <h2 className="type-headline text-on-surface group-hover:text-do-primary transition-colors">{project.title}</h2>
                    <p className="mt-3 max-w-[60ch] type-small text-on-surface-variant line-clamp-2">
                      {study ? study.problem : project.summary}
                    </p>
                    {project.techStack.length > 0 && (
                      <p className="mt-4 font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">
                        {project.techStack.slice(0, 5).join(" / ")}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-3 flex md:flex-col items-end justify-between md:justify-start gap-3 md:pr-3 md:text-right">
                    {lead && (
                      <div>
                        <p className="font-code text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold leading-none tabular text-on-surface">{lead.value}</p>
                        <p className="mt-1 text-xs text-on-surface-muted">{lead.label}</p>
                      </div>
                    )}
                    <span className="flex items-center gap-2 font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">
                      {project.demoUrl && <span>Demo</span>}
                      {project.repoUrl && <span>Repo</span>}
                      <ArrowUpRight aria-hidden size={16} className="text-on-surface" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
