import { CARD_NEWS_DATA } from "../page";
import { toGalleryCard } from "@/lib/card-news";

/**
 * 카드뉴스 목록의 전체 표시 모델 — 빌드 때 한 번 만드는 정적 JSON(런타임 렌더 0).
 * 목록 페이지는 첫 화면 카드만 싣고, 필터·검색·더 보기를 처음 쓸 때 이 파일을 한 번 불러온다
 * (src/components/card-news/use-card-index.ts). 데이터 원본은 그대로 page.tsx 마커 구간(publish.py 관리).
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(CARD_NEWS_DATA.map(toGalleryCard), {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
