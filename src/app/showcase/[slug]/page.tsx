import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXContent } from "@/components/mdx/mdx-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedShowcase, getShowcaseBySlug, STATUS_LABEL } from "@/lib/content";
import { SHOWCASE_PROJECT_LINKS } from "@/lib/case-studies";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const STATUS_BADGE: Record<string, string> = { live: "badge-live", wip: "badge-wip", archived: "badge-archived" };

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getShowcaseBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/showcase/${slug}` },
  };
}

export function generateStaticParams() {
  return getPublishedShowcase().map((item) => ({ slug: item.slug }));
}

export default async function ShowcaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getShowcaseBySlug(slug);

  if (!item || item.draft) {
    notFound();
  }

  const projectSlug = SHOWCASE_PROJECT_LINKS[slug];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "AI 쇼케이스", item: `${SITE_URL}/showcase` },
      { "@type": "ListItem", position: 3, name: item.title, item: `${SITE_URL}/showcase/${slug}` },
    ],
  };

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <JsonLd data={breadcrumb} />
      <header className="mb-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-on-surface pt-3 font-code text-xs uppercase tracking-[0.08em]">
          <nav aria-label="위치" className="text-on-surface-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-on-surface">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/showcase" className="hover:text-on-surface">Showcase</Link></li>
            </ol>
          </nav>
          <p className="flex items-center gap-2 text-on-surface-muted">
            {item.type && <span>{item.type}</span>}
            <span className={`${STATUS_BADGE[item.status] ?? "badge-archived"} px-2 py-0.5 text-[11px] normal-case`}>
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
          </p>
        </div>
        <h1 className="mt-8 max-w-[20em] type-article-title text-on-surface">{item.title}</h1>
        <p className="lead-rule mt-6 max-w-[46rem] type-body text-on-surface-variant">{item.summary}</p>

        {item.stack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="기술 스택">
            {item.stack.map((tech: string) => (
              <li key={tech} className="tag-chip font-code !text-xs !font-medium">{tech}</li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {item.externalUrl ? (
            <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-accent inline-flex h-12 px-6 text-[15px]">
              써 보기 <ArrowUpRight aria-hidden size={16} />
            </a>
          ) : (
            <span className="inline-flex h-12 items-center border border-dashed border-outline px-5 text-sm text-on-surface-muted">
              데모 링크 준비 중
            </span>
          )}
          {item.repoUrl && (
            <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex h-12 px-6 text-[15px]">
              GitHub <ArrowUpRight aria-hidden size={16} />
            </a>
          )}
          {projectSlug && (
            <Link href={`/projects/${projectSlug}`} className="text-link inline-flex items-center gap-1 text-sm">
              케이스 스터디 보기 <ArrowUpRight aria-hidden size={14} />
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-[44rem]">
        <MDXContent collection="showcase" slug={slug} />
      </div>

      <p className="mt-16">
        <Link href="/showcase" className="text-link inline-flex items-center gap-1 text-sm">
          <ArrowLeft aria-hidden size={14} /> 쇼케이스 전체 보기
        </Link>
      </p>
    </main>
  );
}
