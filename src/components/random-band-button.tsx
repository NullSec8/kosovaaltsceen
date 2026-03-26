"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function RandomBandButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      router.push("/bands/random");
    } catch {
      setLoading(false);
    }
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 border border-foreground/60 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent disabled:opacity-60 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="16 3 21 3 21 8"/>
        <line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
        <line x1="4" y1="4" x2="9" y2="9"/>
      </svg>
      {loading ? "Loading…" : "Random band"}
    </button>
  );
}
