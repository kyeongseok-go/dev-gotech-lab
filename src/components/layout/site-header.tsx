import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/blog", label: "블로그" },
  { href: "/projects", label: "프로젝트" },
  { href: "/showcase", label: "Showcase" },
  { href: "/services", label: "서비스" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="logo-icon flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-black">
            ㄱ
          </div>
          <span className="logo-text text-base font-extrabold tracking-tight text-white">
            고텍이
          </span>
        </Link>

        {/* 네비게이션 + 테마 토글 */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-1 overflow-x-auto sm:gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
