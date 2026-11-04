# 도구화 후보 백로그 (시드)

- 작성일: 2026-11-04
- 재료: `~/.claude/skills/` 아래 사용자 본인 스킬 7개의 SKILL.md와 부속 references
- 기준: 서버·API 키 없이 **브라우저만으로** 돌아가는 부분만 도구 후보로 뽑았다. LLM이 꼭 필요한 부분은 BYO-key 선택 기능으로 분리했다(근거: `docs/handoff/showcase-autonomy/research/cors-providers.md`).
- 수요 근거 URL은 모두 2026-11-04에 실제로 열어 내용을 확인한 것만 적었다. 열지 못한 곳은 적지 않았다.

---

## Phase 0 샘플 도구 추천: `ko-ai-tell-highlighter` (한글 AI 티·번역투 하이라이터)

**조건 충족**: 하루 분량 / 외부 API 없음 / 서버 없음

이유:
1. **원천이 이미 규칙 형태로 정리돼 있다.** `humanize-korean/references/quick-rules.md`에 패턴 ID·심각도·처방이 표로 48행 있고, `metrics.py`는 "standard library ONLY", 정규식으로 형태소 분석을 근사한다고 스스로 밝힌다. TypeScript 정규식으로 옮기기만 하면 된다.
2. **하루에 끝낼 범위를 자르기 쉽다.** 정규식으로 잡히는 패턴만 1차로 넣는다. 예: A-1 "~에 대해", A-2 "~를 통해", A-3 "~에 있어", A-8 "~되어진다", A-19 "~에서의/~으로의", C-5 이모지, C-11 연결어미 뒤 쉼표, D-1 결산 피벗 어휘, D-2 "시사하는 바가 크다", D-3 "본질적으로", D-4 hype 어휘. 의미 판단이 필요한 A-15·A-18 등은 뺀다.
3. **빈자리가 보인다.** 찾아본 한국어 도구는 LLM 기반 스킬(yoonmoon)이거나 "AI 확률"만 주는 탐지기였다. "어디가 왜 번역투인지 규칙 근거로 칠해 주는 브라우저 도구"는 이번 조사에서 보지 못했다(없다고 단정하지는 않음).
4. **블로그 제작기와 잘 맞는다.** "내 윤문 스킬을 브라우저 도구로 옮기며 규칙 몇 개를 버렸나"가 그대로 글감이 된다.

하루 분량 범위(제안):
- 입력창 → 실시간 하이라이트(카테고리 색) → 오른쪽에 패턴 ID·처방 한 줄 → 지표 3개(연결어미 쉼표율, 결산 피벗 개수, 문장 수) 표시.
- 수치·따옴표 인용·영어 약어는 탐지 제외(quick-rules의 Do-NOT 목록 그대로).
- 윤문(재작성)은 Phase 0에서 하지 않는다. BYO-key 윤문은 후속.

예비안: 시간이 모자라면 `blog-meta-linter`(후보 4)로 바꾼다. 규칙이 더 단순하다.

---

## 후보 목록

요약표:

| # | slug | 카테고리 | 브라우저 전용 | LLM | 예상 사용자 스토리 |
|---|---|---|---|---|---|
| 1 | ko-ai-tell-highlighter | writing | 가능 | 불필요(윤문은 BYO-key 선택) | 6 |
| 2 | mermaid-polish | visual | 가능 | 불필요 | 5 |
| 3 | card-news-canvas | content | 가능 | 불필요(문안 생성은 BYO-key 선택) | 6 |
| 4 | blog-meta-linter | devtools | 가능 | 불필요 | 4 |
| 5 | ko-plain-style-checker | docs | 가능 | 불필요 | 5 |
| 6 | blueprint-card | visual | 가능 | 불필요 | 5 |
| 7 | c4-adr-starter | docs | 가능 | 불필요 | 4 |
| 제외 | rss-to-card-draft | content | 불가 | - | - |

