/**
 * Cookie consent and preferences for the site.
 * Used to improve the site (e.g. analytics, preferences) while respecting user choice.
 */

export const COOKIE_CONSENT_KEY = "kosovo-alt-cookie-consent";
export const COOKIE_CONSENT_COOKIE = "cookie_consent";

export type CookieConsentLevel = "necessary" | "all";

export type CookieConsent = {
  level: CookieConsentLevel;
  timestamp: number;
};

const CONSENT_MAX_AGE_DAYS = 365;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY) ?? getCookie(COOKIE_CONSENT_COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed?.level && (parsed.level === "necessary" || parsed.level === "all")) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setConsent(level: CookieConsentLevel): void {
  const payload: CookieConsent = { level, timestamp: Date.now() };
  const value = JSON.stringify(payload);
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setCookie(COOKIE_CONSENT_COOKIE, value, CONSENT_MAX_AGE_DAYS);
  }
}

/** True if user has accepted optional cookies (e.g. analytics). Use to gate tracking. */
export function hasOptionalConsent(): boolean {
  return getStoredConsent()?.level === "all";
}

/** True if user has made a choice (necessary or all). */
export function hasConsentChoice(): boolean {
  return getStoredConsent() !== null;
}
