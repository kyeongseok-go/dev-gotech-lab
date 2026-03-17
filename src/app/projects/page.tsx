import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "진행 중이거나 완료된 프로젝트 목록입니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const items = getPublishedProjects();

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        직접 설계하고 구현한 프로젝트 목록입니다.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((project) => (
            <li key={project.slug}>
              <div className="list-card">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {project.period && <span>{project.period}</span>}
                  {project.role && (
                    <>
                      <span className="text-border">|</span>
                      <span>{project.role}</span>
                    </>
                  )}
                  {project.featured && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>

                <h2 className="mt-2.5 text-lg font-semibold">{project.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {project.summary}
                </p>

                {project.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="tag-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  {project.repoUrl && (
                    <Link
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      GitHub &rarr;
                    </Link>
                  )}
                  {project.demoUrl && (
                    <Link
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Demo &rarr;
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
