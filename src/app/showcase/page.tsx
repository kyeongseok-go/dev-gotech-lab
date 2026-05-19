import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedShowcase, STATUS_LABEL } from "@/lib/content";
import { ExternalLink, Code, ArrowUpRight } from "lucide-react";
import { PageHeading } from "@/components/section/page-heading";
import { ColorCard, COLOR_VARIANTS } from "@/components/section/color-card";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "AI Showcase",
  description: "AI를 활용해 만든 실험과 프로토타입 모음입니다.",
  alternates: { canonical: "/showcase" },
};

export default function ShowcasePage() {
  const items = getPublishedShowcase();

  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
      <PageHeading
        eyebrow="AI Showcase · Experiments"
        count={items.length}
        size="xl"
        title={
          <>
            <span className="display-accent display-accent-cyan">Tiny</span><br />
            AI things.
          </>
        }
        lead={
          <>
            AI를 활용해 만든 <span className="text-em">실험적 도구</span>와
            <span className="text-em"> 미니앱</span>입니다.
            완성도보다 <span className="text-em-coral">속도와 학습</span>에 무게를 둡니다.
          </>
        }
      />

      {items.length === 0 ? (
        <div className="obsidian-card p-12 text-center">
          <p className="type-body text-on-surface-variant">등록된 항목이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, i) => {
            const colorIdx = i % COLOR_VARIANTS.length;
            return (
              <Reveal key={item.slug} index={i} as="div">
                <div className={`tilt-card h-full ${item.status === "archived" ? "opacity-70" : ""}`}>
                  <ColorCard
                    index={colorIdx}
                    className="p-7 md:p-8 h-full flex flex-col min-h-[300px]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-code text-[10px] tracking-widest opacity-85">
                        {STATUS_LABEL[item.status] ?? item.status}
                        {item.type && ` · ${item.type}`}
                      </span>
                      {item.featured ? (
                        <span className="font-code text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-black/20">
                          Featured
                        </span>
                      ) : (
                        <ArrowUpRight size={18} className="opacity-75" />
                      )}
                    </div>

                    <Link href={`/showcase/${item.slug}`}>
                      <h2 className="font-headline text-xl md:text-2xl font-semibold leading-tight mb-3">
                        {item.title}
                      </h2>
                    </Link>
                    <p className="type-small c-sub line-clamp-3 mb-5">
                      {item.summary}
                    </p>

                    {item.stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                        {item.stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="font-code text-[10px] uppercase tracking-wider opacity-80"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-black/15">
                      {item.externalUrl && (
                        <Link
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-code text-[10px] uppercase tracking-widest font-semibold inline-flex items-center gap-1 hover:underline underline-offset-4"
                        >
                          Demo <ExternalLink size={12} />
                        </Link>
                      )}
                      {item.repoUrl && (
                        <Link
                          href={item.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-code text-[10px] uppercase tracking-widest inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                        >
                          Repo <Code size={12} />
                        </Link>
                      )}
                    </div>
                  </ColorCard>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
