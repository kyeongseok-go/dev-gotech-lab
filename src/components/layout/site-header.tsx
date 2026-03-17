import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/blog", label: "블로그" },
  { href: "/projects", label: "프로젝트" },
  { href: "/showcase", label: "Showcase" },
  { href: "/card-news", label: "카드뉴스" },
  { href: "/services", label: "서비스" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        {/* 로고 — Cyan→Violet 그라디언트 아이콘 */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="logo-icon flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white transition-shadow group-hover:shadow-[0_0_16px_rgba(0,229,255,0.3)]">
            ㄱ
          </div>
          <span className="logo-text text-base font-extrabold tracking-tight">
            고텍이
          </span>
        </Link>

        {/* 네비게이션 + 테마 토글 */}
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
