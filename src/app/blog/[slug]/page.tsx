import { PageContainer } from "@/components/layout/page-container";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">{slug}</h1>
      <p className="mt-3 text-muted-foreground">글 상세 내용이 여기에 표시됩니다. (Day 3에서 구현)</p>
    </PageContainer>
  );
}
