// src/app/admin/media/UploadButton.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

interface FileResult {
  name: string;
  ok: boolean;
  error?: string;
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

    const files = Array.from(fileList).slice(0, MAX_FILES);

    setIsUploading(true);
    setResults([]);
    setProgress(
      files.length === 1
        ? `Загрузка ${files[0].name}...`
        : `Подготовка ${files.length} файлов...`
    );

    // ─────────────────────────────────────────────────────
    // Клиентская валидация — отсекаем невалидные сразу
    // ─────────────────────────────────────────────────────
    const validFiles: File[] = [];
    const clientErrors: FileResult[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        clientErrors.push({
          name: file.name,
          ok: false,
          error: "Недопустимый формат. Разрешены: JPG, PNG, WebP",
        });
        continue;
      }
      if (file.size > MAX_SIZE) {
        clientErrors.push({
          name: file.name,
          ok: false,
          error: "Файл слишком большой. Максимум: 10 MB",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setResults(clientErrors);
      setIsUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      setProgress(
        validFiles.length === 1
          ? `Загрузка ${validFiles[0].name}...`
          : `Загрузка ${validFiles.length} файлов одним коммитом...`
      );

      // ───────────────────────────────────────────────────
      // Конвертируем файлы в base64 на клиенте
      // Передаём как JSON — надёжнее чем FormData multiple
      // ───────────────────────────────────────────────────
      const filePayloads = await Promise.all(
        validFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            base64,
          };
        })
      );

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filePayloads }),
      });

      const data = await res.json().catch(() => ({ results: [] }));

      if (!res.ok && res.status !== 207) {
        setResults([
          ...clientErrors,
          {
            name: "Все файлы",
            ok: false,
            error: data.error ?? `HTTP ${res.status}`,
          },
        ]);
      } else {
        setResults([...clientErrors, ...(data.results ?? [])]);
      }

      const hasSuccess = (data.results ?? []).some((r: FileResult) => r.ok);
      if (hasSuccess) router.refresh();
    } catch (err) {
      setResults([
        ...clientErrors,
        {
          name: "Все файлы",
          ok: false,
          error: err instanceof Error ? err.message : "Ошибка сети",
        },
      ]);
    }

    setIsUploading(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => setResults([]), 6000);
  }

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.filter((r) => !r.ok).length;
  const hasResults = results.length > 0;

  const buttonStyle = isUploading
    ? "border border-text/10 bg-surface/30 text-text-muted"
    : hasResults && errorCount === 0
      ? "border border-accent/30 bg-accent/10 text-accent"
      : hasResults && successCount === 0
        ? "border border-red-500/30 bg-red-500/10 text-red-400"
        : hasResults
          ? "border border-accent-bright/20 bg-surface/30 text-text-muted"
          : "border border-accent-bright/30 bg-accent-bright/8 text-accent-bright hover:border-accent-bright/50 hover:bg-accent-bright/15";

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${buttonStyle}`}
      >
        {isUploading ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"
              strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" />
          </svg>
        ) : hasResults && errorCount === 0 ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3-3 3 3M2 11h10" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {isUploading
          ? (progress ?? "Загрузка...")
          : hasResults && errorCount === 0
            ? `Загружено ${successCount}`
            : hasResults && successCount > 0 && errorCount > 0
              ? `${successCount} ок / ${errorCount} ошибок`
              : hasResults && errorCount > 0
                ? "Ошибка загрузки"
                : "Загрузить изображения"}
      </button>

      {hasResults && (
        <div className="w-full max-w-xs space-y-1">
          {results.map((r, i) => (
            <p
              key={`${r.name}-${i}`}
              className={`truncate text-right text-xs ${r.ok ? "text-accent/80" : "text-red-400"}`}
              title={r.error}
            >
              {r.ok ? "✓" : "✗"} {r.name}
              {r.error && (
                <span className="ml-1 text-text-muted/60">— {r.error}</span>
              )}
            </p>
          ))}
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