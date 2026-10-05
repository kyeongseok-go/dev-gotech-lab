/* 출처: Magic UI Number Ticker (@magicui/number-ticker, https://magicui.design) — MIT.
   변경: motion/react → framer-motion(기존 의존성 재사용), reduced-motion 시 마운트 직후 최종값,
   기본 색상 클래스 제거(사이트 토큰 상속). */
"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  /** 자릿수 고정 (예: 2 → "07") */
  padStart?: number
}

function format(value: number, decimalPlaces: number, padStart: number): string {
  const text = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)))
  return padStart > 0 ? text.padStart(padStart, "0") : text
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  padStart = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReduced = useReducedMotion()
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })
  const target = direction === "down" ? startValue : value

  useEffect(() => {
    if (prefersReduced) {
      // 동작 줄이기: 애니메이션 없이 최종값으로 바로 바꾼다.
      // 서버 HTML(시작값)과 첫 클라이언트 렌더를 같게 둬야 하이드레이션 불일치(#418)가 없다.
      if (ref.current) ref.current.textContent = format(target, decimalPlaces, padStart)
      return
    }
    if (!isInView) return
    const timer = setTimeout(() => motionValue.set(target), delay * 1000)
    return () => clearTimeout(timer)
  }, [motionValue, isInView, delay, target, prefersReduced, decimalPlaces, padStart])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = format(latest, decimalPlaces, padStart)
        }
      }),
    [springValue, decimalPlaces, padStart]
  )

  return (
    <span className={cn("inline-block tabular-nums", className)} {...props}>
      {/* 스크린리더에는 최종값만 노출, 애니메이션 숫자는 숨김 */}
      <span className="sr-only">{format(target, decimalPlaces, padStart)}</span>
      <span ref={ref} aria-hidden="true">
        {/* 서버·클라이언트 모두 시작값으로 렌더 — reduced-motion 최종값은 마운트 직후 effect 가 넣는다 */}
        {format(direction === "down" ? value : startValue, decimalPlaces, padStart)}
      </span>
    </span>
  )
}
