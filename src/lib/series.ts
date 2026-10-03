/**
 * 블로그 시리즈·관련 프로젝트 연결 정의.
 * 콘텐츠(MDX)를 고치지 않고 slug 규칙과 명시 목록으로 묶는다.
 * 근거: 제목·slug 에 이미 존재하는 연재 표기(1편~5편, Ch.1~3)와 글이 다루는 실제 프로젝트.
 */
export interface SeriesDef {
  id: string;
  title: string;
  /** slug 가 이 정규식에 맞으면 시리즈에 포함, 캡처 그룹 1 = 순서 */
  pattern: RegExp;
}

export const SERIES: readonly SeriesDef[] = [
  {
    id: "karpathy-wiki",
    title: "Karpathy LLM Wiki 연재",
    pattern: /^karpathy-wiki-series-(\d+)-/,
  },
  {
    id: "projectb-dev",
    title: "핸드메이드 쇼핑몰 1인 개발기",
    pattern: /^projectb-dev-chapter(\d+)$/,
  },
];

/** 블로그 slug → 관련 프로젝트 slug (글이 해당 프로젝트의 개발기·회고인 경우만) */
export const POST_PROJECT_LINKS: Readonly<Record<string, readonly string[]>> = {
  "parkmate-dev-story": ["park-mate"],
  "safeshare-dev-story": ["safe-share"],
  "workmate-dev-story": ["work-mate"],
  "youtube-shorts-automation-pipeline": ["youtube-short-automation"],
  "projectb-dev-chapter1": ["project-b"],
  "projectb-dev-chapter2": ["project-b"],
  "projectb-dev-chapter3": ["project-b"],
  "building-with-claude-day0-day1": ["gotech-lab"],
  "claude-day1-recap": ["gotech-lab"],
};
