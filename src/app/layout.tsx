import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NordTrail Travel — Премиум-путешествия",
  description:
    "Премиальный туристический портал. Направления, гиды, бюджетные советы, визовые инструкции и лучшие маршруты для путешествий в 2026 году.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        {children}
      </body>
    </html>
  );
}
