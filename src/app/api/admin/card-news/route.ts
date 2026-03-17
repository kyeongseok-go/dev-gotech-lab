import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getAllCardNews, createCardNews } from "@/lib/db/card-news";

/** GET — 전체 카드뉴스 목록 (Admin) */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getAllCardNews();
  return NextResponse.json(items);
}

/** POST — 카드뉴스 생성 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = (await request.json()) as Record<string, unknown>;
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: "제목과 slug는 필수입니다." }, { status: 400 });
    }

    const id = await createCardNews(data as Parameters<typeof createCardNews>[0]);
    if (id === null) {
      return NextResponse.json({ error: "생성에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
