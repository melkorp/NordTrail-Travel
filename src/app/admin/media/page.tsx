// src/app/admin/media/page.tsx
//
// Серверный компонент — читает список изображений через fs,
// передаёт данные в клиентский MediaGrid для интерактивности.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { readdirSync, statSync } from "fs";
import path from "path";
import Link from "next/link";
import MediaGrid from "./MediaGrid";
import { formatBytes } from "@/lib/format";

// ─────────────────────────────────────────────────────────────
// ТИП ИЗОБРАЖЕНИЯ
// ─────────────────────────────────────────────────────────────
export interface ImageFile {
  name: string; // "hero-bg-1600.webp"
  url: string; // "/images/optimized/hero-bg-1600.webp"
  size: number; // размер в байтах
  ext: string; // "webp" | "avif"
}

// ─────────────────────────────────────────────────────────────
// Чтение изображений из папки optimized
// Возвращает только AVIF и WebP — PNG/JPG в originals
// ─────────────────────────────────────────────────────────────
function getOptimizedImages(): ImageFile[] {
  const dir = path.join(process.cwd(), "public", "images", "optimized");

  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    // Папка не существует — возвращаем пустой массив
    return [] as ImageFile[];
  }

  return files
    .filter((f) => /\.(webp|avif)$/i.test(f))
    .map((name) => {
      const filePath = path.join(dir, name);
      const stat = statSync(filePath);
      const ext = name.split(".").pop()?.toLowerCase() ?? "";

      return {
        name,
        url: `/images/optimized/${name}`,
        size: stat.size,
        ext,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ─────────────────────────────────────────────────────────────
// Статистика по форматам
// ─────────────────────────────────────────────────────────────
function getStats(images: ImageFile[]) {
  const avif = images.filter((i) => i.ext === "avif").length;
  const webp = images.filter((i) => i.ext === "webp").length;
  const totalSize = images.reduce((acc, i) => acc + i.size, 0);
  return { avif, webp, total: images.length, totalSize };
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function AdminMediaPage() {
  // Проверяем сессию
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const images = getOptimizedImages();
  const stats = getStats(images);

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* ── Хлебные крошки ──────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Медиафайлы</span>
        </nav>

        {/* ── Шапка ───────────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Медиафайлы
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {stats.total} файлов ·{" "}
              <span className="text-primary">{stats.avif} AVIF</span>
              {" · "}
              <span className="text-accent">{stats.webp} WebP</span>
              {" · "}
              {formatBytes(stats.totalSize)} суммарно
            </p>
          </div>

          {/* Кнопка загрузки — заглушка */}
          <button
            disabled
            title="В разработке"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-accent-bright/30 bg-accent-bright/8 px-4 py-2.5 text-sm font-medium text-accent-bright opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v8M4 6l3-3 3 3M2 11h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Загрузить изображение
          </button>
        </div>

        {/* ── Подсказка про скрипт оптимизации ───────────── */}
        <div className="mb-6 rounded-xl border border-accent-bright/15 bg-accent-bright/5 px-4 py-3">
          <p className="text-xs text-text-muted">
            Для добавления изображений: положи оригиналы в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-accent-bright">
              public/images/originals/
            </code>{" "}
            и запусти{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-accent-bright">
              pnpm optimize-images
            </code>
          </p>
        </div>

        {/* ── Сетка изображений ───────────────────────────── */}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-text/8 bg-surface/30 py-20 text-center">
            <div className="mb-4 text-4xl text-text-muted">◎</div>
            <p className="font-heading text-lg font-bold text-text-muted">
              Изображений пока нет
            </p>
            <p className="mt-2 text-sm text-text-muted/75">
              Добавьте файлы в public/images/originals/ и запустите скрипт
            </p>
          </div>
        ) : (
          // Передаём данные в клиентский компонент
          <MediaGrid images={images} />
        )}

        {/* ── Подвал ──────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between text-xs text-text-muted">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M10 6H2M5 9L2 6l3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад в админку
          </Link>

          <p className="text-text-muted/60">
            Оптимизированные файлы в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono">
              public/images/optimized/
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
