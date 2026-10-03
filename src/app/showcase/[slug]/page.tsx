import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXContent } from "@/components/mdx/mdx-content";
import { JsonLd } from "@/components/seo/json-ld";
import { DocHeader } from "@/components/section/doc-header";
import { padNumber } from "@/lib/format";
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
  const number = getPublishedShowcase().findIndex((s) => s.slug === slug) + 1;
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
      <DocHeader
        crumbs={[{ href: "/showcase", label: "Showcase" }]}
        stamp={{ k: "Specimen", v: `S-${padNumber(number, 2)}` }}
        meta={[...(item.type ? [item.type] : []), STATUS_LABEL[item.status] ?? item.status]}
        title={item.title}
        titleWidth="20em"
        lead={item.summary}
      >
        <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-8">
          <dl className="spec-table col-span-12 lg:col-span-7">
            <dt>Status</dt>
            <dd>
              <span className={`${STATUS_BADGE[item.status] ?? "badge-archived"} px-2 py-0.5 text-[11px]`}>
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </dd>
            {item.type && (
              <>
                <dt>Type</dt>
                <dd>{item.type}</dd>
              </>
            )}
            {item.stack.length > 0 && (
              <>
                <dt>Stack</dt>
                <dd>
                  <ul className="flex flex-wrap gap-1.5" aria-label="기술 스택">
                    {item.stack.map((tech: string) => (
                      <li key={tech} className="tag-chip tag-chip-sm">{tech}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
            {projectSlug && (
              <>
                <dt>Case</dt>
                <dd>
                  <Link href={`/projects/${projectSlug}`} className="text-link inline-flex items-center gap-1">
                    케이스 스터디 보기 <ArrowUpRight aria-hidden size={14} />
                  </Link>
                </dd>
              </>
            )}
          </dl>
          <div className="col-span-12 lg:col-span-5 flex flex-col items-start gap-3 lg:pl-6 lg:border-l lg:border-hairline">
            <p className="font-code text-xs uppercase tracking-[0.12em] text-on-surface-muted">Try it · 써 보기</p>
            {item.externalUrl ? (
              <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex h-12 px-6 text-[15px]">
                데모 열기 <ArrowUpRight aria-hidden size={16} className="btn-arrow" />
              </a>
            ) : (
              <button type="button" disabled className="btn-outline inline-flex h-12 px-6 text-[15px]">
                데모 링크 준비 중
              </button>
            )}
            {item.repoUrl && (
              <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex h-12 px-6 text-[15px]">
                GitHub <ArrowUpRight aria-hidden size={16} />
              </a>
            )}
          </div>
        </div>
      </DocHeader>

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
