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
      <Link
        href="/admin/logout"
        className="text-accent-bright hover:underline text-sm"
      >
        Выйти
      </Link>
    </div>
  );
}
