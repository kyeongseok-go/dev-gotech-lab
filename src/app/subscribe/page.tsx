import type { Metadata } from "next";
import { SubscribeForm } from "@/components/subscribe-form";

export const metadata: Metadata = {
  title: "구독",
  description: "새 글과 서비스 업데이트를 이메일로 받아보세요.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  return (
    <main className="pt-32 pb-20 px-8 max-w-xl mx-auto">
      <h1 className="font-headline text-4xl font-bold tracking-tighter text-white mb-4">
        구독
      </h1>
      <p className="text-on-surface-variant leading-relaxed mb-8">
        AI 실험 결과, 개발 기록, 새로운 서비스 업데이트 소식을 이메일로
        받아보세요. 스팸 없이, 의미 있는 내용만 보내드립니다.
      </p>
      <div className="obsidian-card p-8 border border-do-primary/10">
        <SubscribeForm />
      </div>
      <p className="mt-6 text-xs text-on-surface-variant">
        구독은 언제든 해지할 수 있습니다.
      </p>
    </main>
  );
}
