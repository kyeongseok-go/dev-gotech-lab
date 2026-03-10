import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getServices } from "@/lib/db/services";

const STATUS_LABEL: Record<string, string> = {
  live: "운영중",
  wip: "준비중",
  archived: "종료",
};

const STATUS_COLOR: Record<string, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  wip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  archived: "bg-muted text-muted-foreground",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">서비스</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        gotech.lab에서 제공하는 도구와 서비스 모음입니다.
      </p>

      {services.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            등록된 서비스가 없습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            서비스가 준비되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {services.map((svc) => (
            <li
              key={svc.slug}
              className="flex flex-col rounded-lg border border-border p-5 transition-colors hover:bg-muted/30"
            >
              {/* 상단 뱃지 */}
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${STATUS_COLOR[svc.status] ?? STATUS_COLOR.archived}`}
                >
                  {STATUS_LABEL[svc.status] ?? svc.status}
                </span>
                {svc.featured === 1 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
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
              <div className="mt-4">
                {svc.url ? (
                  <Link
                    href={svc.url}
                    className={
                      svc.status === "live"
                        ? "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        : "text-sm text-primary underline underline-offset-4 hover:text-primary/80"
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
                    className="ml-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    GitHub
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
