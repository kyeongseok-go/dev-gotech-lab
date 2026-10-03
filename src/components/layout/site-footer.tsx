import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

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

const COLOPHON = [
  { k: "Type", v: "Pretendard · Geist Mono" },
  { k: "Stack", v: "Next.js 16 · Tailwind v4 · Velite MDX" },
  { k: "Host", v: "Cloudflare Workers" },
];

const LINK_CLASS =
  "group inline-flex items-center gap-1 text-[15px] text-on-surface hover:text-do-primary transition-colors";

/**
 * SiteFooter — 노트 뒷표지(콜로폰).
 * 잉크 룰 + 4열 헤어라인 표: 브랜드 · 목차 · 연락 · 콜로폰.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 md:mt-32 px-[var(--gutter)]">
      <div className="mx-auto max-w-[84rem] border-t border-on-surface">
        <div className="grid grid-cols-12 gap-px bg-hairline border-b border-hairline">
          <div className="col-span-12 lg:col-span-5 bg-page py-8 lg:pr-8">
            <Link
              href="/"
              aria-label="GoTechy 홈"
              className="-ml-2 inline-flex items-center transition-opacity hover:opacity-85"
            >
              <BrandLogo size="md" />
            </Link>
            <p className="mt-4 type-small text-on-surface-variant max-w-sm">
              Go Build the Technology, <span className="text-em">more easy.</span>
              <br />
              가자!! 기술을 만들고, 더 쉽게 살자.
            </p>
          </div>

          <nav aria-label="사이트 목차" className="col-span-6 lg:col-span-2 bg-page py-8 lg:pl-6">
            <p className="font-code text-[11px] uppercase tracking-[0.12em] text-on-surface-muted mb-4">Index</p>
            <ul className="space-y-2">
              {SITE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={LINK_CLASS}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 lg:col-span-2 bg-page py-8 pl-6">
            <p className="font-code text-[11px] uppercase tracking-[0.12em] text-on-surface-muted mb-4">Connect</p>
            <ul className="space-y-2">
              {CONNECT_LINKS.map(({ href, label, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={LINK_CLASS}
                  >
                    {label}
                    <ArrowUpRight
                      aria-hidden
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-3 bg-page py-8 lg:pl-6">
            <p className="font-code text-[11px] uppercase tracking-[0.12em] text-on-surface-muted mb-4">Colophon</p>
            <dl className="space-y-2 text-sm">
              {COLOPHON.map(({ k, v }) => (
                <div key={k} className="grid grid-cols-[4rem_1fr] gap-2">
                  <dt className="font-code text-xs text-on-surface-muted pt-0.5">{k}</dt>
                  <dd className="text-on-surface-variant">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-6 font-code text-xs text-on-surface-muted">
          <p>
            © {year} GoTechy · Designed &amp; developed by <span className="text-on-surface">고경석</span>
          </p>
          <p className="tabular">EOF — end of notebook</p>
        </div>
      </div>
    </footer>
  );
}
