// src/app/admin/media/UploadButton.tsx
"use client";

// Двухэтапная загрузка:
// Этап 1: каждый файл → POST /api/admin/media/upload → blobSha (без коммита)
// Этап 2: все blobSha → POST /api/admin/media/commit → один коммит
//
// Загрузка последовательная — бережём GitHub API rate limit.
// Один коммит → Actions триггерится один раз → нет гонки.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// ─────────────────────────────────────────────────────────────
// Типы
// ─────────────────────────────────────────────────────────────
interface FileResult {
  name: string;
  ok: boolean;
  error?: string;
}

interface BlobResult {
  blobSha: string;
  filePath: string;
  safeName: string;
}

export default function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [results, setResults] = useState<FileResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ─────────────────────────────────────────────────────────
  // Этап 1: загрузить один файл → получить blobSha
  // ─────────────────────────────────────────────────────────
  async function uploadBlob(file: File): Promise<BlobResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
      // Content-Type не указываем — браузер сам добавит boundary
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      blobSha?: string;
      filePath?: string;
      safeName?: string;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }

    if (!data.blobSha || !data.filePath || !data.safeName) {
      throw new Error("Неполный ответ от сервера");
    }

    return {
      blobSha: data.blobSha,
      filePath: data.filePath,
      safeName: data.safeName,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Этап 2: закоммитить все blobs одним коммитом
  // ─────────────────────────────────────────────────────────
  async function commitBlobs(blobs: BlobResult[]): Promise<void> {
    const res = await fetch("/api/admin/media/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: blobs.map((b) => ({
          blobSha: b.blobSha,
          filePath: b.filePath,
          safeName: b.safeName,
        })),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? `Commit failed: HTTP ${res.status}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Основной обработчик
  // ─────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, MAX_FILES);

    setIsUploading(true);
    setResults([]);
    setProgress(`Проверка файлов...`);

    // ── Клиентская валидация ─────────────────────────────
    const validFiles: File[] = [];
    const accumulated: FileResult[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        accumulated.push({
          name: file.name,
          ok: false,
          error: "Недопустимый формат. Разрешены: JPEG, PNG, WebP",
        });
        continue;
      }
      if (file.size > MAX_SIZE) {
        accumulated.push({
          name: file.name,
          ok: false,
          error: "Файл слишком большой. Максимум: 10 MB",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setResults(accumulated);
      setIsUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // ── Этап 1: загружаем blobs последовательно ──────────
    const blobs: BlobResult[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setProgress(
        validFiles.length === 1
          ? `Загрузка ${file.name}...`
          : `Загрузка ${i + 1}/${validFiles.length}: ${file.name}`,
      );

      try {
        const blob = await uploadBlob(file);
        blobs.push(blob);
        // Добавляем промежуточный результат — пользователь видит прогресс
        accumulated.push({ name: blob.safeName, ok: true });
      } catch (err) {
        accumulated.push({
          name: file.name,
          ok: false,
          error: err instanceof Error ? err.message : "Ошибка загрузки",
        });
      }

      // Обновляем список после каждого файла
      setResults([...accumulated]);
    }

    // ── Этап 2: коммитим все успешные blobs одним коммитом
    if (blobs.length > 0) {
      setProgress(
        blobs.length === 1
          ? `Коммит "${blobs[0].safeName}"...`
          : `Коммит ${blobs.length} файлов одним коммитом...`,
      );

      try {
        await commitBlobs(blobs);
        console.log(`[UploadButton] Закоммичено ${blobs.length} файл(ов)`);
        router.refresh();
      } catch (err) {
        // Коммит не прошёл — помечаем все успешные blobs как ошибку
        const commitError =
          err instanceof Error ? err.message : "Ошибка коммита";

        setResults(
          accumulated.map((r) =>
            r.ok
              ? {
                  ...r,
                  ok: false,
                  error: `Blob создан, но коммит не прошёл: ${commitError}`,
                }
              : r,
          ),
        );
        setIsUploading(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setIsUploading(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    // Сбрасываем результаты через 6 секунд
    setTimeout(() => setResults([]), 6000);
  }

  // ─────────────────────────────────────────────────────────
  // Отображение
  // ─────────────────────────────────────────────────────────
  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.filter((r) => !r.ok).length;
  const hasResults = results.length > 0;

  const buttonStyle = isUploading
    ? "border border-text/10 bg-surface/30 text-text-muted cursor-wait"
    : hasResults && errorCount === 0
      ? "border border-accent/30 bg-accent/10 text-accent"
      : hasResults && successCount === 0
        ? "border border-red-500/30 bg-red-500/10 text-red-400"
        : hasResults
          ? "border border-text/10 bg-surface/30 text-text-muted"
          : "border border-accent-bright/30 bg-accent-bright/8 text-accent-bright hover:border-accent-bright/50 hover:bg-accent-bright/15";

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Скрытый input — multiple для выбора нескольких файлов */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Кнопка */}
      <button
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${buttonStyle}`}
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

        {/* Текст */}
        {isUploading
          ? (progress ?? "Загрузка...")
          : hasResults && errorCount === 0
            ? `Загружено ${successCount}`
            : hasResults && successCount > 0 && errorCount > 0
              ? `${successCount} ок / ${errorCount} ошибок`
              : hasResults
                ? "Ошибка загрузки"
                : "Загрузить изображения"}
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

          {successCount > 0 && !isUploading && (
            <p className="text-right text-xs text-text-muted/60">
              GitHub Actions оптимизирует за 2–3 мин
            </p>
          )}
        </div>
      )}
    </div>
  );
}
