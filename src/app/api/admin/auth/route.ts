import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionCookie, clearSessionCookie } from "@/lib/auth/admin";

/** POST — 로그인 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string };
    if (!body.password || !verifyPassword(body.password)) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const cookie = await createSessionCookie();
    return NextResponse.json(
      { success: true },
      { status: 200, headers: { "Set-Cookie": cookie } },
    );
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/** DELETE — 로그아웃 */
export async function DELETE() {
  const cookie = clearSessionCookie();
  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Set-Cookie": cookie } },
  );
}
