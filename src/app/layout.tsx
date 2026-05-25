// src/app/layout.tsx
//
// Корневой layout — читает настройки из content/settings.json.
// metadata генерируется динамически через generateMetadata.
// accentColor передаётся как CSS-переменная --color-accent-bright.

import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/navigation";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

// ─────────────────────────────────────────────────────────────
// generateMetadata — динамические метаданные из settings.json
// Вызывается при каждой сборке страницы на сервере
// ─────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  // Читаем настройки — синхронно внутри, но обёртка async для Next.js
  const settings = getSettings();

  const { title, description } = settings.site;

  return {
    metadataBase: new URL("https://melkorp.github.io/NordTrail-Travel"),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/images/optimized/og-main-1600.webp",
          width: 1200,
          height: 630,
          alt: `${title} — премиум-путешествия на север`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/optimized/og-main-1600.webp"],
    },
  };
}

// ─────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Читаем настройки для CSS-переменной и футера
  // Синхронный вызов — layout не может быть async в Next.js 15
  // при использовании generateMetadata в том же файле
  const settings = getSettings();

  // accentColor из settings.json → CSS-переменная
  // Переопределяет значение из globals.css только если задано в настройках
  const accentColor = settings.theme.accentColor;

  // Текст футера — из settings.json или дефолт
  const footerText = settings.footer.text;

  return (
    <html lang="ru" className="bg-bg scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="yPR572WBTIYrST5_MOVxNekvIknpEGVrGNH3HbD60b0"
        />

        {/* CSS-переменная цвета акцента из settings.json
            Инлайновый стиль перекрывает значение из globals.css
            Работает без перезагрузки страницы после смены темы */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --color-accent-bright: ${accentColor}; }`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen font-body text-text">
        <Navigation />

        <main className="pt-16 md:pt-20">{children}</main>

        {/* ── Футер — текст из settings.json ──────────────── */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-text-muted">
          <p>
            {footerText}{" "}
            <Link
              href="/contact/"
              className="text-accent-bright hover:underline"
            >
              открыт к приобретению
            </Link>
            .
          </p>

          {/* Навигация в футере — остаётся статической */}
          <div className="mt-2 flex justify-center gap-4">
            <Link
              href="/privacy-policy/"
              className="hover:text-accent-bright transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms/"
              className="hover:text-accent-bright transition-colors"
            >
              Условия использования
            </Link>
            <Link
              href="/cookies/"
              className="hover:text-accent-bright transition-colors"
            >
              Cookie
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
