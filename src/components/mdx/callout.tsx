import type { ReactNode } from "react";

const variants = {
  info: {
    className: "border-blue-500/40 bg-blue-500/10 text-blue-200",
    icon: "ℹ️",
  },
  warning: {
    className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
    icon: "⚠️",
  },
  tip: {
    className: "border-green-500/40 bg-green-500/10 text-green-200",
    icon: "💡",
  },
} as const;

interface CalloutProps {
  type?: keyof typeof variants;
  children: ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const v = variants[type];
  return (
    <div className={`my-4 rounded-lg border p-4 ${v.className}`}>
      <div className="flex gap-2">
        <span className="shrink-0">{v.icon}</span>
        <div className="min-w-0 [&>p]:mb-0">{children}</div>
      </div>
    </div>
  );
}
