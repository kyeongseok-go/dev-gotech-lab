import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/layout/page-container";
import { SubscribeForm } from "@/components/subscribe-form";
import { AboutTimeline } from "./about-timeline";

export const metadata: Metadata = {
  title: "소개",
  description:
    "오피스 SW 엔진 개발자의 기술 블로그 · 포트폴리오 · AI 실험 공간입니다.",
  alternates: { canonical: "/about" },
};

const SKILLS = {
  Languages: ["TypeScript", "JavaScript", "Java", "Node.js"],
  Frontend: ["React", "Next.js", "Tailwind CSS", "HTML/CSS"],
  "Backend & DB": ["Tibero ODBC", "Docker", "Liquibase", "REST API"],
  "Tools & QA": ["Git", "Jest", "TestLink", "pdf.js", "html-to-image"],
};

const INTERESTS = [
  {
    label: "AI 활용 개발",
    desc: "AI로 빠르게 MVP를 만들고 실험하는 워크플로우",
  },
  {
    label: "웹 풀스택",
    desc: "Next.js + Cloudflare 기반 서비스 구축",
  },
  {
    label: "개발 기록",
    desc: "블로그를 통한 학습 과정 공유와 포트폴리오 관리",
  },
  {
    label: "그 외",
    desc: "운동, 신앙, 취미 활동을 통한 균형 잡힌 생활",
  },
];

export default function AboutPage() {
  return (
    <PageContainer className="max-w-4xl">
      {/* 소개 — 프로필 카드 */}
      <section className="mb-14">
        <div className="flex items-start gap-6">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-border sm:h-32 sm:w-32">
            <Image
              src="/images/profile.png"
              alt="고경석 프로필"
              fill
              className="object-cover"
              style={{ objectPosition: "50% 8%" }}
              sizes="128px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">고경석</h1>
            <p className="mt-1.5 text-sm font-semibold text-primary">
              AI Builder &middot; Full-stack Developer
            </p>
            <p className="mt-3 leading-7 text-muted-foreground">
              Tmax A&C에서 5년간 오피스 SW 엔진을 개발한 경험을 토대로, AI를
              활용해 빠르게 제품을 만들고 실험하는 AI Builder로 전환 중인
              개발자입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 경력 타임라인 — Aceternity Timeline 스타일 */}
      <section className="mb-14">
        <h2 className="section-heading mb-8 text-lg font-bold">경력 타임라인</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Tmax A&C &middot; 오피스 SW 엔진 개발 (2019.08 &ndash; 2024.12)
        </p>
        <AboutTimeline />
      </section>

      {/* 기술 스택 */}
      <section className="mb-14">
        <h2 className="section-heading mb-8 text-lg font-bold">기술 스택</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(SKILLS).map(([category, items]) => (
            <div key={category} className="list-card">
              <h3 className="mb-3 text-sm font-semibold">{category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <span key={skill} className="tag-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 관심 분야 */}
      <section className="mb-14">
        <h2 className="section-heading mb-8 text-lg font-bold">관심 분야</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {INTERESTS.map((item) => (
            <li key={item.label} className="list-card">
              <p className="font-semibold">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 이 사이트에 대해 */}
      <section className="mb-14">
        <h2 className="section-heading mb-6 text-lg font-bold">
          이 사이트에 대해
        </h2>
        <p className="leading-7 text-muted-foreground">
          <strong className="text-foreground">gotech.lab</strong>은 기술 블로그,
          포트폴리오, AI 실험 결과, 그리고 작은 서비스들을 한 곳에 모아 공유하기
          위해 만들었습니다. Next.js 15 + Tailwind CSS v4 + Velite MDX로
          구성되어 있으며, Cloudflare Pages에 배포됩니다.
        </p>
      </section>

      {/* 구독 */}
      <section className="mb-14 list-card !py-8">
        <h2 className="mb-2 text-lg font-bold">소식 받기</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          AI 실험, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
        </p>
        <SubscribeForm />
      </section>

      {/* 연락 */}
      <section className="mb-14">
        <h2 className="section-heading mb-6 text-lg font-bold">연락</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="mailto:kugll9606@gmail.com"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              kugll9606@gmail.com
            </a>
          </li>
          <li>
            <a
              href="https://github.com/kyeongseok-go"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              GitHub &rarr;
            </a>
          </li>
        </ul>
      </section>
    </PageContainer>
  );
}
