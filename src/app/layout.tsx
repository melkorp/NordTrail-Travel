// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ru" className="bg-bg">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
