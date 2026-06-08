// src/app/admin/media/UploadButton.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, Loader2 } from "lucide-react";

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

  async function uploadBlob(file: File): Promise<BlobResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, MAX_FILES);

    setIsUploading(true);
    setResults([]);
    setProgress(`Проверка файлов...`);

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
        accumulated.push({ name: blob.safeName, ok: true });
      } catch (err) {
        accumulated.push({
          name: file.name,
          ok: false,
          error: err instanceof Error ? err.message : "Ошибка загрузки",
        });
      }

      setResults([...accumulated]);
    }

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

    setTimeout(() => setResults([]), 6000);
  }

  const successCount = results.filter((r) => r.ok).length;
  const errorCount = results.filter((r) => !r.ok).length;
  const hasResults = results.length > 0;

  const buttonStyle = isUploading
    ? "border border-slate-700/50 bg-slate-800/30 text-slate-500 cursor-wait"
    : hasResults && errorCount === 0
      ? "border border-green-400/30 bg-green-500/10 text-green-400"
      : hasResults && successCount === 0
        ? "border border-red-500/30 bg-red-500/10 text-red-400"
        : hasResults
          ? "border border-slate-700/50 bg-slate-800/30 text-slate-500"
          : "border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/20";

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
          <Loader2 size={14} className="animate-spin" />
        ) : hasResults && errorCount === 0 ? (
          <Check size={14} />
        ) : (
          <Upload size={14} />
        )}

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

      {hasResults && (
        <div className="w-full max-w-xs space-y-1">
          {results.map((r, i) => (
            <p
              key={`${r.name}-${i}`}
              className={`truncate text-right text-xs ${
                r.ok ? "text-green-400/80" : "text-red-400"
              }`}
              title={r.error}
            >
              {r.ok ? "✓" : "✗"} {r.name}
              {r.error && (
                <span className="ml-1 text-slate-500">— {r.error}</span>
              )}
            </p>
          ))}

          {successCount > 0 && !isUploading && (
            <p className="text-right text-xs text-slate-500">
              GitHub Actions оптимизирует за 2–3 мин
            </p>
          )}
        </div>
      )}
    </div>
  );
}
