"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getStoredConsent, setConsent, type CookieConsentLevel } from "@/lib/cookies";

const VISIT_RECORDED_KEY = "kosovo-alt-visit-recorded";

function recordVisitOnce() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(VISIT_RECORDED_KEY)) return;
  sessionStorage.setItem(VISIT_RECORDED_KEY, "1");
  fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => {});
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    }
  }, [mounted]);

  function handleChoice(level: CookieConsentLevel) {
    setConsent(level);
    setVisible(false);
    if (level === "all") recordVisitOnce();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="animate-slide-in-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-foreground/20 bg-background/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] backdrop-blur-sm md:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground/90">
          We use cookies to remember your preferences (e.g. theme and cookie choice) and to improve the site. Necessary cookies are required for the site to work. You can accept all or only necessary.
          </p>
          <Link
            href="/about"
            className="mt-1 inline-block text-xs text-foreground/70 underline hover:text-accent"
          >
            Privacy &amp; about
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleChoice("necessary")}
            className="border border-foreground/40 px-4 py-2 text-sm font-medium uppercase tracking-wider transition hover:border-foreground hover:bg-foreground/10"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => handleChoice("all")}
            className="border border-accent bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
