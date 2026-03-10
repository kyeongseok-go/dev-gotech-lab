import { PageContainer } from "@/components/layout/page-container";

export default function Home() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">안녕하세요, gotech.lab입니다.</h1>
      <p className="mt-3 text-muted-foreground">개인 홈페이지 · 기술 블로그 · 서비스 플랫폼</p>
    </PageContainer>
  );
}
