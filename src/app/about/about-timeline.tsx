"use client";

import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";
import {
  Code,
  Database,
  Search,
  Layers,
  Users,
  Palette,
  Cpu,
  Rocket,
} from "lucide-react";

const TIMELINE_DATA = [
  {
    title: "2019",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              Office SW 안정화 & QA 시스템 구축
            </h4>
            <span className="tag-badge">초급 개발자</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          ToHangul · WaplPoint 안정화 작업과 TestLink 기반 QA 자동화 시스템을
          구축했습니다. 오피스 SW 엔진의 기초 체력을 다진 시기입니다.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <span className="text-2xl font-bold text-primary">ToHangul</span>
            <p className="mt-1 text-xs text-muted-foreground">한글 입력 엔진</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <span className="text-2xl font-bold text-primary">TestLink</span>
            <p className="mt-1 text-xs text-muted-foreground">QA 자동화</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2020",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Database className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              공통 엔진 모듈 설계 & 클라우드 연동
            </h4>
            <span className="tag-badge">백엔드 개발자</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          PieceTree 기반 텍스트 엔진으로 메모리 효율을 극대화하고, Node.js +
          Tibero ODBC + Docker 환경을 구축했습니다.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-box">
            <span className="metric-value text-xl">40%</span>
            <span className="metric-label">성능 향상</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">PieceTree</span>
            <span className="metric-label">텍스트 엔진</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-mint)]/10">
            <Search className="h-5 w-5 text-[var(--brand-mint)]" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              양식개체 시스템 & 검색 기능 고도화
            </h4>
            <span className="tag-badge">프론트엔드 개발자</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          EditBox · ComboBox DOM/Render를 구현하고, Find/Replace 검색 성능을
          70% 향상시켰습니다.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-box">
            <span className="metric-value text-xl">70%</span>
            <span className="metric-label">검색 속도 향상</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">EditBox</span>
            <span className="metric-label">양식개체</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">DOM</span>
            <span className="metric-label">렌더링 엔진</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2022",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-lavender)]/10">
            <Layers className="h-5 w-5 text-[var(--brand-lavender)]" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              SuperPoint Architecture 설계 & React 전환
            </h4>
            <span className="tag-badge">시스템 아키텍트</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          차세대 프레젠테이션 엔진을 React + TypeScript 아키텍처로 전환하고,
          Slide 계층 구조를 설계했습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "Architecture", "Slide Engine"].map((tech) => (
            <span key={tech} className="tag-chip-velog">{tech}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "2023",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-coral)]/10">
            <Users className="h-5 w-5 text-[var(--brand-coral)]" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              공동편집 Message Handler & 썸네일 최적화
            </h4>
            <span className="tag-badge">성능 최적화</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          실시간 공동편집 시스템의 Operation Message Handler를 설계하고,
          html-to-image + pdf.js 기반 썸네일 성능을 40% 향상시켰습니다.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-box">
            <span className="metric-value text-xl">실시간</span>
            <span className="metric-label">공동편집</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">40%</span>
            <span className="metric-label">썸네일 성능 향상</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              Theme/ClrMap 시스템 & 테스트 자동화
            </h4>
            <span className="tag-badge">풀스택 개발자</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          완벽한 색상 테마 시스템을 설계하여 색상 오차율 0%를 달성하고,
          Jest 테스트 커버리지 95%, 완전 문서화를 완료했습니다.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-box">
            <span className="metric-value text-xl">0%</span>
            <span className="metric-label">색상 오차율</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">95%</span>
            <span className="metric-label">테스트 커버리지</span>
          </div>
          <div className="metric-box">
            <span className="metric-value text-xl">9개</span>
            <span className="metric-label">핵심 모듈</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "NOW",
    content: (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)]/20 to-[var(--brand-violet)]/20">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              AI Builder — gotech.lab
            </h4>
            <span className="tag-badge">1인 개발</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          5년간의 엔진 개발 경험을 바탕으로, AI를 활용해 빠르게 만들고
          기록하는 AI Builder로 전환했습니다. Next.js + Cloudflare 기반
          개인 플랫폼을 운영하고 있습니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Next.js", "Cloudflare", "Claude AI", "TypeScript", "Tailwind CSS"].map((tech) => (
            <span key={tech} className="tag-chip-velog">{tech}</span>
          ))}
        </div>
      </div>
    ),
  },
];

export function AboutTimeline() {
  return <Timeline data={TIMELINE_DATA} />;
}
