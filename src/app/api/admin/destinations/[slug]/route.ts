// src/app/api/admin/destinations/[slug]/route.ts
//
// PUT  — обновить существующее направление
// POST — создать новое (409 если уже существует)
// DELETE — удалить из GitHub

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import type { Destination } from "@/lib/types";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// GitHub helpers
// ─────────────────────────────────────────────────────────────
async function getFileFromGitHub(
  filePath: string,
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}?ref=${GH_BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  return { content: data.content, sha: data.sha };
}

async function commitFileToGitHub(
  filePath: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, "utf-8").toString("base64"),
        branch: GH_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub PUT failed: ${res.status} — ${error.message ?? "unknown"}`,
    );
  }
}

async function deleteFileFromGitHub(
  filePath: string,
  message: string,
): Promise<void> {
  // Получаем sha — без него GitHub не удалит
  const existing = await getFileFromGitHub(filePath);
  if (!existing) {
    console.log(`[CMS] Файл не найден, пропуск: ${filePath}`);
    return;
  }

  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sha: existing.sha, branch: GH_BRANCH }),
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub DELETE failed: ${res.status} — ${error.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Собрать MDX из Destination
// ─────────────────────────────────────────────────────────────
function buildMdxContent(body: Destination, markdownBody = ""): string {
  return matter.stringify(markdownBody, {
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
}

// ─────────────────────────────────────────────────────────────
// Проверка авторизации
// ─────────────────────────────────────────────────────────────
async function checkAuth(): Promise<NextResponse | null> {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO)
    return NextResponse.json(
      { error: "Сервер не настроен: отсутствуют GitHub credentials" },
      { status: 500 },
    );
  return null;
}

// ─────────────────────────────────────────────────────────────
// PUT — обновить существующее
// ─────────────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { slug } = await params;
  const filePath = `content/destinations/${slug}.mdx`;

  try {
    const body: Destination = await request.json();

    const existing = await getFileFromGitHub(filePath);
    if (!existing)
      return NextResponse.json(
        { error: `Файл ${filePath} не найден. Используйте POST для создания.` },
        { status: 404 },
      );

    const rawContent = Buffer.from(
      existing.content.replace(/\n/g, ""),
      "base64",
    ).toString("utf-8");
    const { content: markdownBody } = matter(rawContent);

    await commitFileToGitHub(
      filePath,
      buildMdxContent(body, markdownBody),
      `cms: обновление направления "${body.name}"`,
      existing.sha,
    );

    console.log(`[CMS] Направление обновлено: ${filePath}`);
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
// POST — создать новое (409 если уже существует)
// ─────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { slug } = await params;
  const filePath = `content/destinations/${slug}.mdx`;

  try {
    const body: Destination = await request.json();

    if (!body.slug?.trim())
      return NextResponse.json(
        { error: "Slug не может быть пустым" },
        { status: 400 },
      );
    if (!body.name?.trim())
      return NextResponse.json(
        { error: "Название не может быть пустым" },
        { status: 400 },
      );

    // Проверяем что файл не существует
    const existing = await getFileFromGitHub(filePath);
    if (existing)
      return NextResponse.json(
        {
          error: `Направление "${slug}" уже существует. Используйте PUT для обновления.`,
        },
        { status: 409 },
      );

    await commitFileToGitHub(
      filePath,
      buildMdxContent(body, ""),
      `cms: создание направления "${body.name}"`,
    );

    console.log(`[CMS] Направление создано: ${filePath}`);
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    console.error(`[CMS] Ошибка создания ${slug}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE — удалить направление
// ─────────────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;

  const { slug } = await params;
  const filePath = `content/destinations/${slug}.mdx`;

  try {
    await deleteFileFromGitHub(filePath, `cms: удаление направления "${slug}"`);
    console.log(`[CMS] Направление удалено: ${filePath}`);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error(`[CMS] Ошибка удаления ${slug}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
