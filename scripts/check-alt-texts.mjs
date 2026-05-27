import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const SCAN_DIRS = ["src", "content"];
const VALID_EXTENSIONS = new Set([".tsx", ".mdx", ".jsx", ".ts"]);

// HTML/JSX patterns
const IMG_REGEX = /<img[^>]*alt="([^"]*)"[^>]*>/gi;
const IMAGE_REGEX = /<Image[^>]*alt="([^"]*)"[^>]*>/gi;

// MDX patterns
const MDX_IMAGE_REGEX = /!\[([^\]]*)\]\([^)]+\)/g;

// Next.js Image without alt — ищем <Image без alt=
const IMAGE_NO_ALT_REGEX = /<Image\b(?!.*\balt=)[^>]*\/>/gi;

// Data object patterns
const DATA_IMAGE_FIELDS =
  /(?:image|img|imageUrl|cover|thumbnail)\s*:\s*["'][^"']+["']/gi;

const GENERIC_ALTS = new Set(["image", "photo", "picture", "img", "alt"]);
const BAD_PHRASES = ["image of", "picture of"];

const report = {
  timestamp: new Date().toISOString(),
  project: "nordtrail-travel",
  summary: {
    totalImages: 0,
    totalIssues: 0,
    withAlt: 0,
    withoutAlt: 0,
    emptyAlt: 0,
    genericAlt: 0,
    badPhrases: 0,
    tooLong: 0,
    mdxImages: 0,
    dataImages: 0,
    imageNoAlt: 0,
  },
  files: [],
};

function normalizeAlt(alt) {
  return alt ? alt.trim() : "";
}

function classifyAlt(alt) {
  const issues = [];
  const normalized = normalizeAlt(alt);

  if (alt === undefined || alt === null) {
    issues.push("missing-alt");
  } else if (normalized === "") {
    issues.push("empty-alt");
  } else {
    const lower = normalized.toLowerCase();

    if (GENERIC_ALTS.has(lower)) {
      issues.push("generic-alt");
    }

    if (BAD_PHRASES.some((phrase) => lower.includes(phrase))) {
      issues.push("bad-phrase");
    }

    if (normalized.length > 125) {
      issues.push("too-long");
    }
  }

  return issues.length > 0 ? issues : null;
}

