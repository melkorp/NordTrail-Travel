// src/app/api/admin/media/upload/route.ts
//
// POST /api/admin/media/upload
// Принимает JSON: { files: Array<{ name, type, size, base64 }> }
// Все файлы коммитятся ОДНИМ коммитом через GitHub Tree API.
//
// JSON вместо FormData — надёжно работает на Vercel serverless,
// исключает проблемы с парсингом multipart/form-data.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GH_TOKEN = process.env.GITHUB_TOKEN!;
const GH_OWNER = process.env.GITHUB_REPO_OWNER!;
const GH_REPO = process.env.GITHUB_REPO_NAME!;
const GH_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GH_API = "https://api.github.com";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

// ─────────────────────────────────────────────────────────────
// Тип входящего файла
// ─────────────────────────────────────────────────────────────
interface IncomingFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

// ─────────────────────────────────────────────────────────────
// GitHub API helpers
// ─────────────────────────────────────────────────────────────
function ghHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Создать blob, получить sha
async function createBlob(base64: string): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/blobs`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({ content: base64, encoding: "base64" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Blob failed: ${res.status} — ${err.message ?? "unknown"}`);
  }
  return ((await res.json()) as { sha: string }).sha;
}

// Получить SHA текущего HEAD
async function getHeadSha(): Promise<string> {
  const res = await fetch(
    `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/ref/heads/${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`HEAD failed: ${res.status}`);
  const data = await res.json();
  return (data as { object: { sha: string } }).object.sha;
}

// Создать tree
async function createTree(
  baseTreeSha: string,
  entries: { path: string; blobSha: string }[],
): Promise<string> {
  const res = await fetch(`${GH_API}/repos/${GH_OWNER}/${GH_REPO}/git/trees`, {
    method: "POST",
    headers: ghHeaders(),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: entries.map((e) => ({
        path: e.path,
        mode: "100644",
        type: "blob",
        sha: e.blobSha,
      })),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Tree failed: ${res.status} — ${err.message ?? "unknown"}`);
  }
  return ((await res.json()) as { sha: string }).sha;
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
      body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Commit failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
  return ((await res.json()) as { sha: string }).sha;
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
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Ref update failed: ${res.status} — ${err.message ?? "unknown"}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST handler
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
    const body = (await request.json()) as { files?: IncomingFile[] };
    const incoming = body.files;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json({ error: "Файлы не переданы" }, { status: 400 });
    }

    // Ограничиваем на сервере
    const files = incoming.slice(0, MAX_FILES);

    // ── Валидация ────────────────────────────────────────
    interface ValidFile {
      incoming: IncomingFile;
      safeName: string;
      filePath: string;
    }

    const validFiles: ValidFile[] = [];
    const errorResults: { name: string; ok: false; error: string }[] = [];

    for (const f of files) {
      if (!ALLOWED_TYPES.has(f.type)) {
        errorResults.push({
          name: f.name,
          ok: false,
          error: "Недопустимый формат",
        });
        continue;
      }
      if (f.size > MAX_SIZE) {
        errorResults.push({
          name: f.name,
          ok: false,
          error: "Файл слишком большой (максимум 10 MB)",
        });
        continue;
      }
      if (!f.base64 || typeof f.base64 !== "string") {
        errorResults.push({
          name: f.name,
          ok: false,
          error: "Некорректные данные файла",
        });
        continue;
      }
      const safeName = sanitizeName(f.name);
      validFiles.push({
        incoming: f,
        safeName,
        filePath: `public/images/originals/${safeName}`,
      });
    }

    if (validFiles.length === 0) {
      return NextResponse.json({ results: errorResults }, { status: 400 });
    }

    // ── Создаём blobs параллельно ────────────────────────
    // Blobs stateless — параллельность безопасна
    const blobResults = await Promise.all(
      validFiles.map(async (vf) => {
        const blobSha = await createBlob(vf.incoming.base64);
        return { ...vf, blobSha };
      }),
    );

    // ── Один коммит для всех файлов ──────────────────────
    const headSha = await getHeadSha();

    const treeSha = await createTree(
      headSha,
      blobResults.map((b) => ({ path: b.filePath, blobSha: b.blobSha })),
    );

    const commitMessage =
      validFiles.length === 1
        ? `media: загрузка "${validFiles[0].safeName}"`
        : `media: загрузка ${validFiles.length} изображений`;

    const commitSha = await createCommit(commitMessage, treeSha, headSha);
    await updateRef(commitSha);

    console.log(
      `[CMS] ${validFiles.length} файл(ов) в одном коммите: ${commitSha}`,
    );

    // ── Результаты ───────────────────────────────────────
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

    return NextResponse.json(
      { results: [...successResults, ...errorResults] },
      { status: errorResults.length > 0 ? 207 : 200 },
    );
  } catch (err) {
    console.error("[CMS] Ошибка загрузки:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Неизвестная ошибка" },
      { status: 500 },
    );
  }
}
