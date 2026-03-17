import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { putObject, getPublicUrl } from "@/lib/storage/r2";
import { uploadKey } from "@/lib/storage/paths";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

/** POST — 이미지 업로드 → R2 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "지원하지 않는 이미지 형식입니다." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "png";
    const safeName = `${Date.now()}.${ext}`;
    const key = uploadKey(safeName);

    const buffer = await file.arrayBuffer();
    const ok = await putObject(key, buffer, file.type);

    if (!ok) {
      return NextResponse.json({ error: "업로드에 실패했습니다." }, { status: 500 });
    }

    const url = getPublicUrl(key);
    return NextResponse.json({ url, key });
  } catch {
    return NextResponse.json({ error: "업로드 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
