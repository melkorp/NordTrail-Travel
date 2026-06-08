// src/app/blog/page.tsx
import { getAll } from "@/lib/mdx";
import type { ArticleData } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";

const categories = [
  { name: "Hiking", slug: "hiking" },
  { name: "Luxury", slug: "luxury" },
  { name: "Winter", slug: "winter" },
  { name: "Family", slug: "family" },
  { name: "Budget", slug: "budget" },
  { name: "Solo Travel", slug: "solo-travel" },
];

export default async function BlogPage() {
  const allArticles = getAll<ArticleData>("blog");

  const sortedArticles = allArticles.toSorted(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime(),
  );

  const featuredArticle = sortedArticles[0];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: sortedArticles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://nord-trail-travel.vercel.app/blog/${article.slug}/`,
      name: article.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "Блог" },
          ]),
        }}
      />

      <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
        <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto text-center border-b border-white/5">
          <h1 className="text-4xl md:text-6xl font-heading font-semibold text-text mb-4 tracking-tight">
            Журнал северных путешествий
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto mb-8">
            Отчёты, гиды и инсайды от нашей команды исследователей
          </p>
          <Link
            href="/destinations/"
            className="inline-block px-8 py-3 font-heading text-xs tracking-widest uppercase border border-accent-bright text-accent-bright hover:bg-accent-bright hover:text-bg transition-all duration-500 rounded-sm"
          >
            Смотреть направления
          </Link>
        </section>

        {featuredArticle && (
          <section className="py-16 px-6 max-w-5xl mx-auto">
            <Link
              href={`/blog/${featuredArticle.slug}/`}
              className="group relative block glass-card-light rounded-2xl overflow-hidden"
            >
              <article className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-xs font-heading uppercase tracking-widest text-cyan-400 mb-4 bg-cyan-500/10 border border-cyan-400/30 rounded-full px-3 py-1 inline-block">
                    <span>{featuredArticle.category}</span>
                    <span
                      className="w-1 h-1 bg-cyan-400 rounded-full"
                      aria-hidden="true"
                    />
                    <span>{featuredArticle.readTime || "5 min read"}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading text-text mb-4 group-hover:text-cyan-400 transition-colors duration-500 text-glow">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {featuredArticle.quickAnswer}
                  </p>
                  <span className="text-sm font-heading text-cyan-400 group-hover:text-cyan-300 transition-colors duration-500 underline decoration-cyan-400/30 underline-offset-4">
                    Читать статью
                  </span>
                </div>
                {featuredArticle.image && (
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    width={400}
                    height={300}
                    className="w-full md:w-1/3 aspect-4/3 rounded-xl border border-white/20 object-cover group-hover:border-cyan-400/50 transition-colors duration-500"
                  />
                )}
              </article>

              {/* Декоративное свечение */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </section>
        )}

        <section className="py-12 px-6 max-w-5xl mx-auto border-y border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}/`}
                className="block text-center py-3 px-2 border border-white/5 hover:border-accent-bright/30 hover:bg-accent-bright/5 transition-all duration-300 rounded-sm text-sm font-heading text-text-muted hover:text-accent-bright"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}/`}
                className="group block glass-card-light rounded-2xl p-6 h-full"
              >
                <article className="flex flex-col h-full">
                  <div className="mb-4 text-xs font-heading uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 rounded-full px-3 py-1 inline-block w-fit">
                    {article.category}
                  </div>
                  <h3 className="text-xl font-heading text-text mb-3 leading-snug group-hover:text-cyan-400 transition-colors duration-500 text-glow">
                    {article.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-text-secondary font-heading">
                    <span>{article.readTime || "5 min read"}</span>
                    <span
                      className="group-hover:text-cyan-400 transition-colors duration-500"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 bg-linear-to-b from-bg to-surface">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading text-text mb-4">
              Получайте новые северные маршруты
            </h2>
            <p className="text-text-muted mb-8">
              Только избранный контент. Никакого спама.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Ваш email"
                autoComplete="email"
                className="px-4 py-3 bg-bg border border-white/10 text-text font-body focus:border-accent-bright focus:outline-none rounded-sm w-full sm:w-auto min-w-60"
              />
              <button
                type="button"
                className="px-8 py-3 bg-accent-bright text-bg font-heading text-sm tracking-widest uppercase font-medium hover:-translate-y-px transition-all duration-500 rounded-sm"
              >
                Подписаться
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
