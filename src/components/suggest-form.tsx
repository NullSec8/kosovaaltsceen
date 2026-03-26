"use client";

import { useState } from "react";

export function SuggestForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      bandName: String(formData.get("bandName") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      genres: String(formData.get("genres") ?? "").trim(),
      yearFounded: (() => {
        const y = formData.get("yearFounded");
        if (y === null || y === "") return undefined;
        const n = Number(y);
        return Number.isInteger(n) ? n : undefined;
      })(),
      links: String(formData.get("links") ?? "").trim() || undefined,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      contributorEmail: String(formData.get("contributorEmail") ?? "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.fieldErrors
              ? Object.values(data.error.fieldErrors).flat().join(" ")
              : "Something went wrong. Try the email link below.";
        setErrorMessage(msg);
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error. Try the email link below.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-green-500/40 bg-green-500/10 p-4 text-green-200">
        <p className="font-semibold">Thanks! Your suggestion was received.</p>
        <p className="mt-1 text-sm text-green-200/90">
          We&apos;ll review it and add the band when possible. You can suggest another below.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm underline hover:no-underline"
        >
          Submit another suggestion
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-foreground/20 p-6">
      <div>
        <label htmlFor="suggest-bandName" className="block text-sm font-medium text-white/80">
          Band name <span className="text-red-400">*</span>
        </label>
        <input
          id="suggest-bandName"
          name="bandName"
          required
          maxLength={200}
          placeholder="e.g. Band Name"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-city" className="block text-sm font-medium text-white/80">
          City <span className="text-red-400">*</span>
        </label>
        <input
          id="suggest-city"
          name="city"
          required
          maxLength={200}
          placeholder="e.g. Prishtina"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-genres" className="block text-sm font-medium text-white/80">
          Genre(s) <span className="text-red-400">*</span>
        </label>
        <input
          id="suggest-genres"
          name="genres"
          required
          maxLength={500}
          placeholder="e.g. Punk, Metal, Indie"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-yearFounded" className="block text-sm font-medium text-white/80">
          Year founded (optional)
        </label>
        <input
          id="suggest-yearFounded"
          name="yearFounded"
          type="number"
          min={1960}
          max={new Date().getFullYear()}
          placeholder="e.g. 2010"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-links" className="block text-sm font-medium text-white/80">
          Links (optional)
        </label>
        <textarea
          id="suggest-links"
          name="links"
          rows={3}
          maxLength={2000}
          placeholder="YouTube, Spotify, Instagram, Bandcamp, etc."
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-notes" className="block text-sm font-medium text-white/80">
          Notes (optional)
        </label>
        <textarea
          id="suggest-notes"
          name="notes"
          rows={2}
          maxLength={2000}
          placeholder="Any extra info for the archivists"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <label htmlFor="suggest-email" className="block text-sm font-medium text-white/80">
          Your email (optional)
        </label>
        <input
          id="suggest-email"
          name="contributorEmail"
          type="email"
          maxLength={320}
          placeholder="So we can follow up if needed"
          className="mt-1 w-full border border-white/30 bg-black px-3 py-2 text-white placeholder:text-white/40"
        />
      </div>
      {errorMessage && (
        <p className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full border border-white px-4 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit suggestion"}
      </button>
    </form>
  );
}
