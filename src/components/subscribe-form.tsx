"use client";

import { useState, type FormEvent } from "react";

/** unavailable = 구독 저장소(API)가 아직 연결되지 않음 — 성공한 척하지 않는다 */
type Status = "idle" | "submitting" | "success" | "error" | "unavailable";

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

    if (!onSubmit) {
      // 구독 API 가 없을 때 예전에는 1초 뒤 "완료"를 보여 줬지만 실제로는 아무것도 저장되지 않았다.
      // 저장되지 않았다는 사실과 지금 쓸 수 있는 대안(RSS)을 알린다. 입력값은 그대로 둔다.
      setStatus("unavailable");
      return;
    }

    setStatus("submitting");
    try {
      await onSubmit(email);
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
          className="h-11 min-w-0 flex-1 border border-input bg-page px-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:border-on-surface focus:outline-2 focus:outline-do-primary disabled:opacity-50"
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
        {status === "unavailable" && (
          <p className="text-on-surface-variant">
            아직 이메일 구독 서버가 연결되지 않아 신청이 저장되지 않았습니다. 새 글은{" "}
            <a href="/rss.xml" className="text-link">
              RSS
            </a>
            로 받아 보실 수 있습니다.
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
