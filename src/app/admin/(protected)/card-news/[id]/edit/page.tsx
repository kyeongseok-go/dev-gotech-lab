import { notFound } from "next/navigation";
import { getCardNewsById } from "@/lib/db/card-news";
import { CardNewsForm } from "@/components/admin/card-news-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCardNewsPage({ params }: Props) {
  const { id } = await params;
  const item = await getCardNewsById(Number(id));

  if (!item) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">카드뉴스 수정</h1>
      <div className="mx-auto max-w-2xl">
        <CardNewsForm
          mode="edit"
          initial={{
            id: item.id,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            category: item.category,
            image_url: item.image_url,
            external_link: item.external_link,
            tags: item.tags,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}
