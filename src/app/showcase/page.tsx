import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedShowcase, STATUS_LABEL } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Showcase",
  description: "AI를 활용해 만든 실험과 프로토타입 모음입니다.",
  alternates: { canonical: "/showcase" },
};

const STATUS_CLASS: Record<string, string> = {
  live: "status-badge status-live",
  wip: "status-badge status-wip",
  archived: "status-badge status-archived",
};

const BENTO_COLORS = ["bento-blue", "bento-green", "bento-purple", "bento-pink", "bento-yellow", "bento-mint"];

export default function ShowcasePage() {
  const items = getPublishedShowcase();

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight">AI Showcase</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        AI를 활용해 만든 실험적 도구와 미니앱 모음입니다.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">등록된 항목이 없습니다.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item, idx) => (
            <li key={item.slug}>
              <div className={`bento-card flex flex-col ${BENTO_COLORS[idx % BENTO_COLORS.length]}`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={STATUS_CLASS[item.status] ?? STATUS_CLASS.archived}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                  {item.type && (
                    <span className="opacity-60">{item.type}</span>
                  )}
                  {item.featured && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>

                <Link href={`/showcase/${item.slug}`}>
                  <h2 className="mt-3 text-lg font-semibold hover:opacity-80 transition-opacity">
                    {item.title}
                  </h2>
                </Link>
                <p className="mt-1 flex-1 text-sm opacity-70 line-clamp-2">
                  {item.summary}
                </p>

                {item.stack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium dark:bg-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {item.externalUrl && (
                    <Link
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
                    >
                      사이트 보기 &rarr;
                    </Link>
                  )}
                  {item.repoUrl && (
                    <Link
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
                    >
                      GitHub &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
