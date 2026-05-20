// src/app/blog/[slug]/page.tsx
// Данные теперь читаются из content/blog/*.mdx через fs.
// ARTICLES массив удалён — источник правды теперь MDX-файлы.

import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { ArticleData } from "@/lib/types";

// Реэкспортируем тип — BlogPostClient импортирует его отсюда
export type { ArticleData };

// ─────────────────────────────────────────────────────────────
// generateStaticParams
// Читает все .mdx файлы из content/blog/ и возвращает slugs
// ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getSlugs("blog").map((slug) => ({ slug }));
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
  const article = getBySlug<ArticleData>("blog", slug);

  if (!article) return { title: "Статья не найдена | NordTrail Travel" };

  return {
    title: `${article.title} | NordTrail Travel`,
    description: article.quickAnswer,
    alternates: {
      canonical: `https://melkorp.github.io/NordTrail-Travel/blog/${slug}/`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBySlug<ArticleData>("blog", slug);

  if (!article) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text text-xl">Статья не найдена</p>
      </main>
    );
  }

  return <BlogPostClient article={article} />;
}
