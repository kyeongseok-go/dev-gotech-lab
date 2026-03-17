import { CardNewsForm } from "@/components/admin/card-news-form";

export const dynamic = "force-dynamic";

export default function NewCardNewsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">새 카드뉴스 작성</h1>
      <div className="mx-auto max-w-2xl">
        <CardNewsForm mode="create" />
      </div>
    </div>
  );
}
