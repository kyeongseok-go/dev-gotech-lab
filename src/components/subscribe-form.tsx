"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

interface SubscribeFormProps {
  /** 추후 실제 API 연동 시 이 함수를 교체 */
  onSubmit?: (email: string) => Promise<void>;
}

export function SubscribeForm({ onSubmit }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");
    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // 더미 처리: 1초 대기 후 성공
        await new Promise((r) => setTimeout(r, 1000));
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 sm:max-w-md">
        <label htmlFor="subscribe-email" className="sr-only">
          이메일 주소
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          disabled={status === "submitting"}
          className="h-11 min-w-0 flex-1 border border-input bg-page px-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:border-on-surface focus:outline-2 focus:outline-focus disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary inline-flex h-11 px-5 text-sm disabled:opacity-50"
        >
          {status === "submitting" ? "전송 중…" : "구독하기"}
        </button>
      </form>

      {/* 상태 메시지 */}
      <div className="mt-3 text-sm" aria-live="polite">
        {status === "success" && (
          <p className="text-accent-green">
            구독 신청이 완료되었습니다. 감사합니다!
          </p>
        )}
        {status === "error" && (
          <p className="text-accent-coral">
            오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
