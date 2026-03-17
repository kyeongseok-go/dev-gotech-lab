import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getCardNewsById, updateCardNews, deleteCardNews } from "@/lib/db/card-news";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET — 카드뉴스 단건 조회 */
export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getCardNewsById(Number(id));
  if (!item) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(item);
}

/** PUT — 카드뉴스 수정 */
export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = (await request.json()) as Partial<import("@/lib/db/card-news").CardNews>;
    const ok = await updateCardNews(Number(id), data);
    if (!ok) {
      return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/** DELETE — 카드뉴스 삭제 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteCardNews(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
