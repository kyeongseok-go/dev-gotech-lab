"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  /** 스태거 순번 — 같은 그룹 내 등장 지연 (index * 80ms) */
  index?: number;
  /** y 이동 거리 (px). 기본 16 */
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * 진입 fade-up. 뷰포트 진입 시 1회 재생. prefers-reduced-motion 시 즉시 표시.
 * 디자인 시스템 §7 모션 규칙 준수 (600ms / ease-out-expo / 80ms 스태거).
 */
export function Reveal({
  children,
  index = 0,
  y = 16,
  className,
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as];

  const variants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0 : 0.6,
        ease: EASE_OUT_EXPO,
        delay: prefersReduced ? 0 : index * 0.08,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** 포인터 추종 변위 강도 (px). 기본 6 */
  strength?: number;
}

/**
 * 마그네틱 래퍼 — 포인터를 미세하게 추종. CTA 한두 곳에만.
 * reduced-motion 시 비활성.
 */
export function Magnetic({ children, className, strength = 6 }: MagneticProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${(x / rect.width) * strength * 2}px, ${
      (y / rect.height) * strength * 2
    }px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ transition: "transform 320ms cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </div>
  );
}
