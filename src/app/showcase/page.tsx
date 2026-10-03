import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedShowcase, STATUS_LABEL } from "@/lib/content";
import { SHOWCASE_PROJECT_LINKS } from "@/lib/case-studies";
import { PageHeading } from "@/components/section/page-heading";
import { padNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "AI Showcase",
  description: "직접 써 볼 수 있는 AI 결과물과 실험 모음입니다. 케이스 스터디는 프로젝트에서 다룹니다.",
  alternates: { canonical: "/showcase" },
};

const STATUS_BADGE: Record<string, string> = { live: "badge-live", wip: "badge-wip", archived: "badge-archived" };
const STATUS_ORDER: Record<string, number> = { live: 0, wip: 1, archived: 2 };

/**
 * 쇼케이스 = 써 볼 수 있는 결과물. 데모 링크가 있는 운영 중 항목을 위로.
 * 프로젝트와 겹치는 항목은 케이스 스터디 링크만 건다.
 */
export default function ShowcasePage() {
  const items = [...getPublishedShowcase()].sort((a, b) => {
    const live = Number(!!b.externalUrl && b.status === "live") - Number(!!a.externalUrl && a.status === "live");
    return live || (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3);
  });

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="AI Showcase · Try it"
        count={items.length}
        size="xl"
        title={
          <>
            <span className="marker">Tiny</span> AI things.
          </>
        }
        lead={
          <>
            직접 <span className="text-em">써 볼 수 있는 결과물</span>과 실험입니다. 만든 과정과 수치는{" "}
            <Link href="/projects" className="prose-link">프로젝트</Link>에 정리했습니다.
          </>
        }
      />

      {items.length === 0 ? (
        <p className="type-body text-on-surface-variant">등록된 항목이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-hairline">
          {items.map((item, i) => {
            const projectSlug = SHOWCASE_PROJECT_LINKS[item.slug];
            return (
              <li key={item.slug} className="flex flex-col border-r border-b border-hairline">
                <Link href={`/showcase/${item.slug}`} className="group flex flex-1 flex-col gap-6 p-6 md:p-7 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-code text-xs tabular text-on-surface-muted">
                      <span className="font-bold text-on-surface">S-{padNumber(i + 1, 2)}</span>
                      {item.type && <> · {item.type}</>}
                    </span>
                    <span className={`${STATUS_BADGE[item.status] ?? "badge-archived"} px-2 py-0.5 text-[11px]`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="type-title text-on-surface group-hover:text-do-primary transition-colors">{item.title}</h2>
                    <p className="mt-2 type-small text-on-surface-variant line-clamp-3">{item.summary}</p>
                  </div>
                  {item.stack.length > 0 && (
                    <p className="font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">{item.stack.slice(0, 4).join(" / ")}</p>
                  )}
                </Link>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline px-6 md:px-7 py-4 text-sm">
                  {item.externalUrl ? (
                    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
                      데모 열기 <ArrowUpRight aria-hidden size={14} />
                    </a>
                  ) : (
                    <span className="text-on-surface-muted">데모 링크 준비 중</span>
                  )}
                  {projectSlug && (
                    <Link href={`/projects/${projectSlug}`} className="text-link inline-flex items-center gap-1">
                      케이스 스터디 <ArrowUpRight aria-hidden size={14} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
