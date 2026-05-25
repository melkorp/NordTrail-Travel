import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewArticlePage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="hover:text-accent-bright">
            Админка
          </Link>
          <span>/</span>
          <Link href="/admin/articles" className="hover:text-accent-bright">
            Статьи
          </Link>
          <span>/</span>
          <span className="text-text/70">Новая статья</span>
        </nav>
        <h1 className="text-2xl font-heading font-bold mb-4">Новая статья</h1>
        <p className="text-text-muted">
          Форма создания статьи будет доступна в ближайшее время.
        </p>
      </div>
    </main>
  );
}
