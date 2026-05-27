// src/lib/breadcrumbs.ts
//
// Утилита для генерации JSON-LD BreadcrumbList.
// Используй buildBreadcrumbsJsonLd везде где нужна schema.

const BASE_URL = "https://nordtrail.travel";

export interface BreadcrumbItem {
  name: string;
  url?: string; // если не передан — последний элемент без ссылки
}

// Принимает массив элементов, возвращает готовую строку JSON-LD
export function buildBreadcrumbsJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: `${BASE_URL}${item.url}` } : {}),
    })),
  });
}
