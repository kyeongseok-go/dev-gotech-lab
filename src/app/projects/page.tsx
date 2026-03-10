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
      <h1 className="text-2xl font-semibold">프로젝트</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        직접 설계하고 구현한 프로젝트 목록입니다.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((project) => (
            <li
              key={project.slug}
              className="rounded-lg border border-border p-5"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {project.period && <span>{project.period}</span>}
                {project.role && (
                  <>
                    <span>·</span>
                    <span>{project.role}</span>
                  </>
                )}
                {project.featured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-lg font-semibold">{project.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {project.summary}
              </p>

              {project.techStack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
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
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    GitHub
                  </Link>
                )}
                {project.demoUrl && (
                  <Link
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Demo
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
