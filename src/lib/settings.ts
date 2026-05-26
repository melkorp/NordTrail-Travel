// src/lib/settings.ts
import { readFileSync } from "fs";
import path from "path";

export interface SiteSettings {
  site: { title: string; description: string };
  footer: { text: string };
  theme: {
    accentColor: string;
    // ── Новые поля типографики ──────────────────────────
    fontHeading: string; // шрифт заголовков
    fontBody: string; // шрифт текста
    fontSizeBase: string; // базовый размер: "14px" | "16px" | "18px"
  };
  admin: { password: string };
}

const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    title: "NordTrail Travel | Экспедиции в сердце севера",
    description:
      "Премиальные маршруты по Скандинавии: тишина, статус, природа.",
  },
  footer: { text: `© ${new Date().getFullYear()} NordTrail Travel.` },
  theme: {
    accentColor: "#D4AF37",
    // Дефолты совпадают с текущей темой проекта
    fontHeading: "Manrope",
    fontBody: "Inter",
    fontSizeBase: "16px",
  },
  admin: { password: "" },
};

export function getSettings(): SiteSettings {
  const filePath = path.join(process.cwd(), "content", "settings.json");
  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      site: { ...DEFAULT_SETTINGS.site, ...parsed.site },
      footer: { ...DEFAULT_SETTINGS.footer, ...parsed.footer },
      // Глубокий мёрдж theme — новые поля не потеряются если их нет в файле
      theme: { ...DEFAULT_SETTINGS.theme, ...parsed.theme },
      admin: { ...DEFAULT_SETTINGS.admin, ...parsed.admin },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
