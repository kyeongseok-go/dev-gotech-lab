/** 운영 주소 — canonical·사이트맵·RSS·JSON-LD·공유 링크가 모두 이 값을 쓴다. 도메인 확정 시 이 값만 변경.
 *  (이전 기본값 gotech-lab.pages.dev 는 DNS 가 없는 주소라 공유 링크·사이트맵이 죽은 링크였다) */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dev-gotech-lab.kugll9606.workers.dev";
export const SITE_NAME = "GoTechy";
export const SITE_TAGLINE = "Go Build the Technology, more easy.";
export const SITE_DESCRIPTION = "GoTechy — 기술 블로그 · 포트폴리오 · AI 실험 공간. Go Build the Technology, more easy.";
