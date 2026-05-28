// src/app/api/admin/media/upload/route.ts
//
// POST /api/admin/media/upload
// Принимает один файл через FormData (ключ "file").
// Клиент вызывает endpoint отдельно для каждого файла.
// Коммитит оригинал в public/images/originals/ через GitHub API.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// Допустимые форматы
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Ограничения
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB на файл

// ─────────────────────────────────────────────────────────────
// Получить sha файла из GitHub (нужен для обновления)
// ─────────────────────────────────────────────────────────────
async function getFileSha(filePath: string): Promise<string | null> {
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
  return data.sha ?? null;
}

// ─────────────────────────────────────────────────────────────
// Закоммитить файл в GitHub
// ─────────────────────────────────────────────────────────────
async function commitFileToGitHub(
  filePath: string,
  contentBase64: string,
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
        content: contentBase64,
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

// ─────────────────────────────────────────────────────────────
// Sanitize имени файла
// ─────────────────────────────────────────────────────────────
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/upload
// Принимает один файл под ключом "file"
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Авторизация
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

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    // Валидация типа
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Недопустимый формат. Разрешены: JPG, PNG, WebP" },
        { status: 400 },
      );
    }

    // Валидация размера
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум: 10 MB" },
        { status: 400 },
      );
    }

    const safeName = sanitizeName(file.name);
    const filePath = `public/images/originals/${safeName}`;

    // base64 для GitHub API
    const arrayBuffer = await file.arrayBuffer();
    const contentBase64 = Buffer.from(arrayBuffer).toString("base64");

    // sha если файл уже существует
    const existingSha = await getFileSha(filePath);

    await commitFileToGitHub(
      filePath,
      contentBase64,
      `media: загрузка изображения "${safeName}"`,
      existingSha ?? undefined,
    );

    console.log(`[CMS] Изображение загружено: ${filePath}`);

    // Базовое имя без расширения — для путей оптимизированных версий
    const base = safeName.replace(/\.[^.]+$/, "");

    return NextResponse.json({
      ok: true,
      name: safeName,
      originalPath: `/images/originals/${safeName}`,
      optimizedPaths: {
        webp800: `/images/optimized/${base}-800.webp`,
        webp1600: `/images/optimized/${base}-1600.webp`,
        avif800: `/images/optimized/${base}-800.avif`,
        avif1600: `/images/optimized/${base}-1600.avif`,
      },
    });
  } catch (err) {
    console.error("[CMS] Ошибка загрузки:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
