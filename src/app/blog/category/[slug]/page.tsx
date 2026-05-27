// src/app/blog/category/[slug]/page.tsx
//
// СЕРВЕРНЫЙ КОМПОНЕНТ.
// Фильтрует статьи по категории и рендерит страницу.
// Карточки — статические, без клиентского JS.

import type { Metadata } from "next";
import Link from "next/link";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";
import type { ArticleData } from "../../[slug]/page";

// ─────────────────────────────────────────────────────────────
// КОНФИГ КАТЕГОРИЙ
// ─────────────────────────────────────────────────────────────
interface CategoryMeta {
  h1: string;
  subtitle: string;
  articleCategory: string;
}

const CATEGORIES: Record<string, CategoryMeta> = {
  hiking: {
    h1: "Северные треки и экспедиции",
    subtitle:
      "Маршруты через фьорды, ледники, вулканы и удалённые горные регионы.",
    articleCategory: "Hiking",
  },
  luxury: {
    h1: "Премиальные путешествия без компромиссов",
    subtitle: "Private lodges, северные spa, boutique-отели.",
    articleCategory: "Luxury",
  },
  winter: {
    h1: "Территория северной зимы",
    subtitle: "Полярные ночи, frozen expeditions, северное сияние.",
    articleCategory: "Winter",
  },
  family: {
    h1: "Семейные путешествия нового Севера",
    subtitle: "Спокойные маршруты и комфортные путешествия для всей семьи.",
    articleCategory: "Family",
  },
  budget: {
    h1: "Северные маршруты с разумным бюджетом",
    subtitle: "Практичные travel-гайды и самостоятельные путешествия.",
    articleCategory: "Budget",
  },
  "solo-travel": {
    h1: "Одиночные путешествия среди северных дорог",
    subtitle: "Маршруты для тех, кто выбирает тишину и свободу движения.",
    articleCategory: "Solo Travel",
  },
};

// ─────────────────────────────────────────────────────────────
// ИНДЕКС СТАТЕЙ
// Синхронизируй вручную при добавлении новых статей в ARTICLES.
// ─────────────────────────────────────────────────────────────
const ARTICLE_INDEX: Pick<
  ArticleData,
  "slug" | "title" | "category" | "readTime" | "dateDisplay" | "quickAnswer"
>[] = [
  {
    slug: "iceland-budget-2026",
    title: "Сколько стоит путешествие в Исландию в 2026 году",
    category: "Budget",
    readTime: "7 min read",
    dateDisplay: "15 мая 2026",
    quickAnswer:
      "Базовый бюджет на 7 дней в Исландии: от €1 200 на человека (без перелёта).",
  },
  {
    slug: "norway-hiking-guide",
    title: "Лучшие треки Norway для самостоятельной экспедиции",
    category: "Hiking",
    readTime: "9 min read",
    dateDisplay: "20 мая 2026",
    quickAnswer:
      "Norway остаётся одним из лучших направлений Европы для самостоятельного hiking-путешествия.",
  },
  {
    slug: "luxury-iceland-hotels",
    title: "Luxury Iceland: приватные отели среди вулканов",
    category: "Luxury",
    readTime: "8 min read",
    dateDisplay: "22 мая 2026",
    quickAnswer:
      "Luxury Iceland в 2026 году — приватные отели среди лавовых полей, ледников и северных фьордов.",
  },
  {
    slug: "winter-arctic-guide",
    title: "Как подготовиться к зимнему путешествию за Полярный круг",
    category: "Winter",
    readTime: "10 min read",
    dateDisplay: "25 мая 2026",
    quickAnswer:
      "Зимнее путешествие за Полярный круг — полноценная северная экспедиция, где подготовка напрямую влияет на безопасность.",
  },
  {
    slug: "solo-travel-japan-north",
    title: "Solo Travel в Japan: северные маршруты без толп",
    category: "Solo Travel",
    readTime: "10 min read",
    dateDisplay: "25 мая 2026",
    quickAnswer:
      "Северные регионы Japan — Hokkaido и Tohoku — предлагают зимние ландшафты, онсэны и редкое ощущение тишины.",
  },
  {
    slug: "kamchatka-volcanoes",
    title: "Камчатка: экспедиции к вулканам и Тихому океану",
    category: "Hiking",
    readTime: "11 min read",
    dateDisplay: "30 мая 2026",
    quickAnswer:
      "Камчатка — одно из последних по-настоящему экспедиционных направлений Евразии.",
  },
];

