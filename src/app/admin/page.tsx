// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { FileText, Map, Image, Settings, ArrowUpRight } from "lucide-react";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";

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
  {
    title: "Настройки",
    description: "Редактирование названия, описания, цветовой схемы и пароля",
    href: "/admin/settings",
    icon: Settings,
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
          {/* Заголовок панели */}
          <header className="mb-10 pb-6 border-b border-slate-700">
            <h1 className="text-3xl md:text-4xl font-heading font-semibold text-white tracking-tight">
              Панель управления
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-heading tracking-wide">
              NordTrail Travel • Административный модуль
            </p>
          </header>

          {/* Сетка карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group relative flex h-full bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 rounded-lg p-6 flex-col shadow-lg"
              >
                {/* Иконка */}
                <div className="mb-5 p-3 w-fit rounded-lg bg-slate-700 border border-slate-600 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
                  <section.icon
                    size={22}
                    className="text-slate-400 group-hover:text-blue-400 transition-colors duration-300"
                  />
                </div>

                {/* Заголовок и описание */}
                <h2 className="text-xl font-heading font-medium text-white mb-2 group-hover:text-blue-400 transition-colors duration-300 tracking-tight">
                  {section.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-auto">
                  {section.description}
                </p>

                {/* Индикатор перехода */}
                <div className="mt-6 flex items-center gap-2 text-xs font-heading uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors duration-300">
                  <span>Открыть раздел</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>

          <footer className="mt-16 pt-6 border-t border-slate-700 text-xs font-heading text-slate-500 flex justify-between items-center">
            <p>
              Система обновлена • Версия 1.0.0 •{" "}
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Вернуться на сайт
              </Link>
            </p>
            <Link
              href="/admin/help"
              className="hover:text-blue-400 transition-colors"
            >
              Помощь
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
}
