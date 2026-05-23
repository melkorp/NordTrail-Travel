// src/app/api/admin/destinations/[slug]/route.ts
//
// PUT /api/admin/destinations/[slug]
// Сохраняет направление через GitHub API (коммит в репозиторий).
// Vercel read-only filesystem — fs.writeFile недоступен в продакшене.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import type { Destination } from "@/lib/types";

// Конфиг из env — те же переменные что и для статей блога
const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Получить файл из GitHub (sha нужен для обновления)
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
// ─────────────────────────────────────────────────────────────
async function commitFileToGitHub(
  filePath: string,
  content: string,
  message: string,
  sha: string,
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
      sha,
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
// PUT /api/admin/destinations/[slug]
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

  // Проверяем env-переменные
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO) {
    return NextResponse.json(
      { error: "Сервер не настроен: отсутствуют GitHub credentials" },
      { status: 500 },
    );
  }

  const { slug } = await params;
  const filePath = `content/destinations/${slug}.mdx`;

  try {
    const body: Destination = await request.json();

    // Получаем текущий файл из GitHub
    const existing = await getFileFromGitHub(filePath);

    if (!existing) {
      return NextResponse.json(
        { error: `Файл ${filePath} не найден в репозитории` },
        { status: 404 },
      );
    }

    // Декодируем и парсим существующий файл
    const rawContent = Buffer.from(
      existing.content.replace(/\n/g, ""),
      "base64",
    ).toString("utf-8");

    // Сохраняем markdown-часть без изменений
    const { content: markdownBody } = matter(rawContent);

    // Собираем новый MDX-файл с обновлённым frontmatter
    const newFileContent = matter.stringify(markdownBody, {
      slug: body.slug,
      name: body.name,
      h1: body.h1,
      quickAnswer: body.quickAnswer,
      bestSeason: body.bestSeason,
      budget: body.budget,
      difficulty: body.difficulty,
      forKids: body.forKids,
      safety: body.safety,
      sections: body.sections,
      faq: body.faq,
    });

    // Коммитим в GitHub
    await commitFileToGitHub(
      filePath,
      newFileContent,
      `cms: обновление направления "${body.name}"`,
      existing.sha,
    );

    console.log(`[CMS] Направление закоммичено в GitHub: ${filePath}`);

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error(`[CMS] Ошибка сохранения ${slug}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
