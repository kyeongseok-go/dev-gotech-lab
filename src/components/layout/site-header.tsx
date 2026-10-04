"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/card-news", label: "카드뉴스" },
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/about", label: "About" },
];

/**
 * SiteHeader
 * ─────────────────────────────────────────────────────────────
 * 글래스 nav. 무겁지 않게 떠 있어야 하므로 데스크탑 88px / 모바일
 * 64px 로 축소(이전: 100px / 80px). 페이지 콘텐츠 pt-28(112px)
 * 안쪽에 안전하게 들어간다.
 *
 * 로고는 BrandLogo 측에서 콘텐츠 bbox 비율로 박스를 잡고
 * object-cover 로 시각 중심을 보정하므로, 여기서는 단순히
 * items-center 만으로도 정렬이 맞는다. 좌측 패딩은 사용자가
 * "왼쪽 길게 먹어도 OK"라고 했으므로 데스크탑 32px 유지.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between pl-1 pr-3 md:h-[88px] md:pl-2 md:pr-6">
        {/* Logo — 콘텐츠 bbox 비율 박스라 items-center 만으로 시각 정렬 OK */}
        <Link
          href="/"
          aria-label="GoTechy 홈"
          className="inline-flex items-center transition-opacity hover:opacity-90"
        >
          <span className="hidden sm:inline-block">
            <BrandLogo size="md" priority />
          </span>
          <span className="sm:hidden">
            <BrandLogo size="sm" priority />
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 font-headline text-sm font-medium tracking-tight md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative py-1 transition-colors duration-300 ${
                isActive(href)
                  ? "text-do-primary"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute -bottom-0.5 left-0 h-px w-full bg-do-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 text-on-surface md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 토글"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="bg-surface-container px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`py-2 text-sm font-bold uppercase tracking-tighter transition-colors ${
                  isActive(href)
                    ? "text-do-primary"
                    : "text-on-surface-variant hover:text-do-primary"
                }`}
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
