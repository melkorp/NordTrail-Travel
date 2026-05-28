import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

interface UrlEntry {
  path: string;
  label: string;
}

interface BlogFrontmatter {
  title?: string;
}

interface DestinationFrontmatter {
  name?: string;
}

const STATIC_URLS: UrlEntry[] = [
  { path: "/", label: "Главная" },
  { path: "/blog/", label: "Блог" },
  { path: "/destinations/", label: "Направления" },
  { path: "/about/", label: "О нас" },
  { path: "/contact/", label: "Контакты" },
  { path: "/privacy-policy/", label: "Политика конфиденциальности" },
  { path: "/terms/", label: "Условия использования" },
  { path: "/cookies/", label: "Политика cookies" },
];

async function getMdxFiles(directory: string) {
  try {
    const dirPath = join(process.cwd(), directory);
    const files = await readdir(dirPath);
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => ({
        slug: file.replace(/\.mdx$/, ""),
        filePath: join(dirPath, file),
      }));
  } catch {
    return [];
  }
}

async function getBlogUrls(): Promise<UrlEntry[]> {
  const files = await getMdxFiles("content/blog");

  const urls = await Promise.all(
    files.map(async ({ slug, filePath }) => {
      const content = await readFile(filePath, "utf-8");
      const { data } = matter(content) as { data: BlogFrontmatter };
      return {
        path: `/blog/${slug}/`,
        label: `Статья: ${data.title || slug}`,
      };
    }),
  );

  return urls;
}

async function getDestinationUrls(): Promise<UrlEntry[]> {
  const files = await getMdxFiles("content/destinations");

  const urls: UrlEntry[] = [];

  for (const { slug, filePath } of files) {
    const content = await readFile(filePath, "utf-8");
    const { data } = matter(content) as { data: DestinationFrontmatter };
    const name = data.name || slug;

    urls.push({
      path: `/destinations/${slug}/`,
      label: `Направление: ${name}`,
    });

    for (const sub of ["best-time", "cost", "itinerary"]) {
      const subLabel =
        sub === "best-time"
          ? "Лучшее время"
          : sub === "cost"
            ? "Стоимость"
            : "Маршрут";
      urls.push({
        path: `/destinations/${slug}/${sub}/`,
        label: `${name}: ${subLabel}`,
      });
    }
  }

  return urls;
}

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
    return NextResponse.json(
      { error: "Ошибка при получении списка страниц" },
      { status: 500 },
    );
  }
}
