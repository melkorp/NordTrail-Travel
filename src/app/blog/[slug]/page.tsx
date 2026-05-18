// src/app/blog/[slug]/page.tsx
//
// СЕРВЕРНЫЙ КОМПОНЕНТ — здесь нет "use client".
// Отвечает за: генерацию статических путей, метаданные, передачу данных.
// Все анимации и useState живут в BlogPostClient.tsx.

import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

// Мок-данные статьи (позже вынесем в отдельный data-слой или Contentlayer)
// Вынесены сюда, а не в клиент — чтобы при масштабировании заменить на fetch()
const ARTICLES: Record<string, ArticleData> = {
  "iceland-budget-2026": {
    slug: "iceland-budget-2026",
    title: "Сколько стоит путешествие в Исландию в 2026 году",
    category: "Budget",
    readTime: "7 min read",
    // Дата хранится в ISO 8601 — машиночитаемый формат для Schema.org
    // Человекочитаемую версию форматируем при отображении
    dateIso: "2026-05-15",
    dateDisplay: "15 мая 2026",
    author: "NordTrail Research Team",
    quickAnswer:
      "Базовый бюджет на 7 дней в Исландии: от €1 200 на человека (без перелёта). Включает авто, гестхаусы, питание в супермаркетах и бесплатные активности. Премиум-формат: от €3 500 — приватные трансферы, лоджи с видом на фьорды, гастро-ужины.",
    sections: [
      {
        heading: "Почему Исландия дороже, чем кажется",
        content:
          "Исландия — страна с высокой стоимостью жизни: импорт, логистика, сезонность. Но при грамотном планировании можно избежать «туристических ловушек» и сохранить бюджет без потери впечатлений.",
      },
      {
        heading: "Структура расходов: детальный разбор",
        content:
          "Разбиваем ключевые статьи затрат, чтобы вы могли гибко комбинировать опции под свой стиль путешествия.",
      },
    ],
    budgetTable: [
      { item: "Аренда авто (компакт, 7 дней)", low: "€350", premium: "€800" },
      { item: "Жильё (гестхаус / лодж)", low: "€420", premium: "€1 400" },
      {
        item: "Питание (супермаркет / рестораны)",
        low: "€210",
        premium: "€700",
      },
      {
        item: "Активности (бесплатно / гиды)",
        low: "€0",
        premium: "€400",
      },
      { item: "Топливо / трансферы", low: "€120", premium: "€300" },
      { item: "Страховка / связь", low: "€50", premium: "€100" },
      { item: "Резерв (10%)", low: "€115", premium: "€370" },
    ],
    faq: [
      {
        q: "Можно ли сэкономить на жилье без потери комфорта?",
        a: "Да: выбирайте гестхаусы в небольших посёлках (не в Рейкьявике), бронируйте за 3–4 месяца, ищите варианты с кухней — это сократит расходы на питание на 30–40%.",
      },
      {
        q: "Какой сезон оптимален по соотношению цена/впечатления?",
        a: "Май и сентябрь: ещё/уже есть свет, цены на 25–40% ниже пика, меньше туристов, природа в переходной фазе — особенно фотогенична.",
      },
      {
        q: "Нужна ли специальная страховка для Исландии?",
        a: "Рекомендуем полис с покрытием эвакуации и погодных задержек. Стандартный туристический часто не включает экстремальные сценарии (внезапный шторм, закрытие дорог).",
      },
    ],
    conclusion:
      "Исландия в 2026 остаётся доступной при осознанном планировании. Главное — не гнаться за «всё включено», а собирать маршрут как конструктор: базовый каркас + точечные премиум-вставки там, где это действительно усиливает опыт.",
  },
};

// Тип вынесен рядом с данными — проще поддерживать
export interface ArticleData {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  dateIso: string; // "2026-05-15" — для Schema.org и <time dateTime>
  dateDisplay: string; // "15 мая 2026" — для отображения пользователю
  author: string;
  quickAnswer: string;
  sections: { heading: string; content: string }[];
  budgetTable: { item: string; low: string; premium: string }[];
  faq: { q: string; a: string }[];
  conclusion: string;
}

// generateStaticParams говорит Next.js: "Создай HTML-файл для каждого slug".
// Живёт ТОЛЬКО в серверном файле — с "use client" это невозможно.
export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

// generateMetadata — тоже только серверная функция
// В Next.js 15 params — это Promise, нужен await
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) return { title: "Статья не найдена | NordTrail Travel" };

  return {
    title: `${article.title} | NordTrail Travel`,
    description: article.quickAnswer,
    alternates: {
      canonical: `/blog/${slug}/`,
    },
  };
}

// Серверный компонент-страница.
// Получает данные и передаёт их в клиентский компонент через props.
// Аналогия: официант (сервер) берёт заказ с кухни и несёт к столу (клиент).
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // В Next.js 15 params — Promise!
}) {
  // await обязателен в Next.js 15
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text text-xl">Статья не найдена</p>
      </main>
    );
  }

  // Передаём данные вниз — клиентский компонент только рендерит
  return <BlogPostClient article={article} />;
}
