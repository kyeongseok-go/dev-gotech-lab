import { PageContainer } from "@/components/layout/page-container";
import { SubscribeForm } from "@/components/subscribe-form";

export default function SubscribePage() {
  return (
    <PageContainer className="max-w-xl">
      <h1 className="text-2xl font-semibold">구독</h1>
      <p className="mt-3 mb-8 leading-7 text-muted-foreground">
        AI 실험 결과, 개발 기록, 새로운 서비스 업데이트 소식을 이메일로
        받아보세요. 스팸 없이, 의미 있는 내용만 보내드립니다.
      </p>
      <SubscribeForm />
      <p className="mt-6 text-xs text-muted-foreground">
        구독은 언제든 해지할 수 있습니다.
      </p>
    </PageContainer>
  );
}
