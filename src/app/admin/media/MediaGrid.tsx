// src/app/admin/media/MediaGrid.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ImageFile } from "./page";
import { formatBytes } from "@/lib/format";

// ── Получить базовое имя без суффикса и расширения ──────────
function getBaseName(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "");
}

// ── Модалка подтверждения удаления одного файла ─────────────
function DeleteModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: Readonly<{
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={isDeleting ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isDeleting) onCancel();
      }}
    >
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
        <div className="mt-3 rounded-xl border border-text/8 bg-bg/50 p-3">
          <p className="font-mono text-xs text-text-muted/80 leading-relaxed">
            {name}
            <br />
            {getBaseName(name)}-800.webp
            <br />
            {getBaseName(name)}-1600.webp
            <br />
            {getBaseName(name)}-800.avif
            <br />
            {getBaseName(name)}-1600.avif
          </p>
        </div>
        <p className="mt-3 text-xs text-text-muted/60">Действие необратимо.</p>
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
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${isDeleting ? "cursor-wait border-text/10 bg-surface/30 text-text-muted" : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Модалка подтверждения МАССОВОГО удаления ────────────────
function BulkDeleteModal({
  names,
  onConfirm,
  onCancel,
  isDeleting,
  progress,
}: Readonly<{
  names: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  progress: { done: number; total: number } | null;
}>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
      onClick={isDeleting ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isDeleting) onCancel();
      }}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl border border-text/10 bg-surface/90 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-text">
          Удалить {names.length}{" "}
          {names.length === 1 ? "изображение" : "изображения"}?
        </h3>
        <p className="mt-2 text-sm text-text-muted">
          Будут удалены все версии выбранных файлов:
        </p>
        <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-text/8 bg-bg/50 p-3">
          {names.map((name) => (
            <p
              key={name}
              className="font-mono text-xs text-text-muted/80 leading-relaxed"
            >
              {name}
            </p>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted/60">
          Действие необратимо. Файлы удаляются последовательно через GitHub API.
        </p>
        {isDeleting && progress && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-text-muted">
              <span>Удаление...</span>
              <span>
                {progress.done} / {progress.total}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface/60">
              <div
                className="h-1.5 rounded-full bg-accent-bright/70 transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
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
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${isDeleting ? "cursor-wait border-text/10 bg-surface/30 text-text-muted" : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
          >
            {isDeleting
              ? `Удаляю ${progress?.done ?? 0}/${progress?.total ?? names.length}...`
              : `Удалить ${names.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Карточка одного изображения ─────────────────────────────
function ImageCard({
  image,
  isSelected,
  onSelect,
  onDeleted,
}: Readonly<{
  image: ImageFile;
  isSelected: boolean;
  onSelect: (name: string) => void;
  onDeleted: (name: string) => void;
}>) {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

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
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      onDeleted(image.name);
    } catch (err) {
      setIsDeleting(false);
      setShowConfirm(false);
      setDeleteError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setTimeout(() => setDeleteError(""), 4000);
    }
  }

  const extStyle =
    image.ext === "avif"
      ? "border-primary/30 text-primary bg-primary/5"
      : "border-accent/30 text-accent bg-accent/5";

  return (
    <>
      {showConfirm && (
        <DeleteModal
          name={image.name}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
      <div
        className={`group relative overflow-hidden rounded-2xl border bg-surface/20 transition-all duration-300 ${isSelected ? "border-accent-bright/50 bg-accent-bright/5 shadow-[0_0_0_2px_rgba(212,175,55,0.2)]" : "border-text/8 hover:border-text/15 hover:bg-surface/40"}`}
      >
        <div className="relative h-40 w-full overflow-hidden bg-surface/50">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <span
            className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${extStyle}`}
          >
            {image.ext}
          </span>
          <button
            onClick={() => onSelect(image.name)}
            className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border transition-all ${isSelected ? "border-accent-bright bg-accent-bright text-bg" : "border-text/30 bg-bg/70 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100 hover:border-accent-bright/60"}`}
            title={isSelected ? "Снять выделение" : "Выбрать"}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5l2.5 2.5L8 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="absolute left-8 top-2 rounded-lg border border-red-500/30 bg-bg/80 p-1.5 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 group-hover:opacity-100"
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
          {deleteError && (
            <p className="mt-1.5 text-xs text-red-400">{deleteError}</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${copied ? "border-accent/30 bg-accent/10 text-accent" : "border-text/10 bg-text/5 text-text-muted hover:border-accent-bright/30 hover:bg-accent-bright/8 hover:text-accent-bright"}`}
            >
              {copied ? "✓ Скопировано" : "Копировать URL"}
            </button>
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

// ── СЕТКА С ФИЛЬТРАМИ И МАССОВЫМ УДАЛЕНИЕМ ──────────────────
type Filter = "all" | "avif" | "webp";

export default function MediaGrid({
  images: initialImages,
}: Readonly<{ images: ImageFile[] }>) {
  const [images, setImages] = useState<ImageFile[]>(initialImages);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [bulkError, setBulkError] = useState("");
  const router = useRouter();

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((img) => img.name)));
  }

  function handleDeleted(name: string) {
    const baseName = getBaseName(name);
    setImages((prev) =>
      prev.filter((img) => !getBaseName(img.name).startsWith(baseName)),
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    router.refresh();
  }

  async function handleBulkDelete() {
    const names = Array.from(selected);
    setIsBulkDeleting(true);
    setBulkProgress({ done: 0, total: names.length });
    setBulkError("");
    const failed: string[] = [];
    for (let i = 0; i < names.length; i++) {
      try {
        const res = await fetch("/api/admin/media/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: names[i] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const baseName = getBaseName(names[i]);
        setImages((prev) =>
          prev.filter((img) => !getBaseName(img.name).startsWith(baseName)),
        );
      } catch {
        failed.push(names[i]);
      }
      setBulkProgress({ done: i + 1, total: names.length });
    }
    setIsBulkDeleting(false);
    setShowBulkConfirm(false);
    setBulkProgress(null);
    setSelected(new Set(failed));
    if (failed.length > 0) {
      setBulkError(
        `Не удалось удалить ${failed.length} файл(ов): ${failed.join(", ")}`,
      );
      setTimeout(() => setBulkError(""), 6000);
    }
    router.refresh();
  }

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

  const allFilteredSelected =
    filtered.length > 0 && selected.size === filtered.length;

  return (
    <div>
      {showBulkConfirm && (
        <BulkDeleteModal
          names={Array.from(selected)}
          onConfirm={handleBulkDelete}
          onCancel={() => {
            if (!isBulkDeleting) setShowBulkConfirm(false);
          }}
          isDeleting={isBulkDeleting}
          progress={bulkProgress}
        />
      )}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-text/8 bg-surface/20 p-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setFilter(btn.value);
                setSelected(new Set());
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === btn.value ? "bg-accent-bright/15 text-accent-bright" : "text-text-muted hover:text-text"}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelected(new Set());
          }}
          className="rounded-xl border border-text/10 bg-surface/40 px-4 py-2 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/40 focus:bg-surface/70"
        />
        {filtered.length !== images.length && (
          <p className="text-xs text-text-muted">
            Показано: {filtered.length} из {images.length}
          </p>
        )}
        {filtered.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${allFilteredSelected ? "border-accent-bright/40 bg-accent-bright/10 text-accent-bright" : "border-text/10 bg-text/5 text-text-muted hover:border-text/20 hover:text-text"}`}
            >
              {allFilteredSelected ? "Снять все" : "Выбрать все"}
            </button>
            {selected.size > 0 && (
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/15"
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
                Удалить выбранные ({selected.size})
              </button>
            )}
          </div>
        )}
      </div>
      {bulkError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
          {bulkError}
        </div>
      )}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent-bright/15 bg-accent-bright/5 px-4 py-2.5">
          <p className="text-xs text-accent-bright">
            Выбрано: {selected.size} {selected.size === 1 ? "файл" : "файлов"}
          </p>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-text-muted/60 transition-colors hover:text-text-muted"
          >
            Снять выделение
          </button>
        </div>
      )}
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
              isSelected={selected.has(image.name)}
              onSelect={toggleSelect}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
