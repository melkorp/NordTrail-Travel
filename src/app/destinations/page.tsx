// src/app/destinations/page.tsx
//
// Серверный компонент — загружает направления из content/destinations/*.mdx.
// Клиентские анимации вынесены в отдельный компонент DestinationsClient.

import { getAll } from "@/lib/mdx";
import type { Destination } from "@/lib/types";
import DestinationsClient from "./DestinationsClient";

export default function DestinationsPage() {
  // Читаем все MDX-файлы при рендере на сервере
  const destinations = getAll<Destination>("destinations");

  // Сортируем по имени для предсказуемого порядка
  const sorted = destinations.toSorted((a, b) =>
    a.name.localeCompare(b.name, "ru"),
  );

  return <DestinationsClient destinations={sorted} />;
}
