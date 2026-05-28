import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const STATIC_URLS = [
  { path: "/", label: "Главная" },
  { path: "/blog/", label: "Блог" },
  { path: "/destinations/", label: "Направления" },
  { path: "/about/", label: "О нас" },
  { path: "/contact/", label: "Контакты" },
  { path: "/privacy-policy/", label: "Политика конфиденциальности" },
  { path: "/terms/", label: "Условия использования" },
  { path: "/cookies/", label: "Политика cookies" },
];

export async function GET() {
  try {
    const [blogUrls, destinationUrls] = await Promise.all([
      getBlogUrls(),
      getDestinationUrls(),
    ]);

    return NextResponse.json({
      urls: [...STATIC_URLS, ...blogUrls, ...destinationUrls],
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json({ urls: STATIC_URLS });
  }
}

async function getBlogUrls() {
  try {
    const dir = join(process.cwd(), "content", "blog");
    const files = await readdir(dir);
    const urls: { path: string; label: string }[] = [];

    for (const file of files) {
      if (!file.endsWith(".mdx")) continue;
      const content = await readFile(join(dir, file), "utf-8");
      const { data } = matter(content);
      const slug = file.replace(/\.mdx$/, "");
      urls.push({
        path: `/blog/${slug}/`,
        label: `Статья: ${data.title || slug}`,
      });
    }

    return urls;
  } catch {
    return [];
  }
}

async function getDestinationUrls() {
  try {
    const dir = join(process.cwd(), "content", "destinations");
    const files = await readdir(dir);
    const urls: { path: string; label: string }[] = [];

    for (const file of files) {
      if (!file.endsWith(".mdx")) continue;
      const content = await readFile(join(dir, file), "utf-8");
      const { data } = matter(content);
      const slug = file.replace(/\.mdx$/, "");
      const name = data.name || slug;

      urls.push({
        path: `/destinations/${slug}/`,
        label: `Направление: ${name}`,
      });

      for (const sub of ["best-time", "cost", "itinerary"]) {
        const label =
          sub === "best-time"
            ? "Лучшее время"
            : sub === "cost"
              ? "Стоимость"
              : "Маршрут";
        urls.push({
          path: `/destinations/${slug}/${sub}/`,
          label: `${name}: ${label}`,
        });
      }
    }

    return urls;
  } catch {
    return [];
  }
}
