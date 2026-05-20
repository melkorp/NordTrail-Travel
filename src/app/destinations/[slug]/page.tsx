// src/app/destinations/[slug]/page.tsx
// Данные теперь читаются из content/destinations/*.mdx через fs.

import type { Metadata } from "next";
import type { Destination } from "@/lib/types";
import Link from "next/link";
import { getSlugs, getBySlug } from "@/lib/mdx";

// ─────────────────────────────────────────────────────────────
// generateStaticParams
// ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getSlugs("destinations").map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getBySlug<Destination>("destinations", slug);

  if (!dest) return { title: "Направление не найдено" };

  return {
    title: dest.h1,
    description: dest.quickAnswer.slice(0, 160),
    openGraph: {
      title: dest.h1,
      description: dest.quickAnswer.slice(0, 160),
      type: "article",
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Schema.org
// ─────────────────────────────────────────────────────────────
function DestinationSchema({ dest }: { dest: Destination }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    description: dest.quickAnswer,
    touristType: ["Adventure", "Nature", "Luxury"],
    mainEntity: dest.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Хлебные крошки
// ─────────────────────────────────────────────────────────────
function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-8">
      <ol className="flex text-sm text-text/50 font-body">
        <li>
          <Link href="/" className="hover:text-accent-bright transition-colors">
            Главная
          </Link>
          <span className="mx-2">/</span>
        </li>
        <li>
          <Link
            href="/destinations/"
            className="hover:text-accent-bright transition-colors"
          >
            Направления
          </Link>
          <span className="mx-2">/</span>
        </li>
        <li className="text-text/80">{name}</li>
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// Таблица параметров
// ─────────────────────────────────────────────────────────────
function ComparisonTable({ dest }: { dest: Destination }) {
  const rows = [
    { label: "Лучший сезон", value: dest.bestSeason },
    { label: "Средний бюджет", value: dest.budget },
    { label: "Сложность", value: dest.difficulty },
    { label: "Для детей", value: dest.forKids ? "Да" : "Нет" },
    { label: "Безопасность", value: "★".repeat(dest.safety) },
  ];

  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-text/10">
            <th className="py-3 pr-4 text-sm uppercase tracking-wider text-text/50 font-heading">
              Параметр
            </th>
            <th className="py-3 text-sm text-text font-heading">Значение</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-text/5">
              <td className="py-3 pr-4 text-text/70">{row.label}</td>
              <td className="py-3 text-text">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getBySlug<Destination>("destinations", slug);

  if (!dest) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <h1 className="text-2xl text-text font-heading">
          Направление не найдено
        </h1>
      </main>
    );
  }

  return (
    <>
      <DestinationSchema dest={dest} />
      <main className="min-h-screen bg-bg text-text">
        <article className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Breadcrumbs name={dest.name} />

          <h1 className="text-4xl sm:text-5xl font-heading mb-6 text-balance">
            {dest.h1}
          </h1>

          <aside className="bg-accent-bright/5 border border-accent-bright/10 rounded-lg p-5 mb-10">
            <p className="text-text/80 leading-relaxed">{dest.quickAnswer}</p>
          </aside>

          <section aria-labelledby="comparison-heading">
            <h2 id="comparison-heading" className="text-2xl font-heading mb-4">
              Быстрое сравнение
            </h2>
            <ComparisonTable dest={dest} />
          </section>

          {dest.sections.map((section, i) => (
            <section key={i} className="mt-12">
              <h2 className="text-2xl font-heading mb-4">{section.title}</h2>
              <p className="text-text/80 leading-relaxed">{section.content}</p>
            </section>
          ))}

          <section className="mt-16">
            <h2 className="text-2xl font-heading mb-6">
              Часто задаваемые вопросы
            </h2>
            <dl className="space-y-6">
              {dest.faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-heading text-lg mb-2 text-text">
                    {item.question}
                  </dt>
                  <dd className="text-text/70 leading-relaxed">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 border-t border-text/10 pt-8">
            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href={`/destinations/${dest.slug}/best-time/`}
                className="text-accent-bright hover:underline text-sm font-heading"
              >
                Лучшее время для посещения →
              </Link>
              <Link
                href={`/destinations/${dest.slug}/cost/`}
                className="text-accent-bright hover:underline text-sm font-heading"
              >
                Стоимость путешествия →
              </Link>
              <Link
                href={`/destinations/${dest.slug}/itinerary/`}
                className="text-accent-bright hover:underline text-sm font-heading"
              >
                Готовый маршрут →
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
