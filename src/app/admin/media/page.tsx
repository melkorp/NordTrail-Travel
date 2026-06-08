// src/app/admin/media/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { readdirSync, statSync } from "fs";
import path from "path";
import Link from "next/link";
import { motion } from "framer-motion";
import MediaGrid from "./MediaGrid";
import UploadButton from "./UploadButton";
import { Image, ArrowLeft, Info } from "lucide-react";

export interface ImageFile {
  name: string;
  url: string;
  size: number;
  ext: string;
}

function getOptimizedImages(): ImageFile[] {
  const dir = path.join(process.cwd(), "public", "images", "optimized");
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => /\.(webp|avif)$/i.test(f))
    .map((name) => {
      const filePath = path.join(dir, name);
      const stat = statSync(filePath);
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      return { name, url: `/images/optimized/${name}`, size: stat.size, ext };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStats(images: ImageFile[]) {
  const avif = images.filter((i) => i.ext === "avif").length;
  const webp = images.filter((i) => i.ext === "webp").length;
  const totalSize = images.reduce((acc, i) => acc + i.size, 0);
  return { avif, webp, total: images.length, totalSize };
}

export default async function AdminMediaPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const images = getOptimizedImages();
  const stats = getStats(images);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Хлебные крошки */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 text-xs text-slate-500"
        >
          <Link
            href="/admin"
            className="transition-colors hover:text-cyan-400 flex items-center gap-1.5"
          >
            <ArrowLeft size={12} />
            Админка
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-purple-400">Медиафайлы</span>
        </motion.nav>

        {/* Шапка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-500">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">
                Медиафайлы
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              {stats.total} файлов ·{" "}
              <span className="text-purple-400">{stats.avif} AVIF</span>
              {" · "}
              <span className="text-pink-400">{stats.webp} WebP</span>
              {" · "}
              {formatBytes(stats.totalSize)} суммарно
            </p>
          </div>

          <UploadButton />
        </motion.div>

        {/* Подсказка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm px-4 py-3 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400">
            После загрузки оригинал попадёт в репозиторий. GitHub Actions
            запустит{" "}
            <code className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono text-purple-400">
              optimize-images.mjs
            </code>{" "}
            и оптимизированные версии появятся через 2–3 минуты.
          </p>
        </motion.div>

        {/* Сетка изображений */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm py-20 text-center"
          >
            <div className="mb-4 text-5xl text-slate-600">◎</div>
            <p className="font-heading text-lg font-bold text-slate-400">
              Изображений пока нет
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Загрузите первое изображение через кнопку выше
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MediaGrid images={images} />
          </motion.div>
        )}

        {/* Подвал */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-between text-xs text-slate-500"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft size={12} />
            Назад в админку
          </Link>
          <p className="text-slate-600">
            Оптимизированные файлы в{" "}
            <code className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono text-slate-400">
              public/images/optimized/
            </code>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
