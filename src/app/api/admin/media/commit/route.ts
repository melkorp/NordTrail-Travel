// src/app/api/admin/media/commit/route.ts
//
// POST /api/admin/media/commit
// Этап 2: принимает массив { blobSha, filePath },
// создаёт один коммит через GitHub Tree API и обновляет ref.
// Один коммит → Actions триггерится один раз → нет гонки.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Общие заголовки
// ─────────────────────────────────────────────────────────────
function ghHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// ─────────────────────────────────────────────────────────────
// Тип одного файла в запросе
// ─────────────────────────────────────────────────────────────
interface CommitFileEntry {
  blobSha: string;
  filePath: string; // "public/images/originals/photo.jpg"
  safeName: string; // "photo.jpg" — для ответа клиенту
}

// ─────────────────────────────────────────────────────────────
// Получить SHA текущего HEAD ветки
// ─────────────────────────────────────────────────────────────
async function getHeadSha(): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/ref/heads/${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`HEAD failed: ${res.status}`);
  const data = (await res.json()) as { object: { sha: string } };
  return data.object.sha;
}

// ─────────────────────────────────────────────────────────────
// Создать tree из блобов поверх существующего дерева
// ─────────────────────────────────────────────────────────────
async function createTree(
  baseTreeSha: string,
  entries: CommitFileEntry[],
): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: entries.map((e) => ({
        path: e.filePath,
        mode: "100644", // обычный файл
        type: "blob",
        sha: e.blobSha,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Tree failed: ${res.status} — ${(err as { message?: string }).message ?? "unknown"}`,
    );
  }

  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// ─────────────────────────────────────────────────────────────
// Создать commit
// ─────────────────────────────────────────────────────────────
async function createCommit(
  message: string,
  treeSha: string,
  parentSha: string,
): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/commits`,
    {
      method: "POST",
      headers: ghHeaders(),
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Commit failed: ${res.status} — ${(err as { message?: string }).message ?? "unknown"}`,
    );
  }

  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// ─────────────────────────────────────────────────────────────
// Обновить ref ветки на новый commit
// ─────────────────────────────────────────────────────────────
async function updateRef(commitSha: string): Promise<void> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/refs/heads/${GH_BRANCH}`,
    {
      method: "PATCH",
      headers: ghHeaders(),
      body: JSON.stringify({ sha: commitSha, force: false }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Ref update failed: ${res.status} — ${(err as { message?: string }).message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/commit
// Body: { files: CommitFileEntry[] }
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
    const body = (await request.json()) as { files?: CommitFileEntry[] };

    if (!Array.isArray(body.files) || body.files.length === 0) {
      return NextResponse.json(
        { error: "Массив files пустой или не передан" },
        { status: 400 },
      );
    }

    // Базовая проверка структуры каждого элемента
    for (const f of body.files) {
      if (!f.blobSha || !f.filePath || !f.safeName) {
        return NextResponse.json(
          {
            error:
              "Каждый элемент files должен содержать blobSha, filePath, safeName",
          },
          { status: 400 },
        );
      }
    }

    const files = body.files;

    // Получаем HEAD один раз — коммит атомарный
    const headSha = await getHeadSha();

    // Создаём tree со всеми файлами
    const treeSha = await createTree(headSha, files);

    // Сообщение коммита
    const commitMessage =
      files.length === 1
        ? `media: загрузка "${files[0].safeName}"`
        : `media: загрузка ${files.length} изображений (${files.map((f) => f.safeName).join(", ")})`;

    const commitSha = await createCommit(commitMessage, treeSha, headSha);
    await updateRef(commitSha);

    console.log(`[CMS] Коммит создан: ${files.length} файл(ов) → ${commitSha}`);

    // Возвращаем пути к оптимизированным версиям для информации клиента
    const committed = files.map((f) => {
      const base = f.safeName.replace(/\.[^.]+$/, "");
      return {
        safeName: f.safeName,
        filePath: f.filePath,
        optimizedPaths: {
          webp800: `/images/optimized/${base}-800.webp`,
          webp1600: `/images/optimized/${base}-1600.webp`,
          avif800: `/images/optimized/${base}-800.avif`,
          avif1600: `/images/optimized/${base}-1600.avif`,
        },
      };
    });

    return NextResponse.json({ ok: true, commitSha, committed });
  } catch (err) {
    console.error("[CMS] Ошибка коммита:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