async function collectFiles(baseDir) {
  const results = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          await walk(fullPath);
        }
      } else if (entry.isFile() && VALID_EXTENSIONS.has(extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  await walk(baseDir);
  return results;
}

function analyzeHtmlJsxImages(content) {
  const matches = [];
  let match;

  // Standard <img> tags
  const imgRegexCopy = new RegExp(IMG_REGEX.source, IMG_REGEX.flags);
  while ((match = imgRegexCopy.exec(content)) !== null) {
    matches.push({
      type: "img",
      alt: match[1] !== undefined ? normalizeAlt(match[1]) : undefined,
      tag: match[0].substring(0, 120),
    });
  }

  // Next.js <Image> with alt
  const imageRegexCopy = new RegExp(IMAGE_REGEX.source, IMAGE_REGEX.flags);
  while ((match = imageRegexCopy.exec(content)) !== null) {
    matches.push({
      type: "Image",
      alt: match[1] !== undefined ? normalizeAlt(match[1]) : undefined,
      tag: match[0].substring(0, 120),
    });
  }

  // Next.js <Image> without alt
  const noAltRegexCopy = new RegExp(
    IMAGE_NO_ALT_REGEX.source,
    IMAGE_NO_ALT_REGEX.flags,
  );
  while ((match = noAltRegexCopy.exec(content)) !== null) {
    const tagContent = match[0];
    if (!/<Image[^>]*alt=/i.test(tagContent)) {
      matches.push({
        type: "Image",
        alt: undefined,
        tag: tagContent.substring(0, 120),
      });
    }
  }

  return matches;
}

function analyzeMdxImages(content) {
  const matches = [];
  let match;

  const mdxRegexCopy = new RegExp(
    MDX_IMAGE_REGEX.source,
    MDX_IMAGE_REGEX.flags,
  );
  while ((match = mdxRegexCopy.exec(content)) !== null) {
    const altText = match[1] !== undefined ? match[1] : "";
    matches.push({
      type: "mdx-image",
      alt: normalizeAlt(altText),
      tag: match[0].substring(0, 120),
    });
  }

  return matches;
}

function analyzeDataImages(content) {
  const matches = [];
  let match;

  const dataImageRegexCopy = new RegExp(
    DATA_IMAGE_FIELDS.source,
    DATA_IMAGE_FIELDS.flags,
  );
  while ((match = dataImageRegexCopy.exec(content)) !== null) {
    matches.push({
      type: "data-image",
      alt: undefined, // в data-объектах alt ищется отдельно
      hasAlt: false,
      tag: match[0].substring(0, 120),
    });
  }

  return matches;
}

async function analyzeFile(filePath) {
  const content = await readFile(filePath, "utf-8");
  const relativePath = filePath.replace(PROJECT_ROOT, "").replace(/\\/g, "/");
  const ext = extname(filePath);

  const allMatches = [];

  // HTML/JSX images — для .tsx, .jsx, .ts
  if ([".tsx", ".jsx", ".ts"].includes(ext)) {
    allMatches.push(...analyzeHtmlJsxImages(content));
    allMatches.push(...analyzeDataImages(content));
  }

  // MDX images — для .mdx
  if (ext === ".mdx") {
    allMatches.push(...analyzeHtmlJsxImages(content));
    allMatches.push(...analyzeMdxImages(content));
  }

  if (allMatches.length === 0) return null;

  const issues = [];

  for (const m of allMatches) {
    report.summary.totalImages++;

    if (m.type === "mdx-image") report.summary.mdxImages++;
    if (m.type === "data-image") report.summary.dataImages++;
    if (m.type === "Image" && (m.alt === undefined || m.alt === null))
      report.summary.imageNoAlt++;

    const altIssues = classifyAlt(m.alt);

    if (m.alt === undefined || m.alt === null) {
      report.summary.withoutAlt++;
      report.summary.totalIssues++;
      issues.push({
        type: m.type,
        alt: null,
        issues:
          m.type === "data-image"
            ? ["missing-alt", "in-data-object"]
            : ["missing-alt"],
        tag: m.tag,
      });
    } else if (normalizeAlt(m.alt) === "") {
      report.summary.emptyAlt++;
      report.summary.withAlt++;
      issues.push({
        type: m.type,
        alt: "",
        issues: ["empty-alt"],
        tag: m.tag,
      });
    } else {
      report.summary.withAlt++;

      if (altIssues) {
        report.summary.totalIssues += altIssues.length;

        if (altIssues.includes("generic-alt")) report.summary.genericAlt++;
        if (altIssues.includes("bad-phrase")) report.summary.badPhrases++;
        if (altIssues.includes("too-long")) report.summary.tooLong++;

        issues.push({
          type: m.type,
          alt: normalizeAlt(m.alt),
          issues: altIssues,
          tag: m.tag,
        });
      }
    }
  }

  if (issues.length > 0) {
    return {
      file: relativePath,
      totalImages: allMatches.length,
      issuesCount: issues.length,
      issues,
    };
  }

  return null;
}

function printReport() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     🌲 NORDTRAIL ALT-TEXT CHECKER ⛰️         ║");
  console.log("║     ✨ Midnight Gold Edition ✨              ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  console.log(`📅 Date: ${report.timestamp}`);
  console.log(`📁 Project: ${report.project}\n`);

  console.log("📊 SUMMARY:");
  console.log("──────────────────────────────────────────────");
  console.log(`  Total images found:          ${report.summary.totalImages}`);
  console.log(`  ├─ With alt text:            ${report.summary.withAlt}`);
  console.log(`  ├─ Without alt text:         ${report.summary.withoutAlt}`);
  console.log(`  ├─ Empty alt (decorative?):  ${report.summary.emptyAlt}`);
  console.log(`  ├─ MDX images:               ${report.summary.mdxImages}`);
  console.log(`  ├─ Data object images:       ${report.summary.dataImages}`);
  console.log(`  ├─ Image without alt attr:   ${report.summary.imageNoAlt}`);
  console.log(`  ├─ Generic alt text:         ${report.summary.genericAlt}`);
  console.log(`  ├─ Bad phrases:              ${report.summary.badPhrases}`);
  console.log(`  └─ Too long (>125 chars):    ${report.summary.tooLong}`);
  console.log(`\n  ❌ Total issues:             ${report.summary.totalIssues}`);
  console.log("──────────────────────────────────────────────\n");

  if (report.files.length > 0) {
    console.log(`📋 FILES WITH ISSUES (${report.files.length}):\n`);

    for (const fileReport of report.files) {
      console.log(`  📄 ${fileReport.file}`);
      console.log(
        `     Images: ${fileReport.totalImages} | Issues: ${fileReport.issuesCount}`,
      );

      for (const issue of fileReport.issues) {
        const issueLabels = issue.issues
          .map((i) => {
            switch (i) {
              case "missing-alt":
                return "❌ MISSING ALT";
              case "empty-alt":
                return "⚠️  EMPTY ALT";
              case "generic-alt":
                return "⚠️  GENERIC ALT";
              case "bad-phrase":
                return "⚠️  BAD PHRASE";
              case "too-long":
                return "⚠️  TOO LONG";
              case "in-data-object":
                return "📦 IN DATA OBJECT";
              default:
                return i;
            }
          })
          .join(" | ");

        const typeLabel =
          {
            img: "HTML img",
            Image: "Next.js Image",
            "mdx-image": "MDX image",
            "data-image": "Data object",
          }[issue.type] || issue.type;

        const altDisplay = issue.alt === null ? "(none)" : `"${issue.alt}"`;
        console.log(`     • [${typeLabel}] ${issueLabels}`);
        console.log(`       Alt: ${altDisplay}`);
        console.log(`       Tag: ${issue.tag}`);
      }
      console.log("");
    }
  } else {
    console.log("✅ No issues found! All alt texts look great.\n");
  }
}

async function main() {
  console.log("🔍 NordTrail Alt-Text Scanner");
  console.log("🌙 Scanning with Midnight Gold precision...\n");

  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const targetDir = join(PROJECT_ROOT, dir);
    const files = await collectFiles(targetDir);
    allFiles.push(...files);
    console.log(`  📂 ${dir}/ — ${files.length} files found`);
  }

  console.log(`\n  📊 Total: ${allFiles.length} files to analyze`);
  console.log(
    `  🔎 Checking: HTML img, Next.js Image, MDX images, data objects\n`,
  );

  const analysisResults = await Promise.all(
    allFiles.map((file) => analyzeFile(file)),
  );

  for (const result of analysisResults) {
    if (result) {
      report.files.push(result);
    }
  }

  report.files.sort((a, b) => a.file.localeCompare(b.file));

  const reportsDir = join(__dirname, "reports");
  await mkdir(reportsDir, { recursive: true });

  const reportPath = join(reportsDir, "alt-report.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf-8");

  printReport();

  console.log(`📝 Detailed report saved to: scripts/reports/alt-report.json`);
  console.log(
    `✨ Analysis complete! ${report.summary.totalIssues > 0 ? "Action required!" : "All clear!"}\n`,
  );
}

main().catch((error) => {
  console.error("❌ Fatal error:", error.message);
  process.exit(1);
});
