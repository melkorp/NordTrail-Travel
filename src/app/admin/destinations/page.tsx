// src/app/admin/destinations/page.tsx
//
// Страница списка направлений в админке.
// Серверный компонент — читает MDX-файлы при рендере.
// Защита через getServerSession — неавторизованных редиректит на /admin.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { Destination } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Загрузка всех направлений из content/destinations/*.mdx
// ─────────────────────────────────────────────────────────────
async function getAllDestinations(): Promise<Destination[]> {
  const slugs = getSlugs("destinations");

  const destinations = slugs
    .map((slug) => getBySlug<Destination>("destinations", slug))
    .filter((d): d is Destination => d !== null);

  // Сортируем по алфавиту по названию
  return destinations.sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

// ─────────────────────────────────────────────────────────────
// Бейдж сложности — цвет зависит от значения
// ─────────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    лёгкое: "border-accent/30 text-accent bg-accent/5",
    среднее: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
    сложное: "border-red-500/30 text-red-400 bg-red-500/5",
  };

  const style =
    styles[difficulty.toLowerCase()] ??
    "border-text/20 text-text-muted bg-text/5";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {difficulty}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Бейдж бюджета
// ─────────────────────────────────────────────────────────────
function BudgetBadge({ budget }: { budget: string }) {
  const styles: Record<string, string> = {
    низкий: "border-accent/30 text-accent bg-accent/5",
    средний: "border-primary/30 text-primary bg-primary/5",
    высокий: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
  };

  const style =
    styles[budget.toLowerCase()] ?? "border-text/20 text-text-muted bg-text/5";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {budget}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Звёзды безопасности
// ─────────────────────────────────────────────────────────────
function SafetyStars({ safety }: { safety: number }) {
  return (
    <span className="text-xs text-accent-bright/70">
      {"★".repeat(safety)}
      <span className="text-text-muted/30">{"★".repeat(5 - safety)}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function AdminDestinationsPage() {
  // Проверяем сессию
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const destinations = await getAllDestinations();

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* ── Хлебные крошки ──────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Направления</span>
        </nav>

        {/* ── Шапка страницы ──────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Направления
            </h1>
            {/* Счётчик */}
            <p className="mt-1 text-sm text-text-muted">
              {destinations.length}{" "}
              {destinations.length === 1 ? "направление" : "направлений"} в базе
            </p>
          </div>

          {/* Кнопка нового направления — заглушка */}
          <button
            disabled
            title="В разработке"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-accent-bright/30 bg-accent-bright/8 px-4 py-2.5 text-sm font-medium text-accent-bright opacity-50 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Новое направление
          </button>
        </div>

        {/* ── Таблица направлений ──────────────────────────── */}
        {destinations.length === 0 ? (
          // Заглушка если направлений нет
          <div className="flex flex-col items-center justify-center rounded-2xl border border-text/8 bg-surface/30 py-20 text-center">
            <div className="mb-4 text-4xl text-text-muted">◎</div>
            <p className="font-heading text-lg font-bold text-text-muted">
              Направлений пока нет
            </p>
            <p className="mt-2 text-sm text-text-muted/75">
              Добавьте первое направление в content/destinations/
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-text/8">
            <table className="w-full text-sm">
              {/* Заголовки колонок */}
              <thead>
                <tr className="border-b border-text/8 bg-surface/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Название
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Сложность
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Бюджет
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Сезон
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Безопасность
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                    Действия
                  </th>
                </tr>
              </thead>

              {/* Строки направлений */}
              <tbody>
                {destinations.map((dest, i) => (
                  <tr
                    key={dest.slug}
                    className={`border-b border-text/5 transition-colors hover:bg-surface/30 ${
                      i % 2 === 0 ? "bg-transparent" : "bg-surface/10"
                    }`}
                  >
                    {/* Название + slug */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-text leading-snug">
                        {dest.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        /{dest.slug}/
                      </p>
                    </td>

                    {/* Сложность */}
                    <td className="px-5 py-4">
                      <DifficultyBadge difficulty={dest.difficulty} />
                    </td>

                    {/* Бюджет */}
                    <td className="px-5 py-4">
                      <BudgetBadge budget={dest.budget} />
                    </td>

                    {/* Лучший сезон — обрезаем если длинный */}
                    <td className="px-5 py-4">
                      <p
                        className="max-w-45 truncate text-text-muted"
                        title={dest.bestSeason}
                      >
                        {dest.bestSeason}
                      </p>
                    </td>

                    {/* Безопасность звёздами */}
                    <td className="px-5 py-4">
                      <SafetyStars safety={dest.safety} />
                    </td>

                    {/* Действия */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Просмотр на сайте */}
                        <Link
                          href={`/destinations/${dest.slug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-text/10 bg-text/5 px-3 py-1.5 text-xs text-text-muted transition-all hover:border-text/20 hover:text-text"
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 11 11"
                            fill="none"
                          >
                            <path
                              d="M1 10L10 1M10 1H4M10 1v6"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Открыть
                        </Link>

                        {/* Редактировать */}
                        <Link
                          href={`/admin/destinations/${dest.slug}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-bright/30 bg-accent-bright/8 px-3 py-1.5 text-xs font-medium text-accent-bright transition-all hover:border-accent-bright/50 hover:bg-accent-bright/15"
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 11 11"
                            fill="none"
                          >
                            <path
                              d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Редактировать
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Подвал ──────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between text-xs text-text-muted">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
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

          <p className="text-text-muted/60">
            Файлы хранятся в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-text-muted">
              content/destinations/
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
