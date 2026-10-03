import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Velite: dev/build 시 콘텐츠 파이프라인 먼저 실행
const isDev = process.argv.indexOf("dev") !== -1;
const isBuild = process.argv.indexOf("build") !== -1;
// dev 모드에서만 Velite watch 실행 (build는 package.json build 스크립트에서 처리)
if (!process.env.VELITE_STARTED && isDev) {
  process.env.VELITE_STARTED = "1";
  import("velite").then((m) => m.build({ watch: true, clean: false }));
}

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // 인물 사진 등 정적 이미지를 AVIF → WebP 순으로 협상해 전송 (Cloudflare IMAGES 바인딩이 변환)
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
