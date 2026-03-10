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
        </header>

        <div className="prose-custom">
          <MDXContent code={project.body} />
        </div>
      </article>
    </PageContainer>
  );
}
