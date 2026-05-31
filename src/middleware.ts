// src/middleware.ts
// Проверяет сессию для всех админ-страниц.
// Если сессия истекла — редиректит на /admin/login.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Если токена нет — сессия истекла или пользователь не вошёл
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  },
);

// Применяем middleware только к страницам админки
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