"예상 사용자 스토리 수"는 아래 각 후보에 적은 스토리를 센 값이다(추정).

### 1. `ko-ai-tell-highlighter` — 한글 AI 티·번역투 하이라이터
- 한 줄 설명: 붙여 넣은 한글 글에서 번역투·AI 상투구를 규칙 근거와 함께 색칠한다.
- 원천 스킬: `~/.claude/skills/humanize-korean/SKILL.md`, `references/quick-rules.md`, `references/metrics.py`, `references/ai-tell-taxonomy.md`
- 브라우저 전용: **가능** — 탐지는 정규식과 어휘 목록뿐이고 `metrics.py`도 표준 라이브러리 정규식만 쓴다.
- LLM: 탐지는 불필요. "내용 불변 윤문"(스킬의 본기능)은 LLM이 필요하므로 BYO-key 선택 기능으로만.
- 사용자 스토리(6): 붙여 넣고 하이라이트 보기 / 패턴 눌러 처방 보기 / 카테고리별 켜고 끄기 / 지표 3개 보기 / 결과 텍스트 복사 / (선택) BYO-key로 해당 문장만 윤문 제안 받기
- 수요 근거:
  - https://github.com/amondnet/yoonmoon — 한글 번역투·AI 티 진단 Claude Code 플러그인(18 stars). LLM과 Claude Code 환경이 필요해 일반 사용자가 바로 못 쓴다. (접근일 2026-11-04)
  - https://news.hada.io/topic?id=24944 — GeekNews "AI 검사 도구는 이 글이 AI로 쓰였는지 확인할 수 없다 [번역글]"(2025-12-09). 확률형 탐지기 불신 → "확률" 대신 "근거 규칙"을 보여주는 도구의 명분. (접근일 2026-11-04)
- 위험·법적 주의:
  - "AI 판별기"로 홍보하지 않는다. 규칙 일치 표시일 뿐이고 사람 글도 걸린다. 화면에 "부정행위 판정 근거로 쓰지 말 것"을 적는다(yoonmoon도 같은 고지).
  - `ai-tell-taxonomy.md`의 출처·라이선스가 SKILL.md에 없다. 검색 결과에 같은 설명을 쓰는 외부 스킬("humanize-korean-ai-text")이 보여, 원저작자 확인 전에는 규칙 표를 그대로 공개하지 않는다. [확인 필요]
  - 학술 인용(김도훈 2009, 박옥수 2018 등)은 출처 표기를 유지한다.

### 2. `mermaid-polish` — Mermaid를 정돈된 SVG/PNG로
- 한 줄 설명: Mermaid flowchart·sequence·state 코드를 붙여 넣으면 여백·글자·테마를 정돈한 SVG/PNG로 내보낸다.
- 원천 스킬: `~/.claude/skills/archify/SKILL.md` ("Mermaid input" 절: flowchart→workflow, sequenceDiagram→sequence, stateDiagram→lifecycle)
- 브라우저 전용: **가능** — mermaid.js가 브라우저에서 렌더하고, SVG→PNG는 Canvas로 변환한다. archify 렌더러(`bin/archify.mjs`, Node)를 그대로 옮기는 것은 범위가 크므로, 1차는 mermaid.js 출력에 테마·여백 후처리만 한다(추론).
- LLM: 불필요.
- 사용자 스토리(5): 코드 붙여 넣고 미리보기 / 라이트·다크 테마 고르기 / 한글 폰트 고르기 / SVG 다운로드 / 투명 배경 PNG 2배 해상도 다운로드
- 수요 근거:
  - https://github.com/mermaid-js/mermaid-live-editor/issues/1422 — "Formatting of diagram is changed when exported to svg, pdf or png", 2024-03-22 열림, 아직 Open. (접근일 2026-11-04)
  - https://github.com/mermaid-js/mermaid-cli/issues/670 — 같은 증상(라이브 에디터와 내보낸 결과가 다르게 "squashed"), Open. (접근일 2026-11-04)
