// src/app/admin/layout.tsx
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Админ-панель | NordTrail Travel",
  description: "Система управления контентом NordTrail Travel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="bg-slate-900">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen font-sans bg-slate-900 text-slate-100 admin-page">
        {children}
      </body>
    </html>
  );
}
