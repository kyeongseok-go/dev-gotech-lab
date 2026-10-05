import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * 증분 캐시 = Workers 정적 자산(읽기 전용). https://opennext.js.org/cloudflare/caching
 *
 * 캐시를 두지 않으면 OpenNext 는 빌드 때 미리 만든 HTML 을 런타임에 읽지 못해 모든 요청을 SSR 한다
 * (2026-10-04 운영 장애: /card-news 가 Workers 자원 한도를 넘겨 Error 1102).
 * 이 사이트는 ISR·재검증 없이 빌드 때 확정되는 SSG 라서 정적 자산 캐시가 맞다:
 *   · `opennextjs-cloudflare deploy/upload/preview` 가 .open-next/cache 를 assets/cdn-cgi/_next_cache 로 복사해 채운다.
 *   · R2·KV·D1 바인딩, 큐, 태그 캐시가 필요 없다(쓰기·재검증 미지원 — 쓰지 않는다).
 * enableCacheInterception: 미리 렌더된 경로는 Next 서버를 거치지 않고 캐시에서 바로 응답한다
 * (응답 헤더 `x-opennext-cache: HIT`). PPR 을 쓰지 않으므로 켤 수 있다.
 * 동적으로 남는 경로는 scripts/render-allowlist.json 에만 둔다(빌드 검사·E2E 가 함께 읽는다).
 */
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
