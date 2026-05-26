// src/app/api/admin/articles/[slug]/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import type { ArticleData } from "@/lib/types";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

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
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub PUT failed: ${res.status} — ${(errData as { message?: string })?.message ?? "unknown"}`,
    );
  }
}

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

async function checkAuth(): Promise<NextResponse | null> {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  if (!GH_TOKEN || !GH_OWNER || !GH_REPO)
    return NextResponse.json({ error: "Сервер не настроен" }, { status: 500 });
  return null;
}

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
    const existing = await getFileFromGitHub(filePath);
    if (!existing)
      return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
    const rawContent = Buffer.from(
      existing.content.replace(/\n/g, ""),
      "base64",
    ).toString("utf-8");
    const { content: markdownBody } = matter(rawContent);
    await commitFileToGitHub(
      filePath,
      buildMdxContent(body, markdownBody),
      `cms: обновление "${body.title}"`,
      existing.sha,
    );
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка" },
      { status: 500 },
    );
  }
}

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
    if (!body.slug?.trim())
      return NextResponse.json(
        { error: "Slug не может быть пустым" },
        { status: 400 },
      );
    if (!body.title?.trim())
      return NextResponse.json(
        { error: "Заголовок не может быть пустым" },
        { status: 400 },
      );
    const existing = await getFileFromGitHub(filePath);
    if (existing)
      return NextResponse.json(
        { error: "Статья уже существует" },
        { status: 409 },
      );
    await commitFileToGitHub(
      filePath,
      buildMdxContent(body, ""),
      `cms: создание "${body.title}"`,
    );
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = await checkAuth();
  if (authError) return authError;
  const { slug } = await params;
  const filePath = `content/blog/${slug}.mdx`;
  try {
    const existing = await getFileFromGitHub(filePath);
    if (!existing)
      return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
    const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `cms: удаление "${slug}"`,
        sha: existing.sha,
        branch: GH_BRANCH,
      }),
    });
    if (!res.ok) {
      await res.json().catch(() => ({}));
      throw new Error(`GitHub DELETE failed: ${res.status}`);
    }
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ошибка" },
      { status: 500 },
    );
  }
}
