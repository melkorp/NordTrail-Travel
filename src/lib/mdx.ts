// src/lib/mdx.ts
//
// Читает MDX-файлы из content/ при сборке через fs.
// Работает ТОЛЬКО на сервере — в серверных компонентах Next.js.
// На клиенте fs недоступен, поэтому данные передаются как пропсы.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Корень проекта — одинаков и локально, и в GitHub Actions
const CONTENT_ROOT = path.join(process.cwd(), "content");

// ─────────────────────────────────────────────────────────────
// Получить все slugs из папки (для generateStaticParams)
// ─────────────────────────────────────────────────────────────
export function getSlugs(collection: "blog" | "destinations"): string[] {
  const dir = path.join(CONTENT_ROOT, collection);
  // Читаем все .mdx файлы и убираем расширение
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}

// ─────────────────────────────────────────────────────────────
// Получить данные одного файла по slug
// Возвращает frontmatter — всё что между ---
// ─────────────────────────────────────────────────────────────
export function getBySlug<T>(
  collection: "blog" | "destinations",
  slug: string,
): T | null {
  const filePath = path.join(CONTENT_ROOT, collection, `${slug}.mdx`);

  // Если файл не найден — возвращаем null (страница покажет 404)
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  // gray-matter разбирает файл на data (frontmatter) и content (markdown)
  // Нам нужен только data — весь контент у нас в структурированных полях
  const { data } = matter(raw);

  return data as T;
}

// ─────────────────────────────────────────────────────────────
// Получить все записи коллекции (для страниц-списков)
// ─────────────────────────────────────────────────────────────
export function getAll<T>(collection: "blog" | "destinations"): T[] {
  const slugs = getSlugs(collection);
  return slugs
    .map((slug) => getBySlug<T>(collection, slug))
    .filter(Boolean) as T[];
}
