// src/app/about/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";
import { Compass, Map, Calendar } from "lucide-react";

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "О нас" },
          ]),
        }}
      />
      <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
        <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-text mb-6 tracking-tight text-balance"
          >
            <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NordTrail Travel
            </span>
            <br />
            <span className="text-text">Планирование путешествий на север</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-20 h-px bg-linear-to-r from-cyan-400 to-purple-400 mx-auto mb-10"
          />
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            NordTrail Travel — информационный ресурс о северных и горных
            путешествиях. Мы собираем и структурируем данные о направлениях,
            сезонах, бюджетах и маршрутах, чтобы помочь путешественникам
            самостоятельно планировать поездки.
          </motion.p>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={reveal}
              className="text-2xl md:text-3xl font-heading bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-14 tracking-wide uppercase text-center"
            >
              Почему выбирают нас
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  icon: Compass,
                  title: "Экспертиза",
                  desc: "Практические маршруты, сезонные рекомендации и структурированная информация для самостоятельного планирования путешествий по северным направлениям.",
                  gradient: "from-cyan-500 to-blue-500",
                },
                {
                  icon: Map,
                  title: "Актуальные направления",
                  desc: "Подборка маршрутов, локаций и travel-идей с фокусом на Исландию, Скандинавию, Японию и северные регионы России.",
                  gradient: "from-blue-500 to-purple-500",
                },
                {
                  icon: Calendar,
                  title: "Удобное планирование",
                  desc: "Сайт помогает быстро сравнить сезоны, бюджеты, маршруты и форматы поездок — от коротких путешествий до экспедиционных направлений.",
                  gradient: "from-purple-500 to-pink-500",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={reveal}
                  className="group glass-card-light rounded-2xl p-8 transition-all duration-500"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${item.gradient} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-heading text-text mb-3 tracking-tight group-hover:text-cyan-400 transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

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
              <div className="w-12 h-px bg-linear-to-r from-cyan-400 to-purple-400 mb-6" />
              <p className="text-text-secondary leading-relaxed">
                Мы собираем и структурируем информацию о направлениях, сезонах и
                бюджетах, чтобы путешественники могли самостоятельно планировать
                поездки по северным регионам.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                delay: 0.2,
              }}
              className="h-64 md:h-80 rounded-2xl overflow-hidden glass-card-light"
            >
              <Image
                src="/images/optimized/about-team-1600.webp"
                alt="Рабочее пространство NordTrail"
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center glass-card-light rounded-3xl p-12 md:p-16">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              className="text-3xl md:text-4xl font-heading text-text mb-6 tracking-tight"
            >
              Изучите направления, сравните сезоны и бюджеты.
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              transition={{ delay: 0.1 }}
              className="text-text-secondary mb-10 max-w-xl mx-auto"
            >
              Вся информация для планирования уже собрана — выбирайте
              направление и начинайте.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/destinations"
                className="inline-block px-10 py-4 font-heading text-sm tracking-widest uppercase font-medium text-white bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl transition-all duration-500 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(6,182,212,0.4)]"
              >
                Смотреть направления
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
