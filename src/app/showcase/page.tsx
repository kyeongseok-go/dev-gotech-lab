import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedShowcase, STATUS_LABEL } from "@/lib/content";
import { ExternalLink, Code, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Showcase",
  description: "AI를 활용해 만든 실험과 프로토타입 모음입니다.",
  alternates: { canonical: "/showcase" },
};

const STATUS_CLASS: Record<string, string> = {
  live: "badge-live",
  wip: "badge-wip",
  archived: "badge-archived",
};

export default function ShowcasePage() {
  const items = getPublishedShowcase();

  return (
    <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      <header className="mb-20">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white flex items-center gap-4">
          <Sparkles size={48} className="text-do-primary" />
          AI Showcase
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          AI를 활용해 만든 실험적 도구와 미니앱 모음입니다.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="obsidian-card p-12 text-center">
          <p className="text-on-surface-variant">등록된 항목이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const badgeClass = STATUS_CLASS[item.status] ?? STATUS_CLASS.archived;
            return (
              <div
                key={item.slug}
                className={`obsidian-card p-8 flex flex-col group ${item.status === "archived" ? "opacity-60" : ""}`}
              >
                {/* Status & Type */}
                <div className="flex items-center gap-2 text-xs mb-6">
                  <span className={`${badgeClass} font-bold px-2 py-1 text-[10px] uppercase tracking-wider`}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                  {item.type && (
                    <span className="text-on-surface-variant">{item.type}</span>
                  )}
                  {item.featured && (
                    <span className="badge-live font-bold px-2 py-0.5 text-[10px] ml-auto">
                      Featured
                    </span>
                  )}
                </div>

                <Link href={`/showcase/${item.slug}`}>
                  <h2 className="font-headline text-xl font-bold text-white mb-3 group-hover:text-do-primary transition-colors">
                    {item.title}
                  </h2>
                </Link>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2 flex-grow">
                  {item.summary}
                </p>

                {/* Stack */}
                {item.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] text-do-primary font-code"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-outline-variant/15">
                  {item.externalUrl && (
                    <Link
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-do-primary text-xs font-bold uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      Demo <ExternalLink size={12} />
                    </Link>
                  )}
                  {item.repoUrl && (
                    <Link
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                      Repository <Code size={12} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
