// src/app/admin/media/UploadButton.tsx
"use client";

// Кнопка загрузки изображений.
// Отправляет все выбранные файлы ОДНИМ запросом — сервер коммитит
// их одним коммитом через GitHub Tree API, исключая гонку с Actions.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILES = 10;

interface FileResult {
  name: string;
  ok: boolean;
  error?: string;
}

function getButtonStyle(
  isUploading: boolean,
  hasResults: boolean,
  successCount: number,
  errorCount: number,
): string {
  if (isUploading) return "border border-text/10 bg-surface/30 text-text-muted";
  if (hasResults && errorCount === 0)
    return "border border-accent/30 bg-accent/10 text-accent";
  if (hasResults && errorCount > 0 && successCount === 0)
    return "border border-red-500/30 bg-red-500/10 text-red-400";
  if (hasResults && errorCount > 0)
    return "border border-accent-bright/20 bg-surface/30 text-text-muted";
  return "border border-accent-bright/30 bg-accent-bright/8 text-accent-bright hover:border-accent-bright/50 hover:bg-accent-bright/15";
}
function StatusIcon({
  isUploading,
  hasResults,
  errorCount,
}: Readonly<{
  isUploading: boolean;
  hasResults: boolean;
  errorCount: number;
}>) {
  if (isUploading) {
    return (
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
    );
  }
  if (hasResults && errorCount === 0) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 7l4 4 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1v8M4 6l3-3 3 3M2 11h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function getButtonText(
  isUploading: boolean,
  hasResults: boolean,
  successCount: number,
  errorCount: number,
  progress: string | null,
): string {
  if (isUploading) return progress ?? "Загрузка...";
  if (hasResults && errorCount === 0) return `Загружено ${successCount}`;
  if (hasResults && successCount > 0 && errorCount > 0)
    return `${successCount} ок / ${errorCount} ошибок`;
  if (hasResults && errorCount > 0) return "Ошибка загрузки";
  return "Загрузить изображения";
}
export default function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Ограничиваем на клиенте
    const files = Array.from(fileList).slice(0, MAX_FILES);

    setIsUploading(true);
    setResults([]);
    setProgress(
      files.length === 1
        ? `Загрузка ${files[0].name}...`
        : `Загрузка ${files.length} файлов одним коммитом...`,
    );

    try {
      // Все файлы в один FormData — сервер коммитит их разом
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      // Сервер всегда возвращает { results: FileResult[] }
      const data = await res.json().catch(() => ({ results: [] }));

      if (!res.ok && res.status !== 207) {
        // Глобальная ошибка (не связанная с отдельными файлами)
        setResults([
          {
            name: "Все файлы",
            ok: false,
            error: data.error ?? `HTTP ${res.status}`,
          },
        ]);
      } else {
        setResults(data.results ?? []);
      }

      // Обновляем список изображений только если хоть один файл загрузился
      const hasSuccess = (data.results ?? []).some((r: FileResult) => r.ok);
      if (hasSuccess) router.refresh();
    } catch (err) {
      setResults([
        {
          name: "Все файлы",
          ok: false,
          error: err instanceof Error ? err.message : "Ошибка сети",
        },
      ]);
    }

    setIsUploading(false);
    setProgress(null);

    // Сбрасываем input
    if (inputRef.current) inputRef.current.value = "";

    // Сбрасываем результаты через 6 секунд
    setTimeout(() => setResults([]), 6000);
  }

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.filter((r) => !r.ok).length;
  const hasResults = results.length > 0;

  // Определяем стиль кнопки
  const buttonStyle = getButtonStyle(
    isUploading,
    hasResults,
    successCount,
    errorCount,
  );

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

      {/* Кнопка — не блокируем полностью во время загрузки */}
      <button
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${buttonStyle}`}
      >
        {/* Иконка */}
        <StatusIcon
          isUploading={isUploading}
          hasResults={hasResults}
          errorCount={errorCount}
        />

        {/* Текст кнопки */}
        {getButtonText(
          isUploading,
          hasResults,
          successCount,
          errorCount,
          progress,
        )}
      </button>

      {/* Список результатов */}
      {hasResults && (
        <div className="w-full max-w-xs space-y-1">
          {results.map((r, i) => (
            <p
              key={`${r.name}-${i}`}
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

          {/* Итоговая подсказка */}
          {successCount > 0 && (
            <p className="text-right text-xs text-text-muted/60">
              GitHub Actions оптимизирует за 2–3 мин
            </p>
          )}
        </div>
      )}
    </div>
  );
}
