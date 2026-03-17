import Link from "next/link";
import { getAllCardNews } from "@/lib/db/card-news";
import { CardNewsDeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  dev: "개발",
  trend: "트렌드",
  news: "뉴스",
};

export default async function AdminCardNewsPage() {
  const items = await getAllCardNews();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">카드뉴스 관리</h1>
        <Link
          href="/admin/card-news/new"
          className="btn-glow rounded-xl px-5 py-2 text-sm"
        >
          새 카드뉴스
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <p className="text-muted-foreground">등록된 카드뉴스가 없습니다.</p>
          <Link
            href="/admin/card-news/new"
            className="mt-3 inline-block text-sm font-medium text-primary"
          >
            첫 카드뉴스 작성하기 &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">제목</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">카테고리</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">날짜</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.published
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.published ? "bg-green-500" : "bg-muted-foreground"}`} />
                      {item.published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.created_at?.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/card-news/${item.id}/edit`}
                        className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
                      >
                        수정
                      </Link>
                      <CardNewsDeleteButton id={item.id} title={item.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
