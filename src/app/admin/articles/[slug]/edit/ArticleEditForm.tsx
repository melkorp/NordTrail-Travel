// src/app/admin/articles/[slug]/edit/ArticleEditForm.tsx
"use client";

// Клиентский компонент — вся логика формы здесь.
// Получает данные статьи как пропсы от серверного page.tsx.
// Сохранение через API route /api/admin/articles/[slug].

import { useState } from "react";
import Link from "next/link";
import type { ArticleData } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// ТИПЫ
// ─────────────────────────────────────────────────────────────
type Section = ArticleData["sections"][number];
type BudgetRow = ArticleData["budgetTable"][number];
type FaqItem = ArticleData["faq"][number];

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─────────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ─────────────────────────────────────────────────────────────

// Общий стиль для полей ввода
const inputClass =
  "w-full rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

const textareaClass =
  "w-full resize-none rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

// Заголовок секции формы
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
      {children}
    </p>
  );
}

// Карточка-обёртка для группы полей
function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-text/8 bg-surface/20 p-5">
      {children}
    </div>
  );
}

// Кнопка удаления строки в списке
function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 shrink-0 rounded-lg border border-text/10 p-1.5 text-text-muted transition-all hover:border-red-500/30 hover:text-red-400"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 2l8 8M10 2l-8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ГЛАВНЫЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
export default function ArticleEditForm({
  article,
  slug,
}: {
  article: ArticleData;
  slug: string;
}) {
  // Состояние формы — копия данных статьи
  const [form, setForm] = useState<ArticleData>({ ...article });

  // Статус сохранения
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ─────────────────────────────────────────────────────────
  // Обновление простых полей верхнего уровня
  // ─────────────────────────────────────────────────────────
  function setField<K extends keyof ArticleData>(
    key: K,
    value: ArticleData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ─────────────────────────────────────────────────────────
  // Секции статьи
  // ─────────────────────────────────────────────────────────
  function updateSection(index: number, field: keyof Section, value: string) {
    setForm((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], [field]: value };
      return { ...prev, sections };
    });
  }

  function addSection() {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "", content: "" }],
    }));
  }

  function removeSection(index: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  // ─────────────────────────────────────────────────────────
  // Таблица бюджета
  // ─────────────────────────────────────────────────────────
  function updateBudgetRow(
    index: number,
    field: keyof BudgetRow,
    value: string,
  ) {
    setForm((prev) => {
      const budgetTable = [...prev.budgetTable];
      budgetTable[index] = { ...budgetTable[index], [field]: value };
      return { ...prev, budgetTable };
    });
  }

  function addBudgetRow() {
    setForm((prev) => ({
      ...prev,
      budgetTable: [...prev.budgetTable, { item: "", low: "", premium: "" }],
    }));
  }

  function removeBudgetRow(index: number) {
    setForm((prev) => ({
      ...prev,
      budgetTable: prev.budgetTable.filter((_, i) => i !== index),
    }));
  }

  // ─────────────────────────────────────────────────────────
  // FAQ
  // ─────────────────────────────────────────────────────────
  function updateFaq(index: number, field: keyof FaqItem, value: string) {
    setForm((prev) => {
      const faq = [...prev.faq];
      faq[index] = { ...faq[index], [field]: value };
      return { ...prev, faq };
    });
  }

  function addFaq() {
    setForm((prev) => ({
      ...prev,
      faq: [...prev.faq, { q: "", a: "" }],
    }));
  }

  function removeFaq(index: number) {
    setForm((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  }

  // ─────────────────────────────────────────────────────────
  // Сохранение через API route
  // ─────────────────────────────────────────────────────────
  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus("saved");
      // Сбрасываем статус через 3 секунды
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
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* ── Хлебные крошки ────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <Link
            href="/admin/articles"
            className="transition-colors hover:text-primary"
          >
            Статьи
          </Link>
          <span>/</span>
          <span className="text-text/70">{slug}</span>
        </nav>

        {/* ── Шапка страницы ────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Редактирование статьи
            </h1>
            <p className="mt-1 font-mono text-xs text-text-muted">
              content/blog/{slug}.mdx
            </p>
          </div>

          {/* Кнопка сохранения */}
          <button
            onClick={handleSave}
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
            {status === "idle" && "Сохранить"}
          </button>
        </div>

        {/* Сообщение об ошибке */}
        {status === "error" && errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* ── ФОРМА ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Основные поля */}
          <FieldCard>
            <SectionLabel>Основная информация</SectionLabel>
            <div className="space-y-3">
              {/* Заголовок */}
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">
                  Заголовок
                </label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Заголовок статьи"
                />
              </div>

              {/* Два поля в ряд: категория и время чтения */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Категория
                  </label>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {[
                      "Budget",
                      "Hiking",
                      "Luxury",
                      "Winter",
                      "Solo Travel",
                      "Family",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Время чтения
                  </label>
                  <input
                    className={inputClass}
                    value={form.readTime}
                    onChange={(e) => setField("readTime", e.target.value)}
                    placeholder="8 min read"
                  />
                </div>
              </div>

              {/* Два поля в ряд: дата ISO и дата отображения */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Дата (ISO: YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dateIso}
                    onChange={(e) => setField("dateIso", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Дата (отображение)
                  </label>
                  <input
                    className={inputClass}
                    value={form.dateDisplay}
                    onChange={(e) => setField("dateDisplay", e.target.value)}
                    placeholder="15 мая 2026"
                  />
                </div>
              </div>

              {/* Автор */}
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">
                  Автор
                </label>
                <input
                  className={inputClass}
                  value={form.author}
                  onChange={(e) => setField("author", e.target.value)}
                  placeholder="NordTrail Research Team"
                />
              </div>

              {/* Обложка статьи — добавить сюда ↓ */}
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">
                  Обложка статьи (URL)
                </label>
                <input
                  className={inputClass}
                  value={form.image ?? ""}
                  onChange={(e) => setField("image", e.target.value)}
                  placeholder="/images/optimized/hero-bg-800.webp"
                />
                {/* Превью если URL задан */}
                {form.image && (
                  <p className="mt-1 truncate font-mono text-xs text-text-muted/60">
                    {form.image}
                  </p>
                )}
              </div>
            </div>
          </FieldCard>

          {/* Quick Answer */}
          <FieldCard>
            <SectionLabel>Краткий ответ (Quick Answer)</SectionLabel>
            <textarea
              className={textareaClass}
              rows={4}
              value={form.quickAnswer}
              onChange={(e) => setField("quickAnswer", e.target.value)}
              placeholder="Краткое описание для сниппета в поиске..."
            />
          </FieldCard>

          {/* Секции статьи */}
          <FieldCard>
            {/* Было: SectionLabel и кнопка внутри одного flex-div —
                браузер иногда блокирует клик на кнопку рядом с <p>.
                Исправление: кнопка в отдельном div над списком секций */}
            <div className="mb-3 flex items-center justify-between">
              {/* SectionLabel возвращает <p> — выносим текст напрямую */}
              <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
                Секции статьи
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // на всякий случай блокируем сплытие
                  addSection();
                }}
                className="text-xs text-accent-bright transition-colors hover:text-accent-bright/70"
              >
                + Добавить секцию
              </button>
            </div>

            <div className="space-y-4">
              {form.sections.map((section, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-text/8 bg-bg/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted">
                      Секция {i + 1}
                    </span>
                    <RemoveButton onClick={() => removeSection(i)} />
                  </div>

                  <input
                    className={`${inputClass} mb-2`}
                    value={section.heading}
                    onChange={(e) =>
                      updateSection(i, "heading", e.target.value)
                    }
                    placeholder="Заголовок секции (H2)"
                  />

                  <textarea
                    className={textareaClass}
                    rows={4}
                    value={section.content}
                    onChange={(e) =>
                      updateSection(i, "content", e.target.value)
                    }
                    placeholder="Текст секции..."
                  />
                </div>
              ))}

              {form.sections.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted/60">
                  Нет секций — нажмите «Добавить секцию»
                </p>
              )}
            </div>
          </FieldCard>

          {/* Таблица бюджета */}
          <FieldCard>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>Таблица бюджета</SectionLabel>
              <button
                type="button"
                onClick={addBudgetRow}
                className="text-xs text-accent-bright transition-colors hover:text-accent-bright/70"
              >
                + Добавить строку
              </button>
            </div>

            {/* Заголовки колонок таблицы */}
            {form.budgetTable.length > 0 && (
              <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                {["Пункт", "Бюджетно", "Премиум", ""].map((h) => (
                  <span
                    key={h}
                    className="text-xs font-medium uppercase tracking-wide text-text-muted"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {form.budgetTable.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2"
                >
                  <input
                    className={inputClass}
                    value={row.item}
                    onChange={(e) => updateBudgetRow(i, "item", e.target.value)}
                    placeholder="Пункт расходов"
                  />
                  <input
                    className={inputClass}
                    value={row.low}
                    onChange={(e) => updateBudgetRow(i, "low", e.target.value)}
                    placeholder="€100"
                  />
                  <input
                    className={inputClass}
                    value={row.premium}
                    onChange={(e) =>
                      updateBudgetRow(i, "premium", e.target.value)
                    }
                    placeholder="€300"
                  />
                  <RemoveButton onClick={() => removeBudgetRow(i)} />
                </div>
              ))}

              {form.budgetTable.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted/60">
                  Нет строк — нажмите «Добавить строку»
                </p>
              )}
            </div>
          </FieldCard>

          {/* FAQ */}
          <FieldCard>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>FAQ</SectionLabel>
              <button
                type="button"
                onClick={addFaq}
                className="text-xs text-accent-bright transition-colors hover:text-accent-bright/70"
              >
                + Добавить вопрос
              </button>
            </div>

            <div className="space-y-4">
              {form.faq.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-text/8 bg-bg/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted">
                      Вопрос {i + 1}
                    </span>
                    <RemoveButton onClick={() => removeFaq(i)} />
                  </div>

                  {/* Вопрос */}
                  <input
                    className={`${inputClass} mb-2`}
                    value={item.q}
                    onChange={(e) => updateFaq(i, "q", e.target.value)}
                    placeholder="Вопрос..."
                  />

                  {/* Ответ */}
                  <textarea
                    className={textareaClass}
                    rows={3}
                    value={item.a}
                    onChange={(e) => updateFaq(i, "a", e.target.value)}
                    placeholder="Ответ..."
                  />
                </div>
              ))}

              {form.faq.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted/60">
                  Нет вопросов — нажмите «Добавить вопрос»
                </p>
              )}
            </div>
          </FieldCard>

          {/* Заключение */}
          <FieldCard>
            <SectionLabel>Заключение</SectionLabel>
            <textarea
              className={textareaClass}
              rows={4}
              value={form.conclusion}
              onChange={(e) => setField("conclusion", e.target.value)}
              placeholder="Итоговый абзац статьи..."
            />
          </FieldCard>

          {/* Crosslinks — связанные материалы */}
          <FieldCard>
            <SectionLabel>Связанные материалы (перелинковка)</SectionLabel>
            <div className="space-y-3">
              {(form.crosslinks || []).map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className={inputClass}
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...(form.crosslinks || [])];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setField("crosslinks", updated);
                    }}
                    placeholder="Текст ссылки"
                  />
                  <input
                    className={inputClass}
                    value={link.href}
                    onChange={(e) => {
                      const updated = [...(form.crosslinks || [])];
                      updated[i] = { ...updated[i], href: e.target.value };
                      setField("crosslinks", updated);
                    }}
                    placeholder="/destinations/..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (form.crosslinks || []).filter(
                        (_, j) => j !== i,
                      );
                      setField("crosslinks", updated);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updated = [
                    ...(form.crosslinks || []),
                    { label: "", href: "" },
                  ];
                  setField("crosslinks", updated);
                }}
                className="text-sm text-accent-bright hover:underline"
              >
                + Добавить ссылку
              </button>
            </div>
          </FieldCard>

          {/* Нижняя кнопка сохранения — дублируем для удобства */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/admin/articles"
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
              Вернуться к списку
            </Link>

            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
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
              {status === "idle" && "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
