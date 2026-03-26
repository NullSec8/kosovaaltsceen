export type ThemeColors = {
  background: string;
  foreground: string;
  accent: string;
};

export const THEME_STORAGE_KEY = "kosovo-alt-theme";

export const PRESETS: Record<string, ThemeColors> = {
  default: {
    background: "#000000",
    foreground: "#ffffff",
    accent: "#8b0000",
  },
  warm: {
    background: "#1a1510",
    foreground: "#f5f0e8",
    accent: "#c45c26",
  },
  cool: {
    background: "#0f1419",
    foreground: "#e6edf3",
    accent: "#2ea043",
  },
  highcontrast: {
    background: "#000000",
    foreground: "#ffff00",
    accent: "#00ff00",
  },
  sepia: {
    background: "#2a2420",
    foreground: "#f4ecd8",
    accent: "#8b4513",
  },
  purple: {
    background: "#1a0a2e",
    foreground: "#e8e0f0",
    accent: "#9d4edd",
  },
};

export function applyTheme(colors: ThemeColors) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--accent", colors.accent);
}

export function getStoredTheme(): ThemeColors | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThemeColors;
    if (
      typeof parsed?.background === "string" &&
      typeof parsed?.foreground === "string" &&
      typeof parsed?.accent === "string"
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function storeTheme(colors: ThemeColors) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
  } catch {
    // ignore
  }
}
