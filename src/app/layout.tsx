import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "../components/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://melkorp.github.io/NordTrail-Travel"),
  title: "NordTrail Travel | Экспедиции в сердце севера",
  description: "Премиальные маршруты по Скандинавии: тишина, статус, природа.",
  openGraph: {
    title: "NordTrail Travel | Экспедиции в сердце севера",
    description:
      "Премиальные маршруты по Скандинавии: тишина, статус, природа.",
    images: [
      {
        url: "/images/optimized/og-main-1600.webp",
        width: 1200,
        height: 630,
        alt: "NordTrail Travel — премиум-путешествия на север",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NordTrail Travel | Экспедиции в сердце севера",
    description:
      "Премиальные маршруты по Скандинавии: тишина, статус, природа.",
    images: ["/images/optimized/og-main-1600.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="bg-bg scroll-smooth">
      <body className="antialiased min-h-screen font-body text-text">
        <Navigation />
        <main className="pt-16 md:pt-20">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-text-muted">
          <p>
            © {new Date().getFullYear()} NordTrail Travel. Контент создан с
            использованием ИИ. Сайт является SEO-активом —{" "}
            <Link
              href="/contact/"
              className="text-accent-bright hover:underline"
            >
              открыт к приобретению
            </Link>
            .
          </p>
        </footer>
        <Script
          src="https://identity.netlify.com/v1/netlify-identity-widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
