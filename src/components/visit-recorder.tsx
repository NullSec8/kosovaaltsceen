"use client";

import { useEffect, useRef } from "react";

import { hasOptionalConsent } from "@/lib/cookies";

const VISIT_RECORDED_KEY = "kosovo-alt-visit-recorded";

export function VisitRecorder() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || typeof window === "undefined") return;
    if (!hasOptionalConsent()) return;
    try {
      if (sessionStorage.getItem(VISIT_RECORDED_KEY)) return;
      sent.current = true;
      fetch("/api/visit", { method: "POST", keepalive: true })
        .then(() => {
          sessionStorage.setItem(VISIT_RECORDED_KEY, "1");
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  return null;
}
