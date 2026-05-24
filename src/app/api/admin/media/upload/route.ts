// src/app/api/admin/media/upload/route.ts
//
// POST /api/admin/media/upload
// Принимает изображение через FormData,
// коммитит оригинал в content/images/originals/ через GitHub API.
// GitHub Actions запускает optimize-images.mjs и пересобирает сайт.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Конфиг из env — те же переменные что для статей и направлений
const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// Допустимые форматы изображений
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Максимальный размер файла: 10 MB
const MAX_SIZE = 10 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────
// Проверить существует ли файл в GitHub (для получения sha)
// sha нужен если файл уже есть — иначе GitHub вернёт ошибку
// ─────────────────────────────────────────────────────────────
async function getFileSha(filePath: string): Promise<string | null> {
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
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;

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
      // sha передаём только если файл уже существует
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
// POST /api/admin/media/upload
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
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

  try {
    // Читаем FormData — файл передаётся под ключом "file"
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    // Проверяем формат
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Недопустимый формат. Разрешены: JPG, PNG, WebP` },
        { status: 400 },
      );
    }

    // Проверяем размер
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум: 10 MB` },
        { status: 400 },
      );
    }

    // Sanitize имени файла — убираем спецсимволы, оставляем только безопасные
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-") // заменяем небезопасные символы на дефис
      .replace(/-+/g, "-") // убираем двойные дефисы
      .replace(/^-|-$/g, ""); // убираем дефисы в начале и конце

    // Путь в репозитории
    const filePath = `public/images/originals/${safeName}`;

    // Конвертируем файл в base64 для GitHub API
    const arrayBuffer = await file.arrayBuffer();
    const contentBase64 = Buffer.from(arrayBuffer).toString("base64");

    // Проверяем — вдруг файл с таким именем уже есть
    const existingSha = await getFileSha(filePath);

    // Коммитим в GitHub
    await commitFileToGitHub(
      filePath,
      contentBase64,
      `media: загрузка изображения "${safeName}"`,
      existingSha ?? undefined,
    );

    console.log(`[CMS] Изображение загружено в GitHub: ${filePath}`);

    // Возвращаем путь к оригиналу и ожидаемый путь к оптимизированной версии
    return NextResponse.json({
      ok: true,
      name: safeName,
      originalPath: `/images/originals/${safeName}`,
      // Оптимизированные версии появятся после пересборки GitHub Actions
      optimizedPaths: {
        webp800: `/images/optimized/${safeName.replace(/\.[^.]+$/, "")}-800.webp`,
        webp1600: `/images/optimized/${safeName.replace(/\.[^.]+$/, "")}-1600.webp`,
        avif800: `/images/optimized/${safeName.replace(/\.[^.]+$/, "")}-800.avif`,
        avif1600: `/images/optimized/${safeName.replace(/\.[^.]+$/, "")}-1600.avif`,
      },
    });
  } catch (err) {
    console.error("[CMS] Ошибка загрузки изображения:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
