import type { Metadata } from "next";
import { SubscribeForm } from "@/components/subscribe-form";
import { PageHeading } from "@/components/section/page-heading";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "구독",
  description: "새 글과 서비스 업데이트를 이메일로 받아보세요.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-3xl mx-auto">
      <PageHeading
        eyebrow="Newsletter · Subscribe"
        size="xl"
        title={
          <>
            소식 <span className="display-accent">받기</span>.
          </>
        }
        lead={
          <>
            <span className="text-em">AI 실험 결과</span>, 개발 기록, 새 서비스 업데이트를
            이메일로 보내드립니다. 스팸 없이, 의미 있는 내용만.
          </>
        }
      />
      <Reveal>
        <div className="cta-atmos p-8 md:p-12">
          <SubscribeForm />
          <p className="mt-6 font-code text-xs text-on-surface-muted">
            구독은 언제든 해지할 수 있습니다.
          </p>
        </div>
      </Reveal>
    </main>
  );
}
