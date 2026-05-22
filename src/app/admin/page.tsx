import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-heading">Панель управления NordTrail</h1>
      <p>Добро пожаловать, {session.user?.name || "Admin"}!</p>

      {/* Кнопка управления статьями */}
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 rounded-xl border border-accent-bright/30 bg-accent-bright/8 px-5 py-3 text-sm font-medium text-accent-bright transition-all hover:border-accent-bright/50 hover:bg-accent-bright/15 mt-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 13h12M1 1h12M1 1v12M13 1v12M5 1v12M9 1v12"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        Управление статьями
      </Link>

      <Link
        href="/admin/logout"
        className="text-accent-bright hover:underline text-sm mt-6"
      >
        Выйти
      </Link>
    </div>
  );
}
