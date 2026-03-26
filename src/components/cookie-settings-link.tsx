"use client";

import { COOKIE_CONSENT_COOKIE } from "@/lib/cookies";

/** Clears stored cookie consent and reloads so the consent banner shows again. */
export function CookieSettingsLink() {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;
    localStorage.removeItem("kosovo-alt-cookie-consent");
    document.cookie = `${COOKIE_CONSENT_COOKIE}=; path=/; max-age=0`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer border-none bg-transparent p-0 text-inherit underline transition hover:text-accent"
      aria-label="Open cookie settings and show consent banner again"
    >
      Cookie settings
    </button>
  );
}
