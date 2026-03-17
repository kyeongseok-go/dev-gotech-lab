import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getServices } from "@/lib/db/services";

export const metadata: Metadata = {
  title: "서비스",
  description: "gotech.lab에서 제공하는 도구와 서비스 모음입니다.",
  alternates: { canonical: "/services" },
};

const STATUS_LABEL: Record<string, string> = {
  live: "운영중",
  wip: "준비중",
  archived: "종료",
};

const STATUS_CLASS: Record<string, string> = {
  live: "status-badge status-live",
  wip: "status-badge status-wip",
  archived: "status-badge status-archived",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold tracking-tight">서비스</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        gotech.lab에서 제공하는 도구와 서비스 모음입니다.
      </p>

      {services.length === 0 ? (
        <div className="list-card text-center py-12">
          <p className="text-muted-foreground">
            등록된 서비스가 없습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            서비스가 준비되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((svc) => (
            <li key={svc.slug}>
              <div className="list-card flex flex-col">
                {/* 상단 뱃지 */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={STATUS_CLASS[svc.status] ?? STATUS_CLASS.archived}>
                    {STATUS_LABEL[svc.status] ?? svc.status}
                  </span>
                  {svc.featured === 1 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Featured
                    </span>
                  )}
                </div>

                {/* 제목 · 설명 */}
                <h2 className="mt-3 text-lg font-semibold">{svc.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {svc.description}
                </p>

                {/* 링크 */}
                <div className="mt-4 flex items-center gap-3">
                  {svc.url ? (
                    <Link
                      href={svc.url}
                      className={
                        svc.status === "live"
                          ? "rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                          : "text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      }
                    >
                      {svc.status === "live" ? "바로가기" : "미리보기"}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      곧 공개 예정
                    </span>
                  )}
                  {svc.repo_url && (
                    <Link
                      href={svc.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      GitHub &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
