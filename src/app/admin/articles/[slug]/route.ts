// src/app/api/admin/articles/[slug]/route.ts
//
// API route для сохранения статьи через GitHub API.
// Vercel read-only filesystem — fs.writeFile не работает в продакшене.
// Решение: коммитим файл напрямую в GitHub репозиторий через REST API.
// GitHub Actions пересобирает сайт автоматически после коммита.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import type { ArticleData } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Конфиг из env — добавь в Vercel Dashboard → Settings → Env
// GITHUB_TOKEN      — Personal Access Token с правом repo
// GITHUB_REPO_OWNER — логин владельца: "melkorp"
// GITHUB_REPO_NAME  — имя репозитория: "NordTrail-Travel"
// GITHUB_BRANCH     — ветка: "main"
// ─────────────────────────────────────────────────────────────
const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";

// Базовый URL GitHub Contents API
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Получить текущий файл из GitHub
// Возвращает { content: string (base64), sha: string }
// sha нужен для обновления — GitHub требует его при PUT
// ─────────────────────────────────────────────────────────────
async function getFileFromGitHub(
  filePath: string,
): Promise<{ content: string; sha: string } | null> {
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}?ref=${GH_BRANCH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    // Не кэшируем — всегда берём актуальную версию
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);

  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

// ─────────────────────────────────────────────────────────────
// Закоммитить файл в GitHub
// Если sha передан — обновляем существующий файл
// Если sha не передан — создаём новый
// ─────────────────────────────────────────────────────────────
async function commitFileToGitHub(
  filePath: string,
  content: string, // обычная строка, не base64
  message: string,
  sha?: string,
): Promise<void> {
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;

  // GitHub API принимает контент только в base64
  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");

  const body = {
    message,
    content: contentBase64,
    branch: GH_BRANCH,
    // sha обязателен при обновлении существующего файла
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub PUT failed: ${res.status} — ${error.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/admin/articles/[slug]
// ─────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Проверяем авторизацию
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  // Проверяем наличие обязательных env-переменных
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO) {
    console.error("[CMS] Отсутствуют env-переменные GitHub");
    return NextResponse.json(
      { error: "Сервер не настроен: отсутствуют GitHub credentials" },
      { status: 500 },
    );
  }

  const { slug } = await params;

  // Путь к файлу в репозитории (относительно корня)
  const filePath = `content/blog/${slug}.mdx`;

  try {
    // Читаем тело запроса — новые данные статьи
    const body: ArticleData = await request.json();

    // Получаем текущий файл из GitHub чтобы:
    // 1. Сохранить markdown-часть (content после frontmatter)
    // 2. Получить sha для обновления
    const existing = await getFileFromGitHub(filePath);

    if (!existing) {
      return NextResponse.json(
        { error: `Файл ${filePath} не найден в репозитории` },
        { status: 404 },
      );
    }

    // Декодируем base64 → строка → парсим через gray-matter
    // Нам нужен только content (markdown после ---)
    const rawContent = Buffer.from(
      // GitHub возвращает base64 с переносами строк — убираем их
      existing.content.replace(/\n/g, ""),
      "base64",
    ).toString("utf-8");

    const { content: markdownBody } = matter(rawContent);

    // Собираем новый MDX-файл:
    // frontmatter из тела запроса + старый markdown
    const newFileContent = matter.stringify(
      markdownBody, // markdown-часть не трогаем
      {
        slug: body.slug,
        title: body.title,
        category: body.category,
        readTime: body.readTime,
        dateIso: body.dateIso,
        dateDisplay: body.dateDisplay,
        author: body.author,
        // image опциональный — добавляем только если есть
        ...(body.image ? { image: body.image } : {}),
        quickAnswer: body.quickAnswer,
        sections: body.sections,
        budgetTable: body.budgetTable,
        faq: body.faq,
        conclusion: body.conclusion,
      },
    );

    // Коммитим обновлённый файл в GitHub
    await commitFileToGitHub(
      filePath,
      newFileContent,
      `cms: обновление статьи "${body.title}"`,
      existing.sha, // sha существующего файла — обязателен для обновления
    );

    console.log(`[CMS] Статья закоммичена в GitHub: ${filePath}`);

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error(`[CMS] Ошибка сохранения ${slug}:`, err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Неизвестная ошибка",
      },
      { status: 500 },
    );
  }
}
