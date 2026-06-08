// src/app/admin/articles/ArticleRow.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArticleData } from "@/lib/types";
import { Eye, Edit, Trash2 } from "lucide-react";

function CategoryBadge({ category }: Readonly<{ category: string }>) {
  const styles: Record<string, string> = {
    Budget: "border-cyan-400/30 text-cyan-400 bg-cyan-500/10",
    Hiking: "border-blue-400/30 text-blue-400 bg-blue-500/10",
    Luxury: "border-purple-400/30 text-purple-400 bg-purple-500/10",
    Winter: "border-pink-400/30 text-pink-400 bg-pink-500/10",
    "Solo Travel": "border-orange-400/30 text-orange-400 bg-orange-500/10",
    Family: "border-green-400/30 text-green-400 bg-green-500/10",
  };

  const style =
    styles[category] ?? "border-slate-600/30 text-slate-400 bg-slate-700/30";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {category}
    </span>
  );
}

function DeleteModal({
  title,
  slug,
  isDeleting,
  onConfirm,
  onCancel,
}: Readonly<{
  title: string;
  slug: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-white">
          Удалить статью?
        </h3>

        <p className="mt-2 text-sm text-slate-400">Будет удалён файл:</p>

        <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
          <p className="font-mono text-xs text-cyan-400">
            content/blog/{slug}.mdx
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{title}</p>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Действие необратимо. Восстановить можно только через git history.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-700/50 bg-slate-700/30 py-2.5 text-sm text-slate-400 transition-all hover:text-white disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
              isDeleting
                ? "cursor-wait border-slate-700/50 bg-slate-800/30 text-slate-500"
                : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticleRow({
  article,
  index,
}: Readonly<{
  article: Pick<
    ArticleData,
    "slug" | "title" | "category" | "readTime" | "dateDisplay"
  >;
  index: number;
}>) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/articles/${article.slug}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setShowModal(false);
      router.refresh();
    } catch (err) {
      setIsDeleting(false);
      setErrorMsg(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  return (
    <>
      {showModal && (
        <DeleteModal
          title={article.title}
          slug={article.slug}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!isDeleting) setShowModal(false);
          }}
        />
      )}

      <tr
        className={`border-b border-slate-700/30 transition-colors hover:bg-slate-800/50 ${
          index % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
        }`}
      >
        <td className="px-5 py-4">
          <p className="font-medium text-white leading-snug">{article.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">/{article.slug}/</p>
          {errorMsg && <p className="mt-1 text-xs text-red-400">{errorMsg}</p>}
        </td>

        <td className="px-5 py-4">
          <CategoryBadge category={article.category} />
        </td>

        <td className="px-5 py-4 text-slate-400">{article.dateDisplay}</td>

        <td className="px-5 py-4 text-slate-400">{article.readTime}</td>

        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/blog/${article.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-700/30 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-slate-600 hover:text-white"
            >
              <Eye size={11} />
              Открыть
            </Link>

            <Link
              href={`/admin/articles/${article.slug}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20"
            >
              <Edit size={11} />
              Редактировать
            </Link>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-700/30 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={11} />
              Удалить
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
