"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand/brand-logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/card-news", label: "카드뉴스" },
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/about", label: "About" },
];

/**
 * SiteHeader — 랩 노트북 헤더.
 * 좌: 로고 / 중: 번호가 붙은 목차형 내비(01 Blog …) / 우: 테마 토글.
 * 활성 항목은 마커 사각 + 잉크색. 하단은 헤어라인 1px.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="glass-nav fixed top-0 z-50 w-full">
      <nav
        aria-label="주요 메뉴"
        className="mx-auto flex h-16 md:h-[72px] max-w-[84rem] items-center justify-between gap-6 px-[var(--gutter)]"
      >
        <Link
          href="/"
          aria-label="GoTechy 홈"
          className="-ml-2 inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <BrandLogo size="sm" priority />
        </Link>

        <ul className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map(({ href, label }, i) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group inline-flex items-baseline gap-1.5 px-2.5 py-2 text-[15px] font-medium transition-colors ${
                    active ? "text-on-surface" : "text-on-surface-muted hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`font-code text-[10px] tabular ${
                      active ? "text-do-primary" : "text-on-surface-faint group-hover:text-on-surface-muted"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </span>
                  <span className={active ? "marker" : ""}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center text-on-surface md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-hairline bg-page px-[var(--gutter)] pb-6">
          <ul>
            {NAV_LINKS.map(({ href, label }, i) => {
              const active = isActive(href);
              return (
                <li key={href} className="border-b border-hairline">
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className={`font-code text-xs tabular ${active ? "text-do-primary" : "text-on-surface-muted"}`}>
                      {String(i).padStart(2, "0")}
                    </span>
                    <span className={`type-title ${active ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
