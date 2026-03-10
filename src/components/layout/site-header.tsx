import Link from "next/link";

const NAV_LINKS = [
  { href: "/blog", label: "블로그" },
  { href: "/projects", label: "프로젝트" },
  { href: "/showcase", label: "Showcase" },
  { href: "/services", label: "서비스" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-foreground">
          gotech.lab
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
