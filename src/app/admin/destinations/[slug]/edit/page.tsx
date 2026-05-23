// src/app/admin/destinations/[slug]/edit/page.tsx
//
// Серверный компонент — загружает данные направления,
// проверяет сессию, передаёт данные в клиентскую форму.

import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { getBySlug } from "@/lib/mdx";
import type { Destination } from "@/lib/types";
import DestinationEditForm from "./DestinationEditForm";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Проверяем сессию
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const { slug } = await params;

  // Читаем MDX-файл направления
  const destination = getBySlug<Destination>("destinations", slug);

  // Если файл не найден — 404
  if (!destination) notFound();

  return <DestinationEditForm destination={destination} slug={slug} />;
}
