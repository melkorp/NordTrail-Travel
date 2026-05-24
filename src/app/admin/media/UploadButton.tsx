// src/app/admin/media/UploadButton.tsx
"use client";

// Клиентский компонент — кнопка загрузки изображения.
// Открывает диалог выбора файла, отправляет через FormData,
// показывает прогресс и результат.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadButton() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedName, setUploadedName] = useState("");

  // Скрытый input[type=file] — триггерим клик программно
  const inputRef = useRef<HTMLInputElement>(null);

  // Для обновления страницы после загрузки
  const router = useRouter();

  // ─────────────────────────────────────────────────────────
  // Обработка выбора файла
  // ─────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");
    setUploadedName("");

    try {
      // Формируем FormData — API route ожидает поле "file"
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
        // Content-Type НЕ указываем — браузер сам добавит boundary для multipart
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus("success");
      setUploadedName(data.name);

      // Сбрасываем input чтобы можно было загрузить тот же файл повторно
      if (inputRef.current) inputRef.current.value = "";

      // Обновляем страницу через 2 секунды чтобы показать уведомление
      setTimeout(() => {
        setStatus("idle");
        // router.refresh() обновляет серверные данные без полной перезагрузки
        router.refresh();
      }, 2500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Неизвестная ошибка");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Скрытый input — принимает только изображения */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Видимая кнопка — клик открывает диалог выбора файла */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          status === "uploading"
            ? "cursor-wait border border-text/10 bg-surface/30 text-text-muted"
            : status === "success"
              ? "border border-accent/30 bg-accent/10 text-accent"
              : status === "error"
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "border border-accent-bright/30 bg-accent-bright/8 text-accent-bright hover:border-accent-bright/50 hover:bg-accent-bright/15"
        }`}
      >
        {/* Иконка меняется в зависимости от статуса */}
        {status === "uploading" ? (
          // Спиннер во время загрузки
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
        ) : status === "success" ? (
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

        {status === "uploading" && "Загрузка..."}
        {status === "success" && "Загружено!"}
        {status === "error" && "Ошибка"}
        {status === "idle" && "Загрузить изображение"}
      </button>

      {/* Уведомление об успехе */}
      {status === "success" && uploadedName && (
        <p className="text-right text-xs text-accent/80">
          {uploadedName} → GitHub Actions оптимизирует за 2–3 мин
        </p>
      )}

      {/* Сообщение об ошибке */}
      {status === "error" && errorMsg && (
        <p className="max-w-xs text-right text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
