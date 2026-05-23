// src/app/admin/destinations/[slug]/edit/DestinationEditForm.tsx
"use client";

// Клиентский компонент — вся логика формы редактирования направления.
// Получает данные как пропсы от серверного page.tsx.
// Сохранение через API route /api/admin/destinations/[slug].

import { useState } from "react";
import Link from "next/link";
import type { Destination } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// ТИПЫ
// ─────────────────────────────────────────────────────────────
type Section = Destination["sections"][number];
type FaqItem = Destination["faq"][number];
type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─────────────────────────────────────────────────────────────
// СТИЛИ — переиспользуемые классы
// ─────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

const textareaClass =
  "w-full resize-none rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

// ─────────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-muted">
      {children}
    </p>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-text/8 bg-surface/20 p-5">
      {children}
    </div>
  );
}

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

// Кнопка сохранения — переиспользуется вверху и внизу формы
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
export default function DestinationEditForm({
  destination,
  slug,
}: {
  destination: Destination;
  slug: string;
}) {
  // Состояние формы — копия данных направления
  const [form, setForm] = useState<Destination>({ ...destination });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ─────────────────────────────────────────────────────────
  // Обновление простых полей верхнего уровня
  // ─────────────────────────────────────────────────────────
  function setField<K extends keyof Destination>(
    key: K,
    value: Destination[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ─────────────────────────────────────────────────────────
  // Секции направления
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
      sections: [...prev.sections, { title: "", content: "" }],
    }));
  }

  function removeSection(index: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
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
      faq: [...prev.faq, { question: "", answer: "" }],
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
      const res = await fetch(`/api/admin/destinations/${slug}`, {
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
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* ── Хлебные крошки ────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <Link
            href="/admin/destinations"
            className="transition-colors hover:text-primary"
          >
            Направления
          </Link>
          <span>/</span>
          <span className="text-text/70">{slug}</span>
        </nav>

        {/* ── Шапка ─────────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Редактирование направления
            </h1>
            <p className="mt-1 font-mono text-xs text-text-muted">
              content/destinations/{slug}.mdx
            </p>
          </div>
          <SaveButton status={status} onClick={handleSave} />
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
              {/* Два поля: slug и название */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Slug
                  </label>
                  <input
                    className={inputClass}
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    placeholder="iceland"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Название
                  </label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Исландия"
                  />
                </div>
              </div>

              {/* H1 заголовок */}
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">
                  H1 заголовок
                </label>
                <input
                  className={inputClass}
                  value={form.h1}
                  onChange={(e) => setField("h1", e.target.value)}
                  placeholder="Путешествие в Исландию: маршруты, цены, советы 2026"
                />
              </div>

              {/* Лучший сезон */}
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">
                  Лучший сезон
                </label>
                <input
                  className={inputClass}
                  value={form.bestSeason}
                  onChange={(e) => setField("bestSeason", e.target.value)}
                  placeholder="Июнь–август (лето), Октябрь–март (северное сияние)"
                />
              </div>

              {/* Три поля в ряд: бюджет, сложность, для детей */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Бюджет
                  </label>
                  <select
                    className={inputClass}
                    value={form.budget}
                    onChange={(e) => setField("budget", e.target.value)}
                  >
                    <option value="низкий">Низкий</option>
                    <option value="средний">Средний</option>
                    <option value="высокий">Высокий</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Сложность
                  </label>
                  <select
                    className={inputClass}
                    value={form.difficulty}
                    onChange={(e) => setField("difficulty", e.target.value)}
                  >
                    <option value="лёгкое">Лёгкое</option>
                    <option value="среднее">Среднее</option>
                    <option value="сложное">Сложное</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Для детей
                  </label>
                  <select
                    className={inputClass}
                    value={form.forKids ? "true" : "false"}
                    onChange={(e) =>
                      setField("forKids", e.target.value === "true")
                    }
                  >
                    <option value="true">Да</option>
                    <option value="false">Нет</option>
                  </select>
                </div>
              </div>

              {/* Безопасность — числовой слайдер */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
                  <span>Безопасность</span>
                  {/* Показываем звёзды рядом с лейблом */}
                  <span className="text-accent-bright/70">
                    {"★".repeat(form.safety)}
                    <span className="text-text-muted/30">
                      {"★".repeat(5 - form.safety)}
                    </span>
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={form.safety}
                  onChange={(e) => setField("safety", Number(e.target.value))}
                  className="w-full accent-accent-bright"
                />
                <div className="mt-1 flex justify-between text-xs text-text-muted/50">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
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

          {/* Секции */}
          <FieldCard>
            <div className="mb-3 flex items-center justify-between">
              <SectionLabel>Секции</SectionLabel>
              <button
                type="button"
                onClick={addSection}
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

                  {/* Заголовок секции — в Destination поле называется title */}
                  <input
                    className={`${inputClass} mb-2`}
                    value={section.title}
                    onChange={(e) => updateSection(i, "title", e.target.value)}
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

                  {/* В Destination поля называются question/answer, не q/a */}
                  <input
                    className={`${inputClass} mb-2`}
                    value={item.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder="Вопрос..."
                  />

                  <textarea
                    className={textareaClass}
                    rows={3}
                    value={item.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
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

          {/* Нижняя навигация */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/admin/destinations"
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

            <SaveButton
              status={status}
              onClick={handleSave}
              label="Сохранить изменения"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
