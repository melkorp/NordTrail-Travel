import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/navigation";

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
      </body>
    </html>
  );
}
