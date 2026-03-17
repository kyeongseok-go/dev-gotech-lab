"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface CardNewsData {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  external_link: string | null;
  tags: string;
  published: number;
}

interface CardNewsFormProps {
  initial?: CardNewsData;
  mode: "create" | "edit";
}

const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "dev", label: "개발" },
  { value: "trend", label: "트렌드" },
  { value: "news", label: "뉴스" },
];

export function CardNewsForm({ initial, mode }: CardNewsFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CardNewsData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "news",
    image_url: initial?.image_url ?? null,
    external_link: initial?.external_link ?? null,
    tags: initial?.tags ?? "[]",
    published: initial?.published ?? 0,
  });

  const tagsArray: string[] = (() => {
    try { return JSON.parse(form.tags); } catch { return []; }
  })();
  const [tagInput, setTagInput] = useState(tagsArray.join(", "));

  function updateField<K extends keyof CardNewsData>(key: K, value: CardNewsData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
  }

  async function handleImageUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        setError(errData.error ?? "이미지 업로드 실패");
        return;
      }

      const result = (await res.json()) as { url: string };
      updateField("image_url", result.url);
    } catch {
      setError("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      setError("제목과 slug는 필수입니다.");
      return;
    }

    setSaving(true);
    setError("");

    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { ...form, tags: JSON.stringify(tags) };

    try {
      const url = mode === "create"
        ? "/api/admin/card-news"
        : `/api/admin/card-news/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        setError(errData.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push("/admin/card-news");
      router.refresh();
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* 제목 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">제목 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => {
            updateField("title", e.target.value);
            if (mode === "create") updateField("slug", generateSlug(e.target.value));
          }}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          placeholder="카드뉴스 제목"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Slug *</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-mono"
          placeholder="url-friendly-slug"
        />
      </div>

      {/* 카테고리 + 공개 상태 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">카테고리</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">공개 상태</label>
          <button
            type="button"
            onClick={() => updateField("published", form.published ? 0 : 1)}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              form.published
                ? "border-green-500/30 bg-green-500/10 text-green-500"
                : "border-input bg-background text-muted-foreground"
            }`}
          >
            {form.published ? "공개" : "비공개"}
          </button>
        </div>
      </div>

      {/* 요약 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">요약</label>
        <textarea
          value={form.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          placeholder="카드에 표시될 간단한 요약"
        />
      </div>

      {/* 본문 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">본문 (Markdown)</label>
        <textarea
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-mono"
          placeholder="마크다운 형식으로 작성..."
        />
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">커버 이미지</label>
        {form.image_url && (
          <div className="mb-3 overflow-hidden rounded-xl border border-border">
            <img src={form.image_url} alt="커버 미리보기" className="h-40 w-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
          />
          {uploading && <span className="text-xs text-muted-foreground">업로드 중...</span>}
          {form.image_url && (
            <button
              type="button"
              onClick={() => updateField("image_url", null)}
              className="text-xs text-red-500 hover:text-red-400"
            >
              제거
            </button>
          )}
        </div>
      </div>

      {/* 외부 링크 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">외부 링크</label>
        <input
          type="url"
          value={form.external_link ?? ""}
          onChange={(e) => updateField("external_link", e.target.value || null)}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          placeholder="https://example.com/article"
        />
      </div>

      {/* 태그 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">태그 (쉼표로 구분)</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
          placeholder="AI, Next.js, 트렌드"
        />
      </div>

      {/* 버튼 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-glow rounded-xl px-6 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? "저장 중..." : mode === "create" ? "작성하기" : "수정하기"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
