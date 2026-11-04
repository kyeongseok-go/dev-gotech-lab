"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { clearAllToolData, historyKey, parseHistory, pushHistory, type HistoryEntry } from "./tool-storage";

/** 같은 탭 안의 변경 알림(다른 탭은 storage 이벤트) */
const CHANGE_EVENT = "gotechy-tool-storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** 사생활 보호 모드 등에서 저장소 접근이 막혀도 도구는 계속 동작해야 한다 */
function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
}

export function useToolHistory<T>(slug: string) {
  const key = historyKey(slug);
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const entries = useMemo(() => parseHistory<T>(raw), [raw]);

  const add = useCallback(
    (label: string, value: T) => {
      const next: HistoryEntry<T> = { id: newId(), at: new Date().toISOString(), label, value };
      return writeRaw(key, JSON.stringify(pushHistory(parseHistory<T>(readRaw(key)), next)));
    },
    [key],
  );

  /** 모든 도구의 기록·키를 지운다(사이트 설정은 남김). 지운 항목 수 */
  const clearAll = useCallback(() => {
    let removed = 0;
    try {
      removed = clearAllToolData(window.localStorage) + clearAllToolData(window.sessionStorage);
    } catch {
      // 접근이 막힌 저장소는 지울 것도 없다
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return removed;
  }, []);

  return { entries, add, clearAll };
}

/** 하이드레이션 전에는 false — 그동안 입력을 막고 "불러오는 중"을 보여 준다 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
