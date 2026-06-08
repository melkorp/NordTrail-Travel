// src/app/admin/destinations/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { Destination } from "@/lib/types";
import DestinationRow from "./DestinationRow";
import { Map, Plus, ArrowLeft } from "lucide-react";

async function getAllDestinations(): Promise<Destination[]> {
  const slugs = getSlugs("destinations");
  const destinations = slugs
    .map((slug) => getBySlug<Destination>("destinations", slug))
    .filter((d): d is Destination => d !== null);
  return destinations.sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export default async function AdminDestinationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const destinations = await getAllDestinations();

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Хлебные крошки */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 text-xs text-slate-500"
        >
          <Link
            href="/admin"
            className="transition-colors hover:text-cyan-400 flex items-center gap-1.5"
          >
            <ArrowLeft size={12} />
            Админка
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-blue-400">Направления</span>
        </motion.nav>

        {/* Шапка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-500">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">
                Направления
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              {destinations.length}{" "}
              {destinations.length === 1 ? "направление" : "направлений"} в базе
            </p>
          </div>

          <Link
            href="/admin/destinations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Plus size={16} />
            Новое направление
          </Link>
        </motion.div>

        {/* Таблица */}
        {destinations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm py-20 text-center"
          >
            <div className="mb-4 text-5xl text-slate-600">◎</div>
            <p className="font-heading text-lg font-bold text-slate-400">
              Направлений пока нет
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Добавьте первое направление в content/destinations/
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Название
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Сложность
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Бюджет
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Сезон
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Безопасность
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest, i) => (
                  <DestinationRow
                    key={dest.slug}
                    destination={dest}
                    index={i}
                  />
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Подвал */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-between text-xs text-slate-500"
        >
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
              content/destinations/
            </code>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
