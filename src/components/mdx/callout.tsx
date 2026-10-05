import type { ReactNode } from "react";
import { Info, TriangleAlert, Lightbulb } from "lucide-react";

/** 의미 색은 왼쪽 선 + 아이콘 + 텍스트 라벨로 함께 전달 */
const variants = {
  info: { label: "정보", Icon: Info, rule: "border-accent-cyan", ink: "text-accent-cyan" },
  warning: { label: "주의", Icon: TriangleAlert, rule: "border-accent-amber", ink: "text-accent-amber" },
  tip: { label: "팁", Icon: Lightbulb, rule: "border-accent-green", ink: "text-accent-green" },
} as const;

interface CalloutProps {
  type?: keyof typeof variants;
  children: ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const { label, Icon, rule, ink } = variants[type] ?? variants.info;
  return (
    <aside className={`my-6 border-l-2 ${rule} bg-surface-container-low px-5 py-4`}>
      <p className={`mb-2 flex items-center gap-1.5 font-code text-xs font-bold uppercase tracking-[0.1em] ${ink}`}>
        <Icon aria-hidden size={14} />
        {label}
      </p>
      <div className="min-w-0 text-on-surface-variant [&>p]:mb-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}
