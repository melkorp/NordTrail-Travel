// src/app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Базовая анимация: медленное появление, мягкое торможение
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
      {/* 1. Заголовок и миссия */}
      <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto text-center">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-text mb-6 tracking-tight text-balance"
        >
          NordTrail Travel — Премиум-путешествия на край северного мира
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-20 h-px bg-accent-bright mx-auto mb-10"
        />

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Мы превращаем путешествие в тщательно продуманную северную
          экспедицию...
        </motion.p>
      </section>

      {/* 2. Три причины (фон surface) */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={reveal}
            className="text-2xl md:text-3xl font-heading text-accent-bright mb-14 tracking-wide uppercase text-center"
          >
            Почему выбирают нас
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                title: "Экспертиза",
                desc: "Глубокое знание маршрутов, логистики и местных традиций. Мы работаем только там, где побывали сами.",
              },
              {
                title: "Эксклюзивность",
                desc: "Маршруты вне массового туризма. Закрытые локации, частные лоджи и доступ к нетронутым пейзажам.",
              },
              {
                title: "Персонализация",
                desc: "Каждая экспедиция собирается под вас: от темпа движения до гастрономических предпочтений.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={reveal}
                transition={{ delay: i * 0.15 }}
                className="group p-6 border border-white/5 hover:border-accent-bright/30 rounded-sm transition-all duration-500"
              >
                <h3 className="text-xl font-heading text-text mb-3 tracking-tight group-hover:text-accent-bright transition-colors duration-500">
                  {item.title}
                </h3>
                <p className="text-text-muted leading-relaxed text-sm md:text-base">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Команда (фон bg) */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
          >
            <h2 className="text-2xl md:text-3xl font-heading text-text mb-4 tracking-tight">
              Команда
            </h2>
            <div className="w-12 h-px bg-accent-calm mb-6" />
            <p className="text-text-muted leading-relaxed">
              Небольшая команда исследователей и travel-аналитиков. Мы не
              продаём туры — мы проектируем впечатления, опираясь на личные
              отчёты, метеоданные и десятилетия опыта в Арктике.
            </p>
          </motion.div>

          {/* Плейсхолдер для фото: сохраняет сетку до вставки реального изображения */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.2,
            }}
            className="h-64 md:h-80 bg-surface rounded-sm flex items-center justify-center border border-white/5"
          >
            <span className="text-text/20 font-heading text-xs tracking-widest uppercase">
              Фото команды
            </span>
          </motion.div>
        </div>
      </section>

      {/* 4. CTA (фон surface с плавным переходом) */}
      <section className="py-24 px-6 bg-linear-to-b from-surface to-bg">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            className="text-3xl md:text-4xl font-heading text-text mb-6 tracking-tight"
          >
            Готовы начать маршрут?
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={{ delay: 0.1 }}
            className="text-text-muted mb-10 max-w-xl mx-auto"
          >
            Оставьте заявку, и мы составим предварительную программу вашей
            северной экспедиции в течение 48 часов.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/contact"
              className="inline-block px-10 py-4 font-heading text-sm tracking-widest uppercase font-medium text-bg bg-accent-bright rounded-sm transition-all duration-500 hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(212,175,55,0.25)]"
            >
              Свяжитесь с нами
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
