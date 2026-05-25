// src/app/admin/settings/SettingsForm.tsx
"use client";

// Клиентский компонент — форма редактирования настроек сайта.
// Сохранение через PUT /api/admin/settings.

import { useState } from "react";
import Link from "next/link";
import type { SiteSettings } from "./page";

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─────────────────────────────────────────────────────────────
// ПЕРЕИСПОЛЬЗУЕМЫЕ СТИЛИ
// ─────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

const textareaClass =
  "w-full resize-none rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

// ─────────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ─────────────────────────────────────────────────────────────
function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-text/8 bg-surface/20 p-5">
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium uppercase tracking-widest text-text-muted">
      {children}
    </p>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-muted">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-muted/60">{hint}</p>}
    </div>
  );
}

// Кнопка сохранения — переиспользуется вверху и внизу
function SaveButton({
  status,
  onClick,
  label = "Сохранить",
}: {
  status: SaveStatus;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === "saving"}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
        status === "saving"
          ? "cursor-wait border border-text/10 bg-surface/30 text-text-muted"
          : status === "saved"
            ? "border border-accent/30 bg-accent/10 text-accent"
            : status === "error"
              ? "border border-red-500/30 bg-red-500/10 text-red-400"
              : "border border-accent-bright/40 bg-accent-bright/10 text-accent-bright hover:bg-accent-bright/20"
      }`}
    >
      {status === "saving" && "Сохранение..."}
      {status === "saved" && "✓ Сохранено"}
      {status === "error" && "✗ Ошибка"}
      {status === "idle" && label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ГЛАВНЫЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  // Состояние формы — глубокая копия настроек
  const [form, setForm] = useState<SiteSettings>(
    JSON.parse(JSON.stringify(settings)),
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Показывать ли пароль открытым текстом
  const [showPassword, setShowPassword] = useState(false);

  // ─────────────────────────────────────────────────────────
  // Обновление вложенных полей
  // setNested("site", "title", "NordTrail") → form.site.title = "NordTrail"
  // ─────────────────────────────────────────────────────────
  // Обновление вложенных полей
  function setNested<
    S extends keyof SiteSettings,
    F extends keyof SiteSettings[S],
  >(section: S, field: F, value: SiteSettings[S][F]) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  // ─────────────────────────────────────────────────────────
  // Сохранение через API route
  // ─────────────────────────────────────────────────────────
  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  // ─────────────────────────────────────────────────────────
  // РЕНДЕР
  // ─────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Шапка с кнопкой сохранения ──────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Все поля обязательны, кроме пароля
        </p>
        <SaveButton status={status} onClick={handleSave} />
      </div>

      {/* Сообщение об ошибке */}
      {status === "error" && errorMsg && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="space-y-5">
        {/* ── Настройки сайта ─────────────────────────────── */}
        <FieldCard>
          <SectionLabel>Сайт</SectionLabel>
          <div className="space-y-3">
            <FieldRow
              label="Название сайта"
              hint="Отображается в заголовке браузера и og:title"
            >
              <input
                className={inputClass}
                value={form.site.title}
                onChange={(e) => setNested("site", "title", e.target.value)}
                placeholder="NordTrail Travel"
              />
            </FieldRow>

            <FieldRow
              label="Описание сайта"
              hint="Используется в meta description и og:description"
            >
              <textarea
                className={textareaClass}
                rows={3}
                value={form.site.description}
                onChange={(e) =>
                  setNested("site", "description", e.target.value)
                }
                placeholder="Северные маршруты и экспедиции"
              />
            </FieldRow>
          </div>
        </FieldCard>

        {/* ── Подвал ──────────────────────────────────────── */}
        <FieldCard>
          <SectionLabel>Подвал (Footer)</SectionLabel>

          <FieldRow
            label="Текст подвала"
            hint="Копирайт и дополнительная информация"
          >
            <textarea
              className={textareaClass}
              rows={2}
              value={form.footer.text}
              onChange={(e) => setNested("footer", "text", e.target.value)}
              placeholder="© 2026 NordTrail Travel. Все права защищены."
            />
          </FieldRow>
        </FieldCard>

        {/* ── Тема оформления ─────────────────────────────── */}
        <FieldCard>
          <SectionLabel>Тема оформления</SectionLabel>

          <FieldRow
            label="Цвет акцента"
            hint="HEX-код основного акцентного цвета (золото по умолчанию)"
          >
            <div className="flex items-center gap-3">
              {/* Цветовой пикер */}
              <div className="relative">
                <input
                  type="color"
                  value={form.theme.accentColor}
                  onChange={(e) =>
                    setNested("theme", "accentColor", e.target.value)
                  }
                  className="h-10 w-10 cursor-pointer rounded-xl border border-text/10 bg-transparent p-0.5 outline-none"
                  title="Выбрать цвет"
                />
              </div>

              {/* HEX-поле рядом с пикером */}
              <input
                className={`${inputClass} font-mono uppercase`}
                value={form.theme.accentColor}
                onChange={(e) => {
                  // Принимаем только валидный HEX — # + 6 символов
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    setNested("theme", "accentColor", val);
                  }
                }}
                placeholder="#D4AF37"
                maxLength={7}
              />

              {/* Превью цвета */}
              <div
                className="h-10 w-10 shrink-0 rounded-xl border border-text/10"
                style={{ backgroundColor: form.theme.accentColor }}
                title={form.theme.accentColor}
              />
            </div>

            {/* Предустановленные цвета */}
            <div className="mt-3">
              <p className="mb-2 text-xs text-text-muted/60">
                Предустановленные:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Золото", value: "#D4AF37" },
                  { label: "Синий", value: "#4DA8FF" },
                  { label: "Мята", value: "#8FFFD1" },
                  { label: "Коралл", value: "#FF6B6B" },
                  { label: "Аметист", value: "#9B59B6" },
                  { label: "Серебро", value: "#BDC3C7" },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() =>
                      setNested("theme", "accentColor", preset.value)
                    }
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                      form.theme.accentColor === preset.value
                        ? "border-accent-bright/40 bg-accent-bright/10 text-accent-bright"
                        : "border-text/10 text-text-muted hover:border-text/20 hover:text-text"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: preset.value }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </FieldRow>
        </FieldCard>

        {/* ── Настройки безопасности ──────────────────────── */}
        <FieldCard>
          <SectionLabel>Безопасность</SectionLabel>

          <FieldRow
            label="Пароль администратора"
            hint="Оставьте пустым чтобы не менять текущий пароль"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputClass} pr-10`}
                value={form.admin.password}
                onChange={(e) => setNested("admin", "password", e.target.value)}
                placeholder="Новый пароль"
                autoComplete="new-password"
              />

              {/* Кнопка показать/скрыть пароль */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  // Иконка "глаз закрыт"
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3A7 7 0 0 0 1 8s2.3 5 7 5a7 7 0 0 0 3.8-1.2M6 3.1A7 7 0 0 1 8 3c4.7 0 7 5 7 5a12 12 0 0 1-1.8 2.6"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  // Иконка "глаз открыт"
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1 8s2.3-5 7-5 7 5 7 5-2.3 5-7 5-7-5-7-5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </FieldRow>

          {/* Предупреждение про пароль */}
          <div className="mt-3 rounded-xl border border-accent-bright/15 bg-accent-bright/5 px-3 py-2.5">
            <p className="text-xs text-text-muted/80">
              Пароль хранится в репозитории — используй только для некритичных
              сред. Для продакшена рекомендуем переменные окружения Vercel.
            </p>
          </div>
        </FieldCard>

        {/* ── Нижняя навигация ────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
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

          <SaveButton
            status={status}
            onClick={handleSave}
            label="Сохранить настройки"
          />
        </div>
      </div>
    </div>
  );
}
