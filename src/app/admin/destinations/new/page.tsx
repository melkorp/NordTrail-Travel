// src/app/admin/destinations/new/page.tsx
//
// Серверный компонент — проверяет сессию,
// рендерит форму создания нового направления.

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DestinationCreateForm from "./DestinationCreateForm";

export default async function NewDestinationPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  return <DestinationCreateForm />;
}
