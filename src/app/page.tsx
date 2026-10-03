import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  getPublishedBlogs,
  getPublishedProjects,
  getPublishedShowcase,
  getReadingTime,
  getSeriesLabel,
  STATUS_LABEL,
} from "@/lib/content";
import { formatDateDot, padNumber } from "@/lib/format";
import { HomeHero } from "@/components/home/home-hero";
import { LabStats } from "@/components/home/lab-stats";
import { StackTicker } from "@/components/home/stack-ticker";
import { MethodSection } from "@/components/home/method-section";
import { LabHead } from "@/components/section/lab-head";
import { PostRow } from "@/components/blog/post-row";
import { Badge } from "@/components/reui/badge";
import { CARD_NEWS_DATA } from "@/app/card-news/page";
import { toCardView } from "@/lib/card-news";

/** 연구 노트 시작 이후 엔진 개발 경력 (5년 5개월) */
const ENGINE_MONTHS = 65;

const STATUS_BADGE: Record<string, string> = {
  live: "badge-live",
  wip: "badge-wip",
  archived: "badge-archived",
};

function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-on-surface hover:text-do-primary transition-colors"
    >
      {label}
      <ArrowUpRight
        aria-hidden
        size={14}
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

export default async function Home() {
  const allBlogs = getPublishedBlogs();
  const allProjects = getPublishedProjects();
  const allShowcase = getPublishedShowcase();

  const blogs = allBlogs.slice(0, 4);
  const [leadProject, ...restProjects] = allProjects.slice(0, 4);
  const showcaseItems = allShowcase.slice(0, 3);
  const latestCards = CARD_NEWS_DATA.slice(0, 3).map(toCardView);

  const stats = [
    { value: allBlogs.length, unit: "편", label: "개발 기록" },
    { value: allProjects.length, unit: "개", label: "프로젝트" },
    { value: allShowcase.length, unit: "개", label: "AI 쇼케이스" },
    { value: ENGINE_MONTHS, unit: "개월", label: "엔진 개발" },
  ];

  return (
    <main className="pt-24 md:pt-28 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <HomeHero
        entryNumber={padNumber(allBlogs.length)}
        lastEntryDate={allBlogs[0] ? formatDateDot(allBlogs[0].date) : "—"}
      />
      <LabStats stats={stats} />
      <StackTicker />

      {/* §01 — 프로젝트: 커버 1건 + 목록 */}
      <section aria-labelledby="works-title" className="mt-24 md:mt-32">
        <LabHead
          index="01"
          id="works-title"
          title="Feat. works · 프로젝트"
          meta={<MoreLink href="/projects" label={`전체 ${padNumber(allProjects.length, 2)}`} />}
        />
        {!leadProject ? (
          <p className="type-small text-on-surface-muted">등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <Link
              href={`/projects/${leadProject.slug}`}
              className="group col-span-12 lg:col-span-7 flex flex-col justify-between gap-10 min-h-[22rem] p-6 md:p-8 lab-grid bg-surface-container-low border border-hairline transition-colors hover:border-outline"
            >
              <div className="flex items-start justify-between gap-4 font-code text-xs text-on-surface-muted">
                <span className="text-do-primary">P-01 · featured</span>
                <span className="tabular">{leadProject.period ?? "—"}</span>
              </div>
              <div>
                <h3 className="type-display text-on-surface group-hover:text-do-primary transition-colors">
                  {leadProject.title}
                </h3>
                <p className="mt-5 type-body text-on-surface-variant max-w-xl line-clamp-3">
                  {leadProject.summary}
                </p>
                {leadProject.techStack.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {leadProject.techStack.slice(0, 5).map((tech: string) => (
                      <Badge key={tech} variant="outline" size="sm" className="bg-page">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>

            <ol className="col-span-12 lg:col-span-5 border-b border-hairline">
              {restProjects.map((project, i) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group grid grid-cols-[3rem_1fr_auto] gap-x-3 py-5 border-t border-hairline hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-code text-xs text-on-surface-muted tabular pt-1 pl-1">
                      P-{padNumber(i + 2, 2)}
                    </span>
                    <div>
                      <h3 className="type-title text-on-surface group-hover:text-do-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-1 type-small text-on-surface-variant line-clamp-2">{project.summary}</p>
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      size={16}
                      className="mt-1 mr-1 text-on-surface-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* §02 — 방법론 */}
      <div className="mt-24 md:mt-32">
        <MethodSection />
      </div>

      {/* §03 — 최신 기록: 잡지 목차 */}
      <section aria-labelledby="insights-title" className="mt-24 md:mt-32">
        <LabHead
          index="03"
          id="insights-title"
          title="Latest entries · 최신 기록"
          meta={<MoreLink href="/blog" label={`전체 ${padNumber(allBlogs.length)}`} />}
        />
        {blogs.length === 0 ? (
          <p className="type-small text-on-surface-muted">아직 작성된 글이 없습니다.</p>
        ) : (
          <div className="border-b border-hairline">
            {blogs.map((post, i) => (
              <PostRow
                key={post.slug}
                post={post}
                number={allBlogs.length - i}
                dateLabel={formatDateDot(post.date)}
                readingMinutes={getReadingTime(post.body)}
                seriesLabel={getSeriesLabel(post.slug)}
                isLead={i === 0}
                headingLevel="h3"
              />
            ))}
          </div>
        )}
      </section>

      {/* §04 — AI 쇼케이스: 헤어라인 3열 표 */}
      <section aria-labelledby="showcase-title" className="mt-24 md:mt-32">
        <LabHead
          index="04"
          id="showcase-title"
          title="AI showcase · 실험품"
          meta={<MoreLink href="/showcase" label={`전체 ${padNumber(allShowcase.length, 2)}`} />}
        />
        {showcaseItems.length === 0 ? (
          <p className="type-small text-on-surface-muted">등록된 항목이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
            {showcaseItems.map((item, i) => (
              <li key={item.slug} className="bg-page">
                <Link
                  href={`/showcase/${item.slug}`}
                  className="group flex h-full flex-col gap-8 p-6 md:p-7 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-code text-xs text-on-surface-muted tabular">S-{padNumber(i + 1, 2)}</span>
                    <span className={`${STATUS_BADGE[item.status] ?? "badge-archived"} px-2 py-0.5 text-[11px]`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="type-title text-on-surface group-hover:text-do-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 type-small text-on-surface-variant line-clamp-3">{item.summary}</p>
                  </div>
                  {item.stack.length > 0 && (
                    <p className="font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">
                      {item.stack.slice(0, 3).join(" / ")}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* §05 — 카드뉴스: 다크 밴드 + 최신 3장 */}
      <section aria-labelledby="cardnews-title" className="mt-24 md:mt-32">
        <LabHead index="05" id="cardnews-title" title="Card news · 오늘의 기술" meta="Daily · 원문 발췌 + 출처" />
        <div className="band-inverse p-6 md:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <p className="col-span-12 md:col-span-8 type-display text-on-surface">
              하루 한 장, <span className="marker">기술 뉴스</span> 카드.
            </p>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <p className="type-small text-on-surface-variant">
                AI 회사 공식 발표·커뮤니티·국내 테크블로그에서 그날의 소식을 골라 원문 발췌와 출처를 함께 정리합니다.
              </p>
              <Link href="/card-news" className="btn-outline mt-5 inline-flex h-11 px-5 text-sm">
                카드뉴스 전체 보기
                <ArrowUpRight aria-hidden size={16} />
              </Link>
            </div>
          </div>
          <ul className="mt-10 grid gap-px bg-hairline border border-hairline md:grid-cols-3">
            {latestCards.map((card) => (
              <li key={card.id} className="bg-surface-container">
                <Link
                  href={`/card-news/${card.id}`}
                  className="group flex h-full flex-col gap-3 border-t-4 border-do-primary p-5 transition-colors hover:bg-surface-container-high"
                >
                  <span className="font-code text-xs tabular text-on-surface-muted">
                    <span className="font-bold text-on-surface">{card.serial}</span> · {card.dateDot}
                  </span>
                  <span className="type-title text-on-surface line-clamp-3 group-hover:text-do-primary transition-colors">
                    {card.title}
                  </span>
                  {card.source && (
                    <span className="mt-auto font-code text-[11px] text-on-surface-muted">{card.source.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 마무리 CTA — Tailark OSS Mist "call-to-action-1" 구조 참고 (MIT) */}
      <section aria-labelledby="cta-title" className="mt-24 md:mt-32 border-t border-on-surface pt-10 md:pt-14">
        <div className="grid grid-cols-12 gap-6 items-end">
          <h2 id="cta-title" className="col-span-12 lg:col-span-8 type-display-xl text-on-surface">
            Let&apos;s build
            <br />
            <span className="marker">together.</span>
          </h2>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:items-end">
            <p className="type-body text-on-surface-variant lg:text-right">가자!! 기술을 만들고, 더 쉽게 살자.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/subscribe" className="btn-primary inline-flex h-12 px-6 text-[15px]">
                소식 받기
                <ArrowUpRight aria-hidden size={16} className="btn-arrow" />
              </Link>
              <Link href="/about" className="btn-outline inline-flex h-12 px-6 text-[15px]">
                프로젝트 상의하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
