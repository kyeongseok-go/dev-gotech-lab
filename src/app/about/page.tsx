import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SubscribeForm } from "@/components/subscribe-form";
import { Mail, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "소개",
  description: "오피스 SW 엔진 개발자의 기술 블로그 · 포트폴리오 · AI 실험 공간입니다.",
  alternates: { canonical: "/about" },
};

const PROFILE = {
  name: "고경석",
  headline:
    "Tmax A&C에서 5년간 오피스 SW 엔진을 개발한 경험을 토대로, AI를 활용해 빠르게 제품을 만들고 실험하는 AI Builder로 전환 중인 개발자입니다.",
  email: "kugll9606@gmail.com",
  github: "https://github.com/kyeongseok-go",
};

const CAREER = [
  { year: "2019", title: "Office SW 안정화 & QA 시스템 구축", role: "초급 개발자", highlight: "ToHangul·WaplPoint 안정화, TestLink 기반 QA 자동화" },
  { year: "2020", title: "공통 엔진 모듈 설계 & 클라우드 연동", role: "백엔드 개발자", highlight: "PieceTree 텍스트 엔진, Node.js + Tibero ODBC, Docker 환경 구축" },
  { year: "2021", title: "양식개체 시스템 & 검색 기능 고도화", role: "프론트엔드 개발자", highlight: "EditBox·ComboBox DOM/Render, Find/Replace 검색 성능 50% 향상" },
  { year: "2022", title: "SuperPoint Architecture 설계 & React 전환", role: "시스템 아키텍트", highlight: "프레젠테이션 엔진 React 전환, Slide 계층 구조 설계" },
  { year: "2023", title: "공동편집 Message Handler & 썸네일 최적화", role: "성능 최적화", highlight: "실시간 공동편집, html-to-image + pdf.js 썸네일 40% 성능 향상" },
  { year: "2024", title: "Theme/ClrMap 시스템 & 테스트 자동화", role: "풀스택 개발자", highlight: "색상 오차율 0% 달성, Jest 테스트 커버리지 95%, 완전 문서화" },
];

const SKILLS = {
  "Languages": ["TypeScript", "JavaScript", "Java", "Node.js"],
  "Frontend": ["React", "Next.js", "Tailwind CSS", "HTML/CSS"],
  "Backend & DB": ["Tibero ODBC", "Docker", "Liquibase", "REST API"],
  "Tools & QA": ["Git", "Jest", "TestLink", "pdf.js", "html-to-image"],
};

const INTERESTS = [
  { label: "AI 활용 개발", desc: "AI로 빠르게 MVP를 만들고 실험하는 워크플로우" },
  { label: "웹 풀스택", desc: "Next.js + Cloudflare 기반 서비스 구축" },
  { label: "개발 기록", desc: "블로그를 통한 학습 과정 공유와 포트폴리오 관리" },
  { label: "그 외", desc: "운동, 신앙, 취미 활동을 통한 균형 잡힌 생활" },
];

