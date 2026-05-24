// src/app/admin/media/MediaGrid.tsx
"use client";

// Клиентский компонент — нужен для кнопки "Копировать URL"
// и фильтрации по формату (требует useState).

import { useState } from "react";
import Image from "next/image";
import type { ImageFile } from "./page";
import { formatBytes } from "@/lib/format";
// ─────────────────────────────────────────────────────────────
// Карточка одного изображения
// ─────────────────────────────────────────────────────────────
function ImageCard({ image }: { image: ImageFile }) {
  // Состояние кнопки копирования — показываем "Скопировано" 2 сек
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback для браузеров без clipboard API
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

  // Определяем цвет бейджа формата
  const extStyle =
    image.ext === "avif"
      ? "border-primary/30 text-primary bg-primary/5"
      : "border-accent/30 text-accent bg-accent/5";

  return (
    <div className="group overflow-hidden rounded-2xl border border-text/8 bg-surface/20 transition-all duration-300 hover:border-text/15 hover:bg-surface/40">
      {/* Превью изображения */}
      <div className="relative h-40 w-full overflow-hidden bg-surface/50">
        <Image
          src={image.url}
          alt={image.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          // Размеры маленькие — превью в сетке
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Бейдж формата поверх превью */}
        <span
          className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${extStyle}`}
        >
          {image.ext}
        </span>
      </div>

      {/* Информация о файле */}
      <div className="p-3">
        {/* Имя файла — обрезаем если длинное */}
        <p
          className="truncate text-xs font-medium text-text"
          title={image.name}
        >
          {image.name}
        </p>

        {/* Размер файла */}
        <p className="mt-0.5 text-xs text-text-muted">
          {formatBytes(image.size)}
        </p>

        {/* URL — кликабельный моноширинный текст */}
        <p
          className="mt-1.5 truncate rounded bg-bg/60 px-2 py-1 font-mono text-[10px] text-text-muted/70"
          title={image.url}
        >
          {image.url}
        </p>

        {/* Кнопка копирования URL */}
        <button
          onClick={handleCopy}
          className={`mt-2 w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            copied
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-text/10 bg-text/5 text-text-muted hover:border-accent-bright/30 hover:bg-accent-bright/8 hover:text-accent-bright"
          }`}
        >
          {copied ? "✓ Скопировано" : "Копировать URL"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// СЕТКА С ФИЛЬТРАМИ
// ─────────────────────────────────────────────────────────────
type Filter = "all" | "avif" | "webp";

export default function MediaGrid({ images }: { images: ImageFile[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  // Фильтрация по формату и имени
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
      {/* ── Панель фильтров и поиска ────────────────────── */}
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

        {/* Поиск по имени файла */}
        <input
          type="search"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-text/10 bg-surface/40 px-4 py-2 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/40 focus:bg-surface/70"
        />

        {/* Счётчик отфильтрованных */}
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
            Ничего не найдено по запросу «{search}»
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((image) => (
            <ImageCard key={image.name} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}
