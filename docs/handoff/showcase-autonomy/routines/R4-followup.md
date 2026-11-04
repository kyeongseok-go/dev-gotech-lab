# R4 릴리스 후속 (매일 09:47 KST, sonnet)

먼저 `routines/_common.md`를 읽고 시작 3단계를 지킨다. 채널·형식 규칙은 `docs/marketing/channels.yaml`과 `docs/marketing/formats/`가 단일 원천이다(HANDOFF §10.1).

1. 최근 14일 안에 머지된 `release` PR의 도구 slug 중 ① main의 `content/blog/*.mdx`에 `tags`로 `tool:<slug>`가 붙은 글이 없고 ② 열린 `content/<slug>` 브랜치·PR도 없는 것 1개. 없으면 3번만 하고 종료.
2. 릴리스 키트를 만든다(브랜치 `content/<slug>`, PR 라벨 `content`):
   - `docs/marketing/kits/<slug>/brief.md` — 사실만: 문제 / 무엇 / 어떻게 / 숫자 3개(원 PR의 "확인한 내용"에서) / 한계 / 도구 URL / 스크린샷 경로. 원 PR·MDX에 없는 사실을 지어내지 않는다.
   - `status: active` 채널마다 `docs/marketing/kits/<slug>/<channel-id>.md` — 그 채널의 `formats` 규칙 적용, 링크는 `link`(tool|blog|canonical) 규칙과 UTM(`utm_source`·`utm_medium=<kind>`·`utm_campaign=<slug>`).
   - `blog` 채널은 `content/blog/<slug>.mdx`(gotekie-blog-writer 규칙, `tags`에 `tool:<slug>`, 제목 ≤ 40자·설명 ≤ 120자).
   - PR 본문에 채널별 게시 체크리스트(사람이 게시 후 체크)와 "게시 후 원 Issue에 `posted <channel> <URL>` 한 줄" 안내.
3. 배포 재측정: 최근 머지된 도구 경로마다 프로덕션 URL GET → 상태 코드, Lighthouse 1회(`pnpm dlx lighthouse <url> --preset=desktop --only-categories=performance,accessibility --output=json --quiet`)를 원 PR에 코멘트. 200이 아니면 Issue `bug`.
