// src/app/blog/page.tsx
//
// Страница списка блога.
// Static Export — рендерится один раз при сборке, без серверных запросов.
// "use client" нужен только для Framer Motion (браузерные анимации).

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Базовая анимация появления.
// delay передаём через custom + функцию-вариант,
// чтобы не перезаписывать ease и duration при каждом вызове.
const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

// Категории — slug используется и в URL, и как ключ
const categories = [
  { name: "Hiking", slug: "hiking" },
  { name: "Luxury", slug: "luxury" },
  { name: "Winter", slug: "winter" },
  { name: "Family", slug: "family" },
  { name: "Budget", slug: "budget" },
  { name: "Solo Travel", slug: "solo-travel" },
];

// Статьи — добавили поле slug для формирования URL
// Позже заменим на fetch из Contentlayer или JSON-файла
const articles = [
  {
    slug: "iceland-budget-2026",
    title: "Сколько стоит путешествие в Исландию в 2026 году",
    category: "Budget",
    readTime: "7 min",
  },
  {
    slug: "norway-hiking-guide",
    title: "Лучшие треки Norway для самостоятельной экспедиции",
    category: "Hiking",
    readTime: "9 min",
  },
  {
    slug: "luxury-iceland-hotels",
    title: "Luxury Iceland: приватные отели среди вулканов",
    category: "Luxury",
    readTime: "8 min",
  },
  {
    slug: "winter-arctic-guide",
    title: "Как подготовиться к зимнему путешествию за Полярный круг",
    category: "Winter",
    readTime: "10 min",
  },
  {
    slug: "solo-travel-japan-north",
    title: "Solo Travel в Japan: северные маршруты без толп",
    category: "Solo Travel",
    readTime: "9 min",
  },
  {
    slug: "kamchatka-volcanoes",
    title: "Камчатка: экспедиции к вулканам и Тихому океану",
    category: "Hiking",
    readTime: "11 min",
  },
  {
    slug: "kolsky-peninsula",
    title: "Кольский полуостров: северное сияние, киты и Арктика без визы",
    category: "Winter",
    readTime: "10 min",
  },
  {
    slug: "altai-mountains",
    title: "Алтай: горные экспедиции и дорога к сибирским ледникам",
    category: "Hiking",
    readTime: "10 min",
  },
  {
    slug: "baikal-lake",
    title: "Байкал зимой и летом: путеводитель по сибирскому озеру-морю",
    category: "Winter",
    readTime: "9 min",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto text-center border-b border-white/5">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0}
          className="text-4xl md:text-6xl font-heading font-semibold text-text mb-4 tracking-tight"
        >
          Журнал северных путешествий
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.1}
          className="text-lg text-text-muted max-w-xl mx-auto mb-8"
        >
          Отчёты, гиды и инсайды от нашей команды исследователей
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.2}
        >
          <Link
            href="/destinations/"
            className="inline-block px-8 py-3 font-heading text-xs tracking-widest uppercase border border-accent-bright text-accent-bright hover:bg-accent-bright hover:text-bg transition-all duration-500 rounded-sm"
          >
            Смотреть направления
          </Link>
        </motion.div>
      </section>

      {/* ── 2. Featured Article ──────────────────────────────── */}
      {/*
        Паттерн: Link снаружи → article внутри.
        Вся карточка кликабельна, семантика сохранена.
        group вешаем на Link — тогда group-hover работает на всех дочерних элементах.
      */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          custom={0}
        >
          <Link
            href="/blog/iceland-budget-2026/"
            className="group relative block bg-surface border border-white/5 hover:border-accent-bright/40 transition-all duration-500 rounded-sm overflow-hidden"
          >
            <article className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 text-xs font-heading uppercase tracking-widest text-accent-calm mb-4">
                  <span>Luxury</span>
                  <span
                    className="w-1 h-1 bg-white/20 rounded-full"
                    aria-hidden="true"
                  />
                  <span>Winter</span>
                  <span
                    className="w-1 h-1 bg-white/20 rounded-full"
                    aria-hidden="true"
                  />
                  <span>12 min read</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-heading text-text mb-4 group-hover:text-accent-bright transition-colors duration-500">
                  Iceland зимой: северное сияние вне туристических маршрутов
                </h2>

                <p className="text-text-muted leading-relaxed mb-6">
                  Полный гид по частным локациям, где световое шоу становится
                  личным опытом, а не массовым зрелищем.
                </p>

                {/* span вместо <a> — мы уже внутри <Link>, вкладывать ссылку в ссылку нельзя */}
                <span className="text-sm font-heading text-text/60 group-hover:text-accent-bright transition-colors duration-500 underline decoration-accent-bright/30 underline-offset-4">
                  Читать статью
                </span>
              </div>

              {/* Плейсхолдер изображения — позже заменить на <Image> */}
              <div
                className="w-full md:w-1/3 aspect-4/3 bg-bg/50 rounded-sm border border-white/5"
                aria-hidden="true"
              />
            </article>
          </Link>
        </motion.div>
      </section>

      {/* ── 3. Категории ────────────────────────────────────── */}
      {/* Ссылки уже были — только добавили трейлинг-слэш для Static Export */}
      <section className="py-12 px-6 max-w-5xl mx-auto border-y border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              // Здесь оставляем inline transition — это не variants, конфликта нет
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link
                href={`/blog/category/${cat.slug}/`}
                className="block text-center py-3 px-2 border border-white/5 hover:border-accent-bright/30 hover:bg-accent-bright/5 transition-all duration-300 rounded-sm text-sm font-heading text-text-muted hover:text-accent-bright"
              >
                {cat.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. Сетка статей ─────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            /*
              Тот же паттерн: Link снаружи, article внутри.
              motion переносим на Link — он поддерживает motion-пропсы через motion(Link),
              но проще и надёжнее обернуть в motion.div.
            */
            <motion.div
              key={article.slug} // slug надёжнее index: не ломается при сортировке
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={reveal}
              custom={i * 0.1} // нарастающая задержка для каждой карточки
            >
              <Link
                href={`/blog/${article.slug}/`}
                className="group block bg-surface border border-white/5 hover:border-accent-bright/40 hover:-translate-y-px transition-all duration-500 rounded-sm p-6 h-full"
              >
                <article className="flex flex-col h-full">
                  <div className="mb-4 text-xs font-heading uppercase tracking-widest text-accent-calm">
                    {article.category}
                  </div>

                  <h3 className="text-xl font-heading text-text mb-3 leading-snug group-hover:text-accent-bright transition-colors duration-500">
                    {article.title}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-text/40 font-heading">
                    <span>{article.readTime}</span>
                    {/* aria-hidden: декоративная стрелка, смысла для скринридера не несёт */}
                    <span
                      className="group-hover:text-accent-bright transition-colors duration-500"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. CTA Подписка ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-linear-to-b from-bg to-surface">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            custom={0}
            className="text-2xl md:text-3xl font-heading text-text mb-4"
          >
            Получайте новые северные маршруты
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            custom={0.1}
            className="text-text-muted mb-8"
          >
            Только избранный контент. Никакого спама.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            custom={0.2}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <input
              type="email"
              placeholder="Ваш email"
              // autocomplete помогает браузеру заполнить поле автоматически
              autoComplete="email"
              className="px-4 py-3 bg-bg border border-white/10 text-text font-body focus:border-accent-bright focus:outline-none rounded-sm w-full sm:w-auto min-w-60"
            />
            <button
              type="button"
              className="px-8 py-3 bg-accent-bright text-bg font-heading text-sm tracking-widest uppercase font-medium hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(77,168,255,0.2)] transition-all duration-500 rounded-sm"
            >
              Подписаться
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
