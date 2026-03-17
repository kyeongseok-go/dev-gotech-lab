import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* 어드민 네비게이션 바 */}
      <nav className="mb-8 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/card-news" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            카드뉴스 관리
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            사이트로 돌아가기
          </Link>
          <LogoutButton />
        </div>
      </nav>

      {children}
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { clearSessionCookie } = await import("@/lib/auth/admin");
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        cookieStore.delete("admin_session");
        const { redirect } = await import("next/navigation");
        redirect("/admin/login");
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        로그아웃
      </button>
    </form>
  );
}
