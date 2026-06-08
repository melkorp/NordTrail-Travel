// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Map,
  Image,
  Settings,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";

// Анимация появления
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Конфигурация разделов админки с градиентами
const adminSections = [
  {
    title: "Статьи",
    description: "Управление публикациями, черновиками и рубрикатором блога",
    href: "/admin/articles",
    icon: FileText,
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.4)",
    count: "12",
  },
  {
    title: "Направления",
    description: "Редактирование маршрутов, локаций и сезонных гидов",
    href: "/admin/destinations",
    icon: Map,
    gradient: "from-blue-500 to-purple-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
    count: "9",
  },
  {
    title: "Медиафайлы",
    description: "Библиотека изображений, оптимизация и управление обложками",
    href: "/admin/media",
    icon: Image,
    gradient: "from-purple-500 to-pink-500",
    glowColor: "rgba(139, 92, 246, 0.4)",
    count: "48",
  },
  {
    title: "Настройки",
    description: "Редактирование названия, описания, цветовой схемы и пароля",
    href: "/admin/settings",
    icon: Settings,
    gradient: "from-pink-500 to-orange-500",
    glowColor: "rgba(236, 72, 153, 0.4)",
    count: "⚙️",
  },
];

export default function AdminPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "Админ-панель", url: "/admin" },
          ]),
        }}
      />
      <main className="min-h-screen bg-slate-900 text-slate-100 font-body antialiased selection:bg-blue-500 selection:text-white p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок панели с анимацией */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 pb-6 border-b border-slate-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-linear-to-br from-cyan-500 to-purple-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-heading uppercase tracking-widest text-cyan-400">
                Панель управления
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight mb-2">
              Добро пожаловать,{" "}
              <span className="bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Администратор
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-heading tracking-wide">
              NordTrail Travel • Административный модуль v1.0.0
            </p>
          </motion.header>

          {/* Быстрая статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {[
              { label: "Статей", value: "12", color: "text-cyan-400" },
              { label: "Направлений", value: "9", color: "text-blue-400" },
              { label: "Медиа", value: "48", color: "text-purple-400" },
              { label: "Просмотров", value: "2.4k", color: "text-pink-400" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 text-center hover:border-slate-600 transition-colors"
              >
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Сетка карточек с анимацией */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminSections.map((section) => (
              <motion.div key={section.href} variants={itemVariants}>
                <Link
                  href={section.href}
                  className="group relative flex h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-500 rounded-2xl p-6 flex-col overflow-hidden"
                  style={{
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2)`,
                  }}
                >
                  {/* Градиентный оверлей при наведении */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Декоративное свечение */}
                  <div
                    className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{ backgroundColor: section.glowColor }}
                  />

                  {/* Иконка с градиентом */}
                  <div className="relative z-10 mb-5">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${section.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <section.icon size={26} className="text-white" />
                    </div>
                  </div>

                  {/* Заголовок и описание */}
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-heading font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300 tracking-tight">
                        {section.title}
                      </h2>
                      <span className="text-xs font-heading text-slate-500 bg-slate-700/50 px-2 py-1 rounded-full">
                        {section.count}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  {/* Индикатор перехода */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs font-heading uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors duration-300">
                      Открыть раздел
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-linear-to-br group-hover:from-cyan-500 group-hover:to-purple-500 transition-all duration-300">
                      <ArrowUpRight
                        size={14}
                        className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Футер */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 pt-6 border-t border-slate-700/50 text-xs font-heading text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Система активна • Версия 1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                ← Вернуться на сайт
              </Link>
              <Link
                href="/admin/help"
                className="hover:text-cyan-400 transition-colors"
              >
                Помощь
              </Link>
              <Link
                href="/admin/logout"
                className="hover:text-red-400 transition-colors"
              >
                Выход
              </Link>
            </div>
          </motion.footer>
        </div>
      </main>
    </>
  );
}
