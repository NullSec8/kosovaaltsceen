"use client";

import { createBrowserClient } from "@supabase/ssr";

import { hasSupabaseEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasSupabaseEnv() || !url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}
