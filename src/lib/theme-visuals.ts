export interface ThemePaletteConfig {
  light: {
    surface: string;
    sidebar: string;
    ink: string;
    accent: string;
  };
  dark: {
    surface: string;
    sidebar: string;
    ink: string;
    accent: string;
  };
  fontSample?: string;
  fontFamily?: string;
  tags: {
    en: string[];
    zh: string[];
  };
}

export const THEME_PALETTES: Record<string, ThemePaletteConfig> = {
  "eidos.forest-theme": {
    light: {
      surface: "#f8f7f2",
      sidebar: "#ebeee6",
      ink: "#242b26",
      accent: "#356b52",
    },
    dark: {
      surface: "#1c2620",
      sidebar: "#202d24",
      ink: "#e9f0e8",
      accent: "#92c9a7",
    },
    fontSample: "Aa Bb Cc · 0123",
    fontFamily: "-apple-system, BlinkMacSystemFont, Avenir Next, Segoe UI, sans-serif",
    tags: {
      en: ["Light & Dark", "Pine & Warm Paper", "Zero Code · Pure CSS"],
      zh: ["浅色与深色", "松木与暖纸配色", "纯 CSS · 无代码"],
    },
  },
  "eidos.maple-theme": {
    light: {
      surface: "#fbf8f4",
      sidebar: "#f2ebe4",
      ink: "#2b2726",
      accent: "#a84432",
    },
    dark: {
      surface: "#231e1d",
      sidebar: "#2b2321",
      ink: "#f1e8e3",
      accent: "#ef9a7e",
    },
    fontSample: "fn main() { 0123 }",
    fontFamily: "'Eidos Maple Mono', ui-monospace, SFMono-Regular, monospace",
    tags: {
      en: ["Bundled Maple Mono Font", "Light & Dark", "Warm Terracotta"],
      zh: ["内嵌 Maple Mono 字体", "浅色与深色", "陶土与枫木暖调"],
    },
  },
};

export function getThemePalette(id: string): ThemePaletteConfig {
  return (
    THEME_PALETTES[id] ?? {
      light: {
        surface: "#f8f9fa",
        sidebar: "#f0f2f5",
        ink: "#1f2328",
        accent: "#0969da",
      },
      dark: {
        surface: "#161b22",
        sidebar: "#0d1117",
        ink: "#f0f6fc",
        accent: "#58a6ff",
      },
      fontSample: "Aa Bb Cc · 0123",
      tags: {
        en: ["Light & Dark", "Theme Plugin"],
        zh: ["浅色与深色", "主题插件"],
      },
    }
  );
}
