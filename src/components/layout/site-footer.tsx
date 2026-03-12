import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "#1e2139", background: "#0d0f1a" }}
    >
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* 브랜드 */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-black"
                style={{
                  background: "linear-gradient(135deg, #00e5ff, #7c3aed)",
                }}
              >
                ㄱ
              </div>
              <span
                className="text-sm font-extrabold"
                style={{ fontFamily: "Pretendard, sans-serif" }}
              >
                고텍이
              </span>
            </div>
            <p className="text-xs" style={{ color: "#8892a4" }}>
              Build the Technology. Live Easier.
            </p>
          </div>

          {/* 링크 */}
          <div className="flex gap-6">
            <Link
              href="https://github.com/kyeongseok-go"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: "#8892a4" }}
            >
              GitHub
            </Link>
            <Link href="/blog" className="text-xs transition-colors" style={{ color: "#8892a4" }}>
              블로그
            </Link>
            <Link href="/about" className="text-xs transition-colors" style={{ color: "#8892a4" }}>
              소개
            </Link>
          </div>
        </div>

        <div
          className="mt-6 border-t pt-6 text-center text-xs"
          style={{ borderColor: "#1e2139", color: "#8892a4" }}
        >
          © {new Date().getFullYear()} 고텍이 by Go Kyeongseok. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
