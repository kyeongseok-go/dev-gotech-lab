import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/db/services";
import { PageHeading } from "@/components/section/page-heading";
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
  description: "GoTechy에서 제공하는 도구와 서비스 모음입니다.",
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
  database: <Database size={24} />,
  monitoring: <BarChart3 size={24} />,
  archive: <Archive size={24} />,
  image: <ImageIcon size={24} />,
  terminal: <Terminal size={24} />,
  memory: <Cpu size={24} />,
};

function getServiceIcon(icon?: string | null) {
  if (icon && SERVICE_ICONS[icon]) return SERVICE_ICONS[icon];
  return <Database size={24} />;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <PageHeading
        eyebrow="Services · Registry"
        count={services.length}
        size="xl"
        title={
          <>
            Dynamic <span className="marker">Registry</span>.
          </>
        }
        lead={
          <>
            마이크로서비스, 내부 도구, 운영 환경의 목록입니다. <span className="text-em">D1</span>과{" "}
            <span className="text-em">Cloudflare Workers</span>로 운영됩니다.
          </>
        }
      />

      {services.length === 0 ? (
        <section aria-labelledby="registry-title">
          <div className="lab-head mb-6">
            <span className="lab-index">§01</span>
            <h2 id="registry-title" className="type-label text-on-surface">Registry · 등록부</h2>
            <span className="font-code text-xs text-on-surface-muted tabular">D1 등록 0건</span>
          </div>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">서비스 등록부</caption>
            <thead>
              <tr className="border-b border-on-surface font-code text-[11px] uppercase tracking-[0.1em] text-on-surface-muted">
                <th scope="col" className="w-16 py-2 font-normal">No.</th>
                <th scope="col" className="py-2 font-normal">서비스</th>
                <th scope="col" className="hidden sm:table-cell py-2 font-normal">상태</th>
                <th scope="col" className="py-2 text-right font-normal">열기</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline">
                <td className="py-5 align-top font-code text-xs tabular text-on-surface-muted">R-01</td>
                <td className="py-5 pr-4">
                  <p className="type-title text-on-surface">AI 뉴스 애그리게이터</p>
                  <p className="mt-1 type-small text-on-surface-variant">AI·개발 관련 뉴스를 한곳에 모아 보는 화면. 수집기는 준비 중입니다.</p>
                </td>
                <td className="hidden sm:table-cell py-5 align-top">
                  <span className="badge-wip px-2 py-0.5 text-[11px]">준비 중</span>
                </td>
                <td className="py-5 align-top text-right">
                  <Link href="/services/news" className="text-link inline-flex items-center gap-1 text-sm">
                    보기 <ExternalLink aria-hidden size={13} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 font-code text-xs text-on-surface-muted">
            ※ D1 서비스 테이블에 등록되면 이 표가 자동으로 채워집니다.
          </p>
        </section>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-hairline">
          {services.map((svc, i) => {
            const badgeClass = STATUS_CLASS[svc.status] ?? STATUS_CLASS.archived;
            return (
              <li key={svc.slug} className="flex flex-col border-r border-b border-hairline p-6 md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-on-surface" aria-hidden>{getServiceIcon(svc.icon)}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-code text-xs tabular text-on-surface-muted">R-{String(i + 1).padStart(2, "0")}</span>
                    <span className={`${badgeClass} px-2 py-0.5 text-[11px]`}>{STATUS_LABEL[svc.status] ?? svc.status}</span>
                  </span>
                </div>
                <h2 className="mt-6 type-title text-on-surface">{svc.title}</h2>
                <p className="mt-2 flex-1 type-small text-on-surface-variant">{svc.description}</p>
                <div className="mt-6 flex items-center gap-5 border-t border-hairline pt-4 text-sm">
                  {svc.url ? (
                    <Link href={svc.url} className="text-link inline-flex items-center gap-1">
                      {svc.status === "live" ? "열기" : "미리보기"}
                      <ExternalLink aria-hidden size={13} />
                    </Link>
                  ) : (
                    <span className="text-on-surface-muted">{svc.status === "archived" ? "운영 종료" : "준비 중"}</span>
                  )}
                  {svc.repo_url && (
                    <Link href={svc.repo_url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
                      저장소 <Code aria-hidden size={13} />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
