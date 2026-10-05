# dev-gotech-lab 디자인 작업 이력 (2026-10-02 ~ 10-05)

> 작성 2026-10-05. 시안 브랜치·워크트리 삭제 전에 남기는 기록이다. 근거는 커밋 SHA·파일 경로로 붙였다.
> 확인 방법: `git log/show/diff`(읽기 전용), `gh pr view 6/7`, 운영 URL `curl`. 추측에는 "추정"이라고 적었다.
> 비교 아티팩트(시안 스크린샷 비교): https://claude.ai/artifact/XnaHPWqmPUKLgnuvzpidoX

## 0. 한 줄 요약

1차 시안 2개(refresh·canva)와 2차 시안 3개(refresh-a/b/c)를 만들어 비교한 뒤 **refresh("Lab Notebook" 연구 노트)에 상세 페이지·사진·콘텐츠를 더한 `design/upgrade`** 를 골랐다. PR #6 으로 배포했다가 운영 `/card-news` 에서 Cloudflare Error 1102 가 나서 되돌렸다(revert). 지금은 원인(OpenNext 증분 캐시 없음 → 모든 요청 SSR)을 고친 `release/upgrade-v2`(PR #7, OPEN)가 병합을 기다린다.

### 결론 표

| 브랜치 | 방향 | 결과 | 마지막 커밋 SHA |
|---|---|---|---|
| `design/refresh` | Lab Notebook — 모눈 연구 노트 + 버밀리언 마커 | **채택**(upgrade 의 바탕) | `d50837d854011d62c9f66799279d5e049550d765` |
| `design/canva` | Crosshair Lab — Canva 시안, 근흑색 + 형광 라임 | 미채택 | `cb9971c385909bb009146481f80a26879d817175` |
| `design/refresh-a` | Dither Archive — 1비트 디더 인쇄 아카이브 | 미채택 | `360e417c88392240b5889ded7a24b7d79559fc0b` |
| `design/refresh-b` | Inline Editorial — 인라인 칩 매거진, 세리프 | 미채택 | `dd56d63036b6db923ac423dca5e5c7fcfe58fbce` |
| `design/refresh-c` | Poster Daily — 날짜별 색 포스터 | 미채택 | `18704d51e0413da8196a08201c775f9a78cab2e5` |
| `design/upgrade-ey` | refresh + 차콜·노랑(EY) 색 + 기능 추가 | 미채택(색을 잘못 입힌 판, 보존용) | `4bcab47d0201ff9dbf1bbae2b889b1d345fcb90c` |
| `design/upgrade` | refresh 업그레이드 + 상세·사진·콘텐츠·E2E | 중간단계(PR #6 병합 → revert) | `3f0d77dd11b9fd5b52d6ed5b3a82290fb8f814d8` |
| `release/upgrade-v2` | upgrade 재적용 + 1102 수정 + G3b 게이트 | **진행중**(PR #7 OPEN) | `7431c0c05444c4722bc24f506a9f91880d9724ca` |
| `rollback/upgrade` | revert 커밋 표시용 | 중간단계(`origin/main` 과 같음) | `41008785efe8ee6beb280a398183cff02dfbddef` |

## 1. 브랜치 계보

```
origin/main @ 866ed9e (10-02 카드뉴스 자동 업데이트)
├─ design/canva      (+7, 10-02)                         ← 1차
└─ design/refresh    (+7, 10-02)                         ← 1차
   ├─ design/refresh-a (+7, 10-03)                       ← 2차
   ├─ design/refresh-b (+8, 10-02~03)                    ← 2차
   ├─ design/refresh-c (+9, 10-02~03)                    ← 2차
   ├─ design/upgrade-ey (+14, 10-03 12:48~13:27)         ← EY 색 판
   └─ design/upgrade   (+38, 10-03 13:40 ~ 10-04 08:34)  ← ey 의 기능 커밋을 cherry-pick, 색 커밋 2개 제외
        └─ PR #6 병합 97defa4 (10-04) → origin/main
             └─ 7134148 (10-04 데일리) → revert 4100878 (10-05) = origin/main = rollback/upgrade
                  └─ release/upgrade-v2: reapply 3a33a12 → 017db6c → 1165fc3 → 7431c0c (PR #7)
```

- 전체 SHA: 기준 `866ed9e82a631293d5c327069e4843491ef5895b`, PR #6 병합 `97defa43b80c65f7475c3924edc1b5f1c43a7ce9`, revert `41008785efe8ee6beb280a398183cff02dfbddef`, reapply `3a33a123787f69beda52ec9b34ed0e37a3b2fc4e`.
- `design/upgrade` 는 `design/upgrade-ey` 에서 갈라진 게 아니다. 같은 커밋 메시지를 13:40~13:41 에 refresh 위로 다시 쌓았다(author 시각은 ey 와 같고 committer 시각만 13:40 → cherry-pick). 빠진 것은 `d61508a`(차콜·노랑 토큰)와 `2773796`(EY 히어로)이다. 사진 원본은 `c0308c3` 로 따로 들어갔다.
- `origin/main` 의 히스토리에는 refresh·upgrade 커밋이 그대로 남아 있다. revert 는 내용만 되돌리기 때문에 `git merge-base origin/main design/refresh` 는 `d50837d` 다. 그래서 refresh 의 기준점을 계산할 때는 `866ed9e` 를 써야 한다.
- refresh·canva·a·b·c·ey 는 로컬 전용이다(원격 없음). `design/upgrade` 와 `release/upgrade-v2` 는 원격에 있다.

## 2. 공통 사항 (모든 시안)

- 스택: Next 16.1.5 + Tailwind v4(`@theme inline`, 설정 파일 없음) + shadcn. 토큰은 전부 `src/app/globals.css` 에 있고 서체는 `src/app/layout.tsx` 에서 정한다.
- 기존 토큰 이름(`--do-*`, `--accent-*`, shadcn 브리지)은 그대로 두고 **값만 바꾸는** 방식이다. 그래서 손대지 않은 하위 페이지도 새 색을 따라간다(그 결과 생긴 대비 문제는 시안마다 fix 커밋으로 고쳤다).
- 기준 main(866ed9e)의 디자인은 "Editorial Lab"이었다: teal 브랜드 훅(`--brand-h:195`), Space Grotesk + Pretendard 1.3.8 static + Geist Mono, 기본 다크.
- 카드뉴스 데이터는 `src/app/card-news/page.tsx` 의 `/* TECH-NEWS-PIPELINE-DATA:START/END */` 마커 구간에 있고 `publish.py` 가 관리한다. 모든 시안이 이 구간은 건드리지 않았다(커밋 본문에 명시).

## 3. 시안별 상세

### 3.1 `design/refresh` — "Lab Notebook" (채택 바탕)

- **시각 언어**: 기술 연구 노트. 라이트는 모눈 연구노트(종이·잉크), 다크는 야간 실험실(카본·분필). 헤어라인 그리드, 모노 라벨(실험 번호·날짜·태그), 크롭마크, 섹션 인덱스(§), 큰 디스플레이와 본문의 스케일 대비는 최대 8배다. (`b6b0f14`)
- **색 토큰**(`globals.css`)
  - 브랜드 훅 `--brand-h:38`(버밀리언/주홍), `--brand-c:0.165`, `--brand-l-dark:0.74`, `--brand-l-light:0.53`
  - 다크: page `#0F0F0D`, card `#161613`, 글자 `#EEECE4`/`#C9C6BB`/`#A3A095`/`#8E8B80`, 보조 cyan `#8DB3FF`, coral `#FF8A7A`, green `#73D5A0`, amber `#E9B64F`
  - 라이트: page `#F4F2EC`, card `#FBFAF7`, 글자 `#16150F`/`#3B3830`/`#5C584E`/`#67635A`, 모눈선 `rgba(44,82,140,0.075)`, cyan `#2453B8`, coral `#B42318`, green `#1C6E46`
  - `--radius: 0.25rem`, `--grid-minor: 24px`
- **폰트**: Pretendard Variable(CDN v1.3.9 dynamic-subset) + Geist Mono 2패밀리. Space Grotesk 는 제거했다.
- **레이아웃·모션**: 번호 붙은 목차형 내비 + 활성 마커, 4열 헤어라인 콜로폰 푸터(`c7e20d3`). 홈은 메타 스트립 + 초대형 제목 + FIG.01 도판, NumberTicker 수치 스트립, Marquee 스택 티커, 작업 절차표, 잡지 목차형 최신 기록(`98c1c78`). 블로그는 잡지 목차형 + ReUI 라인 탭, 글 번호는 필터해도 바뀌지 않는다(`08fa67d`). 카드뉴스는 최신 1건 커버 + 2x2 벤토 + 24개씩 더 보기(`0849521`).
- **도입한 외부 컴포넌트**: `components.json` 에 @tailark-oss·@magicui·@react-bits·@reui 레지스트리를 등록했다. marquee·number-ticker·badge·tabs·DecryptedText를 들여왔다(`926cd71`). motion 대신 기존 framer-motion 을 쓴다.
- **주요 파일**: `globals.css`, `layout.tsx`, `src/app/page.tsx`, `components/home/{home-hero,lab-stats,method-section,stack-ticker}.tsx`, `components/section/lab-head.tsx`, `components/blog/post-row.tsx`, `components/ui/{marquee,number-ticker,tabs}.tsx`, `components/reui/badge.tsx`, `components/effects/decrypted-text.tsx`
- **접근성·버그 수정**: "본문으로 건너뛰기" 링크 추가, 카드뉴스 모달에 dialog 역할·Esc·포커스 이동, reduced-motion 에서 숫자 티커가 0에 멈추던 문제(`d50837d`)
- **결과**: 사용자가 이 시안을 골랐다(10-03). 업그레이드의 바탕이 됐다.

### 3.2 `design/canva` — "Crosshair Lab" (미채택)

- **시각 언어**: 사용자의 Canva 홈 시안(https://canva.link/ij1l20oy7z3a0yy)을 옮겼다. 근흑색 바탕에 형광 라임 한 가지를 작은 블록·점·태그로만 쓴다. 전폭 1px 헤어라인 구획, 각진 카드 + 1px 테두리, 액센트 단어에는 라임 밑줄 블록을 깐다.
- **색 토큰**: `--brand-h:122`, `--brand-c:0.211`, `--brand-l-dark:0.938`(= `#D4FF3A`), `--brand-l-light:0.44`(짙은 올리브 `#495B02`, 라이트에서는 라임을 글자색으로 쓰지 않는다)
  - 다크: page `#0D0F0D`, card `#161917`, 글자 `#EDF0EA`/`#BFC5BA`/`#959D91`/`#8A9286`, 라임 위 글자 `#0D0F0D`(16.6:1)
  - 라이트: page `#F2F0E6`, card `#FBFAF5`, 글자 `#141612`/`#3D4239`/`#575D52`/`#5F655A`
  - 보조색은 채도를 낮췄다: cyan `#8FC9C0`, coral `#FF8A6B`, green `#B5D96A`, lavender `#B9B5D6`. `--radius: 0.125rem`
- **폰트**: Pretendard + Geist Mono(Space Grotesk 제거)
- **레이아웃**: 히어로는 왼쪽 큰 제목 + 라임 사각 CTA, 오른쪽에 조준선 박스(SVG 십자선·라임 원·모서리 점, `components/home/hero-crosshair.tsx`)를 둔다. 7/5 비대칭 카드, 모노 내비 + 라임 사각 활성 마커, 헤더 오른쪽에 라임 구독 버튼.
- **그림**: `public/images/canva/{gotech-hero.jpg 1680×944, gotech-cover.jpg 1080×1080, og-default.jpg 1200×630}`와 출처 README(Canva Pro 라이선스, 이 사이트 전용). 사이트 기본 OG/Twitter 이미지(`summary_large_image`)도 연결했다(`d7f8c84`).
- **접근성·버그**: 카드뉴스 카드를 button 으로 바꿨고 모달에 dialog·Esc를 달았다. 그림 위 글자에 암판(`.plate`) 바탕을 보장했다(`cb9971c`). 768 구간 내비 줄바꿈과 hidden 충돌도 고쳤다.
- **미채택 이유**: 사용자 선택에서 빠짐. 다시 쓸 만한 것: OG 기본 이미지 연결(upgrade 에는 없음), 조준선 히어로.

### 3.3 `design/refresh-a` — "Dither Archive" (미채택)

- **시각 언어**: 매일 찍혀 나오는 카드뉴스를 1비트로 인쇄된 기록물처럼 쌓는다. 석회 회색 바탕·잉크·흰 타일 위에 민트 신호 "한 칸"을 둔다. 다크는 같은 판을 반전한 네거티브 필름이다. 벤토 타일은 반경 0·간격 0으로 맞대고, 경계는 색 대비와 1px 잉크 선으로만 낸다.
- **색 토큰**: 라이트 page `#E2E2E0`, 타일 `#FFFFFF`, 잉크 `#111111`, 본문 `#2B2B29`. 다크 page `#121211`, 글자 `#ECECE8`/`#CFCFCA`. 신호 `--da-signal:#A1FFCB` / `--da-on-signal:#111111`. primary 는 잉크(라이트 `#111111`, 다크 `#ECECE8`). `--radius: 0rem`
- **폰트**: Pretendard(제목 800) + **Galmuri11**(12px 픽셀 라벨·날짜, OFL, 18.7KB 서브셋 자체 호스팅 `src/app/fonts/Galmuri11-subset.woff2`) + **JetBrains Mono**(코드)
- **시그니처**: `components/dither/{bayer.ts,dither-image.tsx}`. 원본은 그대로 두고, 뷰포트에 들어오면 캔버스에서 Bayer 4x4 디더를 그린다. hover/focus 때 400ms 무작위 점 디졸브로 원본이 드러난다. 실패하면 원본을 보여 주고 reduced-motion 이면 바로 바꾼다. DitherCard(Magic UI magic-card 포팅), AnimatedTabs(SmoothUI 포팅), 픽셀 배지, 화살표 블록 버튼도 있다.
- **레이아웃**: 홈은 간격 0 디더 벤토다. 120px 제목(DecryptedText 1회 스크램블), 디더 인물 타일, 민트 '오늘의 카드' 한 칸, 수치 4칸으로 짰다(`9ff0e6c`). 블로그는 잉크 선 표 + 반전 탭이다. 카드뉴스는 №·날짜 도장 디더 썸네일, 날짜 눈금 스트립(`date-tick-strip.tsx`), 3열 아카이브이고, 모달에서는 원본 컬러를 보여 준다(`1ee7eb8`).
- **버그 수정**: 다크에서 디더가 음화로 보이던 문제를 고쳤다(밝기 기준 2색 선택). 320px 줄바꿈과 모달 포커스 가둠·복귀도 고쳤다(`360e417`).
- **미채택 이유**: 사용자 선택에서 빠짐.

### 3.4 `design/refresh-b` — "Inline Editorial" (미채택)

- **시각 언어**: 문장 안에 프로젝트 아이콘·칩·태그가 박힌, 읽히는 포트폴리오다. **라이트가 기본**(유일하게 기본 테마를 바꿈: `<html className="light">`, 테마 스크립트는 저장값이 "dark"일 때만 다크). 크림·테라코타·형광펜은 쓰지 않고, 강조는 세리프 굵기와 코발트로만 한다.
- **색 토큰**: 라이트 page `#F7F7F5`, 잉크 `#15161A`, 본문 `#3A3C43`, 코발트 `#2B3BFF`(6.2:1). 다크 page `#131418`, 글자 `#ECECEF`, 밝힌 코발트 `#8F9BFF`. `--radius: 0.5rem`. 그 밖에 라일락 그레이와 핑크 태그.
- **폰트**: **Hahmlet**(제목·인용 전용 한글 가변 세리프, next/font 자체 호스팅. 굵기는 라이트 430·다크 470) + Pretendard(본문·UI) + Geist Mono(메타)
- **시그니처**: `components/editorial/{inline-chip,eyebrow,word-reveal}.tsx`. 인라인 칩은 조사와 묶어 줄바꿈을 막고, 미리보기 카드는 aria-hidden 이다. 스크롤에 따라 단어가 진해지는 WordReveal, animated-shiny-text, interactive-hover-button, animated-tabs 를 이식했다. `lib/{categories,project-glyphs}.ts`, `components/blog/post-thumb.tsx`(4:3 타이포 썸네일)도 있다.
- **레이아웃**: 홈 히어로는 사진 칩·프로젝트 칩·카드뉴스 칩을 박은 세리프 44px 문단이고, 수치는 숫자 칩 문장으로 보여 준다. 블로그는 잡지 지면형 1열(세리프 28px 제목)이다. 카드뉴스는 오늘·어제·그제 가로 레일 + 월별 아카이브이고, 상대 날짜는 마운트 후에 계산한다. 헤더는 주 링크 3개 + 보조 2개, 현재 위치는 코발트 점으로 표시한다.
- **접근성·버그**: 인라인 칩 테두리(axe link-in-text-block), 44px 터치 영역, 코드 블록을 두 테마 모두 잉크 판으로, 소개 페이지 대비(axe color-contrast 0)(`6663328`, `dd56d63`)
- **미채택 이유**: 사용자 선택에서 빠짐.

### 3.5 `design/refresh-c` — "Poster Daily" (미채택)

- **시각 언어**: 카드뉴스 하루치가 한 장의 색 포스터가 되고, `№184` 같은 숫자 자체가 브랜드다.
- **색 토큰**: 포스터 잉크는 테마와 무관하다. ink `#1D2440`, paper `#F9FCF4`, pink `#FF9BB4`, yellow `#FFE500`, green `#14CD69`, deep `#1C4839`. 필드 5색 `.field-{navy,pink,yellow,green,deep}` 은 글자색을 짝으로 지정해 대비 7.2~14.7:1 을 맞췄다. 페이지는 다크 `#0E1224`(primary 핑크 `#FF9BB4`), 라이트 `#F9FCF4`(primary `#A61E52`). `--radius: 0.375rem`, 버튼은 pill.
- **날짜→색 규칙**(`src/lib/poster.ts`): UTC 일수 서수 × 3 mod 5. 같은 날짜는 언제나 같은 색이고 이웃한 날은 항상 다른 색이다. `src/lib/card-news.ts` 로 카드뉴스 실제 개수·최신 번호를 읽는다.
- **폰트**: Pretendard + **Anton**(숫자·영문 압축 디스플레이) + **Martian Mono**(스탬프·라벨·코드). Geist Mono는 제거했다.
- **레이아웃·모션**: 첫 화면은 오늘 필드 색 전면 + Anton № 카운트업이다. 스크롤하면 숫자가 밀려나고 데스크톱에서는 어제 포스터가 덮는다(`components/home/poster-hero.tsx`). 최근 7일 제목 마퀴, 지난 5일 타일(`daily-strip.tsx`)이 이어진다. 블로그는 2열 스티커 카드 + 오프셋 그림자다. 카드뉴스 타일은 TiltedCard 로 감쌌고, 정밀 포인터에서만 기울어진다. shimmer-button 은 히어로 1곳에만 쓴다. 헤더에 오늘 번호 스탬프를 달았다.
- **버그 수정**: 카운트업이 어제 번호에 오래 머물던 문제를 과감쇠 스프링으로 고쳤다(`96f25e8`). 구독 입력창 대비를 1.2 → 14.7 로 올렸고, 코드 블록 주석 대비를 6.0:1 로 맞췄다(`18704d5`).
- **미채택 이유**: 사용자 선택에서 빠짐.

### 3.6 `design/upgrade-ey` — 차콜·노랑 판 (미채택, 보존용)

- refresh 위에서 `d61508a` 가 브랜드 훅을 노랑(`--brand-h:101.4`, `--brand-c:0.19`, `--brand-l:0.917` ≈ `#FFE600`)으로 바꿨다. 다크 page `#1A1A24`/`#2E2E38`, 글자 `#FFFFFF`이고, 노랑을 선·형광 표시로만 쓰는 `--do-mark` 를 새로 만들었다. 각진 모서리·그림자 없음·hover 반전 버튼, 큰 제목 300·모노 라벨 700, 헤더 활성 4px 막대.
- `2773796`: 홈 히어로를 큰 인물 누끼 도판(베이지 재킷)으로 바꿨다.
- 나머지 12개 커밋은 upgrade 와 내용이 같은 기능 커밋이다(4절).
- **미채택 이유**(사용자 메모): EY한영 색감은 gc-review-gate 전용이었는데 이 사이트에 잘못 입혔다. upgrade 는 이 판에서 색 커밋을 빼고 다시 쌓았고, `0ffc0f7` 에서 옮겨 온 화면에 남은 EY 유틸(mark·on-mark·btn-accent)을 주홍·잉크로 바꿨다.

## 4. 채택본: `design/upgrade` → `release/upgrade-v2`

### 4.1 스타일 (refresh 위 추가분)
- 토큰은 refresh 값 그대로다(`--brand-h:38` 버밀리언). `src/app/lab-notebook.css`(434줄, `globals.css` 에서 `@import`)를 추가했다: 문서 메타 줄, 기록 도장, 표본 칩, 텍스트 링크, 인화지 도판, 사양 표, 각주, 초록(Abstract) 상자, 버튼 active/disabled, 코드 블록 두 테마(`--shiki-dark/light`), 본문 h2 §번호·이미지 FIG 번호 카운터(`0ffc0f7`)
- 공용 `components/section/doc-header.tsx`(위치·기록 도장 Entry No./Project P-xx/Specimen S-xx·메타 줄)

### 4.2 추가된 페이지·사진·콘텐츠
- **카드뉴스 상세** `src/app/card-news/[id]/page.tsx`(정적 생성, 당시 184건 → 현재 186건): 카드별 메타·OG·BreadcrumbList, 공유(`share-buttons.tsx`: 링크 복사·X·Threads), 이전/다음, 같은 태그 블로그 글(`bc35c99`)
- **5장 슬라이드** `components/card-news/{card-slides,slide-rail}.tsx`: 표지·무슨 일인가(원문 발췌)·왜 중요한가(의견 데이터가 있을 때만)·핵심 숫자(원문 숫자만)·출처, 최소 3장. 표지·출처 장은 카본, 발췌 장은 미색 모눈이다(테마 무관 고정색, `f749aee`). 표시 로직은 `src/lib/card-news.ts`.
- **카드뉴스 갤러리**: 검색·태그·출처 유형 필터, URL 상태 `?q=&cat=&tag=&src=`(history API). 카드를 누르면 모달 대신 상세로 간다(`4904500`). sitemap 에 상세를, RSS 에 최근 30건을 넣었다(`09ac543`).
- **블로그 상세**: sticky 목차(IntersectionObserver), 읽기 진행 바(`reading-progress.tsx`), tldr 요약 상자(frontmatter 선택 필드), 연재 내비(`src/lib/series.ts`), 관련 글, JSON-LD(`046246f`, `5d5b2c2`)
- **프로젝트 → 케이스 스터디**(`components/projects/case-study-card.tsx`, `src/lib/case-studies.ts`): §01 문제 → §02 접근 → §03 측정값(근거 각주) → §04 스택 → §05 링크. 쇼케이스 상세는 표본 사양 표, 데모가 없으면 버튼을 disabled 로 둔다(`daf42f1`, `688b116`).
- **소개 페이지**: FIG.02 청사진 도판, 사양 표, 제사(epigraph), 제품 계보 ToHangul → SuperWord → SuperPoint, Person JSON-LD(`fae6173`, `bcd599c`)
- **사진**(`c0308c3`, `725d1ac`): `public/images/portrait-hero.webp`(1000×1250, 49KB, 홈 LCP, 4:5 인화지 도판), `portrait-front.webp`(900×1050), `portrait-seated.webp`(965×1615), `avatar.webp`(320×320). `next.config` `images.formats` 는 avif·webp.
- 서비스 빈 상태 등록부 표(`4bdae88`). 홈 카드뉴스 섹션은 최신 표지 3장(`7174dbd`).
- 콘텐츠 정정: markdown-to-slides 의 가짜 URL(`md2slides.example.com`)을 지우고 live → wip 로 바꿨다(`4b3e1f2`).

### 4.3 upgrade 에서 고친 접근성·버그
- 앵커가 고정 헤더에 가려짐 → `scroll-padding-top: 6rem`(`369e629`)
- reduced-motion 숫자 티커 하이드레이션 불일치 React #418(`90f9500`), MDX 이미지 p 안 figure 중첩 #418(`f0ed7b7`), 태그 정렬 `localeCompare` 서버·브라우저 차이(`524de3f`)
- `SITE_URL` 기본값 `gotech-lab.pages.dev`(DNS 없음) → `dev-gotech-lab.kugll9606.workers.dev`(`66f851c`)
- 구독 폼이 저장하지 않고도 '구독 완료'를 보여 주던 문제(`126760b`), 짧은 글 진행 바 100%(`188428a`), GFM 체크박스 이름(`86abe09`), 경력 번호 대비(`7cb7329`)
- Cloudflare 런타임에서 카드 상세가 전부 404 → `dynamicParams=false` 제거(`0c5e2a1`. v2 에서는 캐시를 넣은 뒤 다시 켬)
- wrangler esbuild `keep_names` 가 next-themes 인라인 스크립트에 `__name` 을 넣어 모든 페이지에서 ReferenceError → `wrangler.jsonc` `"keep_names": false`(`50b61c0`)
- CI tsc 가 `*.webp` import 타입을 못 찾음 → `src/types/next-image.d.ts`(`3f0d77d`)

### 4.4 카드뉴스 Claude 문구 파이프라인 (`dbc2216`)
- 위치: `scripts/card-news-pipeline/`
  - 진입점: `caption_review.py`(수동 실행), `auto_daily.py --claude-caption [--caption-out-dir DIR]`(섀도 모드, 기본 출력 `/tmp/card_caption_<날짜>/`)
  - 모듈: `lib/caption/{source_text,prompts,checks,clients,flow,report,runner,config}.py`
  - 설정: `config/caption.yaml`(모델 기본 `claude-sonnet-5-5`, 우선순위는 env `CARD_NEWS_CAPTION_MODEL` > yaml > 기본값)
  - 테스트: `tests/test_{checks,clients,flow,source_text,auto_daily}.py`(pytest 79건)
  - 문서: `scripts/card-news-pipeline/README.md` "Claude 문구 파이프라인 (옵트인)" 절
- 흐름: 원문 확보 → 생성(사실마다 근거 구절) → 코드 검사 5종(근거 실재·숫자 실재·25자 연속 겹침·과장어·길이) → 별도 판정 호출(맞음/확인 불가/틀림) → `status: "pending_review"` JSON + Markdown 판정표 + 원문 텍스트
- 클라이언트: `ANTHROPIC_API_KEY` → SDK 또는 urllib. 키가 없으면 `claude -p` CLI, 둘 다 없으면 `skip_reason: "no_claude_client"`.
- Reddit 은 약관을 확인하지 못해 **코드에서 항상 제외**한다(`skip_reason: "reddit_terms_unverified"`, 설정으로 끌 수 없음).
- 옵트인: 플래그가 없으면 import 도 하지 않는다. `.github/workflows/card-news-daily.yml` 은 플래그 없이 `auto_daily.py` 를 부른다 → **운영에서는 꺼져 있다.**
- **빠진 단계**: 승인된 문구를 `src/app/card-news/page.tsx` 마커 구간에 반영하는 코드가 없다. 지금은 사람이 출력의 `proposed_entry_patch` 를 보고 직접 반영해야 한다(README "알려진 한계"). 재생성 루프, 번역투 검수, 의미 중복 판정도 아직 없다.
- 실행: `uv run --python 3.12 --with pytest --with pyyaml pytest scripts/card-news-pipeline/tests -q`

### 4.5 테스트·게이트 위치와 실행법
| 게이트 | 내용 | 위치 / 명령 |
|---|---|---|
| G1 정적 | content·tsc·lint·build·check:render | CI `validate` 잡(`.github/workflows/ci.yml`) |
| G2 E2E | 공개 페이지 × 320·390·768·1440 × 다크·라이트: 콘솔 에러·가로 넘침·깨진 이미지·axe serious/critical 0, 링크 크롤, 기능별 스펙. 재시도 0 | `e2e/*.spec.ts`, `playwright.config.ts`(3372 포트 next start). `pnpm build && pnpm test:e2e`. **CI 미포함**(README) |
| G3 | OpenNext 로컬 프리뷰(workerd)에서 전체 E2E | `pnpm preview` 후 `E2E_BASE_URL=http://localhost:8787 pnpm test:e2e` |
| G3b 운영 런타임 비용 | 렌더 방식 계약 + 캐시 HIT·열람 시 렌더 0건·404·허용 경로 p95 | `pnpm check:render`(`scripts/check-render-modes.mjs` + `scripts/render-allowlist.json`), `pnpm test:e2e:runtime`(`e2e/runtime-cost.spec.ts`). CI `runtime-cost` 잡, `pnpm deploy` 안에서도 실행 |

- 게이트 이름 G1~G3b 는 PR #7 본문과 커밋 메시지에만 나온다. 저장소에 게이트 목록 문서는 없다.
- CI `deploy` 잡은 `needs: [validate, runtime-cost]` 이고 main push 때만 돈다.

### 4.6 1102 장애 경위와 현재 수정 상태
1. 10-04 08:38 PR #6 병합(`97defa4`) → main push 로 CI 배포(배포 로그는 직접 확인하지 않음)
2. 운영 `/card-news` 가 Error 1102(Worker exceeded resource limits) → 10-05 08:52 revert `4100878` 로 롤백. 10-05 현재 운영 `https://dev-gotech-lab.kugll9606.workers.dev/card-news` 는 200(롤백판).
3. 원인(PR #7 본문, 로컬 workerd 실측): `open-next.config.ts` 에 `incrementalCache` 가 없어 빌드 때 만든 HTML 을 런타임이 쓰지 못하고 모든 요청을 SSR 했다(`x-nextjs-cache: MISS`). 카드 상세 186쪽과 내부 링크가 생기자 Next 16 Link 프리페치 때문에 `/card-news` 1회 열람당 SSR 요청이 27 → 108건, Worker CPU 가 1,370 → 2,260ms 로 늘었다. 로컬 workerd 는 CPU 한도를 강제하지 않아 G3 가 통과했다.
4. 수정(`release/upgrade-v2`):
   - `3a33a12` revert 를 되돌려 upgrade 를 재적용
   - `017db6c` `staticAssetsIncrementalCache` + `enableCacheInterception: true`. `wrangler.jsonc` 는 그대로다. 상세 4종(card-news·blog·projects·showcase)에 `dynamicParams = false` 를 다시 켰다.
   - `1165fc3` `/blog` 를 정적(○)으로(필터는 클라이언트 `history.pushState`), `/rss.xml` force-static, 갤러리 표시 모델(`toGalleryCard`)을 빌드 시점에 계산
   - `7431c0c` G3b 추가(허용 목록 밖 ƒ·ISR·캐시 설정 누락이면 실패). 동적 허용은 `/services/news`(D1, p95 50ms) 하나뿐이다.
   - 효과(PR #7 표): `/card-news` 웜 CPU 47.3 → 18.7ms(HIT), 열람 1회 Worker 렌더 요청 108 → 0
5. **현재 상태(10-05)**: PR #7 OPEN. CI `validate`·`운영 런타임 비용 (G3b)` SUCCESS, `Cloudflare 배포` SKIPPED(PR 이므로). 리뷰 결정과 댓글은 없다.
6. **남은 게이트**
   - G3(OpenNext 로컬 프리뷰 전체 E2E) 결과: PR 본문에 "진행 중(댓글로 갱신)"이라고 했지만 댓글이 0개라 결과 기록이 없다.
   - PR #7 병합 → 운영 배포 후 실제 Cloudflare 에서 `/card-news`·`/card-news/<id>`·`/` 가 200 이고 1102 가 없는지, 응답 헤더 `x-opennext-cache: HIT` 인지 확인. 운영 CPU 한도는 로컬에서 재현되지 않으므로 이 확인은 배포 후에만 할 수 있다.
   - 사용자 원칙(신기술은 섀도 → 카나리 → 전면)에 맞춘 카나리 경로(Workers 버전 업로드 `pnpm upload` 후 미리보기 URL 검증 등)는 아직 정해지지 않았다(추정: 필요 여부부터 결정해야 함).

## 5. 운영 발견 사항 (결정 대기)

- **GitHub 저장소 링크 비로그인 404**: 10-05 `curl` 로 확인. 404 는 `park-mate`, `youtube-short-automation`, `markdown-to-slides`, `smart-thumbnail` 4곳(`content/projects/park-mate.mdx`, `content/projects/youtube-short-automation.mdx`, `content/showcase/markdown-to-slides.mdx`, `content/showcase/smart-thumbnail.mdx` 의 `repoUrl`). 200 은 `dev-gotech-lab`, `pdf-link-share`, `work-mate`. 비공개 저장소라서 404 인 것으로 추정한다. 저장소를 공개할지 링크를 지울지 정해야 한다.
- **projectb-shop '배포완료' 표기**: `content/showcase/projectb-shop.mdx` 가 `status: "live"` 인데 데모 URL 필드가 없다(upgrade-v2 기준에서도 같음). markdown-to-slides 처럼 `wip` 로 내릴지, 데모를 붙일지 정해야 한다.
- **revert 로 운영에 되살아난 결함**(PR #7 병합 시 다시 해소): 운영 main 의 `SITE_URL` 기본값이 다시 `https://gotech-lab.pages.dev`(죽은 주소)이고, `wrangler.jsonc` 에 `keep_names: false` 가 없다. 그래서 canonical·sitemap·공유 URL 이 깨지고 `__name` ReferenceError 가 다시 난 상태로 추정한다(`50b61c0`, `66f851c` 본문 근거, 운영 HTML 은 직접 보지 않음).

## 6. 삭제된 브랜치 복구법

> **2026-10-05 삭제 전 백업 완료.** 삭제한 브랜치 전부를 git 번들로 묶어 두었다: `~/workspace/_archive/design-branches-2026-10/dev-gotech-lab.bundle`(작성자 로컬 머신에만 있음, 원격 아님). gc 뒤에도 이 번들로 복구된다:
> ```bash
> git fetch ~/workspace/_archive/design-branches-2026-10/dev-gotech-lab.bundle 'refs/heads/*:refs/heads/*'
> git bundle list-heads ~/workspace/_archive/design-branches-2026-10/dev-gotech-lab.bundle   # 들어 있는 브랜치·SHA 확인
> ```
> 번들 파일까지 없어졌다면 아래 SHA 명령은 객체가 gc 되기 전까지만 통한다.

```bash
cd ~/workspace/dev-gotech-lab
git branch design/canva      cb9971c385909bb009146481f80a26879d817175
git branch design/refresh    d50837d854011d62c9f66799279d5e049550d765
git branch design/refresh-a  360e417c88392240b5889ded7a24b7d79559fc0b
git branch design/refresh-b  dd56d63036b6db923ac423dca5e5c7fcfe58fbce
git branch design/refresh-c  18704d51e0413da8196a08201c775f9a78cab2e5
git branch design/upgrade-ey 4bcab47d0201ff9dbf1bbae2b889b1d345fcb90c
git branch design/upgrade    3f0d77dd11b9fd5b52d6ed5b3a82290fb8f814d8
git branch rollback/upgrade  41008785efe8ee6beb280a398183cff02dfbddef
# 워크트리로 다시 보기: git worktree add ~/workspace/worktrees/gotech-ra design/refresh-a
# 객체가 남았는지 확인: git cat-file -t <sha>   (commit 이면 복구 가능)
```

- **영구 보존**: `design/refresh`, `design/upgrade`, `rollback/upgrade` 의 커밋은 `origin/main`(PR #6 병합 히스토리)과 `origin/design/upgrade` 에서 닿기 때문에 gc 되지 않는다.
- **gc 위험**: `design/canva`, `design/refresh-a/b/c`, `design/upgrade-ey` 는 **로컬에만 있다.** 브랜치를 지우면 reflog 가 만료되고(기본 unreachable 30일) gc/prune 이 돌 때 객체가 사라진다. 그 뒤에는 SHA 로도 복구할 수 없다. 오래 남기려면 삭제 전에 `git push origin <branch>` 하거나 `git bundle create design-drafts.bundle design/canva design/refresh-a design/refresh-b design/refresh-c design/upgrade-ey` 로 묶어 두는 방법이 있다(→ 번들 방식으로 실행함, 이 절 맨 위 참고).
- 워크트리 7곳은 10-05 확인 때 미커밋 변경이 0건이었다(`git -C <wt> status --short`).

## 7. 이전 디자인 시도 (3~5월, 이번 삭제 대상 아님)

| 브랜치 | 날짜 | 방향 | main 미반영 커밋 |
|---|---|---|---|
| `backup/before-redesign-v2` | 03-17 | brand-v2 직전 백업 포인트(`8261d5c`) | 1 |
| `redesign/brand-v2` | 03-17~03-26 | Cyber Cyan/Deep Violet/Space Black 브랜드 컬러, Velog 스타일 블로그, 카드뉴스 D1 CMS·관리자 인증(`e37396a`). 이후 블로그 글 커밋 | 7 |
| `redesign/neon-v3` | 03-17~03-27 | brand-v2 위 네온-픽셀 시스템: 노이즈·오로라·스캔라인, 픽셀 꽃 패럴랙스, 네온/미니멀 테마 토글(`b46903d`, `a521a81`) | 9 |
| `feat/digital-obsidian-redesign` | 04-04 | Digital Obsidian(teal `#6FB3B8`, glass-nav·obsidian-card). 디자인 자체는 main `168f269`(04-09)에 병합된 것으로 보이고, 남은 1건은 블로그 글 | 1 |
| `feat/gotechy-brand` | 05-20 | GoTechy 브랜드 가이드: Cobalt `#2F63FF`, Electric Cyan `#00D4FF`, Deep Indigo `#0F1226`, 테마별 로고·인물(`dc86dca`) | 7 (main `78d149e`/`56cb708` 리브랜딩에 비슷한 내용이 들어간 것으로 추정) |

- 지금 토큰 이름의 `--do-*` 접두사는 Digital Obsidian 의 흔적이다(추정).

## 8. 다음에 이어 작업할 사람(미래의 Claude)에게

**남은 결정**
- PR #7 병합 시점과 배포 후 검증 방식(카나리를 둘지)
- 운영 발견 2건: GitHub 링크 4곳, projectb-shop 상태
- 카드뉴스 문구 파이프라인: 승인 문구를 page.tsx 에 반영하는 단계를 만들지, 데일리 워크플로에서 `--claude-caption` 섀도를 켤지
- 미채택 시안에서 가져올 것이 있는지(예: canva 의 기본 OG 이미지, c 의 날짜별 색 규칙)

**함정**
- 메인 작업트리 `~/workspace/dev-gotech-lab` 의 로컬 `main` 은 `origin/main` 보다 85커밋 뒤처져 있고 사용자의 미커밋 작업이 있다. checkout·stash·reset 을 하지 말고 `git show <ref>:<path>` 나 별도 워크트리를 쓸 것.
- refresh 계열의 기준을 `git merge-base origin/main ...` 으로 구하면 PR #6 히스토리 때문에 틀린 값이 나온다. 기준은 `866ed9e` 다.
- `docs/design-system.md` 는 아직 옛 "Editorial Lab"(teal) 내용이다. 문서에 "globals.css 와 항상 일치"라고 써 있지만 refresh·upgrade·v2 어디서도 갱신하지 않았다.
- 로컬 workerd(`pnpm preview`)는 Workers CPU 한도를 강제하지 않는다. 시간이 아니라 "요청마다 렌더되는가"(G3b)로 판단할 것.
- 정적 자산 증분 캐시는 읽기 전용이다. ISR·`revalidate`·새 동적 경로를 넣으면 `check:render` 가 막는다. 꼭 필요하면 `scripts/render-allowlist.json` 에 이유와 p95 상한을 적고, R2 캐시를 검토한다.
- 카드뉴스 데이터 마커 구간(`TECH-NEWS-PIPELINE-DATA`)은 `publish.py` 소유다. 마커 밖에서 export 만 추가할 것.
- E2E 는 공유 머신 부하에 민감하다(시간 예산 180초, expect 30초, 재시도 0). 외부 CDN(jsdelivr Pretendard)의 응답 없음은 경고로만 처리한다(`8431244`).
- `next-env.d.ts` 는 gitignore 대상이다. 정적 이미지 타입은 `src/types/next-image.d.ts` 에 있다.
- E2E 결과 스크린샷은 PR #7 본문에 로컬 `./artifacts/`(커밋 안 함)라고 돼 있지만, 10-05 확인 때 워크트리에 해당 폴더가 없었다.
