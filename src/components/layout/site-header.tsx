"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
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

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="glass-nav fixed top-0 w-full z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        {/* Logo */}
        <Link
          href="/"
          className="font-headline text-xl font-semibold tracking-tight text-on-surface"
          aria-label="GoTechy 홈"
        >
          Go<span className="text-do-primary logo-lab">Techy</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm font-medium">
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
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            className="md:hidden p-2 text-on-surface"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 토글"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container px-8 pb-6 pt-2">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-bold uppercase tracking-tighter py-2 transition-colors ${
                  isActive(href) ? "text-do-primary" : "text-on-surface-variant hover:text-do-primary"
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
