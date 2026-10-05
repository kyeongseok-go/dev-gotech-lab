"use client";

import { useCallback, useRef, useState } from "react";
import { CARD_INDEX_URL, type GalleryCard } from "@/lib/card-news";

interface CardIndex {
  /** 전체 카드 (아직 안 불러왔으면 null) */
  all: GalleryCard[] | null;
  /** 불러오기 실패 — 화면에 안내를 띄운다 */
  failed: boolean;
  /** 전체 카드를 한 번만 불러온다. 성공하면 true */
  ensureAll: () => Promise<boolean>;
}

function isGalleryCards(data: unknown): data is GalleryCard[] {
  return Array.isArray(data) && data.every((c) => typeof c?.id === "number" && typeof c?.title === "string");
}

/** 목록 첫 화면 밖의 카드는 정적 인덱스(JSON)에서 필요할 때 한 번만 불러온다 */
export function useCardIndex(initial: GalleryCard[], total: number): CardIndex {
  const complete = initial.length >= total;
  const [all, setAll] = useState<GalleryCard[] | null>(complete ? initial : null);
  const [failed, setFailed] = useState(false);
  // 진행 중이거나 끝난 요청 — 성공한 요청은 그대로 두어 다시 부르지 않는다(함수 정체성도 고정)
  const pending = useRef<Promise<boolean> | null>(complete ? Promise.resolve(true) : null);

  const ensureAll = useCallback((): Promise<boolean> => {
    pending.current ??= fetch(CARD_INDEX_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error(`카드 인덱스 응답 ${res.status}`);
        const data: unknown = await res.json();
        if (!isGalleryCards(data)) throw new Error("카드 인덱스 형식이 다르다");
        setAll(data);
        setFailed(false);
        return true;
      })
      .catch((err: unknown) => {
        console.error("카드뉴스 목록을 불러오지 못했다", err);
        pending.current = null; // 다음 조작 때 다시 시도
        setFailed(true);
        return false;
      });
    return pending.current;
  }, []);

  return { all, failed, ensureAll };
}
