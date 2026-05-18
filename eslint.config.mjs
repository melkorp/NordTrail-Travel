// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "path";
import { fileURLToPath } from "url";

// Получаем путь к текущей папке (аналог __dirname в CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FlatCompat — переводчик со старого формата ESLint на новый
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  // Конвертируем конфиги Next.js в формат, который понимает ESLint 9
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Игнорируемые папки
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