export default function AboutPage() {
  return (
    <main className="pt-32 pb-20 px-8 max-w-4xl mx-auto">
      {/* Profile Section */}
      <section className="mb-20">
        <div className="flex flex-col sm:flex-row items-start gap-8">
          <div className="relative h-40 w-40 md:h-48 md:w-48 flex-shrink-0 overflow-hidden rounded-2xl">
            <div className="ambient-glow absolute -inset-2" />
            <Image
              src="/images/profile-career.jpg"
              alt="고경석 프로필"
              fill
              className="relative object-cover rounded-2xl"
              style={{ objectPosition: "50% 15%" }}
              sizes="(max-width: 768px) 160px, 192px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2">
              {PROFILE.name}
            </h1>
            <p className="text-do-primary font-headline font-medium text-sm uppercase tracking-widest mb-4">
              AI Builder &middot; Full-stack Developer
            </p>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              {PROFILE.headline}
            </p>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="mb-20">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-8">
          <span className="w-8 h-[2px] bg-do-primary" /> 경력 요약
        </h2>
        {/* 경력 사진 카드 */}
        <div className="obsidian-card p-0 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* 사진 */}
            <div className="md:col-span-4 relative min-h-[200px] md:min-h-0">
              <div className="ambient-glow-subtle absolute -inset-1" />
              <Image
                src="/images/profile-hero.jpg"
                alt="고경석 프로필"
                fill
                className="object-cover object-[center_20%]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            {/* 텍스트 */}
            <div className="md:col-span-8 p-8 flex flex-col justify-center">
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">Tmax A&C</h3>
              <p className="text-do-primary font-code text-sm mb-4">2019.08 – 2024.12 &middot; 5년 5개월</p>
              <p className="text-on-surface-variant leading-relaxed">
                오피스 SW 엔진 개발 — 프레젠테이션 엔진, 공동편집, 양식개체 시스템,
                테마/색상 시스템 등 핵심 모듈 설계 및 구현
              </p>
            </div>
          </div>
        </div>

        {/* 타임라인 */}
        <div className="timeline-connector space-y-6">
          {CAREER.map((item, i) => (
            <div
              key={item.year}
              className="obsidian-card p-6 flex gap-6 items-start relative"
            >
              <div className="timeline-dot" style={{ top: "1.75rem" }} />
              <div className="flex-shrink-0 w-12 h-12 bg-do-primary/10 text-do-primary rounded-sm flex items-center justify-center font-headline font-bold text-lg">
                {item.year.slice(-2)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-headline font-bold text-on-surface">{item.title}</h3>
                  <span className="badge-wip text-[10px] font-bold px-2 py-0.5">
                    {item.role}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-20">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-8">
          <span className="w-8 h-[2px] bg-do-primary" /> 기술 스택
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.entries(SKILLS).map(([category, items]) => (
            <div key={category} className="obsidian-card p-6">
              <h3 className="font-headline text-sm font-bold text-do-primary uppercase tracking-widest mb-4">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-surface-container-high rounded-sm text-on-surface-variant font-code text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section className="mb-20">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-8">
          <span className="w-8 h-[2px] bg-do-primary" /> 관심 분야
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {INTERESTS.map((item) => (
            <div key={item.label} className="obsidian-card p-6">
              <h3 className="font-headline font-bold text-white mb-2">{item.label}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About this site */}
      <section className="mb-20">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-6">
          <span className="w-8 h-[2px] bg-do-primary" /> 이 사이트에 대해
        </h2>
        <p className="text-on-surface-variant leading-relaxed text-lg">
          <strong className="text-white">gotech.lab</strong>은 기술 블로그,
          포트폴리오, AI 실험 결과, 그리고 작은 서비스들을 한 곳에 모아 공유하기
          위해 만들었습니다. Next.js 16 + Tailwind CSS v4 + Velite MDX로
          구성되어 있으며, Cloudflare Pages에 배포됩니다.
        </p>
      </section>

      {/* Subscribe */}
      <section className="mb-20 obsidian-card p-8 border border-do-primary/10">
        <h2 className="font-headline text-xl font-bold text-white mb-2">소식 받기</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          AI 실험, 개발 기록, 새 서비스 업데이트를 이메일로 받아보세요.
        </p>
        <SubscribeForm />
      </section>

      {/* Contact */}
      <section>
        <h2 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3 mb-6">
          <span className="w-8 h-[2px] bg-do-primary" /> 연락
        </h2>
        <div className="flex gap-6">
          <a
            href={`mailto:${PROFILE.email}`}
            className="obsidian-card px-6 py-4 flex items-center gap-3 text-sm text-on-surface-variant hover:text-do-primary transition-colors"
          >
            <Mail size={18} className="text-do-primary" />
            {PROFILE.email}
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="obsidian-card px-6 py-4 flex items-center gap-3 text-sm text-on-surface-variant hover:text-do-primary transition-colors"
          >
            <Github size={18} className="text-do-primary" />
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
