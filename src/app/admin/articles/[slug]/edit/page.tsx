// src/app/admin/articles/[slug]/edit/page.tsx
//
// Серверный компонент — загружает данные статьи и проверяет сессию.
// Саму форму рендерит клиентский ArticleEditForm.

import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { getBySlug } from "@/lib/mdx";
import type { ArticleData } from "@/lib/types";
import ArticleEditForm from "./ArticleEditForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Проверяем сессию — неавторизованных отправляем на /admin
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const { slug } = await params;

  // Читаем MDX-файл
  const article = getBySlug<ArticleData>("blog", slug);

  // Если файл не найден — 404
  if (!article) notFound();

  return <ArticleEditForm article={article} slug={slug} />;
}
