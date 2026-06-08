import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель | NordTrail Travel",
  description: "Система управления контентом NordTrail Travel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="admin-page">{children}</body>
    </html>
  );
}