- 위험·법적 주의:
  - archify는 MIT(© 2026 tt-a1i, © 2025 Cocoon AI). 코드나 스타일을 가져오면 LICENSE 고지를 함께 싣는다.
  - mermaid.live와 기능이 겹친다. 차별점(한글 폰트, 내보내기 일치)을 첫 화면에 보여주지 못하면 쓸 이유가 약하다.

### 3. `card-news-canvas` — 카드뉴스 캔버스 렌더러
- 한 줄 설명: "번호. 제목 / 설명" 텍스트를 붙여 넣으면 600x600 카드뉴스 PNG 묶음을 만든다.
- 원천 스킬: `~/.claude/skills/card-news-generator/SKILL.md` (캔버스 600x600, 여백 40px, 제목 48px·본문 28px, 제목 20자·본문 60자 제한, 배경 이미지 중앙 크롭 + 어두운 오버레이 0.5)
- 브라우저 전용: **가능** — 원본은 Python Pillow지만 규격이 모두 숫자로 적혀 있어 Canvas 2D로 옮길 수 있다. 이미지는 사용자 기기에서만 읽는다.
- LLM: 렌더링은 불필요. "주제만 주면 문안 생성"은 BYO-key 선택.
- 사용자 스토리(6): 번호 목록 붙여 넣기 / 글자 수 초과 경고 / 배경색 고르기 / 배경 이미지 여러 장 올려 순서대로 적용 / 오버레이 농도 조절 / PNG 전체 ZIP 다운로드
- 수요 근거:
  - https://community.linkareer.com/job-materials/2138831 — 링커리어 "[카드뉴스 꿀팁] 카드뉴스 쉽게 만들 수 있는 사이트 총정리!!"(2023-07-28). 미리캔버스·망고보드 등 도구 수요, 일부 템플릿 제한 언급. (접근일 2026-11-04)
  - https://brunch.co.kr/@ssuperwasabi/206 — "Claude Code 카드뉴스 메이커 제작"(2026-06-10). 개인이 직접 카드뉴스 자동화 도구를 만든 사례. (접근일 2026-11-04)
  - https://instantdm.com/instagram-free-tools/instagram-carousel-maker — 브라우저 전용·무료 캐러셀 메이커(1080x1080, 1080x1350 PNG). 같은 형태의 도구가 이미 있다는 경쟁 근거. (접근일 2026-11-04)
- 위험·법적 주의:
  - 한글 웹폰트 라이선스(재배포·임베딩 허용 여부)를 확인한 폰트만 쓴다. [확인 필요: 사용할 폰트 선정 후]
  - 사용자가 올린 배경 이미지의 저작권은 사용자 책임임을 고지한다.
  - 600x600은 원천 스킬 규격이다. 인스타그램 권장 비율과는 다를 수 있다(인스타 API 문서는 캐러셀 기본 1:1만 확인). 1080 기준 출력 옵션을 같이 둔다.

### 4. `blog-meta-linter` — 블로그 frontmatter·SEO 메타 검사기
- 한 줄 설명: MDX/Markdown을 붙여 넣으면 frontmatter 필드, 제목·설명 길이, H1 개수, 이미지 alt 누락을 검사한다.
- 원천 스킬: `~/.claude/skills/gotekie-blog-writer/SKILL.md` (frontmatter: title/description/tags/category/date/author/thumbnail/series, 제목 40자 이내, description 120자 이내, H1 1개, 이미지 alt, 첫 문단 결론)
- 브라우저 전용: **가능** — YAML 파싱과 문자열 검사뿐.
- LLM: 불필요. ("첫 문단에 결론이 있나"는 규칙으로 판정하기 어려워 1차에서 뺀다.)
- 사용자 스토리(4): 붙여 넣고 검사 / 규칙별 통과·실패 목록 / 기준값(40·120자) 바꾸기 / 고친 frontmatter 복사
- 수요 근거:
  - https://tripledart.com/tools/meta-length-checker — 무료 메타 제목·설명 길이 검사기(제목 50~60자, 설명 150~160자 권장). (접근일 2026-11-04)
  - https://pkg.go.dev/github.com/giantswarm/frontmatter-validator@v0.2.0 — Hugo frontmatter 검증 CLI(제목 5~100자, 설명 50~300자 등). 개발 블로그에서 frontmatter 검사를 실제로 돌린다는 근거. (접근일 2026-11-04)
