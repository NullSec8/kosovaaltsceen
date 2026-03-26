"use client";

import { useCallback, useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setErrorMsg("Please enter a valid email address.");
        setStatus("error");
        return;
      }
      setStatus("sending");
      setErrorMsg("");
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Could not subscribe.");
        }
        setStatus("success");
        setEmail("");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Could not subscribe.");
        setStatus("error");
      }
    },
    [email],
  );

  if (status === "success") {
    return (
      <div className="space-y-1">
        <p className="text-sm font-semibold text-green-400">Subscribed!</p>
        <p className="text-xs text-foreground/60">
          You&apos;ll receive updates about new bands, events, and news.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-wider">Stay updated</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Your email"
          required
          className="w-full max-w-[240px] border border-foreground/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="border border-foreground/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {status === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </form>
  );
}
