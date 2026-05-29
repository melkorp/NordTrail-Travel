// src/app/api/admin/media/upload/route.ts
//
// POST /api/admin/media/upload
// Этап 1: принимает ОДИН файл через FormData,
// создаёт blob в GitHub, НЕ коммитит, НЕ обновляет ref.
// Возвращает { ok, blobSha, fileName, safeName, filePath }.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_API = "https://api.github.com";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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
// Создать blob в GitHub, получить sha
// Blob stateless — не меняет дерево репозитория
// ─────────────────────────────────────────────────────────────
async function createBlob(contentBase64: string): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/blobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: contentBase64, encoding: "base64" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Blob create failed: ${res.status} — ${(err as { message?: string }).message ?? "unknown"}`,
    );
  }

  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/upload
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
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
        { error: "Недопустимый формат. Разрешены: JPEG, PNG, WebP" },
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

    // Конвертируем в base64 и создаём blob
    const arrayBuffer = await file.arrayBuffer();
    const contentBase64 = Buffer.from(arrayBuffer).toString("base64");
    const blobSha = await createBlob(contentBase64);

    console.log(`[CMS] Blob создан: ${safeName} → ${blobSha}`);

    return NextResponse.json({
      ok: true,
      blobSha,
      fileName: file.name,
      safeName,
      filePath,
    });
  } catch (err) {
    console.error("[CMS] Ошибка создания blob:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
