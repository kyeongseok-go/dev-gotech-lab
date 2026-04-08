import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProjects } from "@/lib/content";
import { ExternalLink, Code, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "진행 중이거나 완료된 프로젝트 목록입니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const items = getPublishedProjects();

  return (
    <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      <header className="mb-20">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
          Projects
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          직접 설계하고 구현한 프로젝트 목록입니다.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-on-surface-variant">등록된 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((project, i) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className={`obsidian-card p-8 group flex flex-col ${i % 2 === 1 ? "md:mt-12" : ""}`}
            >
              {/* Period & Role */}
              <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
                {project.period && <span>{project.period}</span>}
                {project.role && (
                  <>
                    <span>&bull;</span>
                    <span>{project.role}</span>
                  </>
                )}
                {project.featured && (
                  <span className="badge-live text-[10px] font-bold px-2 py-0.5 ml-auto">
                    Featured
                  </span>
                )}
              </div>

              {/* Tech Stack */}
              {project.techStack.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-do-primary/10 text-do-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="font-headline text-2xl font-bold mb-3 text-white group-hover:text-do-primary transition-colors">
                {project.title}
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                {project.summary}
              </p>

              {/* Links */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-outline-variant/15">
                <span className="text-do-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  View Detail <ArrowRight size={12} />
                </span>
                {project.repoUrl && (
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Code size={12} /> Repo
                  </span>
                )}
                {project.demoUrl && (
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <ExternalLink size={12} /> Demo
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
