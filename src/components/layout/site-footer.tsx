import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/section/marquee";

const SITE_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/card-news", label: "Card News" },
  { href: "/about", label: "About" },
  { href: "/subscribe", label: "Subscribe" },
];

const CONNECT_LINKS = [
  { href: "https://github.com/kyeongseok-go", label: "GitHub", external: true },
  { href: "mailto:kugll9606@gmail.com", label: "Email", external: false },
  { href: "/rss.xml", label: "RSS", external: false },
];

const MARQUEE_WORDS = [
  "Go Build the Technology",
  "more easy",
  "기술을 만들고, 더 쉽게 살자",
  "GoTechy",
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full mt-32">
      {/* 상단 거대 마퀴 */}
      <div className="border-y border-hairline">
        <Marquee
          durationSec={36}
          items={MARQUEE_WORDS.map((w) => (
            <span
              key={w}
              className="font-headline text-on-surface-muted"
              style={{ fontSize: "clamp(2.5rem,7vw,5.5rem)", letterSpacing: "-0.03em", fontWeight: 600 }}
            >
              {w}
              <span className="text-do-primary"> ✦ </span>
            </span>
          ))}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-12 gap-6 md:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-12 md:col-span-5">
            <Link href="/" className="font-headline text-3xl font-semibold text-on-surface inline-block mb-3">
              Go<span className="text-do-primary">Techy</span>
            </Link>
            <p className="type-small text-on-surface-variant max-w-sm">
              Go Build the Technology, <span className="text-em">more easy.</span>
              <br />가자!! 기술을 만들고, 더 쉽게 살자.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-6 md:col-span-3">
            <span className="font-code text-xs font-semibold tracking-widest uppercase text-on-surface-muted block mb-5">
              Links
            </span>
            <ul className="space-y-2.5">
              {SITE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-headline font-medium text-base text-on-surface hover:text-do-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-6 md:col-span-4">
            <span className="font-code text-xs font-semibold tracking-widest uppercase text-on-surface-muted block mb-5">
              Connect
            </span>
            <ul className="space-y-2.5">
              {CONNECT_LINKS.map(({ href, label, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="font-headline font-medium text-base text-on-surface hover:text-do-primary transition-colors inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 카피 */}
        <div className="pt-8 border-t border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-code text-xs text-on-surface-faint">
            Designed &amp; developed by{" "}
            <span className="text-do-primary">고경석</span> · &copy; {new Date().getFullYear()}{" "}
            GoTechy. All rights reserved.
          </p>
          <p className="font-code text-xs text-on-surface-faint">
            Next.js 16 · Tailwind v4 · Velite MDX · Cloudflare
          </p>
        </div>
      </div>
    </footer>
  );
}
