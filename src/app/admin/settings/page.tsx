// src/app/admin/settings/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import SettingsForm from "./SettingsForm";
import { getSettings } from "@/lib/settings";
import { Settings, ArrowLeft } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const settings = getSettings();

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
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
          <span className="text-pink-400">Настройки</span>
        </motion.nav>

        {/* Шапка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-linear-to-br from-pink-500 to-orange-500">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Настройки сайта
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Изменения сохраняются в{" "}
            <code className="rounded bg-slate-800/50 px-1.5 py-0.5 font-mono text-pink-400">
              content/settings.json
            </code>{" "}
            через коммит в GitHub
          </p>
        </motion.div>

        {/* Форма */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SettingsForm settings={settings} />
        </motion.div>
      </div>
    </main>
  );
}
