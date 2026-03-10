import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} gotech.lab
        </p>
        <div className="flex gap-4">
          <Link
            href="https://github.com/kyeongseok-go"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/about"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            소개
          </Link>
        </div>
      </div>
    </footer>
  );
}
