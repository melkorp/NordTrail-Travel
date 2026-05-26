// src/app/admin/destinations/DestinationRow.tsx
"use client";

// Клиентская строка таблицы направлений — с кнопкой удаления и модалкой.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Бейджи
// ─────────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    лёгкое: "border-accent/30 text-accent bg-accent/5",
    среднее: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
    сложное: "border-red-500/30 text-red-400 bg-red-500/5",
  };
  const style =
    styles[difficulty.toLowerCase()] ??
    "border-text/20 text-text-muted bg-text/5";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {difficulty}
    </span>
  );
}

function BudgetBadge({ budget }: { budget: string }) {
  const styles: Record<string, string> = {
    низкий: "border-accent/30 text-accent bg-accent/5",
    средний: "border-primary/30 text-primary bg-primary/5",
    высокий: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
  };
  const style =
    styles[budget.toLowerCase()] ?? "border-text/20 text-text-muted bg-text/5";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {budget}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Модалка подтверждения
// ─────────────────────────────────────────────────────────────
function DeleteModal({
  name,
  slug,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  name: string;
  slug: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-text/10 bg-surface/90 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-text">
          Удалить направление?
        </h3>

        <p className="mt-2 text-sm text-text-muted">Будет удалён файл:</p>

        <div className="mt-3 rounded-xl border border-text/8 bg-bg/50 p-3">
          <p className="font-mono text-xs text-accent-bright">
            content/destinations/{slug}.mdx
          </p>
          <p className="mt-1 text-xs text-text-muted/70">{name}</p>
        </div>

        <p className="mt-3 text-xs text-text-muted/60">
          Действие необратимо. Восстановить можно только через git history.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-text/10 bg-text/5 py-2.5 text-sm text-text-muted transition-all hover:text-text disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
              isDeleting
                ? "cursor-wait border-text/10 bg-surface/30 text-text-muted"
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

// ─────────────────────────────────────────────────────────────
// СТРОКА ТАБЛИЦЫ
// ─────────────────────────────────────────────────────────────
export default function DestinationRow({
  destination,
  index,
}: {
  destination: Pick<
    Destination,
    "slug" | "name" | "difficulty" | "budget" | "bestSeason" | "safety"
  >;
  index: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/destinations/${destination.slug}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

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
          name={destination.name}
          slug={destination.slug}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!isDeleting) setShowModal(false);
          }}
        />
      )}

      <tr
        className={`border-b border-text/5 transition-colors hover:bg-surface/30 ${
          index % 2 === 0 ? "bg-transparent" : "bg-surface/10"
        }`}
      >
        {/* Название + slug */}
        <td className="px-5 py-4">
          <p className="font-medium text-text leading-snug">
            {destination.name}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">/{destination.slug}/</p>
          {errorMsg && <p className="mt-1 text-xs text-red-400">{errorMsg}</p>}
        </td>

        {/* Сложность */}
        <td className="px-5 py-4">
          <DifficultyBadge difficulty={destination.difficulty} />
        </td>

        {/* Бюджет */}
        <td className="px-5 py-4">
          <BudgetBadge budget={destination.budget} />
        </td>

        {/* Сезон */}
        <td className="px-5 py-4">
          <p
            className="max-w-45 truncate text-text-muted"
            title={destination.bestSeason}
          >
            {destination.bestSeason}
          </p>
        </td>

        {/* Безопасность */}
        <td className="px-5 py-4">
          <span className="text-xs text-accent-bright/70">
            {"★".repeat(destination.safety)}
            <span className="text-text-muted/30">
              {"★".repeat(5 - destination.safety)}
            </span>
          </span>
        </td>

        {/* Действия */}
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            {/* Открыть на сайте */}
            <Link
              href={`/destinations/${destination.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-text/10 bg-text/5 px-3 py-1.5 text-xs text-text-muted transition-all hover:border-text/20 hover:text-text"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M1 10L10 1M10 1H4M10 1v6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Открыть
            </Link>

            {/* Редактировать */}
            <Link
              href={`/admin/destinations/${destination.slug}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-bright/30 bg-accent-bright/8 px-3 py-1.5 text-xs font-medium text-accent-bright transition-all hover:border-accent-bright/50 hover:bg-accent-bright/15"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Редактировать
            </Link>

            {/* Удалить */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-text/10 bg-text/5 px-3 py-1.5 text-xs text-text-muted transition-all hover:border-red-500/30 hover:bg-red-500/8 hover:text-red-400"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M1.5 3h8M3.5 3V2h4v1M4.5 5v3M6.5 5v3M2 3l.5 6.5a1 1 0 001 .5h4a1 1 0 001-.5L9 3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Удалить
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}
