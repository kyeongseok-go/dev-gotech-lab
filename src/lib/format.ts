/** ISO 날짜 문자열 → 랩 노트북 표기 "2026.09.30" (타임존 변환 없이 앞 10자리 사용) */
export function formatDateDot(dateStr: string): string {
  return dateStr.slice(0, 10).replaceAll("-", ".");
}

/** 숫자를 고정 자릿수 문자열로 (7 → "007") */
export function padNumber(value: number, width = 3): string {
  return String(value).padStart(width, "0");
}
