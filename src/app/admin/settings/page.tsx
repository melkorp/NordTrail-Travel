// src/app/admin/settings/page.tsx
//
// Серверный компонент — читает content/settings.json,
// проверяет сессию, передаёт данные в клиентскую форму.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import SettingsForm from "./SettingsForm";

// ─────────────────────────────────────────────────────────────
// ТИП НАСТРОЕК
// Экспортируется — SettingsForm импортирует отсюда
// ─────────────────────────────────────────────────────────────
export interface SiteSettings {
  site: {
    title: string;
    description: string;
  };
  footer: {
    text: string;
  };
  theme: {
    accentColor: string;
  };
  admin: {
    password: string;
  };
}

// Значения по умолчанию — если settings.json не найден
const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    title: "NordTrail Travel",
    description: "Северные маршруты и экспедиции",
  },
  footer: {
    text: "© 2026 NordTrail Travel. Все права защищены.",
  },
  theme: {
    accentColor: "#D4AF37",
  },
  admin: {
    password: "",
  },
};

// ─────────────────────────────────────────────────────────────
// Чтение settings.json из content/
// ─────────────────────────────────────────────────────────────
async function getSettings(): Promise<SiteSettings> {
  const filePath = path.join(process.cwd(), "content", "settings.json");

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    // Мёрджим с дефолтами — защита от неполного JSON
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Файл не найден или невалидный JSON — возвращаем дефолты
    return DEFAULT_SETTINGS;
  }
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function AdminSettingsPage() {
  // Проверяем сессию — редиректим на /admin/login (не /admin)
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* ── Хлебные крошки ──────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Настройки</span>
        </nav>

        {/* ── Шапка ───────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-text">
            Настройки сайта
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Изменения сохраняются в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-accent-bright">
              content/settings.json
            </code>{" "}
            через коммит в GitHub
          </p>
        </div>

        {/* Клиентская форма с текущими настройками */}
        <SettingsForm settings={settings} />
      </div>
    </main>
  );
}
