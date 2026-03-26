"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { applyTheme, getStoredTheme, PRESETS, storeTheme, type ThemeColors } from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeColors;
  setTheme: (colors: ThemeColors) => void;
  resetTheme: () => void;
};

const defaultTheme = PRESETS.default;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: defaultTheme,
      setTheme: () => {},
      resetTheme: () => {},
    };
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColors>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((colors: ThemeColors) => {
    setThemeState(colors);
    applyTheme(colors);
    storeTheme(colors);
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(PRESETS.default);
  }, [setTheme]);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
  }, [mounted, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
