"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Главная", href: "/" },
  { name: "Направления", href: "/destinations" },
  { name: "Блог", href: "/blog" },
  { name: "О нас", href: "/about" },
  { name: "Контакты", href: "/contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ждём монтирования на клиенте, чтобы избежать ошибок гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Отслеживаем скролл
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Закрываем мобильное меню при смене маршрута
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Блокируем скролл страницы при открытом меню
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Логотип */}
        <Link
          href="/"
          className="font-heading font-semibold text-text text-lg tracking-tight hover:text-accent-bright transition-colors duration-500"
        >
          NordTrail
        </Link>

        {/* Десктоп-меню */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = mounted && pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative font-heading text-sm tracking-wide transition-all duration-500 hover:-translate-y-px ${
                    isActive
                      ? "text-accent-bright"
                      : "text-text/70 hover:text-text"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent-bright"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Гамбургер */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-text/70 hover:text-accent-bright p-2"
          aria-label="Открыть меню"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-bg/95 backdrop-blur-md border-b border-white/5"
          >
            <ul className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = mounted && pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block py-3 font-heading text-base ${
                        isActive
                          ? "text-accent-bright border-l-2 border-accent-bright pl-4"
                          : "text-text/70 hover:text-text hover:pl-4 border-l-2 border-transparent"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
