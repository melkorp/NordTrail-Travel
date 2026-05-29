// src/app/api/admin/media/upload/route.ts
//
// POST /api/admin/media/upload
// Принимает до 10 файлов через FormData (ключ "file" повторяется).
// Все файлы коммитятся ОДНИМ коммитом через GitHub Tree API —
// это исключает гонку с GitHub Actions при параллельных загрузках.
//
// Алгоритм:
// 1. Загружаем каждый файл как blob → получаем sha блоба
// 2. Создаём tree с указанием всех блобов
// 3. Создаём commit поверх текущего HEAD
// 4. Обновляем ref ветки на новый commit

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

// Допустимые форматы — Set для O(1) проверки
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

// ─────────────────────────────────────────────────────────────
// Общие заголовки для GitHub API
// ─────────────────────────────────────────────────────────────
function ghHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
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
// Шаг 1: Загрузить файл как blob, получить sha
// GitHub хранит контент отдельно от tree — сначала создаём blob
// ─────────────────────────────────────────────────────────────
async function createBlob(contentBase64: string): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/blobs`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      content: contentBase64,
      encoding: "base64",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Blob create failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }

  const data = await res.json();
  return data.sha as string;
}

// ─────────────────────────────────────────────────────────────
// Шаг 2: Получить SHA текущего HEAD ветки
// ─────────────────────────────────────────────────────────────
async function getHeadSha(): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/ref/heads/${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" },
  );

  if (!res.ok) throw new Error(`Get HEAD failed: ${res.status}`);
  const data = await res.json();
  return data.object.sha as string;
}

// ─────────────────────────────────────────────────────────────
// Шаг 3: Создать tree с несколькими файлами
// base_tree — текущее дерево, новые файлы добавляются поверх
// ─────────────────────────────────────────────────────────────
interface TreeEntry {
  path: string; // путь в репозитории
  blobSha: string; // sha блоба
}

async function createTree(
  baseTreeSha: string,
  entries: TreeEntry[],
): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: entries.map((e) => ({
        path: e.path,
        mode: "100644", // обычный файл
        type: "blob",
        sha: e.blobSha,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Tree create failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }

  const data = await res.json();
  return data.sha as string;
}

// ─────────────────────────────────────────────────────────────
// Шаг 4: Создать commit
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
      `Commit create failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }

  const data = await res.json();
  return data.sha as string;
}

// ─────────────────────────────────────────────────────────────
// Шаг 5: Переместить ref ветки на новый commit
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
      `Update ref failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/upload
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

    // Собираем все файлы под ключом "file"
    const rawFiles = formData.getAll("file") as File[];

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: "Файлы не переданы" }, { status: 400 });
    }

    // Ограничиваем количество на сервере
    const files = rawFiles.slice(0, MAX_FILES);

    // ── Валидация каждого файла ──────────────────────────
    interface ValidFile {
      file: File;
      safeName: string;
      filePath: string;
    }

    const validFiles: ValidFile[] = [];
    const validationErrors: { name: string; error: string }[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        validationErrors.push({
          name: file.name,
          error: "Недопустимый формат. Разрешены: JPG, PNG, WebP",
        });
        continue;
      }

      if (file.size > MAX_SIZE) {
        validationErrors.push({
          name: file.name,
          error: "Файл слишком большой. Максимум: 10 MB",
        });
        continue;
      }

      const safeName = sanitizeName(file.name);
      validFiles.push({
        file,
        safeName,
        filePath: `public/images/originals/${safeName}`,
      });
    }

    // Если все файлы невалидны — возвращаем ошибки сразу
    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          results: validationErrors.map((e) => ({
            name: e.name,
            ok: false,
            error: e.error,
          })),
        },
        { status: 400 },
      );
    }

    // ── Загружаем все файлы как blobs параллельно ────────
    // Blobs не зависят друг от друга — можно параллельно
    const blobResults = await Promise.all(
      validFiles.map(async (vf) => {
        const arrayBuffer = await vf.file.arrayBuffer();
        const contentBase64 = Buffer.from(arrayBuffer).toString("base64");
        const blobSha = await createBlob(contentBase64);
        return { ...vf, blobSha };
      }),
    );

    // ── Один коммит со всеми файлами ────────────────────
    // Получаем HEAD один раз — все файлы идут в один коммит
    const headSha = await getHeadSha();

    const treeEntries: TreeEntry[] = blobResults.map((b) => ({
      path: b.filePath,
      blobSha: b.blobSha,
    }));

    const treeSha = await createTree(headSha, treeEntries);

    const commitMessage =
      validFiles.length === 1
        ? `media: загрузка изображения "${validFiles[0].safeName}"`
        : `media: загрузка ${validFiles.length} изображений (${validFiles.map((f) => f.safeName).join(", ")})`;

    const commitSha = await createCommit(commitMessage, treeSha, headSha);
    await updateRef(commitSha);

    console.log(
      `[CMS] Загружено ${validFiles.length} изображений одним коммитом: ${commitSha}`,
    );

    // ── Формируем ответ ──────────────────────────────────
    const successResults = blobResults.map((b) => {
      const base = b.safeName.replace(/\.[^.]+$/, "");
      return {
        name: b.safeName,
        ok: true,
        originalPath: `/images/originals/${b.safeName}`,
        optimizedPaths: {
          webp800: `/images/optimized/${base}-800.webp`,
          webp1600: `/images/optimized/${base}-1600.webp`,
          avif800: `/images/optimized/${base}-800.avif`,
          avif1600: `/images/optimized/${base}-1600.avif`,
        },
      };
    });

    const errorResults = validationErrors.map((e) => ({
      name: e.name,
      ok: false,
      error: e.error,
    }));

    // 207 Multi-Status если часть файлов не прошла валидацию
    const status = errorResults.length > 0 ? 207 : 200;

    return NextResponse.json(
      { results: [...successResults, ...errorResults] },
      { status },
    );
  } catch (err) {
    console.error("[CMS] Ошибка загрузки:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
