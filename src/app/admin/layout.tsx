import type { Metadata } from "next";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="bg-slate-900">
      <body className="antialiased min-h-screen font-sans bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
