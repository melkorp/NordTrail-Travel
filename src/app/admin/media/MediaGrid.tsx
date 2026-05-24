// src/app/admin/media/MediaGrid.tsx
"use client";

// Клиентский компонент — сетка изображений с фильтрами,
// копированием URL и удалением.

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ImageFile } from "./page";
import { formatBytes } from "@/lib/format";

// ─────────────────────────────────────────────────────────────
// Модальное окно подтверждения удаления
// ─────────────────────────────────────────────────────────────
function ConfirmModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    // Оверлей — клик по нему отменяет удаление
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Карточка — stopPropagation чтобы клик внутри не закрывал модалку */}
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-text/10 bg-surface/90 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-text">
          Удалить изображение?
        </h3>

        <p className="mt-2 text-sm text-text-muted">
          Будут удалены все версии файла:
        </p>

        {/* Список удаляемых файлов */}
        <div className="mt-3 rounded-xl border border-text/8 bg-bg/50 p-3">
          <p className="font-mono text-xs text-text-muted/80 leading-relaxed">
            {name}
            <br />
            {name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "")}-800.webp
            <br />
            {name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "")}-1600.webp
            <br />
            {name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "")}-800.avif
            <br />
            {name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "")}-1600.avif
          </p>
        </div>

        <p className="mt-3 text-xs text-text-muted/60">
          Действие необратимо. Восстановить можно только через git.
        </p>

        {/* Кнопки */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-text/10 bg-text/5 py-2.5 text-sm text-text-muted transition-all hover:text-text"
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
// Карточка одного изображения
// ─────────────────────────────────────────────────────────────
function ImageCard({
  image,
  onDeleted,
}: {
  image: ImageFile;
  onDeleted: (name: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Копирование URL в буфер обмена
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback для старых браузеров
      const input = document.createElement("input");
      input.value = image.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Подтверждение удаления — вызывается из модалки
  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/admin/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: image.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      // Уведомляем родителя — убираем карточку из сетки
      onDeleted(image.name);
    } catch (err) {
      setIsDeleting(false);
      setShowConfirm(false);
      setDeleteError(err instanceof Error ? err.message : "Неизвестная ошибка");
      // Сбрасываем ошибку через 4 секунды
      setTimeout(() => setDeleteError(""), 4000);
    }
  }

  // Цвет бейджа формата
  const extStyle =
    image.ext === "avif"
      ? "border-primary/30 text-primary bg-primary/5"
      : "border-accent/30 text-accent bg-accent/5";

  return (
    <>
      {/* Модалка подтверждения */}
      {showConfirm && (
        <ConfirmModal
          name={image.name}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isDeleting={isDeleting}
        />
      )}

      <div className="group overflow-hidden rounded-2xl border border-text/8 bg-surface/20 transition-all duration-300 hover:border-text/15 hover:bg-surface/40">
        {/* Превью */}
        <div className="relative h-40 w-full overflow-hidden bg-surface/50">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Бейдж формата */}
          <span
            className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${extStyle}`}
          >
            {image.ext}
          </span>

          {/* Кнопка удаления — появляется при наведении поверх превью */}
          <button
            onClick={() => setShowConfirm(true)}
            className="absolute left-2 top-2 rounded-lg border border-red-500/30 bg-bg/80 p-1.5 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 group-hover:opacity-100"
            title="Удалить изображение"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2 3l.5 7a1 1 0 001 1h5a1 1 0 001-1L10 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Информация */}
        <div className="p-3">
          <p
            className="truncate text-xs font-medium text-text"
            title={image.name}
          >
            {image.name}
          </p>

          <p className="mt-0.5 text-xs text-text-muted">
            {formatBytes(image.size)}
          </p>

          <p
            className="mt-1.5 truncate rounded bg-bg/60 px-2 py-1 font-mono text-[10px] text-text-muted/70"
            title={image.url}
          >
            {image.url}
          </p>

          {/* Ошибка удаления */}
          {deleteError && (
            <p className="mt-1.5 text-xs text-red-400">{deleteError}</p>
          )}

          {/* Кнопки: копировать и удалить */}
          <div className="mt-2 flex gap-2">
            {/* Копировать URL */}
            <button
              onClick={handleCopy}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-text/10 bg-text/5 text-text-muted hover:border-accent-bright/30 hover:bg-accent-bright/8 hover:text-accent-bright"
              }`}
            >
              {copied ? "✓ Скопировано" : "Копировать URL"}
            </button>

            {/* Удалить */}
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg border border-text/10 bg-text/5 px-2.5 py-1.5 text-xs text-text-muted transition-all hover:border-red-500/30 hover:bg-red-500/8 hover:text-red-400"
              title="Удалить"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2 3l.5 7a1 1 0 001 1h5a1 1 0 001-1L10 3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// СЕТКА С ФИЛЬТРАМИ
// ─────────────────────────────────────────────────────────────
type Filter = "all" | "avif" | "webp";

export default function MediaGrid({
  images: initialImages,
}: {
  images: ImageFile[];
}) {
  const [images, setImages] = useState<ImageFile[]>(initialImages);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const router = useRouter();

  // Убираем удалённое изображение из локального состояния
  // router.refresh() обновляет серверные данные в фоне
  function handleDeleted(name: string) {
    // Убираем все версии с тем же базовым именем
    const baseName = name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "");
    setImages((prev) =>
      prev.filter(
        (img) =>
          !img.name
            .replace(/\.[^.]+$/, "")
            .replace(/-(800|1600)$/, "")
            .startsWith(baseName),
      ),
    );
    // Обновляем серверные данные
    router.refresh();
  }

  // Фильтрация
  const filtered = images.filter((img) => {
    const matchesFormat = filter === "all" || img.ext === filter;
    const matchesSearch = img.name.toLowerCase().includes(search.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  const filterButtons: { value: Filter; label: string }[] = [
    { value: "all", label: `Все (${images.length})` },
    {
      value: "avif",
      label: `AVIF (${images.filter((i) => i.ext === "avif").length})`,
    },
    {
      value: "webp",
      label: `WebP (${images.filter((i) => i.ext === "webp").length})`,
    },
  ];

  return (
    <div>
      {/* ── Панель фильтров ─────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Фильтры по формату */}
        <div className="flex rounded-xl border border-text/8 bg-surface/20 p-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === btn.value
                  ? "bg-accent-bright/15 text-accent-bright"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Поиск по имени */}
        <input
          type="search"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-text/10 bg-surface/40 px-4 py-2 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/40 focus:bg-surface/70"
        />

        {filtered.length !== images.length && (
          <p className="text-xs text-text-muted">
            Показано: {filtered.length} из {images.length}
          </p>
        )}
      </div>

      {/* ── Сетка карточек ──────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-text/8 bg-surface/20 py-12 text-center">
          <p className="text-sm text-text-muted">
            {search
              ? `Ничего не найдено по запросу «${search}»`
              : "Изображений нет"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((image) => (
            <ImageCard
              key={image.name}
              image={image}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
