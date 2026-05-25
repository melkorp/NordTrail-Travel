// src/app/admin/articles/new/page.tsx
//
// Серверный компонент — проверяет сессию,
// рендерит форму создания новой статьи.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ArticleCreateForm from "./ArticleCreateForm";

export default async function NewArticlePage() {
  // Проверяем сессию
  const session = await getServerSession();
  if (!session) redirect("/admin");

  return <ArticleCreateForm />;
}
