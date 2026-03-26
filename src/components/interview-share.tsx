"use client";

import { useState } from "react";

type InterviewShareProps = {
  title: string;
};

export function InterviewShare({ title }: InterviewShareProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  function handleCopy() {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="space-y-2 border border-white/20 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide">Share</h2>
      <div className="flex flex-wrap gap-2">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white/40 px-3 py-2 text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        >
          Twitter
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white/40 px-3 py-2 text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        >
          Facebook
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="border border-white/40 px-3 py-2 text-xs uppercase tracking-wider hover:border-accent hover:text-accent"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
