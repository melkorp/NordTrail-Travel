// src/app/admin/media/UploadButton.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Максимум файлов за раз — ограничение на клиенте
const MAX_FILES = 10;

// Статус одного файла в очереди
interface FileResult {
  name: string;
  ok: boolean;
  error?: string;
}

export default function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ─────────────────────────────────────────────────────────
  // Обработка множественного выбора файлов
  // ─────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Ограничиваем на клиенте — берём первые MAX_FILES
    const files = Array.from(fileList).slice(0, MAX_FILES);

    setIsUploading(true);
    setResults([]);
    setProgress({ done: 0, total: files.length });

    const accumulated: FileResult[] = [];

    // Загружаем каждый файл отдельным запросом
    // Параллельно — быстрее, но не перегружаем GitHub API
    await Promise.all(
      files.map(async (file, i) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            accumulated.push({
              name: file.name,
              ok: false,
              error: data.error ?? `HTTP ${res.status}`,
            });
          } else {
            accumulated.push({ name: data.name ?? file.name, ok: true });
          }
        } catch (err) {
          accumulated.push({
            name: file.name,
            ok: false,
            error: err instanceof Error ? err.message : "Ошибка сети",
          });
        }

        // Обновляем прогресс после каждого файла
        setProgress({ done: i + 1, total: files.length });
      }),
    );

    setResults(accumulated);
    setIsUploading(false);
    setProgress(null);

    // Сбрасываем input
    if (inputRef.current) inputRef.current.value = "";

    // Обновляем список изображений
    router.refresh();

    // Сбрасываем результаты через 5 секунд
    setTimeout(() => setResults([]), 5000);
  }

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.filter((r) => !r.ok).length;
  const hasResults = results.length > 0;

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Скрытый input — multiple для множественного выбора */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Видимая кнопка — не блокируем во время загрузки */}
      <button
        onClick={() => inputRef.current?.click()}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          isUploading
            ? "border border-text/10 bg-surface/30 text-text-muted"
            : hasResults && errorCount === 0
              ? "border border-accent/30 bg-accent/10 text-accent"
              : hasResults && errorCount > 0
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "border border-accent-bright/30 bg-accent-bright/8 text-accent-bright hover:border-accent-bright/50 hover:bg-accent-bright/15"
        }`}
      >
        {/* Иконка */}
        {isUploading ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="animate-spin"
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
        ) : hasResults && errorCount === 0 ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7l4 4 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v8M4 6l3-3 3 3M2 11h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {isUploading
          ? progress
            ? `Загрузка ${progress.done}/${progress.total}...`
            : "Загрузка..."
          : hasResults && errorCount === 0
            ? `Загружено ${successCount}`
            : hasResults && errorCount > 0
              ? `${successCount} ок / ${errorCount} ошибок`
              : "Загрузить изображения"}
      </button>

      {/* Прогресс-бар */}
      {isUploading && progress && (
        <div className="w-full max-w-xs">
          <div className="h-1 w-full rounded-full bg-surface/60">
            <div
              className="h-1 rounded-full bg-accent-bright/70 transition-all duration-300"
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Список результатов */}
      {hasResults && (
        <div className="w-full max-w-xs space-y-1">
          {results.map((r) => (
            <p
              key={r.name}
              className={`truncate text-right text-xs ${
                r.ok ? "text-accent/80" : "text-red-400"
              }`}
              title={r.error}
            >
              {r.ok ? "✓" : "✗"} {r.name}
              {r.error && (
                <span className="ml-1 text-text-muted/60">— {r.error}</span>
              )}
            </p>
          ))}

          {/* Итог если больше одного файла */}
          {results.length > 1 && (
            <p className="text-right text-xs text-text-muted/60">
              {successCount > 0 &&
                `${successCount} загружено → GitHub Actions оптимизирует за 2–3 мин`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
