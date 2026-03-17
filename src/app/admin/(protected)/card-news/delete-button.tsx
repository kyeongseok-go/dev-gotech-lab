"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CardNewsDeleteButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`"${title}" 카드뉴스를 삭제하시겠습니까?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/card-news/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {deleting ? "삭제 중" : "삭제"}
    </button>
  );
}
