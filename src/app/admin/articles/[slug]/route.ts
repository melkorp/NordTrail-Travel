// src/app/api/admin/articles/[slug]/route.ts
//
// API route для сохранения статьи.
// PUT /api/admin/articles/[slug]
// Пока заглушка — выводит JSON в консоль.
// Следующий шаг: запись обратно в MDX-файл через gray-matter.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Проверяем авторизацию — неавторизованным отказываем
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = await request.json();

    // TODO: здесь будет запись в MDX-файл через gray-matter
    // Пока выводим в консоль для проверки
    console.log(`[CMS] Сохранение статьи: ${slug}`);
    console.log(JSON.stringify(body, null, 2));

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error(`[CMS] Ошибка сохранения ${slug}:`, err);
    return NextResponse.json(
      { error: "Ошибка при сохранении" },
      { status: 500 },
    );
  }
}
