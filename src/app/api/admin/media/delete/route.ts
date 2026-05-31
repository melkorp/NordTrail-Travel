// src/app/api/admin/media/delete/route.ts

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// ─────────────────────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────────────────────

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  url?: string;
  size?: number;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

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

// ─────────────────────────────────────────────────────────────
// НОВОЕ: Получить все файлы из репозитория, которые соответствуют baseName
// ─────────────────────────────────────────────────────────────

/**
 * Fetch complete tree from GitHub with recursive=1
 * This gets all files at all depths, not just top level
 */
async function fetchCompleteTree(treeSha: string): Promise<GitHubTreeItem[]> {
  const url = `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees/${treeSha}?recursive=1`;

  const res = await fetch(url, {
    headers: ghHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tree: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as GitHubTreeResponse;

  // GitHub truncates at 10,000 items by default
  if (data.truncated) {
    console.warn(
      `[CMS] Tree truncated at ${data.tree.length} items. Consider paginating or filtering.`,
    );
  }

  return data.tree;
}

/**
 * Find all files in tree that match a baseName
 * Matches: baseName.jpg, baseName-800.webp, baseName-1600.avif, etc.
 * Only returns files that actually exist in the tree
 */
function findMatchingFilePaths(
  treeItems: GitHubTreeItem[],
  baseName: string,
): string[] {
  // Escape special regex characters in baseName
  const baseNameEscaped = baseName.replace(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );

  // Pattern: baseName.ext or baseName-DIGITS.ext
  // This matches: hero-bg.jpg, hero-bg-800.webp, hero-bg-1600.avif, etc.
  const pattern = new RegExp(
    String.raw`^${baseNameEscaped}(?:-(\d+))?\.\w+$`,
    "i",
  );

  return treeItems
    .filter((item) => {
      // Only match blobs (files), not trees (directories)
      if (item.type !== "blob") return false;

      // Get the filename from the full path
      const fileName = item.path.split("/").pop();
      if (!fileName) return false;

      return pattern.test(fileName);
    })
    .map((item) => item.path);
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
  if (filePaths.length === 0) {
    // No files to delete, return the same tree SHA
    return baseTreeSha;
  }

  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: filePaths.map((path) => ({
        path,
        mode: "100644",
        type: "blob",
        sha: null,
      })),
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string;
      documentation_url?: string;
    };
    throw new Error(
      `Tree create failed: ${res.status} — ${err.message ?? "unknown"}. ` +
        "Only delete paths that exist in the tree." +
        (err.documentation_url ? ` See: ${err.documentation_url}` : ""),
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

    // Получаем реальное дерево репозитория
    const headSha = await getHeadSha();
    const baseTreeSha = await getTreeSha(headSha);
    const treeItems = await fetchCompleteTree(baseTreeSha);

    // Ищем только файлы, которые реально существуют
    const filePaths = findMatchingFilePaths(treeItems, baseName);

    if (filePaths.length === 0) {
      console.log(`[CMS] Файлы для ${baseName} не найдены в дереве`);
      return NextResponse.json({
        ok: true,
        deleted: baseName,
        notFound: true,
        message: "Файлы уже удалены или не существуют",
      });
    }

    console.log(
      `[CMS] Найдено ${filePaths.length} файлов для удаления:`,
      filePaths,
    );

    // Создаём коммит с реальными файлами
    const newTreeSha = await createTreeWithDeletions(baseTreeSha, filePaths);
    const commitSha = await createCommit(
      `media: удаление изображения "${baseName}"`,
      newTreeSha,
      headSha,
    );
    await updateRef(commitSha);

    console.log(
      `[CMS] Успешно удалено ${filePaths.length} файлов: ${baseName} → ${commitSha}`,
    );

    return NextResponse.json({
      ok: true,
      deleted: baseName,
      deletedCount: filePaths.length,
      deletedFiles: filePaths,
      commitSha,
    });
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

    // Получаем реальное дерево репозитория один раз
    const headSha = await getHeadSha();
    const baseTreeSha = await getTreeSha(headSha);
    const treeItems = await fetchCompleteTree(baseTreeSha);

    // Собираем все пути всех файлов всех изображений, которые реально существуют
    const allPaths = new Set<string>();
    const baseNames: string[] = [];
    const notFoundBaseNames: string[] = [];

    for (const name of names) {
      const baseName = getBaseName(name);
      baseNames.push(baseName);

      const matchedPaths = findMatchingFilePaths(treeItems, baseName);

      if (matchedPaths.length === 0) {
        notFoundBaseNames.push(baseName);
      } else {
        for (const path of matchedPaths) {
          allPaths.add(path);
        }
      }
    }

    const filePaths = Array.from(allPaths);

    if (filePaths.length === 0) {
      console.log(`[CMS] Файлы для удаления не найдены`);
      return NextResponse.json({
        ok: true,
        deleted: [],
        notFound: true,
        message: "Файлы уже удалены или не существуют",
        notFoundBaseNames,
      });
    }

    console.log(
      `[CMS] Найдено ${filePaths.length} файлов для удаления в ${baseNames.length} изображениях`,
    );

    // Один коммит для всех удалений
    const newTreeSha = await createTreeWithDeletions(baseTreeSha, filePaths);

    const deletedBaseNames = baseNames.filter(
      (bn) => !notFoundBaseNames.includes(bn),
    );
    const commitMessage =
      deletedBaseNames.length === 1
        ? `media: удаление изображения "${deletedBaseNames[0]}"`
        : `media: удаление ${deletedBaseNames.length} изображений`;

    const commitSha = await createCommit(commitMessage, newTreeSha, headSha);
    await updateRef(commitSha);

    console.log(
      `[CMS] Удалено ${deletedBaseNames.length} изображений одним коммитом (${filePaths.length} файлов): ${commitSha}`,
    );

    return NextResponse.json({
      ok: true,
      deleted: deletedBaseNames,
      deletedCount: filePaths.length,
      deletedFiles: filePaths,
      commitSha: commitSha,
    });
  } catch (err) {
    console.error("[CMS] Ошибка массового удаления:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
