"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** 공유 — 링크 복사 + X·Threads 웹 인텐트(계정 연동 없음) */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };

  const text = encodeURIComponent(title);
  const encUrl = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className="btn-outline inline-flex h-10 px-4 text-sm">
        {copied ? <Check aria-hidden size={14} /> : <Link2 aria-hidden size={14} />}
        {copied ? "복사됨" : "링크 복사"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline inline-flex h-10 px-4 text-sm"
      >
        X에 공유
      </a>
      <a
        href={`https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline inline-flex h-10 px-4 text-sm"
      >
        Threads에 공유
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? "링크를 복사했습니다" : failed ? "복사하지 못했습니다. 주소창의 링크를 직접 복사해 주세요" : ""}
      </span>
      {failed && <span className="text-xs text-accent-coral">복사 실패 — 주소창 링크를 직접 복사해 주세요</span>}
    </div>
  );
}
