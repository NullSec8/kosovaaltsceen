"use client";

import { useCallback, useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { PRESETS, type ThemeColors } from "@/lib/theme";

const PRESET_NAMES: Record<string, string> = {
  default: "Default",
  warm: "Warm",
  cool: "Cool",
  highcontrast: "High contrast",
  sepia: "Sepia",
  purple: "Purple",
};

export function ColorSettings() {
  const { theme, setTheme, resetTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<ThemeColors>(theme);

  const applyPreset = useCallback(
    (key: string) => {
      const colors = PRESETS[key];
      if (colors) {
        setTheme(colors);
        setCustom(colors);
      }
    },
    [setTheme],
  );

  const applyCustom = useCallback(() => {
    setTheme(custom);
  }, [custom, setTheme]);

  const syncCustomFromTheme = useCallback(() => {
    setCustom(theme);
  }, [theme]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) syncCustomFromTheme();
        }}
        className="border border-white/30 px-3 py-1.5 text-sm uppercase tracking-wider transition hover:border-accent hover:text-accent"
        aria-expanded={open}
        aria-controls="color-settings-panel"
        id="color-settings-button"
      >
        Customize colors
      </button>

      {open && (
        <div
          id="color-settings-panel"
          role="dialog"
          aria-labelledby="color-settings-button"
          aria-modal="true"
          className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,320px)] rounded border border-white/20 bg-[var(--background)] p-4 shadow-lg"
          style={{ color: "var(--foreground)" }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-sm font-semibold uppercase tracking-wider">Theme</span>
              <button
                type="button"
                onClick={resetTheme}
                className="text-xs uppercase tracking-wider opacity-80 hover:opacity-100"
              >
                Reset
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider opacity-80">Presets</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([key, colors]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className="rounded border border-white/30 px-2 py-1.5 text-xs uppercase tracking-wider transition hover:border-accent hover:text-accent"
                    title={PRESET_NAMES[key] ?? key}
                  >
                    {PRESET_NAMES[key] ?? key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider opacity-80">Custom colors</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs">Background</span>
                  <input
                    type="color"
                    value={custom.background}
                    onChange={(e) => setCustom((c) => ({ ...c, background: e.target.value }))}
                    className="h-9 w-full cursor-pointer rounded border border-white/30 bg-transparent"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs">Text</span>
                  <input
                    type="color"
                    value={custom.foreground}
                    onChange={(e) => setCustom((c) => ({ ...c, foreground: e.target.value }))}
                    className="h-9 w-full cursor-pointer rounded border border-white/30 bg-transparent"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs">Accent</span>
                  <input
                    type="color"
                    value={custom.accent}
                    onChange={(e) => setCustom((c) => ({ ...c, accent: e.target.value }))}
                    className="h-9 w-full cursor-pointer rounded border border-white/30 bg-transparent"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={applyCustom}
                className="mt-2 w-full rounded border border-white/40 py-1.5 text-xs uppercase tracking-wider transition hover:border-accent hover:text-accent"
              >
                Apply custom
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <button
          type="button"
          aria-label="Close theme panel"
          className="fixed inset-0 z-40 -z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
