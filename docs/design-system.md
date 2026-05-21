# gotech.lab — "Editorial Lab" 디자인 시스템

> 단일 진실 소스(Single Source of Truth). 이 문서와 `src/app/globals.css`는
> **항상 일치**해야 한다. 토큰을 바꾸면 양쪽을 같은 커밋에서 갱신한다.
>
> **레퍼런스 DNA**:
> - **san.framer.website** (1순위) — 웜 슬레이트 베이스, 초대형 압축 디스플레이 + 이탤릭 세리프 액센트, 컬러풀 메이슨리, 회전 배지, 마퀴, 그라데이션 CTA
> - Linear (휘도 스태킹·반투명 보더) · Vercel (shadow-as-border 기법)
>
> 적용 범위: 홈 + 모든 섹션 페이지(blog/projects/showcase/about/card-news). 사용자 콘텐츠는 보존.

---

## 1. Visual Theme & Atmosphere

san.framer 풍 **에디토리얼 디자이너 포트폴리오**. 다크는 웜 슬레이트(#22242E 시그니처) 위에서
콘텐츠가 컬러풀하게 떠오르고, 라이트는 Figma 프레임 시트 위에 동일한 컬러 카드가 더 강하게 발색.
양 테마는 동급 1급 시민이며, **위계는 weight가 아니라 크기 대비·자간 압축·색 대비**로 만든다.

핵심 특성:
- 웜 슬레이트 다크 베이스 (`#1B1D26` 페이지, `#22242E` 카드/섹션 — san 시그니처)
- Figma 프레임 라이트 (잉크 `#0A0A0A` on `#FFFFFF`)
- **초대형 압축 디스플레이** (`clamp(3.25rem,...,10rem)`, `-0.045em` 자간) + **이탤릭 세리프 액센트 단어**
- **컬러풀 솔리드 카드** 5색 시맨틱 셋 (violet·emerald·amber·coral·cyan) — 콘텐츠 카드의 기본
- **단일 크로마 액센트 = 브랜드 틸**(현재). 모든 색은 `--brand-*` 훅 1곳에서 oklch 파생
- shadow-as-border 헤어라인, 휘도 스태킹 카드, 절제 모션, 회전 배지, 마퀴, 그라데이션 CTA

## 2. Color — Tonal Architecture

### 브랜드 훅 (리브랜딩 = 여기 3개만 교체)
```
--brand-h: 195;        /* hue (현재 틸) */
--brand-c: 0.062;      /* chroma */
--brand-l-dark: 0.74;  --brand-l-light: 0.50;
```

### Dark (san 웜 슬레이트)
| Role | Token | Value |
|---|---|---|
| Page / Surface | `--do-surface` | `#1B1D26` |
| Card / Section (san 시그니처) | `--do-surface-container-low` | `#22242E` |
| Container | `--do-surface-container` | `#282B37` |
| Elevated | `--do-surface-container-high` | `#313440` |
| Highest | `--do-surface-container-highest` | `#3C4050` |
| Bright (hover) | `--do-surface-bright` | `#494E61` |
| Text 1 primary | `--do-on-surface` | `#F4F5F7` |
| Text 2 body | `--do-on-surface-variant` | `#C7CAD4` |
| Text 3 meta | `--do-on-surface-muted` | `#8E92A0` |
| Text 4 faint | `--do-on-surface-faint` | `#61657A` |
| Hairline | `--do-hairline` | `rgba(255,255,255,0.08)` |

### Light (Figma 프레임 + Vercel 갤러리)
| Role | Token | Value |
|---|---|---|
| Page (frame bg) | `--do-page` | `#EAEAE7` |
| Surface (sheet) | `--do-surface` | `#FFFFFF` |
| Subtle tint | `--do-surface-container-low` | `#FAFAFA` |
| Text 1 heading | `--do-on-surface` | `#0A0A0A` |
| Text 2 body | `--do-on-surface-variant` | `#404040` |
| Hairline | `--do-hairline` | `rgba(0,0,0,0.08)` |

### 컬러 카드 5색 (san 시그니처 — 양 테마 동일, 솔리드 색 위 가독 텍스트)
- `.card-c1` violet `#6C4DF6` / 흰 텍스트
- `.card-c2` emerald `#10B981` / 다크 텍스트
- `.card-c3` amber `#F5A524` / 다크 텍스트
- `.card-c4` coral `#FF6B5E` / 다크 텍스트
- `.card-c5` cyan `#22B8CF` / 다크 텍스트
- 자식 `.c-sub` 클래스는 sub-텍스트 톤 자동 적용
- ColorCard 컴포넌트가 index로 자동 순환

### 시맨틱 액센트 (인라인 강조 / 핀)
- `--accent-cyan #4CC9F0 · coral #FF6B5E · green #5BD6A0 · lavender #C4B5FD`
- 라이트는 대비용 심화: cyan `#0E7FA8`, coral `#D8442F`, green `#1E8C5E`, lavender `#6D5BD0`

## 3. Typography — 압축 그로테스크 + 세리프 이탤릭 액센트

- Display: **Space Grotesk** (`--font-headline`) — san의 Sharp Grotesk 대체
- Body(한글): **Pretendard** (`--font-body`)
- Code: **Geist Mono** (`--font-code`)
- 액센트 단어: **시스템 세리프 이탤릭**(Georgia/Times/Noto Serif KR) — `.display-accent`

| Role | Util | Size (clamp) | Weight | LH | Tracking |
|---|---|---|---|---|---|
| Display-XL (히어로) | `.type-display-xl` | `clamp(3.25rem,…,10rem)` | 700 | 0.92 | -0.045em |
| Display | `.type-display` | `clamp(2.5rem,…,6.75rem)` | 600 | 0.98 | -0.045em |
| Headline | `.type-headline` | `clamp(1.75rem,…,3rem)` | 600 | 1.1 | -0.02em |
| Title | `.type-title` | `clamp(1.125rem,…,1.5rem)` | 600 | 1.25 | — |
| Body | `.type-body` | 17px | 400 | 1.75 | — |
| Small | `.type-small` | 15px (14px 금지) | 400 | 1.65 | — |
| Label | `.type-label` / `.section-label` | 12px / 0.7rem | 700 | — | 0.16em / UPPER |

**3-웨이트 규율** + **압축 자간** + **이탤릭 세리프 액센트로 어휘 단위 강조**.
- `.display-accent` 한 단어를 이탤릭 세리프 프라이머리로 (예: "Build the *Visual* Technology")
- `.text-em` 본문 인라인 이탤릭 컬러 강조
- `.hl` 프라이머리 일반 컬러 강조 (이탤릭 X)

## 4. Components

### Cards
- `.obsidian-card` — 뉴트럴 surface-container-low + hairline 링 + hover lift
- `.card-color` + `.card-c{1-5}` — san 컬러풀 솔리드 (콘텐츠 카드 기본)
- `<ColorCard index>` 컴포넌트가 5색 순환 자동
- `.tilt-card` — hover 시 미세 회전+lift (san 부채꼴 느낌)

### Process / Feature rows
- `.process-row` — 행 패널, hover 시 translateX
- `.process-row--active` — 1개만 틸 채움 (san "Design" 활성)
- `.idx` — 행 좌측 인덱스 (이탤릭 모노)

### Section primitives
- `<PageHeading eyebrow title lead count size>` — 거대 페이지 타이틀 (히어로 = `size="xl"`)
- `<SectionLabel count>` — 트래킹 대문자 + (NN) 카운트
- `<ColorCard index variant neutral>` — 컬러풀 카드 래퍼
- `<Marquee items durationSec>` — 무한 가로 마퀴 (트랙 2배 + mask edge)
- `<SpinBadge text centerEmoji>` — 회전 원형 스탬프 (SVG textPath)
- `<Reveal index y as>` — fade-up 진입 (whileInView, reduced-motion 자동)
- `<Magnetic strength>` — 포인터 추종 CTA

### Decorative
- `.pill-tag` + `.pill-{green/coral/violet/surface}` — 떠다니는 주석 핀
- `.cta-atmos` — 그라데이션 분위기 CTA (radial teal+lavender wash)
- `.section-invert` — 톤 반전 섹션 (다크↔라이트 자동)
- `.corner-arrow` — ↘ 코너 데코
- `.grid-texture` — 배경 격자 (히어로)
- `.ambient-glow` / `.ambient-glow-subtle` — 라디얼 글로우
- `.app-frame` — 라이트 모드 Figma 프레임 (라운드 시트)

### Status badges
- `.badge-live` / `.badge-wip` / `.badge-archived` — 하드웨어 라벨 톤 (`rounded-[0.1875rem]`)

### Buttons
- `.btn-primary` (틸 솔리드, rounded-full, hover lift+글로우)
- `.btn-outline` (투명 + hairline, rounded-full)

## 5. Spacing & Grid

- 8pt 베이스. 페이지 패딩 데스크탑 `px-6 md:px-10`.
- 카드 간 `gap-4 md:gap-5`, 섹션 간 `mb-28 md:mb-40`.
- 컨테이너 max `7xl`(1280px), about는 `5xl`, card-news는 `6xl`.
- 메이슨리 그리드: 12-col + 7/5/5/7 패턴 반복 (블로그·프로젝트).

## 6. Depth & Elevation

- 다크: 휘도 스태킹 (배경 단계 ↑ = elevation ↑) + 컬러 카드 자체 발색
- 라이트: shadow-as-border 헤어라인 + 컬러 카드 솔리드
- hover lift: `translateY(-6px) rotate(-1deg) scale(1.015) + shadow`

## 7. Motion & Interaction

- 진입: `<Reveal>` fade-up 16px / 600ms / ease-out-expo / 80ms 스태거 / `once:true` (whileInView)
- CTA: `<Magnetic strength=6>` 포인터 추종 미세 변위
- 마퀴: 32–42s, hover pause, mask edge fade
- 배지: `spin-slow` 16s linear infinite (SVG textPath)
- 큰 타이틀 진입: `.rise-in` CSS 키프레임 (JS 불필요 폴백)
- 카드 hover: `.tilt-card` 미세 회전+lift
- `prefers-reduced-motion: reduce` → 전부 무효화 (`@media`)

## 8. Voice & Brand

- 톤: 간결·자신감·이중언어(영문 디스플레이 + 한글 본문)
- 이탤릭 세리프 액센트 = 시그니처 어휘("Visual", "Shipped", "Writing", "Tiny", "hot", "기술")
- 마이크로카피: 한국어 UX (CTA "프로젝트 보기", "전체 보기"); 라벨 영문 ("FEAT WORKS")
- 푸터 마퀴 키워드 = 브랜드 슬로건 반복 ("Build the technology · Live easier · 기술을…")

## 9. Anti-patterns

- 토큰으로 풀리는 문제에 오프-팔레트 색 추가 금지.
- 모든 텍스트 같은 크기/weight로 위계 평탄화 금지.
- `text-white`/`text-slate-*` 등 토큰 우회 하드코딩 금지(라이트 모드 파괴).
- 다크에서 불투명 다크 보더 금지 — 반투명 화이트 hairline.
- 컬러 카드 텍스트 대비 무시 금지 (반드시 `.c-sub`로 sub-텍스트 톤 유지).
- generic SaaS 히어로 복제 금지.
- 디스플레이에 임의 `text-*` 사이즈 직접 사용 금지 — `.type-*` 유틸로만.

---

### 동기화 규칙
1. 토큰 변경 → 이 문서 §2/§3 + `globals.css` 같은 커밋.
2. 새 컴포넌트 / 새 카드 색 추가 → §4에 1줄 등재.
3. `stitch/DESIGN.md`(구 7섹션)는 **폐기**. 이 문서가 정본.

### 새 페이지 작성 체크리스트
- [ ] `<PageHeading eyebrow size="xl" title=… lead=… count=…>` 사용
- [ ] 카드형 콘텐츠는 `<ColorCard index>` 또는 `.obsidian-card`
- [ ] 섹션 라벨은 `<SectionLabel count>`
- [ ] 진입 애니메이션은 `<Reveal index>` 래퍼
- [ ] `text-white`/`text-slate-*` 등 하드코딩 색 0개
- [ ] 디스플레이 텍스트는 `.type-display(-xl)` / `.type-headline` 유틸
- [ ] 한글 본문은 `text-on-surface-variant` + `leading` 자동(.type-body)
