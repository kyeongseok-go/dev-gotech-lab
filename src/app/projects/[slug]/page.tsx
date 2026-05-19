import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/mdx/mdx-content";
import { getPublishedProjects, getProjectBySlug } from "@/lib/content";
import { ExternalLink, Code } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
  };
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
    <main className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-on-surface">
                {project.title}
              </h1>
              <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Period & Role */}
            {(project.period || project.role) && (
              <div className="grid grid-cols-2 gap-8 py-6 border-y border-outline-variant/15">
                {project.period && (
                  <div>
                    <span className="block text-outline text-[10px] uppercase tracking-widest mb-1 font-bold">
                      Period
                    </span>
                    <span className="font-headline text-on-surface font-medium">
                      {project.period}
                    </span>
                  </div>
                )}
                {project.role && (
                  <div>
                    <span className="block text-outline text-[10px] uppercase tracking-widest mb-1 font-bold">
                      Role
                    </span>
                    <span className="font-headline text-on-surface font-medium">
                      {project.role}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-surface-container-high rounded-sm text-on-surface-variant font-code text-xs border border-outline-variant/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {(project.repoUrl || project.demoUrl) && (
              <div className="flex flex-wrap gap-4">
                {project.demoUrl && (
                  <Link
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-8 py-4 rounded-sm text-sm flex items-center gap-2"
                  >
                    Live Demo
                    <ExternalLink size={14} />
                  </Link>
                )}
                {project.repoUrl && (
                  <Link
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline px-8 py-4 rounded-sm text-sm flex items-center gap-2"
                  >
                    Source Code
                    <Code size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-8">
        <div className="prose-custom">
          <MDXContent code={project.body} />
        </div>
      </section>

      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-8 mt-16 pt-8 border-t border-outline-variant/15">
        <Link
          href="/projects"
          className="text-sm text-on-surface-variant transition-colors hover:text-do-primary font-headline uppercase tracking-wider"
        >
          &larr; All Projects
        </Link>
      </div>
    </main>
  );
}
