// src/app/admin/articles/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { ArticleData } from "@/lib/types";
import ArticleRow from "./ArticleRow";
import { FileText, Plus, ArrowLeft } from "lucide-react";

async function getAllArticles(): Promise<ArticleData[]> {
  const slugs = getSlugs("blog");
  const articles = slugs
    .map((slug) => getBySlug<ArticleData>("blog", slug))
    .filter((a): a is ArticleData => a !== null);
  return articles.sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime(),
  );
}

export default async function AdminArticlesPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const articles = await getAllArticles();

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Хлебные крошки */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/admin"
            className="transition-colors hover:text-cyan-400 flex items-center gap-1.5"
          >
            <ArrowLeft size={12} />
            Админка
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-cyan-400">Статьи</span>
        </nav>

        {/* Шапка страницы */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">
                Статьи блога
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              {articles.length} {articles.length === 1 ? "статья" : "статей"} в
              базе
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            <Plus size={16} />
            Новая статья
          </Link>
        </div>

        {/* Подсказка по категориям */}
        <details className="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 text-sm">
          <summary className="cursor-pointer font-heading text-slate-400 hover:text-cyan-400 transition-colors">
            О категориях
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-500">
            <div>
              <span className="text-cyan-400 font-medium">Бюджет</span> — статьи
              о бюджетных путешествиях
            </div>
            <div>
              <span className="text-blue-400 font-medium">Хайкинг</span> — пешие
              походы и треккинг
            </div>
            <div>
              <span className="text-purple-400 font-medium">Люкс</span> —
              премиум-отдых и отели
            </div>
            <div>
              <span className="text-pink-400 font-medium">Зима</span> — зимние
              путешествия
            </div>
            <div>
              <span className="text-orange-400 font-medium">Соло</span> —
              одиночные путешествия
            </div>
            <div>
              <span className="text-green-400 font-medium">Семья</span> —
              семейные поездки
            </div>
          </div>
        </details>

        {/* Таблица статей */}
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm py-20 text-center">
            <div className="mb-4 text-5xl text-slate-600">◎</div>
            <p className="font-heading text-lg font-bold text-slate-400">
              Статей пока нет
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Добавьте первую статью в content/blog/
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Заголовок
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Категория
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Дата
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Время чтения
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, i) => (
                  <ArticleRow key={article.slug} article={article} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Подвал */}
        <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft size={12} />
            Назад в админку
          </Link>
          <p className="text-slate-600">
            Файлы хранятся в{" "}
            <code className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono text-slate-400">
              content/blog/
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
