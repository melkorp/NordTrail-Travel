// src/app/admin/destinations/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { Destination } from "@/lib/types";
import DestinationRow from "./DestinationRow";

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
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/admin" className="transition-colors hover:text-primary">
            Админка
          </Link>
          <span>/</span>
          <span className="text-text/70">Направления</span>
        </nav>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text">
              Направления
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {destinations.length}{" "}
              {destinations.length === 1 ? "направление" : "направлений"} в базе
            </p>
          </div>

          <Link
            href="/admin/destinations/new"
            className="inline-flex items-center gap-2 rounded-xl border border-accent-bright/30 bg-accent-bright/8 px-4 py-2.5 text-sm font-medium text-accent-bright transition-all hover:border-accent-bright/50 hover:bg-accent-bright/15"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Новое направление
          </Link>
        </div>

        {destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-text/8 bg-surface/30 py-20 text-center">
            <div className="mb-4 text-4xl text-text-muted">◎</div>
            <p className="font-heading text-lg font-bold text-text-muted">
              Направлений пока нет
            </p>
            <p className="mt-2 text-sm text-text-muted/75">
              Добавьте первое направление в content/destinations/
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-text/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-text/8 bg-surface/50">
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Название
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Сложность
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Бюджет
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Сезон
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Безопасность
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
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
          </div>
        )}

        <div className="mt-8 flex items-center justify-between text-xs text-text-muted">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M10 6H2M5 9L2 6l3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад в админку
          </Link>
          <p className="text-text-muted/60">
            Файлы хранятся в{" "}
            <code className="rounded bg-surface/50 px-1.5 py-0.5 font-mono text-text-muted">
              content/destinations/
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