// ─────────────────────────────────────────────────────────────
// generateStaticParams
// ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug];

  if (!cat) return { title: "Категория не найдена | NordTrail Travel" };

  return {
    title: `${cat.h1} | NordTrail Travel`,
    description: cat.subtitle,
    alternates: {
      canonical: `https://melkorp.github.io/NordTrail-Travel/destinations/${slug}/`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// КОМПОНЕНТ КАРТОЧКИ
// ─────────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: (typeof ARTICLE_INDEX)[number] }) {
  return (
    <Link
      href={`/blog/${article.slug}/`}
      className="group block rounded-2xl border border-text/8 bg-surface/30 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-surface/60 hover:shadow-[0_0_32px_rgba(77,168,255,0.08)]"
    >
      {/* Категория + время */}
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-full border border-primary/30 px-3 py-0.5 text-xs font-medium tracking-wide text-primary">
          {article.category}
        </span>
        <span className="text-xs text-text-muted">{article.readTime}</span>
        <span className="ml-auto text-xs text-text-muted/75">
          {article.dateDisplay}
        </span>
      </div>

      {/* Заголовок */}
      <h2 className="mb-2 font-heading text-lg font-bold leading-snug text-text transition-colors duration-200 group-hover:text-accent">
        {article.title}
      </h2>

      {/* Аннотация */}
      <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
        {article.quickAnswer}
      </p>

      {/* Читать → */}
      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary/70 transition-colors duration-200 group-hover:text-primary">
        Читать статью
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M2 6h8M7 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];

  if (!cat) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text text-xl">Категория не найдена</p>
      </main>
    );
  }

  const articles = ARTICLE_INDEX.filter(
    (a) => a.category.toLowerCase() === cat.articleCategory.toLowerCase(),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "Блог", url: "/blog/" },
            { name: cat.h1 },
          ]),
        }}
      />
      <main className="min-h-screen bg-bg text-text">
        {/* ── Хедер категории ─────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-20">
          {/* Хлебные крошки */}
          <nav className="mb-8 flex items-center gap-2 text-xs text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary">
              NordTrail
            </Link>
            <span>/</span>
            <Link
              href="/blog/"
              className="transition-colors hover:text-primary"
            >
              Блог
            </Link>
            <span>/</span>
            <span className="text-text/70">{cat.h1}</span>
          </nav>

          {/* H1 с золотым подчёркиванием */}
          <div className="mb-4">
            <h1 className="inline font-heading text-3xl font-bold leading-tight text-text sm:text-4xl">
              {cat.h1}
            </h1>
            {/* Подчёркивание: accent-bright → accent градиент */}
            <div className="mt-3 h-px w-24 bg-linear-to-r from-accent-bright to-accent" />
          </div>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
            {cat.subtitle}
          </p>
        </section>

        {/* ── Сетка статей ────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          {articles.length > 0 ? (
            <>
              {/* Счётчик */}
              <p className="mb-6 text-sm text-text-muted/75">
                {articles.length} {articles.length === 1 ? "статья" : "статей"}{" "}
                в категории
              </p>

              {/* Карточки */}
              <div className="grid gap-4 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </>
          ) : (
            /* Заглушка если статей нет */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-text/8 bg-surface/30 py-20 text-center">
              <div className="mb-4 text-4xl text-text-muted">◎</div>
              <p className="font-heading text-lg font-bold text-text-muted">
                Скоро
              </p>
              <p className="mt-2 text-sm text-text-muted/75">
                Статьи этой категории появятся в ближайшее время
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
