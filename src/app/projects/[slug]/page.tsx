import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { MDXContent } from "@/components/mdx/mdx-content";
import { getPublishedProjects, getProjectBySlug } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPublishedProjects().map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project || project.draft) {
    notFound();
  }

  return (
    <PageContainer className="max-w-3xl">
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {project.period && <span>{project.period}</span>}
            {project.role && (
              <>
                <span>·</span>
                <span>{project.role}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{project.title}</h1>
          <p className="mt-3 text-muted-foreground">{project.summary}</p>

          {project.techStack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
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

          {(project.repoUrl || project.demoUrl) && (
            <div className="mt-4 flex gap-3">
              {project.demoUrl && (
                <Link
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  데모 보기
                </Link>
              )}
              {project.repoUrl && (
                <Link
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  GitHub
                </Link>
              )}
            </div>
          )}
        </header>

        <div className="prose-custom">
          <MDXContent code={project.body} />
        </div>
      </article>

      <div className="mt-12 border-t border-border pt-8">
        <Link
          href="/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← 프로젝트 목록으로
        </Link>
      </div>
    </PageContainer>
  );
}
