// src/app/admin/articles/page.tsx
//
// Страница списка статей в админке.
// Серверный компонент — читает MDX-файлы при рендере.
// Защита через getServerSession — неавторизованных редиректит на /admin.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { ArticleData } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Загрузка всех статей из content/blog/*.mdx
// ─────────────────────────────────────────────────────────────
async function getAllArticles(): Promise<ArticleData[]> {
  const slugs = getSlugs("blog");

  // Читаем каждый файл и фильтруем null (битые файлы)
  const articles = slugs
    .map((slug) => getBySlug<ArticleData>("blog", slug))
    .filter((a): a is ArticleData => a !== null);

  // Сортируем по дате — новые сверху
  return articles.sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime(),
  );
}

// ─────────────────────────────────────────────────────────────
// Бейдж категории — цвет зависит от категории
// ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  // Перевод английских категорий на русский
  const categoryMap: Record<string, string> = {
    Budget: "Бюджет",
    Hiking: "Хайкинг",
    Luxury: "Люкс",
    Winter: "Зима",
    "Solo Travel": "Соло",
    Family: "Семья",
  };
  const categoryLabel = categoryMap[category] ?? category;

  // Маппинг категорий на цвета темы (ключи — русские названия)
  const styles: Record<string, string> = {
    Бюджет: "border-accent/30 text-accent bg-accent/5",
    Хайкинг: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
    Люкс: "border-primary/30 text-primary bg-primary/5",
    Зима: "border-primary/30 text-primary bg-primary/5",
    Соло: "border-accent/30 text-accent bg-accent/5",
    Семья: "border-accent-bright/30 text-accent-bright bg-accent-bright/5",
  };

  const style =
    styles[categoryLabel] ?? "border-text/20 text-text-muted bg-text/5";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {categoryLabel}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function AdminArticlesPage() {
  // Проверяем сессию — неавторизованных отправляем на страницу входа
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* ── Шапка страницы ──────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Статьи блога
            </h1>
            {/* Счётчик статей */}
            <p className="mt-1 text-sm text-text-muted">
              {articles.length} {articles.length === 1 ? "статья" : "статей"} в
              базе
            </p>
          </div>

          {/* Кнопка новой статьи — пока заглушка */}
          <button
            disabled
            title="В разработке"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-accent-bright/30 bg-accent-bright/8 px-4 py-2.5 text-sm font-medium text-accent-bright opacity-50 transition-all"
          >
            {/* Плюс */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Новая статья
          </button>
        </div>

        {/* ── Хлебные крошки ──────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Статьи</span>
        </nav>

        {/* ── Подсказка по категориям ──────────────────────────── */}
        <details className="mb-6 rounded-xl border border-text/8 bg-surface/20 p-4 text-sm">
          <summary className="cursor-pointer font-heading text-text-muted hover:text-text transition-colors">
            О категориях
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-text-muted">
            <div>
              <span className="text-accent font-medium">Бюджет</span> — статьи о
              бюджетных путешествиях
            </div>
            <div>
              <span className="text-accent-bright font-medium">Хайкинг</span> —
              пешие походы и треккинг
            </div>
            <div>
              <span className="text-primary font-medium">Люкс</span> —
              премиум-отдых и отели
            </div>
            <div>
              <span className="text-primary font-medium">Зима</span> — зимние
              путешествия
            </div>
            <div>
              <span className="text-accent font-medium">Соло</span> — одиночные
              путешествия
            </div>
            <div>
              <span className="text-accent-bright font-medium">Семья</span> —
              семейные поездки
            </div>
          </div>
        </details>

        {/* ── Таблица статей ──────────────────────────────── */}
        {articles.length === 0 ? (
          // Заглушка если статей нет
          <div className="flex flex-col items-center justify-center rounded-2xl border border-text/8 bg-surface/30 py-20 text-center">
            <div className="mb-4 text-4xl text-text-muted">◎</div>
            <p className="font-heading text-lg font-bold text-text-muted">
              Статей пока нет
            </p>
            <p className="mt-2 text-sm text-text-muted/75">
              Добавьте первую статью в content/blog/
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-text/8">
            <table className="w-full text-sm">
              {/* Заголовки колонок */}
              <thead>
                <tr className="border-b border-text/8 bg-surface/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Заголовок
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Категория
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Дата
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Время чтения
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                    Действия
                  </th>
                </tr>
              </thead>

              {/* Строки статей */}
              <tbody>
                {articles.map((article, i) => (
                  <tr
                    key={article.slug}
                    className={`border-b border-text/5 transition-colors hover:bg-surface/30 ${
                      i % 2 === 0 ? "bg-transparent" : "bg-surface/10"
                    }`}
                  >
                    {/* Заголовок + slug */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-text leading-snug">
                        {article.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        /{article.slug}/
                      </p>
                    </td>

                    {/* Категория */}
                    <td className="px-5 py-4">
                      <CategoryBadge category={article.category} />
                    </td>

                    {/* Дата публикации */}
                    <td className="px-5 py-4 text-text-muted">
                      {article.dateDisplay}
                    </td>

                    {/* Время чтения */}
                    <td className="px-5 py-4 text-text-muted">
                      {article.readTime}
                    </td>

                    {/* Действия */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Просмотр на сайте — открывает в новой вкладке */}
                        <Link
                          href={`/blog/${article.slug}/`}
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

                        {/* Редактировать — ссылка на форму редактирования */}
                        <Link
                          href={`/admin/articles/${article.slug}/edit`}
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

        {/* ── Подвал с навигацией ─────────────────────────── */}
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

          {/* Подсказка про MDX */}
          <p className="text-text-muted/60">
            Файлы хранятся в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-text-muted">
              content/blog/
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
