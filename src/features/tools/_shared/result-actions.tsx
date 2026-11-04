"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

const FEEDBACK_MS = 2000;

export function downloadText(filename: string, text: string, mime = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface CopyButtonProps {
  text: string;
  label: string;
  disabled?: boolean;
}

/** 복사 결과를 화면 낭독기에도 알린다(aria-live) */
export function CopyButton({ text, label, disabled }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), FEEDBACK_MS);
  };
  return (
    <button type="button" onClick={copy} disabled={disabled} className="btn-outline inline-flex h-11 px-4 text-sm disabled:opacity-50">
      {state === "done" ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
      {label}
      <span aria-live="polite" className="sr-only">
        {state === "done" ? "복사했습니다" : state === "error" ? "복사하지 못했습니다. 직접 선택해 복사해 주세요" : ""}
      </span>
    </button>
  );
}

interface DownloadButtonProps {
  filename: string;
  text: string;
  label: string;
  disabled?: boolean;
}

export function DownloadButton({ filename, text, label, disabled }: DownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadText(filename, text)}
      disabled={disabled}
      className="btn-outline inline-flex h-11 px-4 text-sm disabled:opacity-50"
    >
      <Download aria-hidden size={16} />
      {label}
    </button>
  );
}
