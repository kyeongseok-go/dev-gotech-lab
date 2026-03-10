import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedShowcase, STATUS_LABEL } from "@/lib/content";

const STATUS_COLOR: Record<string, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  wip: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  archived: "bg-muted text-muted-foreground",
};

export default function ShowcasePage() {
  const items = getPublishedShowcase();

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">AI Showcase</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        AI를 활용해 만든 실험적 도구와 미니앱 모음입니다.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground">등록된 항목이 없습니다.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.slug}
              className="flex flex-col rounded-lg border border-border p-5"
            >
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${STATUS_COLOR[item.status] ?? STATUS_COLOR.archived}`}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                {item.type && (
                  <span className="text-muted-foreground">{item.type}</span>
                )}
                {item.featured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                {item.summary}
              </p>

              {item.stack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                {item.externalUrl && (
                  <Link
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    사이트 보기
                  </Link>
                )}
                {item.repoUrl && (
                  <Link
                    href={item.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
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