- 위험·법적 주의:
  - 길이 기준은 도구마다 다르다(위 두 곳도 다름). "검색엔진 공식 기준"처럼 쓰지 않고 "고텍이 기준"이라고 밝힌다.
  - 한글은 글자 수와 검색 결과 표시 폭이 다를 수 있다. [확인 필요]

### 5. `ko-plain-style-checker` — 쉬운 한국어 문체 검사기
- 한 줄 설명: 설명 문서 초안에서 80자 넘는 문장, 콜론 조각문, em-dash·화살표·가운데 점, 풀이 없는 영문 약어를 찾는다.
- 원천 스킬: `~/.claude/skills/explain-doc/SKILL.md` 4절 "글쓰기 규칙"(한 문장 80자 이하, 80자 초과 문장 10% 이하, 콜론 조각문 금지, em-dash·화살표·가운데 점 금지, 번역투 목록, AI 상투구 목록, 한 문단 새 용어 2개까지)과 `scripts/check.py`
- 브라우저 전용: **가능** — 문장 분리와 정규식 검사. `check.py`의 화면 위치 검사(스크린샷 기반)는 빼고 텍스트 규칙만 옮긴다.
- LLM: 불필요.
- 사용자 스토리(5): 붙여 넣고 검사 / 긴 문장 순위 보기 / 금지 기호 일괄 표시 / 해요체 섞임 표시 / 기준값 조절
- 수요 근거:
  - https://www.earticle.net/Article/A139561 — 홍정하·최재웅·유석훈(2011), 「텍스트 수준과 가독성」, 언어정보 12호. 문장 길이를 한국어 가독성 지표로 검증. "문장 길이 검사"의 학술 근거. (접근일 2026-11-04)
  - https://github.com/ttytu/ukta-web — 인하대 한국어 텍스트 분석기 UKTA(13 stars). 백엔드·docker-compose가 있는 서버형이라, 브라우저만으로 도는 가벼운 도구와 구분된다. (접근일 2026-11-04)
- 위험·법적 주의:
  - 1번 후보와 규칙이 겹친다(번역투 목록). 합칠지 나눌지 Phase 1에서 정한다. 합치면 "쓰기 도구 묶음" 하나가 된다.
  - 영어용 가독성 공식(Flesch 등)은 쓰지 않는다.

### 6. `blueprint-card` — 설계도 카드 이미지 생성기
- 한 줄 설명: 제목·핵심 기법·흐름·VS 비교·측정 4칸·알려진 한계를 폼에 넣으면 1080x1350 카드 PNG를 만든다.
- 원천 스킬: `~/.claude/skills/arch-doc/SKILL.md` ⑦절과 `references/card-blueprint.md` (구조 6단, 색 코딩 파랑·초록·빨강·앰버, 1080x1350, "측정은 실측만", "알려진 한계 스트립 필수")
- 브라우저 전용: **가능** — HTML/CSS 레이아웃을 Canvas 또는 SVG로 그려 PNG로 내보낸다.
- LLM: 불필요.
- 사용자 스토리(5): 폼 채우기 / 측정 칸에 근거 메모 달기 / 한계 칸 비면 내보내기 막기 / 4:5와 1:1 전환 / PNG 다운로드
- 수요 근거:
  - https://github.com/Hainrixz/open-carrusel — 인스타 캐러셀을 HTML로 만들어 PNG로 찍는 MIT 도구(507 stars, 1080x1350 지원). 단 로컬 실행·Claude 필요. (접근일 2026-11-04)
  - https://instantdm.com/instagram-free-tools/instagram-carousel-maker — 브라우저 전용 1080x1350 PNG 내보내기 도구. (접근일 2026-11-04)
  - 두 근거 모두 "세로 카드 이미지 생성" 일반 수요이고, "개발 설계도 카드" 특정 수요 근거는 못 찾았다. [확인 필요]
