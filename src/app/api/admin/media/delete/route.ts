// src/app/api/admin/media/delete/route.ts
//
// DELETE /api/admin/media/delete
//   Body: { name: string } — удаляет один файл (одиночное удаление из карточки).
//   Использует старый подход (отдельный коммит) — вызывается редко.
//
// POST /api/admin/media/delete
//   Body: { names: string[] } — удаляет несколько файлов ОДНИМ коммитом.
//   Использует GitHub Tree API: sha: null = удалить файл из дерева.
//   Один коммит → Actions триггерится один раз → нет гонки.

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
// Утилиты для имён файлов
// ─────────────────────────────────────────────────────────────
function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

function getBaseName(name: string): string {
  return stripExtension(name).replace(/-(800|1600)$/, "");
}

// Все пути файлов связанных с одним изображением:
// оригиналы (все расширения) + оптимизированные версии
function getAllFilePaths(baseName: string): string[] {
  const origExts = ["jpg", "jpeg", "png", "webp"];
  const originals = origExts.map(
    (ext) => `public/images/originals/${baseName}.${ext}`,
  );
  const optimized = [
    `public/images/optimized/${baseName}-800.webp`,
    `public/images/optimized/${baseName}-1600.webp`,
    `public/images/optimized/${baseName}-800.avif`,
    `public/images/optimized/${baseName}-1600.avif`,
  ];
  return [...originals, ...optimized];
}

// ─────────────────────────────────────────────────────────────
// GitHub Tree API helpers
// ─────────────────────────────────────────────────────────────

// Получить SHA текущего HEAD ветки
async function getHeadSha(): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/ref/heads/${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`HEAD failed: ${res.status}`);
  const data = (await res.json()) as { object: { sha: string } };
  return data.object.sha;
}

// Получить SHA текущего tree из commit
async function getTreeSha(commitSha: string): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/commits/${commitSha}`,
    { headers: ghHeaders(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Commit fetch failed: ${res.status}`);
  const data = (await res.json()) as { tree: { sha: string } };
  return data.tree.sha;
}

// Создать tree — файлы с sha: null удаляются из дерева
async function createTreeWithDeletions(
  baseTreeSha: string,
  filePaths: string[],
): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: filePaths.map((path) => ({
        path,
        mode: "100644",
        type: "blob",
        // sha: null — GitHub удаляет этот путь из дерева
        sha: null,
      })),
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Tree create failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// Создать commit
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
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Commit create failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

// Обновить ref ветки
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
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Ref update failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Проверка авторизации и env
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
// Защита от path traversal
// ─────────────────────────────────────────────────────────────
function isSafeName(name: string): boolean {
  return !name.includes("/") && !name.includes("..");
}

// ─────────────────────────────────────────────────────────────
// DELETE — удалить один файл (одиночное удаление из карточки)
// Body: { name: "hero-bg-1600.webp" }
// Использует старый подход — отдельный коммит на каждый файл.
// Вызывается редко (один клик на одну карточку).
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { name?: string };
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Не передано имя файла" },
        { status: 400 },
      );
    }

    if (!isSafeName(name)) {
      return NextResponse.json(
        { error: "Недопустимое имя файла" },
        { status: 400 },
      );
    }

    const baseName = getBaseName(name);
    const filePaths = getAllFilePaths(baseName);

    // Один коммит даже для одиночного удаления — через Tree API
    const headSha = await getHeadSha();
    const baseTreeSha = await getTreeSha(headSha);
    const newTreeSha = await createTreeWithDeletions(baseTreeSha, filePaths);
    const commitSha = await createCommit(
      `media: удаление изображения "${baseName}"`,
      newTreeSha,
      headSha,
    );
    await updateRef(commitSha);

    console.log(`[CMS] Удалено: ${baseName} → ${commitSha}`);
    return NextResponse.json({ ok: true, deleted: baseName });
  } catch (err) {
    console.error("[CMS] Ошибка удаления:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST — удалить несколько файлов ОДНИМ коммитом
// Body: { names: string[] }
// Все файлы (оригиналы + оптимизированные версии) удаляются
// из дерева через sha: null в одном Tree API коммите.
// Один коммит → Actions триггерится один раз → нет гонки.
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const body = (await request.json()) as { names?: string[] };
    const { names } = body;

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: "Массив names пустой или не передан" },
        { status: 400 },
      );
    }

    // Защита от path traversal для каждого имени
    const invalidName = names.find((n) => !isSafeName(n));
    if (invalidName) {
      return NextResponse.json(
        { error: `Недопустимое имя файла: ${invalidName}` },
        { status: 400 },
      );
    }

    // Собираем все пути всех файлов всех изображений
    // Set убирает дубликаты если несколько names имеют одно base
    const allPaths = new Set<string>();
    const baseNames: string[] = [];

    for (const name of names) {
      const baseName = getBaseName(name);
      baseNames.push(baseName);
      for (const path of getAllFilePaths(baseName)) {
        allPaths.add(path);
      }
    }

    const filePaths = Array.from(allPaths);

    // Один коммит для всех удалений
    const headSha = await getHeadSha();
    const baseTreeSha = await getTreeSha(headSha);
    const newTreeSha = await createTreeWithDeletions(baseTreeSha, filePaths);

    const commitMessage =
      baseNames.length === 1
        ? `media: удаление изображения "${baseNames[0]}"`
        : `media: удаление ${baseNames.length} изображений (${baseNames.join(", ")})`;

    const commitSha = await createCommit(commitMessage, newTreeSha, headSha);
    await updateRef(commitSha);

    console.log(
      `[CMS] Удалено ${baseNames.length} изображений одним коммитом: ${commitSha}`,
    );

    return NextResponse.json({
      ok: true,
      deleted: baseNames,
      commitSha,
    });
  } catch (err) {
    console.error("[CMS] Ошибка массового удаления:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
