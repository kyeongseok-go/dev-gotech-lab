import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProjects } from "@/lib/content";
import { ExternalLink, Code, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/section/page-heading";
import { ColorCard, COLOR_VARIANTS } from "@/components/section/color-card";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "진행 중이거나 완료된 프로젝트 목록입니다.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const items = getPublishedProjects();

  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      <PageHeading
        eyebrow="Projects · Portfolio"
        count={items.length}
        size="xl"
        title={
          <>
            <span className="display-accent display-accent-amber">Shipped</span><br />
            things.
          </>
        }
        lead={
          <>
            직접 설계하고 구현한 프로젝트 목록입니다.
            <span className="text-em"> Office SW 엔진</span>부터
            <span className="text-em"> AI 빠른 빌드</span>까지.
          </>
        }
      />

      {items.length === 0 ? (
        <p className="type-body text-on-surface-variant">등록된 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {items.map((project, i) => {
            const pattern = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
            const colSpan = pattern[i % 4];
            const colorIdx = i % COLOR_VARIANTS.length;
            return (
              <Reveal key={project.slug} index={i} className={`col-span-12 ${colSpan}`} as="div">
                <Link href={`/projects/${project.slug}`} className="tilt-card block h-full">
                  <ColorCard index={colorIdx} className="p-7 md:p-8 h-full flex flex-col min-h-[280px]">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-code text-[10px] uppercase tracking-widest opacity-85">
                        {project.period ?? "Project"}
                        {project.role && ` · ${project.role}`}
                      </span>
                      {project.featured ? (
                        <span className="font-code text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-black/20">
                          Featured
                        </span>
                      ) : (
                        <ArrowUpRight size={18} className="opacity-75" />
                      )}
                    </div>

                    <h2 className="font-headline text-2xl md:text-3xl font-semibold leading-tight mb-3">
                      {project.title}
                    </h2>
                    <p className="type-small c-sub line-clamp-3 mb-5">
                      {project.summary}
                    </p>

                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                        {project.techStack.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="font-code text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-black/15"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-black/15">
                      <span className="font-code text-[10px] uppercase tracking-widest font-semibold inline-flex items-center gap-1">
                        View Detail
                        <ArrowUpRight size={12} />
                      </span>
                      {project.repoUrl && (
                        <span className="font-code text-[10px] uppercase tracking-widest inline-flex items-center gap-1 opacity-80">
                          <Code size={12} /> Repo
                        </span>
                      )}
                      {project.demoUrl && (
                        <span className="font-code text-[10px] uppercase tracking-widest inline-flex items-center gap-1 opacity-80">
                          <ExternalLink size={12} /> Demo
                        </span>
                      )}
                    </div>
                  </ColorCard>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
