import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/db/services";
import {
  ExternalLink,
  Code,
  Database,
  BarChart3,
  Archive,
  Image as ImageIcon,
  Terminal,
  Cpu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "서비스",
  description: "gotech.lab에서 제공하는 도구와 서비스 모음입니다.",
  alternates: { canonical: "/services" },
};

const STATUS_LABEL: Record<string, string> = {
  live: "배포완료",
  wip: "개발중",
  archived: "보관됨",
};

const STATUS_CLASS: Record<string, string> = {
  live: "badge-live",
  wip: "badge-wip",
  archived: "badge-archived",
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  database: <Database size={28} />,
  monitoring: <BarChart3 size={28} />,
  archive: <Archive size={28} />,
  image: <ImageIcon size={28} />,
  terminal: <Terminal size={28} />,
  memory: <Cpu size={28} />,
};

function getServiceIcon(icon?: string | null) {
  if (icon && SERVICE_ICONS[icon]) return SERVICE_ICONS[icon];
  return <Database size={28} />;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="mb-20">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
          Dynamic <span className="text-do-primary">Registry</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          마이크로서비스, 내부 도구, 프로덕션 환경의 중앙 디렉토리입니다. D1과
          Cloudflare Workers로 운영됩니다.
        </p>
      </header>

      {/* Service Grid */}
      {services.length === 0 ? (
        <div className="obsidian-card p-12 text-center">
          <p className="text-on-surface-variant">
            등록된 서비스가 없습니다.
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            서비스가 준비되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {services.map((svc) => {
            const badgeClass =
              STATUS_CLASS[svc.status] ?? STATUS_CLASS.archived;
            return (
              <div
                key={svc.slug}
                className="group obsidian-card p-8 flex flex-col h-full"
              >
                {/* Icon & Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-surface-container-highest rounded-sm text-do-primary group-hover:scale-110 transition-transform">
                    {getServiceIcon(svc.icon)}
                  </div>
                  <span
                    className={`${badgeClass} text-[0.6875rem] font-bold px-2 py-1 uppercase tracking-wider`}
                  >
                    {STATUS_LABEL[svc.status] ?? svc.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-headline text-xl font-bold text-white mb-3 group-hover:text-do-primary transition-colors">
                  {svc.title}
                </h3>
                <p className="text-sm text-on-surface-variant mb-8 flex-grow leading-relaxed">
                  {svc.description}
                </p>

                {/* Links */}
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-outline-variant/15">
                  {svc.url ? (
                    <Link
                      href={svc.url}
                      className="text-do-primary text-xs font-bold uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-1"
                    >
                      {svc.status === "live" ? "Deployment" : "Preview"}
                      <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-50">
                      {svc.status === "archived" ? "Offline" : "Coming Soon"}
                    </span>
                  )}
                  {svc.repo_url && (
                    <Link
                      href={svc.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                      Repository
                      <Code size={12} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
