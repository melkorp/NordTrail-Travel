// src/app/api/admin/settings/route.ts
//
// PUT /api/admin/settings
// Сохраняет настройки в content/settings.json через GitHub API.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import type { SiteSettings } from "@/lib/settings";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// Путь к файлу настроек в репозитории
const SETTINGS_PATH = "content/settings.json";

// ─────────────────────────────────────────────────────────────
// Получить sha файла (нужен для обновления)
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
// PUT /api/admin/settings
// ─────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
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
    const body: SiteSettings = await request.json();

    // Базовая валидация — title и description обязательны
    if (!body.site?.title?.trim()) {
      return NextResponse.json(
        { error: "Название сайта не может быть пустым" },
        { status: 400 },
      );
    }

    if (!body.site?.description?.trim()) {
      return NextResponse.json(
        { error: "Описание сайта не может быть пустым" },
        { status: 400 },
      );
    }

    // Валидация HEX-цвета
    if (!/^#[0-9A-Fa-f]{6}$/.test(body.theme?.accentColor ?? "")) {
      return NextResponse.json(
        { error: "Неверный формат цвета акцента (ожидается #RRGGBB)" },
        { status: 400 },
      );
    }

    // Получаем sha существующего файла (если есть)
    const sha = await getFileSha(SETTINGS_PATH);

    // Сериализуем с отступами для читаемости в репозитории
    const jsonContent = JSON.stringify(body, null, 2);

    // Коммитим в GitHub
    await commitFileToGitHub(
      SETTINGS_PATH,
      jsonContent,
      "cms: обновление настроек сайта",
      sha ?? undefined,
    );

    console.log("[CMS] Настройки сохранены в GitHub");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[CMS] Ошибка сохранения настроек:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
