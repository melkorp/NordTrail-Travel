// scripts/optimize-images.js

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// =====================================
// Аналог __dirname для ESM
// =====================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================
// Пути
// =====================================

const INPUT_DIR = path.join(process.cwd(), "public", "images", "originals");

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "optimized");

// =====================================
// Настройки
// =====================================

const SIZES = [800, 1600];

const AVIF_QUALITY = 65;
const WEBP_QUALITY = 80;

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

// =====================================
// Создание выходной директории
// =====================================

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  });
}

// =====================================
// Проверка расширения файла
// =====================================

function isSupportedImage(fileName) {
  const ext = path.extname(fileName).toLowerCase();

  return SUPPORTED_EXTENSIONS.includes(ext);
}

// =====================================
// Оптимизация изображения
// =====================================

async function optimizeImage(fileName) {
  const inputPath = path.join(INPUT_DIR, fileName);

  // Имя без расширения
  const baseName = path.parse(fileName).name;

  try {
    const image = sharp(inputPath);

    const metadata = await image.metadata();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Обработка: ${fileName}`);
    console.log(`Размер: ${metadata.width}x${metadata.height}`);

    for (const size of SIZES) {
      // =====================================
      // AVIF
      // =====================================

      const avifOutput = path.join(OUTPUT_DIR, `${baseName}-${size}.avif`);

      await sharp(inputPath)
        .resize({
          width: size,
          withoutEnlargement: true,
        })
        .avif({
          quality: AVIF_QUALITY,
        })
        .toFile(avifOutput);

      console.log(`✓ AVIF создан: ${baseName}-${size}.avif`);

      // =====================================
      // WEBP
      // =====================================

      const webpOutput = path.join(OUTPUT_DIR, `${baseName}-${size}.webp`);

      await sharp(inputPath)
        .resize({
          width: size,
          withoutEnlargement: true,
        })
        .webp({
          quality: WEBP_QUALITY,
        })
        .toFile(webpOutput);

      console.log(`✓ WEBP создан: ${baseName}-${size}.webp`);
    }

    console.log(`✔ Готово: ${fileName}`);
  } catch (error) {
    console.error(`Ошибка обработки ${fileName}:`, error.message);
  }
}

// =====================================
// Главная функция
// =====================================

async function main() {
  try {
    console.log(`\n====================================`);
    console.log(`Оптимизация изображений запущена`);
    console.log(`====================================\n`);

    // Создаем папку optimized
    await ensureOutputDir();

    // Получаем список файлов
    const files = await fs.readdir(INPUT_DIR);

    // Фильтруем только изображения
    const imageFiles = files.filter(isSupportedImage);

    if (imageFiles.length === 0) {
      console.log("Изображения не найдены в папке originals.");
      return;
    }

    console.log(`Найдено изображений: ${imageFiles.length}\n`);

    // Последовательная обработка
    for (const file of imageFiles) {
      await optimizeImage(file);
    }

    console.log(`\n====================================`);
    console.log(`Все изображения оптимизированы`);
    console.log(`====================================\n`);
  } catch (error) {
    console.error("Глобальная ошибка:", error.message);
  }
}

// =====================================
// Запуск
// =====================================

main();
