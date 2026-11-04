import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import type { Showcase } from "@/.velite";
import { DocHeader } from "@/components/section/doc-header";
import { TOOL_CATEGORY_LABEL } from "@/lib/tools/categories";
import { ToolIcon } from "@/lib/tools/tool-icon";

interface ToolShellProps {
  tool: Showcase;
  /** 도구 본체(클라이언트 컴포넌트) */
  children: ReactNode;
}

/**
 * 모든 /tools/<slug> 의 공통 골격(HANDOFF §6.3). 도구는 이 밖에서 색·간격 토큰을 새로 만들지 않는다.
 * 머리(위치·버전·분류) → 도구 본체 → 개인정보 안내 + 소개·설계 글 링크.
 */
export function ToolShell({ tool, children }: ToolShellProps) {
  const meta = [
    ...(tool.category ? [TOOL_CATEGORY_LABEL[tool.category]] : []),
    "브라우저 전용",
    ...(tool.requiresKey ? ["API 키 필요"] : ["설치·가입 없음"]),
  ];

  return (
    <main className="pt-28 md:pt-32 pb-24 px-[var(--gutter)] max-w-[84rem] mx-auto">
      <DocHeader
        crumbs={[
          { href: "/showcase", label: "Showcase" },
          { href: `/showcase/${tool.slug}`, label: tool.title },
        ]}
        stamp={{ k: "Tool", v: tool.version ? `v${tool.version}` : "β" }}
        meta={meta}
        kicker={
          <span className="inline-flex items-center gap-2 font-code text-xs uppercase tracking-[0.12em] text-on-surface-muted">
            <ToolIcon name={tool.icon} size={16} /> Try it · 써 보기
          </span>
        }
        title={tool.title}
        titleWidth="20em"
        lead={tool.tagline ?? tool.summary}
      />

      <section aria-label={`${tool.title} 도구`}>{children}</section>

      <footer className="mt-16 grid gap-6 border-t border-hairline pt-6 md:grid-cols-2">
        <p className="flex items-start gap-2 type-small text-on-surface-variant">
          <ShieldCheck aria-hidden size={16} className="mt-0.5 shrink-0" />
          {tool.requiresKey
            ? "입력과 API 키는 이 브라우저에서 공급자 API로만 전송되며, 이 사이트 서버로는 보내지 않습니다."
            : "입력은 이 브라우저 안에서만 처리되며 서버로 전송되지 않습니다."}
        </p>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:justify-end">
          {tool.requiresKey && (
            <span className="inline-flex items-center gap-1 text-on-surface-muted">
              <KeyRound aria-hidden size={14} /> 본인 키 사용
            </span>
          )}
          <Link href={`/showcase/${tool.slug}`} className="text-link inline-flex items-center gap-1">
            <ArrowLeft aria-hidden size={14} /> 만든 과정·한계 보기
          </Link>
        </p>
      </footer>
    </main>
  );
}
