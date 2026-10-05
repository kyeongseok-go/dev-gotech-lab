/* 출처: ReUI Badge (@reui/badge, https://reui.io) — MIT © Keenthemes.
   사이트 토큰에 맞게 변형만 추려 다듬음: 모노 라벨 · 2px 모서리 · 헤어라인 외곽. */
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center w-fit border border-transparent font-code uppercase tracking-[0.06em] whitespace-nowrap outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3",
  ],
  {
    variants: {
      variant: {
        /* 잉크 채움 — 활성 상태 */
        default: "bg-on-surface text-page",
        /* 헤어라인 외곽 — 기본 태그 */
        outline: "border-hairline bg-transparent text-on-surface-variant",
        /* 마커 톤 — 강조 라벨 */
        "primary-light": "border-do-primary/30 bg-primary-container text-on-primary-container",
        secondary: "bg-surface-container text-on-surface-variant",
      },
      size: {
        sm: "px-1.5 h-5 text-[0.6875rem] gap-1",
        default: "px-2 h-6 text-xs gap-1",
        lg: "px-2.5 h-7 text-xs gap-1.5",
      },
      radius: {
        default: "rounded-[2px]",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
      radius: "default",
    },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, radius, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants, type BadgeProps }
