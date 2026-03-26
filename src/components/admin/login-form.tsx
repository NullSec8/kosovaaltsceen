"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env and restart the dev server.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong during sign in.";
      setError(message);
      setLoading(false);
    }
  }

  const authConfigured = hasSupabaseEnv();

  return (
    <form action={handleSubmit} className="mx-auto w-full max-w-md space-y-4 border border-white/20 p-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-wide">Admin Login</h1>

      {!authConfigured ? (
        <p className="border border-yellow-500/40 p-3 text-sm text-yellow-300">
          Supabase auth is not configured for this environment.
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-white/80">
          Email
        </label>
        <input id="email" name="email" type="email" required className="w-full border border-white/30 bg-black px-3 py-2" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full border border-white/30 bg-black px-3 py-2"
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !authConfigured}
        className="w-full border border-white px-4 py-2 font-semibold uppercase tracking-wider hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
