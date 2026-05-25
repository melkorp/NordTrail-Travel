// src/app/api/admin/articles/[slug]/route.ts
//
// PUT /api/admin/articles/[slug] — обновить существующую статью
// POST /api/admin/articles/[slug] — создать новую статью
// Оба метода коммитят MDX-файл в GitHub.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import type { ArticleData } from "@/lib/types";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Получить файл из GitHub
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
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);

  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

// ─────────────────────────────────────────────────────────────
// Закоммитить файл в GitHub
// sha передаём при обновлении, не передаём при создании
// ─────────────────────────────────────────────────────────────
async function commitFileToGitHub(
  filePath: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;
  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: GH_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub PUT failed: ${res.status} — ${error.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Собрать MDX-файл из ArticleData
// Общая утилита для PUT и POST
// ─────────────────────────────────────────────────────────────
function buildMdxContent(body: ArticleData, markdownBody = ""): string {
  return matter.stringify(markdownBody, {
    slug: body.slug,
    title: body.title,
    category: body.category,
    readTime: body.readTime,
    dateIso: body.dateIso,
    dateDisplay: body.dateDisplay,
    author: body.author,
    ...(body.image ? { image: body.image } : {}),
    quickAnswer: body.quickAnswer,
    sections: body.sections,
    budgetTable: body.budgetTable,
    faq: body.faq,
    conclusion: body.conclusion,
  });
}

// ─────────────────────────────────────────────────────────────
// Проверка авторизации и env — общая для обоих методов
// ─────────────────────────────────────────────────────────────
async function checkAuth(): Promise<NextResponse | null> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO) {
    return NextResponse.json(
      { error: "Сервер не настроен: отсутствуют GitHub credentials" },
      { status: 500 },
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// PUT — обновить существующую статью
// ─────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { slug } = await params;
  const filePath = `content/blog/${slug}.mdx`;

  try {
    const body: ArticleData = await request.json();

    // Получаем существующий файл — он должен существовать для PUT
    const existing = await getFileFromGitHub(filePath);
    if (!existing) {
      return NextResponse.json(
        { error: `Файл ${filePath} не найден. Используйте POST для создания.` },
        { status: 404 },
      );
    }

    // Сохраняем markdown-часть существующего файла
    const rawContent = Buffer.from(
      existing.content.replace(/\n/g, ""),
      "base64",
    ).toString("utf-8");
    const { content: markdownBody } = matter(rawContent);

    const newFileContent = buildMdxContent(body, markdownBody);

    await commitFileToGitHub(
      filePath,
      newFileContent,
      `cms: обновление статьи "${body.title}"`,
      existing.sha,
    );

    console.log(`[CMS] Статья обновлена: ${filePath}`);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error(`[CMS] Ошибка обновления ${slug}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST — создать новую статью
// Возвращает 409 если файл уже существует
// ─────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { slug } = await params;
  const filePath = `content/blog/${slug}.mdx`;

  try {
    const body: ArticleData = await request.json();

    // Базовая валидация
    if (!body.slug?.trim()) {
      return NextResponse.json(
        { error: "Slug не может быть пустым" },
        { status: 400 },
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Заголовок не может быть пустым" },
        { status: 400 },
      );
    }

    // Проверяем — файл не должен существовать
    const existing = await getFileFromGitHub(filePath);
    if (existing) {
      return NextResponse.json(
        {
          error: `Статья со slug "${slug}" уже существует. Используйте PUT для обновления.`,
        },
        { status: 409 }, // 409 Conflict
      );
    }

    // Создаём новый MDX-файл с пустым markdown-телом
    // (весь контент в frontmatter — как у существующих статей)
    const newFileContent = buildMdxContent(body, "");

    // sha не передаём — GitHub создаст новый файл
    await commitFileToGitHub(
      filePath,
      newFileContent,
      `cms: создание статьи "${body.title}"`,
    );

    console.log(`[CMS] Статья создана: ${filePath}`);
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    console.error(`[CMS] Ошибка создания ${slug}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
