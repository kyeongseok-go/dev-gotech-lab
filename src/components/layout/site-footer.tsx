import Link from "next/link";

const SITE_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/showcase", label: "Showcase" },
  { href: "/services", label: "Services" },
];

const EXTERNAL_LINKS = [
  { href: "https://github.com/kyeongseok-go", label: "GitHub", external: true },
  { href: "mailto:kugll9606@gmail.com", label: "Email", external: false },
  { href: "/rss.xml", label: "RSS", external: false },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-do-primary/10 bg-surface">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div>
            <div
              className="font-bold text-on-surface text-lg mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              gotech<span className="text-do-primary">.lab</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Go !! Build the Technology, Live Easier.
            </p>
          </div>

          {/* Column 2: Site Links */}
          <div>
            <h3
              className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Links
            </h3>
            <ul className="space-y-2">
              {SITE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-on-surface-variant hover:text-do-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: External Links */}
          <div>
            <h3
              className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Connect
            </h3>
            <ul className="space-y-2">
              {EXTERNAL_LINKS.map(({ href, label, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-on-surface-variant hover:text-do-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-outline-variant/15 pt-6">
          <p className="text-xs text-on-surface-variant text-center">
            &copy; {new Date().getFullYear()} 고텍이(gotechle). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
