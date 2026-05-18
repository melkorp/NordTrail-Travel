// src/components/legal-page.tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, children }: LegalPageProps) {
  return (
    <article className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
      {/* Центрированный узкий контейнер для комфортного чтения юридических текстов */}
      <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
        {/* Кнопка «Назад» — минималистичная, без лишних эффектов */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-heading text-text-muted hover:text-accent-bright transition-colors duration-300 mb-8 group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform duration-300"
          />
          На главную
        </Link>

        {/* Заголовок с золотым акцентом: подчёркивание вместо градиента для строгости */}
        <header className="mb-10 pb-6 border-b border-white/5">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text tracking-tight">
            {title}
          </h1>
          <div className="w-12 h-px bg-accent-bright mt-4" />
        </header>

        {/* Контент: юридический текст с правильной типографикой */}
        <div className="prose prose-invert prose-headings:font-heading prose-headings:text-text prose-headings:tracking-tight prose-p:text-text-muted prose-p:leading-relaxed prose-a:text-accent-bright prose-a:no-underline hover:prose-a:underline prose-strong:text-text prose-ul:text-text-muted prose-li:leading-relaxed max-w-none">
          {children}
        </div>

        {/* Футер страницы: дата обновления и контакт для вопросов */}
        <footer className="mt-16 pt-6 border-t border-white/5 text-xs font-heading text-text-muted">
          <p>
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
            <br />
            Вопросы?{" "}
            <Link
              href="/contact"
              className="text-accent-bright hover:underline"
            >
              Свяжитесь с нами
            </Link>
          </p>
        </footer>
      </div>
    </article>
  );
}
