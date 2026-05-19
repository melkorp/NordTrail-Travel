import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NordTrail Travel | Экспедиции в сердце севера",
  description: "Премиальные маршруты по Скандинавии: тишина, статус, природа.",
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
      </body>
    </html>
  );
}
