# 형식(format) 명세

채널은 "어디에", 형식은 "어떤 모양으로"다. 한 형식을 여러 채널이 함께 쓴다(예: `community-showcase` = GeekNews·Show HN).
모든 형식은 같은 원천 `kits/<slug>/brief.md`(사실만: 문제·무엇·어떻게·숫자 3개·한계·링크·스크린샷 경로)에서 만든다. 형식 파일은 원천에 없는 사실을 지어내지 못하게 하는 규칙집이다.

| format | 산출물 | 핵심 규칙 | 만드는 곳 |
| --- | --- | --- | --- |
| `release-post` | 블로그 MDX(`content/blog/`, tags에 `tool:<slug>`) | gotekie-blog-writer 규칙, 제목 ≤40자·설명 ≤120자(blog-meta-linter로 검사) | R4 |
| `short-post` | 1개 게시물 텍스트 + 이미지 1장 경로 | 첫 줄에 "무엇을 해 주는 도구인지", 링크 1개(UTM), 해시태그 ≤2 | R4 |
| `thread-series` | 5~7개 연속 게시물 | 각 ≤500자, 1번에 결과 이미지, 마지막에 링크 | R4 |
| `retro-post` | 회고형 1개 게시물 | "무엇을 만들었고 무엇을 배웠나", 숫자 1개 이상, 참여 유도 문구 금지 | R4 |
| `community-showcase` | 제목 + 마크다운 본문 | 도구 URL 원본, 만든 이유·한계를 짧게, 이미지 없음, 과장 금지 | R4 |
| `maker-log` | 제작기 요약 + 블로그 링크 | 막힌 것·고친 것 위주 | R4 |
| `carousel` | 이미지 N장 + 캡션 | card-news-generator 출력 재사용, 장당 1메시지 | R4(텍스트) + 로컬(이미지 확인) |
| `shorts-script` | 15~60초 대본 + 컷 목록 + 화면 녹화 지시 | 첫 3초 훅, 세로, 자막 필수 | R4(대본) + **로컬 세션(렌더)** |

새 형식을 추가할 때: 이 표에 1행 + `formats/<format>.md`에 템플릿·금지 사항·예시 1개.
