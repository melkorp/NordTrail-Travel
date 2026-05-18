// src/app/blog/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Анимация появления: медленная, с мягким торможением
const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

// Данные для категорий
const categories = [
  { name: "Hiking", slug: "hiking" },
  { name: "Luxury", slug: "luxury" },
  { name: "Winter", slug: "winter" },
  { name: "Family", slug: "family" },
  { name: "Budget", slug: "budget" },
  { name: "Solo Travel", slug: "solo-travel" },
];

// Данные для статей
const articles = [
  {
    title: "Лучшие треки Norway для самостоятельной экспедиции",
    category: "Hiking",
    readTime: "8 min",
  },
  {
    title: "Luxury Iceland: приватные отели среди вулканов",
    category: "Luxury",
    readTime: "10 min",
  },
  {
    title: "Как подготовиться к зимнему путешествию за Полярный круг",
    category: "Winter",
    readTime: "6 min",
  },
  {
    title: "Solo Travel в Japan: северные маршруты без толп",
    category: "Solo Travel",
    readTime: "9 min",
  },
  {
    title: "Сколько стоит путешествие в Iceland в 2026 году",
    category: "Budget",
    readTime: "7 min",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
      {/* 1. Hero Блог */}
      <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto text-center border-b border-white/5">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-4xl md:text-6xl font-heading font-semibold text-text mb-4 tracking-tight"
        >
          Журнал северных путешествий
        </motion.h1>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ delay: 0.1 }}
          className="text-lg text-text-muted max-w-xl mx-auto mb-8"
        >
          Отчёты, гиды и инсайды от нашей команды исследователей
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/destinations"
            className="inline-block px-8 py-3 font-heading text-xs tracking-widest uppercase border border-accent-bright text-accent-bright hover:bg-accent-bright hover:text-bg transition-all duration-500 rounded-sm"
          >
            Смотреть направления
          </Link>
        </motion.div>
      </section>

      {/* 2. Featured Article */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.article
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          className="group relative block bg-surface border border-white/5 hover:border-accent-bright/40 transition-all duration-500 rounded-sm overflow-hidden"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 text-xs font-heading uppercase tracking-widest text-accent-calm mb-4">
                <span>Luxury</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>Winter</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>12 min read</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading text-text mb-4 group-hover:text-accent-bright transition-colors duration-500">
                Iceland зимой: северное сияние вне туристических маршрутов
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                Полный гид по частным локациям, где световое шоу становится
                личным опытом, а не массовым зрелищем.
              </p>
              <span className="text-sm font-heading text-text/60 group-hover:text-accent-bright transition-colors duration-500 underline decoration-accent-bright/30 underline-offset-4">
                Читать статью
              </span>
            </div>
            {/* Плейсхолдер изображения */}
            <div className="w-full md:w-1/3 aspect-[4/3] bg-bg/50 rounded-sm border border-white/5" />
          </div>
        </motion.article>
      </section>

      {/* 3. Категории */}
      <section className="py-12 px-6 max-w-5xl mx-auto border-y border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link
                href={`/blog/category/${cat.slug}`}
                className="block text-center py-3 px-2 border border-white/5 hover:border-accent-bright/30 hover:bg-accent-bright/5 transition-all duration-300 rounded-sm text-sm font-heading text-text-muted hover:text-accent-bright"
              >
                {cat.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Сетка статей */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.article
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={reveal}
              transition={{ delay: i * 0.1 }}
              className="group bg-surface border border-white/5 hover:border-accent-bright/40 hover:-translate-y-px transition-all duration-500 rounded-sm p-6 flex flex-col h-full"
            >
              <div className="mb-4 text-xs font-heading uppercase tracking-widest text-accent-calm">
                {article.category}
              </div>
              <h3 className="text-xl font-heading text-text mb-3 leading-snug group-hover:text-accent-bright transition-colors duration-500">
                {article.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-text/40 font-heading">
                <span>{article.readTime}</span>
                <span className="group-hover:text-accent-bright transition-colors duration-500">
                  →
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 5. CTA Подписка */}
      <section className="py-24 px-6 bg-linear-to-b from-bg to-surface">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-2xl md:text-3xl font-heading text-text mb-4"
          >
            Получайте новые северные маршруты
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.1 }}
            className="text-text-muted mb-8"
          >
            Только избранный контент. Никакого спама.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <input
              type="email"
              placeholder="Ваш email"
              className="px-4 py-3 bg-bg border border-white/10 text-text font-body focus:border-accent-bright focus:outline-none rounded-sm w-full sm:w-auto min-w-[240px]"
            />
            <button className="px-8 py-3 bg-accent-bright text-bg font-heading text-sm tracking-widest uppercase font-medium hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(212,175,55,0.2)] transition-all duration-500 rounded-sm">
              Подписаться
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
