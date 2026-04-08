import Link from "next/link";
import Image from "next/image";
import {
  getPublishedBlogs,
  getPublishedProjects,
  getPublishedShowcase,
  formatDate,
  STATUS_LABEL,
} from "@/lib/content";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function Home() {
  const blogs = getPublishedBlogs().slice(0, 3);
  const projects = getPublishedProjects().slice(0, 2);
  const showcaseItems = getPublishedShowcase().slice(0, 3);

  return (
    <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      {/* ── Hero Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
        <div className="lg:col-span-7">
          <h1
            className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6"
          >
            Gotekie&apos;s
            <br />
            <span className="text-do-primary">Developer Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed mb-8">
            오피스 SW 엔진 5년 경험 위에,{" "}
            <span className="text-white font-semibold">Next.js</span>와{" "}
            <span className="text-white font-semibold">Cloudflare</span>로
            고성능 디지털 환경을 구축합니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="btn-primary px-8 py-4 rounded-lg text-sm"
            >
              View Projects
            </Link>
            <Link
              href="/blog"
              className="btn-outline px-8 py-4 rounded-lg text-sm"
            >
              Read Blog
            </Link>
          </div>
        </div>

        {/* Profile Image */}
        <div className="lg:col-span-5 relative group">
          <div className="ambient-glow absolute -inset-2" style={{ filter: "blur(28px)" }} />
          <div className="relative bg-surface-container-low p-2 rounded-2xl overflow-hidden aspect-[3/4] max-h-[500px]">
            <Image
              src="/images/profile-hero.jpg"
              alt="고경석 프로필"
              width={400}
              height={533}
              className="w-full h-full object-cover object-[center_15%] rounded-xl"
              priority
            />
            {/* 하단 fade-out 오버레이 */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-xl pointer-events-none"
              style={{ background: "linear-gradient(transparent, var(--do-surface))" }}
            />
          </div>
        </div>
      </section>

      {/* ── Featured Projects (Asymmetric) ── */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tighter uppercase">
            Featured Projects
          </h2>
          <Link
            href="/projects"
            className="text-do-primary font-headline font-bold text-sm tracking-widest uppercase flex items-center gap-2 group"
          >
            View All{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              등록된 프로젝트가 없습니다.
            </p>
          ) : (
            projects.map((project, i) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className={`obsidian-card p-8 group ${i === 1 ? "mt-0 md:mt-12" : ""}`}
              >
                {project.techStack.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="bg-do-primary/10 text-do-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="font-headline text-2xl font-bold mb-3">
                  {project.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  {project.summary}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── Bento Grid: Blog & AI Showcase ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32">
        {/* Blog Posts */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="font-headline text-3xl font-bold tracking-tighter uppercase mb-8">
            Latest Insights
          </h2>
          {blogs.length === 0 ? (
            <p className="text-on-surface-variant text-sm">
              아직 작성된 글이 없습니다.
            </p>
          ) : (
            blogs.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="obsidian-card p-6 flex flex-col md:flex-row gap-6 items-center group block"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {post.category && (
                      <span className="text-do-primary text-[10px] font-bold uppercase tracking-widest">
                        {post.category}
                      </span>
                    )}
                    <span className="text-on-surface-variant text-[10px]">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white group-hover:text-do-primary transition-colors">
                    {post.title}
                  </h4>
                  {post.description && (
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* AI Showcase Sidebar */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-8 border border-do-primary/10">
          <h2
            className="font-headline text-xl font-bold tracking-tighter uppercase mb-8 flex items-center gap-2"
          >
            <Sparkles size={18} className="text-do-primary" />
            AI Showcase
          </h2>
          <div className="space-y-6">
            {showcaseItems.length === 0 ? (
              <p className="text-on-surface-variant text-xs">
                등록된 항목이 없습니다.
              </p>
            ) : (
              showcaseItems.map((item) => {
                const statusClass =
                  item.status === "live"
                    ? "badge-live"
                    : item.status === "wip"
                      ? "badge-wip"
                      : "badge-archived";
                return (
                  <Link
                    key={item.slug}
                    href={`/showcase/${item.slug}`}
                    className={`block p-4 bg-surface-container-highest rounded-lg group ${
                      item.status === "archived" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-bold text-white group-hover:text-do-primary transition-colors">
                        {item.title}
                      </h5>
                      <span
                        className={`${statusClass} text-[10px] font-bold px-2 py-0.5`}
                      >
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
                      {item.summary}
                    </p>
                    {item.stack.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {item.stack.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] text-do-primary font-code"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="obsidian-card p-12 text-center border border-do-primary/10">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-4">
          Go !! Build the Technology, Live Easier.
        </h2>
        <p className="text-on-surface-variant mb-8 max-w-lg mx-auto leading-relaxed">
          가자!! 기술을 만들고, 더 쉽게 살자.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/subscribe"
            className="btn-primary px-8 py-4 rounded-lg text-sm"
          >
            소식 받기
          </Link>
          <Link
            href="/about"
            className="btn-outline px-8 py-4 rounded-lg text-sm"
          >
            더 알아보기
          </Link>
        </div>
      </section>
    </main>
  );
}
