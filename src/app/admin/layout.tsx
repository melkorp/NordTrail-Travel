import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель | NordTrail Travel",
  description: "Система управления контентом NordTrail Travel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
