// src/app/admin/media/MediaGrid.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ImageFile } from "./page";
import { formatBytes } from "../../../lib/format";
import { Trash2, Check } from "lucide-react";

function getBaseName(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/-(800|1600)$/, "");
}

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
  const base = getBaseName(name);

  return (
    <dialog open className="fixed inset-0 z-50 m-0 border-0 bg-transparent p-0">
      <div
        className="flex h-full w-full items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !isDeleting) onCancel();
        }}
        tabIndex={-1}
      >
        <div
          className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={() => {}}
        >
          <h3 className="font-heading text-lg font-bold text-white">
            Удалить изображение?
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Будут удалены все версии файла:
          </p>
          <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
            <p className="font-mono text-xs leading-relaxed text-slate-500">
              {name}
              <br />
              {base}-800.webp
              <br />
              {base}-1600.webp
              <br />
              {base}-800.avif
              <br />
              {base}-1600.avif
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500">Действие необратимо.</p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 rounded-xl border border-slate-700/50 bg-slate-700/30 py-2.5 text-sm text-slate-400 transition-all hover:text-white"
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
    </dialog>
  );
}

function BulkDeleteModal({
  names,
  onConfirm,
  onCancel,
  isDeleting,
}: Readonly<{
  names: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}>) {
  return (
    <dialog open className="fixed inset-0 z-50 m-0 border-0 bg-transparent p-0">
      <div
        className="flex h-full w-full items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onCancel}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !isDeleting) onCancel();
        }}
        tabIndex={-1}
      >
        <div
          className="mx-4 w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/90 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={() => {}}
        >
          <h3 className="font-heading text-lg font-bold text-white">
            Удалить {names.length}{" "}
            {names.length === 1 ? "изображение" : "изображения"}?
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Будут удалены все версии выбранных файлов:
          </p>
          <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
            {names.map((n) => (
              <p
                key={n}
                className="font-mono text-xs leading-relaxed text-slate-500"
              >
                {n}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Действие необратимо. Все файлы удаляются одним коммитом.
          </p>

          {isDeleting && (
            <div className="mt-4 flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="animate-spin text-cyan-400"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="20"
                  strokeDashoffset="10"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xs text-slate-400">
                Удаление одним коммитом...
              </span>
            </div>
          )}

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
              {isDeleting ? "Удаляю..." : `Удалить ${names.length}`}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

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
    await navigator.clipboard.writeText(image.url).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      const data = (await res.json()) as { error?: string };
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
      ? "border-purple-400/30 text-purple-400 bg-purple-500/10"
      : "border-cyan-400/30 text-cyan-400 bg-cyan-500/10";

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
        className={`group relative overflow-hidden rounded-2xl border bg-slate-800/30 transition-all duration-300 ${
          isSelected
            ? "border-cyan-400/50 bg-cyan-500/5 shadow-[0_0_0_2px_rgba(6,182,212,0.2)]"
            : "border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
        }`}
      >
        <div className="relative h-40 w-full overflow-hidden bg-slate-900/50">
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
            className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
              isSelected
                ? "border-cyan-400 bg-cyan-500 text-white"
                : "border-slate-600 bg-slate-900/70 text-transparent opacity-0 backdrop-blur-sm group-hover:opacity-100 hover:border-cyan-400/60"
            }`}
            title={isSelected ? "Снять выделение" : "Выбрать"}
          >
            <Check size={10} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="absolute left-8 top-2 rounded-lg border border-red-500/30 bg-slate-900/80 p-1.5 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 group-hover:opacity-100"
            title="Удалить"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="p-3">
          <p
            className="truncate text-xs font-medium text-white"
            title={image.name}
          >
            {image.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatBytes(image.size)}
          </p>
          <p
            className="mt-1.5 truncate rounded bg-slate-900/60 px-2 py-1 font-mono text-[10px] text-slate-500"
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
              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? "border-green-400/30 bg-green-500/10 text-green-400"
                  : "border-slate-700/50 bg-slate-700/30 text-slate-400 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-400"
              }`}
            >
              {copied ? "✓ Скопировано" : "Копировать URL"}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg border border-slate-700/50 bg-slate-700/30 px-2.5 py-1.5 text-xs text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              title="Удалить"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

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

  const filtered = images
    .filter((img) => {
      const matchesFormat = filter === "all" || img.ext === filter;
      const matchesSearch = img.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFormat && matchesSearch;
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((img) => img.name)));
    }
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
    setBulkError("");

    try {
      const res = await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        deleted?: string[];
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const deletedBases = new Set((data.deleted ?? []).map((b) => b));

      setImages((prev) =>
        prev.filter((img) => !deletedBases.has(getBaseName(img.name))),
      );
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      setBulkError(
        err instanceof Error ? err.message : "Неизвестная ошибка при удалении",
      );
      setTimeout(() => setBulkError(""), 6000);
    }

    setIsBulkDeleting(false);
    setShowBulkConfirm(false);
  }

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
        />
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-700/50 bg-slate-800/30 p-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setFilter(btn.value);
                setSelected(new Set());
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === btn.value
                  ? "bg-cyan-500/15 text-cyan-400"
                  : "text-slate-400 hover:text-white"
              }`}
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
          className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400/40 focus:bg-slate-800/70"
        />

        {filtered.length !== images.length && (
          <p className="text-xs text-slate-500">
            Показано: {filtered.length} из {images.length}
          </p>
        )}

        {filtered.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                allFilteredSelected
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-400"
                  : "border-slate-700/50 bg-slate-700/30 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {allFilteredSelected ? "Снять все" : "Выбрать все"}
            </button>

            {selected.size > 0 && (
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/15"
              >
                <Trash2 size={12} />
                Удалить выбранные ({selected.size})
              </button>
            )}
          </div>
        )}
      </div>

      {bulkError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {bulkError}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-2.5">
          <p className="text-xs text-cyan-400">
            Выбрано: {selected.size} {selected.size === 1 ? "файл" : "файлов"}
          </p>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-slate-500 transition-colors hover:text-slate-400"
          >
            Снять выделение
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 py-12 text-center">
          <p className="text-sm text-slate-500">
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
