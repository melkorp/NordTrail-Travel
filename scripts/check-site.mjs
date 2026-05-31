// scripts/check-site.mjs
// Полная проверка сайта: коды ответа, SEO-теги, alt-тексты, битые ссылки.
// Запуск: node scripts/check-site.mjs

import http from "node:http";
import https from "node:https";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://nord-trail-travel.vercel.app";
const CONTENT_DIR = path.join(__dirname, "..", "content");

const STATIC_PAGES = [
  "/",
  "/about/",
  "/blog/",
  "/contact/",
  "/cookies/",
  "/destinations/",
  "/privacy-policy/",
  "/terms/",
  "/robots.txt",
  "/sitemap.xml",
];

let errors = 0;
let warnings = 0;
let checked = 0;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { timeout: 15000 }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      })
      .on("error", reject)
      .on("timeout", () => reject(new Error("Timeout")));
  });
}

function checkSeoTags(data) {
  const issues = [];
  if (!data.includes("og:title")) issues.push("нет og:title");
  if (!data.includes("og:description")) issues.push("нет og:description");
  if (!data.includes("og:image")) issues.push("нет og:image");
  if (!/<title[^>]*>/.test(data) || /<title[^>]*>\s*<\/title>/.test(data)) {
    issues.push("пустой или отсутствует title");
  }
  if (!/<meta[^>]*name="description"/i.test(data)) {
    issues.push("нет meta description");
  }
  return issues;
}

function checkImageAlts(data) {
  const issues = [];
  const imgTags = data.match(/<img[^>]*>/g) || [];
  for (const img of imgTags) {
    if (!/alt=["'][^"']*["']/.test(img) || /alt=["']\s*["']/.test(img)) {
      issues.push(`изображение без alt: ${img.slice(0, 80)}`);
    }
  }
  return issues;
}

async function checkPage(url, label = "") {
  checked++;
  try {
    const { status, data } = await fetchUrl(url);
    const name = label || url;

    if (status !== 200) {
      console.log(`❌ ${name} → HTTP ${status}`);
      errors++;
      return;
    }

    const issues = [...checkSeoTags(data), ...checkImageAlts(data)];

    if (!/<link[^>]*rel="canonical"/i.test(data)) {
      warnings++;
      console.log(`⚠️  ${name} — нет canonical`);
    }

    if (issues.length === 0) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`⚠️  ${name}:`);
      for (const issue of issues) {
        warnings++;
        console.log(`   - ${issue}`);
      }
    }
  } catch (err) {
    console.log(`❌ ${label || url} — ${err.message}`);
    errors++;
  }
}

async function getBlogPages() {
  try {
    const files = await readdir(path.join(CONTENT_DIR, "blog"));
    return files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => `/blog/${f.replace(".mdx", "")}/`);
  } catch {
    return [];
  }
}

async function getDestinationPages() {
  try {
    const files = await readdir(path.join(CONTENT_DIR, "destinations"));
    const slugs = files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(".mdx", ""));
    const pages = [];
    for (const slug of slugs) {
      pages.push(
        `/destinations/${slug}/`,
        `/destinations/${slug}/best-time/`,
        `/destinations/${slug}/cost/`,
        `/destinations/${slug}/itinerary/`,
      );
    }
    return pages;
  } catch {
    return [];
  }
}

function getBlogCategories() {
  return [
    "/blog/category/hiking/",
    "/blog/category/luxury/",
    "/blog/category/winter/",
    "/blog/category/budget/",
    "/blog/category/solo-travel/",
    "/blog/category/family/",
  ];
}

// Главная логика
console.log("\n====================================");
console.log("Проверка сайта NordTrail Travel");
console.log(`Базовый URL: ${BASE_URL}`);
console.log("====================================\n");

const blogPages = await getBlogPages();
const destPages = await getDestinationPages();
const categoryPages = getBlogCategories();

const allPages = [
  ...STATIC_PAGES,
  ...blogPages,
  ...destPages,
  ...categoryPages,
];
console.log(`Всего страниц для проверки: ${allPages.length}\n`);

for (const page of allPages) {
  await checkPage(`${BASE_URL}${page}`, page);
}

console.log("\n====================================");
console.log("ИТОГИ");
console.log("====================================");
console.log(`Проверено: ${checked}`);
console.log(`Ошибок: ${errors}`);
console.log(`Предупреждений: ${warnings}`);
console.log("====================================\n");

process.exit(errors > 0 ? 1 : 0);
