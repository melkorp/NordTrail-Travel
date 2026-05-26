"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем плашку только если пользователь ещё не принял
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 backdrop-blur-md px-6 py-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-text-muted leading-relaxed">
          Мы используем cookie для аналитики и улучшения работы сайта. Продолжая
          использовать сайт, вы соглашаетесь с{" "}
          <Link href="/cookies/" className="text-accent-bright hover:underline">
            политикой использования cookie
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-xl bg-accent-bright px-5 py-2 text-xs font-medium text-bg transition-all hover:-translate-y-px"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
