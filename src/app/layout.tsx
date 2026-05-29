// src/app/layout.tsx
//
// Корневой layout — читает настройки из content/settings.json.
// Шрифты подгружаются из Google Fonts через <link> в <head>.
// CSS-переменные применяются через инлайновый <style>.

import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/navigation";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import CookieConsent from "../components/CookieConsent";
// ─────────────────────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const { title, description } = settings.site;

  return {
    metadataBase: new URL("https://nord-trail-travel.vercel.app"),
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
// Строим URL для Google Fonts
// Один запрос на оба шрифта — быстрее чем два отдельных
// ─────────────────────────────────────────────────────────────
function buildGoogleFontsUrl(heading: string, body: string): string {
  // Уникальные шрифты — heading и body могут совпадать
  const fonts = [...new Set([heading, body])];
  const families = fonts
    .map((f) => `family=${f.replaceAll(" ", "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// ─────────────────────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();

  const { accentColor, fontHeading, fontBody, fontSizeBase } = settings.theme;
  const footerText = settings.footer.text;

  // URL для Google Fonts — подгружаем оба шрифта одним запросом
  const googleFontsUrl = buildGoogleFontsUrl(fontHeading, fontBody);

  // CSS-переменные для всего сайта — переопределяют globals.css
  const cssVars = `
    :root {
      --color-accent-bright: ${accentColor};
      --font-heading: "${fontHeading}", sans-serif;
      --font-body: "${fontBody}", serif;
      --font-size-base: ${fontSizeBase};
    }
    html { font-size: ${fontSizeBase}; }
  `.trim();

  return (
    <html lang="ru" className="bg-bg scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NordTrail Travel",
              url: "https://nord-trail-travel.vercel.app",
            }),
          }}
        />
        <meta
          name="google-site-verification"
          content="yPR572WBTIYrST5_MOVxNekvIknpEGVrGNH3HbD60b0"
        />

        {/* Preconnect ускоряет загрузку Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Шрифты из Google Fonts — подгружаются автоматически при смене */}
        <link rel="stylesheet" href={googleFontsUrl} />

        {/* CSS-переменные: акцент, шрифты, базовый размер */}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="antialiased min-h-screen font-body text-text">
        <Navigation />

        <main className="pt-16 md:pt-20">{children}</main>

        {/* ── Футер ───────────────────────────────────────── */}
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
        <CookieConsent />
      </body>
    </html>
  );
}
