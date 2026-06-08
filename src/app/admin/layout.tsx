// src/app/admin/layout.tsx
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
    <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>
  );
}
