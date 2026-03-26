import type { Metadata } from "next";
import Link from "next/link";

import { SuggestForm } from "@/components/suggest-form";

export const metadata: Metadata = {
  title: "Suggest a Band",
  description:
    "Suggest a band to add to the Kosovo Alt Scene archive. We welcome contributions from the community.",
};

const SUGGEST_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const MAILTO_SUBJECT = "Suggest a band for Kosovo Alt Scene";
const MAILTO_BODY = [
  "Band name:",
  "City:",
  "Genre(s):",
  "Year founded (if known):",
  "Any links (YouTube, Spotify, Instagram, etc.):",
  "",
  "(Add your suggestion above)",
].join("\n");

const mailtoHref = SUGGEST_EMAIL
  ? `mailto:${SUGGEST_EMAIL}?subject=${encodeURIComponent(MAILTO_SUBJECT)}&body=${encodeURIComponent(MAILTO_BODY)}`
  : `mailto:?subject=${encodeURIComponent(MAILTO_SUBJECT)}&body=${encodeURIComponent(MAILTO_BODY)}`;

export default function SuggestPage() {
  return (
    <article className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2 border-b border-white/20 pb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Suggest a band</h1>
        <p className="text-sm uppercase tracking-wider text-white/70">Help grow the archive</p>
      </header>

      <p className="text-white/85 leading-relaxed">
        Know a band that belongs in the Kosovo Alt Scene archive? Fill in the form below or send us
        an email. We&apos;ll review and add them when possible.
      </p>

      <SuggestForm />

      <p className="text-sm text-white/60">
        Prefer email?{" "}
        <a href={mailtoHref} className="underline hover:text-accent">
          Send suggestion by email
        </a>
        {SUGGEST_EMAIL ? ` to ${SUGGEST_EMAIL}` : " (your client will open with a template)."}
      </p>

      <nav className="border-t border-white/20 pt-6">
        <Link
          href="/bands"
          className="text-sm uppercase tracking-wider text-white/80 underline decoration-white/40 hover:text-accent"
        >
          ← Back to archive
        </Link>
      </nav>
    </article>
  );
}
