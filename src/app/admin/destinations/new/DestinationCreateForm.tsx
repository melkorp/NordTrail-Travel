// src/app/admin/destinations/new/DestinationCreateForm.tsx
"use client";

// Клиентский компонент — форма создания нового направления.
// Все поля пустые, slug генерируется из name.
// Сохранение через POST /api/admin/destinations/[slug].
// После успеха — редирект на страницу редактирования.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// ТИПЫ
// ─────────────────────────────────────────────────────────────
type Section = Destination["sections"][number];
type FaqItem = Destination["faq"][number];
type SaveStatus = "idle" | "saving" | "success" | "error";

// ─────────────────────────────────────────────────────────────
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ─────────────────────────────────────────────────────────────
const EMPTY_DESTINATION: Destination = {
  slug: "",
  name: "",
  h1: "",
  quickAnswer: "",
  bestSeason: "",
  budget: "средний",
  difficulty: "среднее",
  forKids: true,
  safety: 4,
  sections: [],
  faq: [],
};

// ─────────────────────────────────────────────────────────────
// СТИЛИ
// ─────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

const textareaClass =
  "w-full resize-none rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70";

const selectClass =
  "w-full rounded-xl border border-text/10 bg-surface/40 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-accent-bright/50 focus:bg-surface/70 cursor-pointer";

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

function CreateButton({ status }: { status: SaveStatus }) {
  return (
    <button
      type="button"
      disabled={status === "saving"}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
        status === "saving"
          ? "cursor-wait border border-text/10 bg-surface/30 text-text-muted"
          : status === "success"
            ? "border border-accent/30 bg-accent/10 text-accent"
            : status === "error"
              ? "border border-red-500/30 bg-red-500/10 text-red-400"
              : "border border-accent-bright/40 bg-accent-bright/10 text-accent-bright hover:bg-accent-bright/20"
      }`}
    >
      {status === "saving" && "Создание..."}
      {status === "success" && "✓ Создано"}
      {status === "error" && "✗ Ошибка"}
      {status === "idle" && "Создать направление"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ГЛАВНЫЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────
export default function DestinationCreateForm() {
  const [form, setForm] = useState<Destination>({ ...EMPTY_DESTINATION });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  const router = useRouter();

  // ─────────────────────────────────────────────────────────
  // Транслитерация для slug из русского названия
  // "Исландия" → "islandiya"
  // ─────────────────────────────────────────────────────────
  function generateSlug(name: string): string {
    const map: Record<string, string> = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (ch) => map[ch] ?? ch)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function setField<K extends keyof Destination>(
    key: K,
    value: Destination[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Автогенерация slug из name
      if (key === "name" && !slugManual) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  }

  // ─────────────────────────────────────────────────────────
  // Секции
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
  // Валидация
  // ─────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!form.slug.trim()) return "Slug не может быть пустым";
    if (!/^[a-z0-9-]+$/.test(form.slug))
      return "Slug может содержать только латинские буквы, цифры и дефисы";
    if (!form.name.trim()) return "Название не может быть пустым";
    if (!form.h1.trim()) return "H1 заголовок не может быть пустым";
    if (!form.quickAnswer.trim()) return "Quick Answer не может быть пустым";
    return null;
  }

  // ─────────────────────────────────────────────────────────
  // Создание через POST /api/admin/destinations/[slug]
  // ─────────────────────────────────────────────────────────
  async function handleCreate() {
    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }

    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/destinations/${form.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setStatus("success");
      setTimeout(() => {
        router.push(`/admin/destinations/${form.slug}/edit`);
      }, 1000);
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
          <span className="text-text/70">Новое направление</span>
        </nav>

        {/* ── Шапка ─────────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Новое направление
            </h1>
            <p className="mt-1 font-mono text-xs text-text-muted">
              content/destinations/
              <span className="text-accent-bright">
                {form.slug || "slug"}.mdx
              </span>
            </p>
          </div>
          <div onClick={handleCreate}>
            <CreateButton status={status} />
          </div>
        </div>

        {/* Ошибка */}
        {status === "error" && errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Подсказка */}
        <div className="mb-6 rounded-xl border border-accent-bright/15 bg-accent-bright/5 px-4 py-3">
          <p className="text-xs text-text-muted">
            Slug генерируется автоматически из названия направления. После
            создания slug изменить нельзя — он становится частью URL.
          </p>
        </div>

        {/* ── ФОРМА ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Основные поля */}
          <FieldCard>
            <SectionLabel>Основная информация</SectionLabel>
            <div className="space-y-3">
              {/* Название и slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Название
                  </label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Исландия"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
                    <span>Slug (URL)</span>
                    <button
                      type="button"
                      onClick={() => setSlugManual((v) => !v)}
                      className={`text-xs transition-colors ${
                        slugManual
                          ? "text-accent-bright"
                          : "text-text-muted/60 hover:text-text-muted"
                      }`}
                    >
                      {slugManual ? "Автогенерация" : "Редактировать"}
                    </button>
                  </label>
                  <input
                    className={`${inputClass} font-mono ${
                      slugManual ? "" : "opacity-70"
                    }`}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setField(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-"),
                      );
                    }}
                    placeholder="iceland"
                    readOnly={!slugManual}
                  />
                  {form.slug && (
                    <p className="mt-1 text-xs text-text-muted/60">
                      URL: /destinations/{form.slug}/
                    </p>
                  )}
                </div>
              </div>

              {/* H1 */}
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

              {/* Бюджет, сложность, для детей */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-text-muted">
                    Бюджет
                  </label>
                  <select
                    className={selectClass}
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
                    className={selectClass}
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
                    className={selectClass}
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

              {/* Безопасность */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
                  <span>Безопасность</span>
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
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
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
              placeholder="Краткое описание направления для сниппета в поиске..."
            />
          </FieldCard>

          {/* Секции */}
          <FieldCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
                Секции
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
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
              <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
                FAQ
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addFaq();
                }}
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

                  {/* В Destination: question/answer (не q/a) */}
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

          {/* Нижняя панель */}
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
              Отмена
            </Link>
            <div onClick={handleCreate}>
              <CreateButton status={status} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
