// src/app/api/admin/media/delete/route.ts
//
// DELETE /api/admin/media/delete
// Удаляет изображение из GitHub репозитория.
// Удаляет оригинал из originals/ и все оптимизированные версии из optimized/.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Получить sha файла из GitHub (нужен для удаления)
// Возвращает null если файл не найден
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
// Удалить один файл из GitHub
// Тихо пропускает если файл не найден (sha === null)
// ─────────────────────────────────────────────────────────────
async function deleteFileFromGitHub(
  filePath: string,
  message: string,
): Promise<void> {
  // Сначала получаем sha — GitHub требует его для удаления
  const sha = await getFileSha(filePath);

  // Файла нет — пропускаем без ошибки
  if (!sha) {
    console.log(`[CMS] Файл не найден, пропуск: ${filePath}`);
    return;
  }

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
      message,
      sha,
      branch: GH_BRANCH,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub DELETE failed: ${res.status} — ${error.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Получить базовое имя без расширения
// "hero-bg-1600.webp" → "hero-bg-1600"
// "hero-bg-800.avif"  → "hero-bg-800"
// ─────────────────────────────────────────────────────────────
function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ─────────────────────────────────────────────────────────────
// Получить базовое имя без размера и расширения
// "hero-bg-1600.webp" → "hero-bg"
// "hero-bg-800.avif"  → "hero-bg"
// ─────────────────────────────────────────────────────────────
function getBaseName(name: string): string {
  // Убираем суффиксы -800 и -1600 которые добавляет optimize-images.mjs
  return stripExtension(name).replace(/-(800|1600)$/, "");
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/media/delete
// Body: { name: "hero-bg-1600.webp" }
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
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
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name) {
      return NextResponse.json(
        { error: "Не передано имя файла" },
        { status: 400 },
      );
    }

    // Защита от path traversal — только имя файла, без слешей
    if (name.includes("/") || name.includes("..")) {
      return NextResponse.json(
        { error: "Недопустимое имя файла" },
        { status: 400 },
      );
    }

    const baseName = getBaseName(name);

    // Список файлов для удаления:
    // 1. Все оптимизированные версии (800/1600, webp/avif)
    // 2. Оригинал в originals/ (пробуем все расширения)
    const optimizedFiles = [
      `public/images/optimized/${baseName}-800.webp`,
      `public/images/optimized/${baseName}-1600.webp`,
      `public/images/optimized/${baseName}-800.avif`,
      `public/images/optimized/${baseName}-1600.avif`,
    ];

    const originalExtensions = ["jpg", "jpeg", "png", "webp"];
    const originalFiles = originalExtensions.map(
      (ext) => `public/images/originals/${baseName}.${ext}`,
    );

    const commitMessage = `media: удаление изображения "${baseName}"`;

    // Удаляем все оптимизированные версии параллельно
    await Promise.all(
      optimizedFiles.map((path) => deleteFileFromGitHub(path, commitMessage)),
    );

    // Удаляем оригиналы последовательно — у них разные расширения
    // Promise.all тоже подойдёт, но так понятнее что удаляем по одному
    for (const path of originalFiles) {
      await deleteFileFromGitHub(path, commitMessage);
    }

    console.log(`[CMS] Изображение удалено из GitHub: ${baseName}`);

    return NextResponse.json({ ok: true, deleted: baseName });
  } catch (err) {
    console.error("[CMS] Ошибка удаления изображения:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
