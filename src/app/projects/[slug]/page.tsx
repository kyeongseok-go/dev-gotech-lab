import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXContent } from "@/components/mdx/mdx-content";
import { CaseStudyCard } from "@/components/projects/case-study-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedProjects, getProjectBySlug, getPostsForProject } from "@/lib/content";
import { getCaseStudy, getShowcaseForProject } from "@/lib/case-studies";
import { formatDateDot, padNumber } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

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
    openGraph: { type: "article", title: project.title, description: project.summary },
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

  const all = getPublishedProjects();
  const number = all.findIndex((p) => p.slug === slug) + 1;
  const study = getCaseStudy(slug);
  const posts = getPostsForProject(slug);
  const showcaseSlug = getShowcaseForProject(slug);
  const url = `${SITE_URL}/projects/${slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": project.repoUrl ? "SoftwareSourceCode" : "CreativeWork",
      name: project.title,
      description: project.summary,
      url,
      author: { "@type": "Person", name: "고경석", url: `${SITE_URL}/about` },
      inLanguage: "ko-KR",
      keywords: project.techStack.join(", "),
      ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "프로젝트", item: `${SITE_URL}/projects` },
        { "@type": "ListItem", position: 3, name: project.title, item: url },
      ],
    },
  ];

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <JsonLd data={jsonLd} />

      <header className="mb-10 md:mb-14">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-on-surface pt-3 font-code text-xs uppercase tracking-[0.08em]">
          <nav aria-label="위치" className="text-on-surface-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-on-surface">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/projects" className="hover:text-on-surface">Projects</Link></li>
            </ol>
          </nav>
          <p className="tabular text-on-surface-muted">
            <span className="font-bold text-on-surface">P-{padNumber(number, 2)}</span>
            {project.period && <> · {project.period}</>}
            {project.role && <> · <span className="normal-case">{project.role}</span></>}
          </p>
        </div>
        <h1 className="mt-8 max-w-[20em] type-article-title text-on-surface">{project.title}</h1>
        <p className="lead-rule mt-6 max-w-[46rem] type-body text-on-surface-variant">{project.summary}</p>
      </header>

      <CaseStudyCard
        study={study}
        techStack={project.techStack}
        repoUrl={project.repoUrl}
        demoUrl={project.demoUrl}
        showcaseSlug={showcaseSlug}
      />

      <section aria-labelledby="body-title" className="mt-16 grid grid-cols-12 gap-x-6">
        <h2 id="body-title" className="sr-only">프로젝트 상세 기록</h2>
        <div className="col-span-12 lg:col-span-8 max-w-[44rem]">
          <MDXContent collection="projects" slug={slug} />
        </div>
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="dev-log-title" className="mt-20">
          <div className="lab-head mb-6">
            <span className="lab-index">§B</span>
            <h2 id="dev-log-title" className="type-label text-on-surface">개발 기록</h2>
            <span className="font-code text-xs text-on-surface-muted tabular">{padNumber(posts.length, 2)}</span>
          </div>
          <ul className="border-b border-hairline">
            {posts.map((p) => (
              <li key={p.slug} className="border-t border-hairline">
                <Link href={`/blog/${p.slug}`} className="group grid grid-cols-[6.5rem_1fr] gap-4 py-4 pl-2 hover:bg-surface-container-low transition-colors">
                  <time dateTime={p.date} className="font-code text-xs text-on-surface-muted tabular pt-1">{formatDateDot(p.date)}</time>
                  <span className="type-title text-on-surface group-hover:text-do-primary transition-colors">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-16">
        <Link href="/projects" className="text-link inline-flex items-center gap-1 text-sm">
          <ArrowLeft aria-hidden size={14} /> 프로젝트 전체 보기
        </Link>
      </p>
    </main>
  );
}
