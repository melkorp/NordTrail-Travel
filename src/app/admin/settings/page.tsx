// src/app/admin/settings/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "./SettingsForm";
import { getSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const settings = getSettings();

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Настройки</span>
        </nav>

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

        <SettingsForm settings={settings} />
      </div>
    </main>
  );
}
