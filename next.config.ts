import type { NextConfig } from "next";

// Переменная GITHUB_REPOSITORY автоматически задаётся GitHub Actions во время деплоя.
// Она выглядит так: "melkorp/NordTrail-Travel"
// Нам нужна только вторая часть — "NordTrail-Travel" — это и будет наш путь на сервере.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

// Если деплоим на GitHub Pages — добавляем "/NordTrail-Travel" как префикс.
// Если работаем локально — префикс пустой, сайт открывается на localhost:3000 как обычно.
const isProduction = process.env.NODE_ENV === "production";
const prefix = isProduction ? "/NordTrail-Travel" : "";

const nextConfig: NextConfig = {
  // Говорим Next.js: "Собери сайт как обычные HTML/CSS/JS файлы, без сервера".
  // GitHub Pages умеет отдавать только статические файлы — именно поэтому нам это нужно.
  output: "export",

  // Добавляет слеш в конце каждого URL: /about/ вместо /about
  // Статические хостинги (GitHub Pages, Netlify) без этого могут не найти страницу.
  trailingSlash: true,

  // Говорит Next.js, что сайт живёт НЕ в корне домена, а во вложенной папке.
  // Локально: "" (пусто) → сайт на localhost:3000/
  // На GitHub Pages: "/NordTrail-Travel" → сайт на melkorp.github.io/NordTrail-Travel/
  basePath: prefix,

  // То же самое, но для статических файлов (CSS, JS, картинки, шрифты).
  // Без этого браузер будет искать стили на melkorp.github.io/styles.css
  // вместо melkorp.github.io/NordTrail-Travel/styles.css — и ничего не найдёт.
  assetPrefix: prefix,

  images: {
    // GitHub Pages не умеет оптимизировать изображения "на лету" — это серверная функция.
    // С этой настройкой картинки просто отдаются как есть, без обработки.
    // Sharp для оптимизации будем запускать сами во время сборки (через скрипт).
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: prefix,
  },
};

export default nextConfig;