- 위험·법적 주의:
  - card-blueprint.md는 정보 구조를 "딩코딩코 백엔드 프로젝트 설계도" 시리즈에서 참고했다고 적는다. 시각 언어를 베끼지 않고, 도구 소개에 참고 사실을 밝힌다.
  - "실측만"을 도구가 강제할 수는 없다. 근거 칸을 필수로 두는 정도로 막는다.

### 7. `c4-adr-starter` — C4 Context 다이어그램·ADR 초안 생성기
- 한 줄 설명: 시스템 이름·사용자·외부 시스템·결정과 대안을 폼에 넣으면 Mermaid C4Context 코드와 ADR 마크다운 초안을 만든다.
- 원천 스킬: `~/.claude/skills/arch-doc/SKILL.md` (C4는 Context+Container만, ADR은 대안이 비면 폐기, arc42는 트리거 충족 칸만), `references/adr-template.md`, `references/arc42-triggers.md`
- 브라우저 전용: **가능** — 문자열 템플릿 + mermaid.js 미리보기. 원 스킬의 "코드 리포 스캔"은 브라우저 범위 밖이라 뺀다.
- LLM: 불필요.
- 사용자 스토리(4): 폼으로 Context 그림 만들기 / ADR 대안 칸 비면 경고 / arc42 12칸 체크리스트로 필요한 칸만 고르기 / md 복사·다운로드
- 수요 근거:
  - https://github.com/npryce/adr-tools — ADR 관리 CLI(5.8k stars). ADR 작성 도구 수요가 크다는 근거. (접근일 2026-11-04)
  - https://mermaid.js.org/syntax/c4.html — Mermaid C4 문서. 스프라이트·태그·범례 등 미완성 기능이 많고 배치를 문장 순서로 정한다고 적혀 있어, 폼으로 문법 실수를 줄여 주는 도구의 여지가 있다(추론). (접근일 2026-11-04)
- 위험·법적 주의:
  - arc42는 CC BY-SA 4.0, C4는 CC BY 4.0(원 스킬 표기). 생성물에 출처 표기를 넣는다. CC BY-SA의 동일조건 변경허락이 생성 문서에 미치는 범위는 [확인 필요].

### 제외: `rss-to-card-draft` — 테크 뉴스 수집 → 카드 초안
- 원천 스킬: `~/.claude/skills/tech-news-pipeline/SKILL.md` (Reddit hot.json + 한국 테크 블로그 RSS 수집, Pollinations 배경 생성, Pillow 합성)
- 브라우저 전용: **불가** — 남의 RSS·Reddit을 브라우저에서 직접 읽으려면 각 사이트가 CORS를 열어야 하는데 보장되지 않는다(이번 조사에서 사이트별로 확인하지 않음 [확인 필요]). 배경 생성도 외부 API(image.pollinations.ai) 호출이다. 서버(Worker 프록시)가 필요하므로 이번 "브라우저 전용" 기준에서 뺀다.
- 남길 수 있는 부분: 카드 렌더링은 3번 후보가 이미 다룬다.

---

## 다음 단계 제안
1. Phase 0: `ko-ai-tell-highlighter` 하루 MVP(규칙 11개, LLM 없음).
2. Phase 1 후보 순서(추정, 수요 근거의 직접성 기준): card-news-canvas → mermaid-polish → blog-meta-linter → ko-plain-style-checker(1번과 통합 검토) → c4-adr-starter → blueprint-card.
3. `ai-tell-taxonomy.md` 원저작·라이선스 확인을 Phase 0 공개 전에 끝낸다.
