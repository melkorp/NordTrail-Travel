"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, ChevronDown } from "lucide-react";
import type { ArticleData } from "./page";
import Image from "next/image";

// Базовая анимация появления снизу вверх
// delay добавляем через prop, а не перезаписью transition —
// иначе затираются duration и ease из variants
const reveal = {
  hidden: { opacity: 0, y: 20 },
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

// ── Компонент строки таблицы ──────────────────────────────────
// Вынесен отдельно для читаемости
function BudgetRow({
  item,
  low,
  premium,
}: {
  item: string;
  low: string;
  premium: string;
}) {
  return (
    <tr className="hover:bg-white/2 transition-colors">
      <td className="px-4 py-3 text-text/90">{item}</td>
      <td className="px-4 py-3 text-right font-heading text-accent-calm">
        {low}
      </td>
      <td className="px-4 py-3 text-right font-heading text-accent-bright">
        {premium}
      </td>
    </tr>
  );
}

// ── FAQ-аккордеон ─────────────────────────────────────────────
function FaqItem({
  question,
  answer,
  delay,
}: {
  question: string;
  answer: string;
  delay: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={reveal}
      custom={delay} // custom передаёт delay в функцию-вариант
      className="border border-white/5 rounded-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        // aria-expanded сообщает скринридерам: открыт аккордеон или нет
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-heading text-sm text-text hover:bg-white/2 transition-colors"
      >
        <span>{question}</span>
        <ChevronDown
          size={16}
          className={`text-text/40 transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* AnimatePresence нужен для анимации исчезновения (exit) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            // overflow-hidden здесь окей: он на анимируемом блоке,
            // а не на родителе, который Framer Motion не контролирует
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-text-muted leading-relaxed text-sm">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Главный клиентский компонент ─────────────────────────────
export default function BlogPostClient({ article }: { article: ArticleData }) {
  const {
    slug,
    title,
    category,
    readTime,
    dateIso,
    dateDisplay,
    author,
    quickAnswer,
    image,
    sections,
    budgetTable,
    faq,
    conclusion,
    crosslinks,
  } = article;

  const baseUrl = "https://melkorp.github.io/NordTrail-Travel";

  return (
    <article className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
      {/* ── JSON-LD Schema ──────────────────────────────────────
          Три отдельных скрипта — Google лучше парсит разделённые схемы.
          datePublished в ISO 8601 — обязательный формат для Schema.org.       */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: quickAnswer,
            author: { "@type": "Person", name: author },
            datePublished: dateIso, // ✅ ISO 8601: "2026-05-15", не "15 мая 2026"
            publisher: {
              "@type": "Organization",
              name: "NordTrail Travel",
              url: baseUrl,
            },
            mainEntityOfPage: `${baseUrl}/blog/${slug}/`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Главная",
                item: `${baseUrl}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Блог",
                item: `${baseUrl}/blog/`,
              },
              // У последнего элемента нет item — это текущая страница
              { "@type": "ListItem", position: 3, name: title },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      {/* ── Article Schema.org ───────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: quickAnswer,
            datePublished: dateIso,
            author: {
              "@type": "Organization",
              name: author,
            },
            publisher: {
              "@type": "Organization",
              name: "NordTrail Travel",
              url: baseUrl,
            },
          }),
        }}
      />

      {/* ── Хлебные крошки ──────────────────────────────────── */}
      <nav
        className="px-6 pt-24 pb-6 max-w-3xl mx-auto"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 text-sm font-heading text-text-muted">
          <li>
            <Link
              href="/"
              className="hover:text-accent-bright transition-colors"
            >
              Главная
            </Link>
          </li>
          {/* aria-hidden="true" — разделитель декоративный, скринридер пропустит */}
          <li aria-hidden="true">
            <ChevronRight size={14} className="text-text/30" />
          </li>
          <li>
            <Link
              href="/blog/"
              className="hover:text-accent-bright transition-colors"
            >
              Блог
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} className="text-text/30" />
          </li>
          {/* aria-current="page" — говорит скринридеру: это текущая страница */}
          <li aria-current="page" className="text-text truncate">
            {title}
          </li>
        </ol>
      </nav>

      {/* ── Шапка статьи ────────────────────────────────────── */}
      <header className="px-6 pb-10 max-w-3xl mx-auto">
        {/* custom={0} передаёт delay=0 в функцию-вариант reveal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0}
          className="flex items-center gap-3 text-xs font-heading uppercase tracking-widest text-accent-bright mb-4"
        >
          <span>{category}</span>
          <span
            className="w-1 h-1 bg-white/20 rounded-full"
            aria-hidden="true"
          />
          <span>{readTime}</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.1} // delay 0.1s — чуть позже категории
          className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-text mb-6 leading-tight text-balance"
        >
          {title}
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.2}
          className="flex items-center gap-4 text-sm text-text-muted"
        >
          {/* dateTime принимает ISO 8601, отображается dateDisplay */}
          <time dateTime={dateIso}>{dateDisplay}</time>
          <span
            className="w-1 h-1 bg-white/20 rounded-full"
            aria-hidden="true"
          />
          <span>{author}</span>
        </motion.div>
      </header>

      {image && (
        <div className="px-6 pb-8 max-w-3xl mx-auto">
          <Image
            src={image}
            alt={title}
            width={800}
            height={450}
            className="w-full rounded-sm border border-white/5"
          />
        </div>
      )}
      {/* ── Quick Answer ─────────────────────────────────────── */}
      <section className="px-6 pb-12 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.3}
          className="p-6 bg-surface border border-accent-bright/20 rounded-sm"
        >
          <div className="flex items-start gap-3">
            <Check
              size={20}
              className="text-accent-bright mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-text/90 leading-relaxed">{quickAnswer}</p>
          </div>
        </motion.div>
      </section>

      {/* ── Основной контент ─────────────────────────────────── */}
      <div className="px-6 pb-16 max-w-3xl mx-auto space-y-10">
        {sections.map((section, i) => (
          <motion.section
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            custom={0.1 * i} // нарастающая задержка для каждого раздела
          >
            <h2 className="text-xl md:text-2xl font-heading text-text mb-4 tracking-tight">
              {section.heading}
            </h2>
            <p className="text-text-muted leading-relaxed">{section.content}</p>
          </motion.section>
        ))}

        {/* ── Таблица бюджета ─────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.2}
          // overflow-hidden здесь на секции-обёртке, не на motion.div с height-анимацией
          // поэтому конфликта с Framer Motion нет
          className="overflow-hidden rounded-sm border border-white/5"
        >
          <table className="w-full text-sm">
            <caption className="sr-only">
              Сравнение бюджетов: базовый и премиум
            </caption>
            <thead className="bg-surface">
              <tr className="text-left font-heading text-xs uppercase tracking-wider text-accent-calm">
                <th className="px-4 py-3" scope="col">
                  Статья
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Базовый
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Премиум
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {budgetTable.map((row, i) => (
                <BudgetRow key={i} {...row} />
              ))}
            </tbody>
          </table>
        </motion.section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            custom={0}
            className="text-xl md:text-2xl font-heading text-text mb-6 tracking-tight"
          >
            Частые вопросы
          </motion.h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <FaqItem
                key={i}
                question={item.q}
                answer={item.a}
                delay={0.1 * i}
              />
            ))}
          </div>
        </section>

        {/* ── Итог ────────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          custom={0.2}
        >
          <h2 className="text-xl md:text-2xl font-heading text-text mb-4 tracking-tight">
            Итог
          </h2>
          <p className="text-text-muted leading-relaxed">{conclusion}</p>
        </motion.section>
        {/* ── Связанные материалы (внутренние ссылки) ──────────────────── */}
        {crosslinks && crosslinks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-sm font-heading text-text-muted mb-3">
              Связанные материалы:
            </p>
            <div className="flex flex-wrap gap-2">
              {crosslinks.map((link, i) => (
                <span key={link.href} className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    className="text-sm text-accent-bright hover:underline"
                  >
                    {link.label}
                  </Link>
                  {i < crosslinks.length - 1 && (
                    <span className="text-text-muted">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Назад в блог ────────────────────────────────────── */}
      <div className="px-6 pb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/blog/"
            className="inline-flex items-center gap-2 text-sm font-heading text-text-muted hover:text-accent-bright transition-colors duration-500 group"
          >
            <ChevronRight
              size={16}
              className="rotate-180 group-hover:-translate-x-0.5 transition-transform duration-500"
              aria-hidden="true"
            />
            Назад в блог
          </Link>
        </motion.div>
      </div>
    </article>
  );
}
