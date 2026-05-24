// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { FileText, Map, Image, ArrowUpRight } from "lucide-react";

// Конфигурация разделов админки
const adminSections = [
  {
    title: "Статьи",
    description: "Управление публикациями, черновиками и рубрикатором блога",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Направления",
    description: "Редактирование маршрутов, локаций и сезонных гидов",
    href: "/admin/destinations",
    icon: Map,
  },
  {
    title: "Медиафайлы",
    description: "Библиотека изображений, оптимизация и управление обложками",
    href: "/admin/media",
    icon: Image,
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-bg to-surface/30 text-text font-body antialiased selection:bg-accent-bright selection:text-bg p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок панели */}
        <header className="mb-10 pb-6 border-b border-white/5">
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-text tracking-tight">
            Панель управления
          </h1>
          <p className="text-text-muted mt-2 text-sm font-heading tracking-wide">
            NordTrail Travel • Административный модуль
          </p>
        </header>

        {/* Сетка карточек: адаптивная, с единой высотой */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              // Делаем всю карточку кликабельной, задаём одинаковую высоту и плавные переходы
              className="group relative flex h-full bg-surface border border-white/5 hover:border-accent-bright/40 hover:-translate-y-px transition-all duration-500 rounded-sm p-6 flex-col"
            >
              {/* Иконка в отдельной подложке */}
              <div className="mb-5 p-3 w-fit rounded-sm bg-bg/60 border border-white/5 group-hover:border-accent-bright/20 group-hover:bg-accent-bright/5 transition-all duration-500">
                <section.icon
                  size={22}
                  className="text-text-muted group-hover:text-accent-bright transition-colors duration-500"
                />
              </div>

              {/* Заголовок и описание */}
              <h2 className="text-xl font-heading font-medium text-text mb-2 group-hover:text-accent-bright transition-colors duration-500 tracking-tight">
                {section.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-auto">
                {section.description}
              </p>

              {/* Индикатор перехода */}
              <div className="mt-6 flex items-center gap-2 text-xs font-heading uppercase tracking-widest text-text/40 group-hover:text-accent-bright transition-colors duration-500">
                <span>Открыть раздел</span>
                <ArrowUpRight
                  size={14}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500"
                />
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-16 pt-6 border-t border-white/5 text-xs font-heading text-text-muted/60 flex justify-between items-center">
          <p>
            Система обновлена • Версия 1.0.0 •{" "}
            <Link
              href="/"
              className="hover:text-accent-bright transition-colors"
            >
              Вернуться на сайт
            </Link>
          </p>
          <Link
            href="/admin/help"
            className="hover:text-accent-bright transition-colors"
          >
            Помощь
          </Link>
        </footer>
      </div>
    </main>
  );
}
