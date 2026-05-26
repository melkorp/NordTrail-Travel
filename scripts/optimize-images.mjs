// scripts/optimize-images.mjs

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import "node:url";

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
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

// =====================================
// Создание выходной директории
// =====================================
async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

// =====================================
// Проверка расширения файла
// =====================================
function isSupportedImage(fileName) {
  return SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

// =====================================
// Проверка: файл уже существует?
// =====================================
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// =====================================
// Оптимизация изображения
// =====================================
async function optimizeImage(fileName) {
  const inputPath = path.join(INPUT_DIR, fileName);
  const baseName = path.parse(fileName).name;

  try {
    const metadata = await sharp(inputPath).metadata();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Обработка: ${fileName}`);
    console.log(`Размер: ${metadata.width}x${metadata.height}`);

    for (const size of SIZES) {
      // AVIF
      const avifOutput = path.join(OUTPUT_DIR, `${baseName}-${size}.avif`);
      if (await fileExists(avifOutput)) {
        console.log(`↩ AVIF уже есть, пропуск: ${baseName}-${size}.avif`);
      } else {
        await sharp(inputPath)
          .resize({ width: size, withoutEnlargement: true })
          .avif({ quality: AVIF_QUALITY })
          .toFile(avifOutput);
        console.log(`✓ AVIF создан: ${baseName}-${size}.avif`);
      }

      // WEBP
      const webpOutput = path.join(OUTPUT_DIR, `${baseName}-${size}.webp`);
      if (await fileExists(webpOutput)) {
        console.log(`↩ WEBP уже есть, пропуск: ${baseName}-${size}.webp`);
      } else {
        await sharp(inputPath)
          .resize({ width: size, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpOutput);
        console.log(`✓ WEBP создан: ${baseName}-${size}.webp`);
      }
    }

    console.log(`✔ Готово: ${fileName}`);
  } catch (error) {
    console.error(`Ошибка обработки ${fileName}:`, error.message);
  }
}

// =====================================
// Главная логика
// =====================================
try {
  console.log(`\n====================================`);
  console.log(`Оптимизация изображений запущена`);
  console.log(`====================================\n`);

  await ensureOutputDir();
  const files = await fs.readdir(INPUT_DIR);
  const imageFiles = files.filter(isSupportedImage);

  if (imageFiles.length === 0) {
    console.log("Изображения не найдены в папке originals.");
  } else {
    console.log(`Найдено изображений: ${imageFiles.length}\n`);
    for (const file of imageFiles) {
      await optimizeImage(file);
    }
    console.log(`\n====================================`);
    console.log(`Все изображения оптимизированы`);
    console.log(`====================================\n`);
  }
} catch (error) {
  console.error("Глобальная ошибка:", error.message);
}
