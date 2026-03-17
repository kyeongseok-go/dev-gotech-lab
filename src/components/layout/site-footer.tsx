import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border" style={{ background: "var(--card)" }}>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* 브랜드 */}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <div className="flex items-center gap-2">
              <div className="logo-icon flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white">
                ㄱ
              </div>
              <span className="text-sm font-extrabold text-foreground" style={{ fontFamily: "Pretendard, sans-serif" }}>
                고텍이
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Build the Technology. Live Easier.
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-6">
            <Link
              href="https://github.com/kyeongseok-go"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              GitHub
            </Link>
            <Link href="/blog" className="text-xs text-muted-foreground transition-colors hover:text-primary">
              블로그
            </Link>
            <Link href="/card-news" className="text-xs text-muted-foreground transition-colors hover:text-primary">
              카드뉴스
            </Link>
            <Link href="/about" className="text-xs text-muted-foreground transition-colors hover:text-primary">
              소개
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 고텍이 by Go Kyeongseok. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
