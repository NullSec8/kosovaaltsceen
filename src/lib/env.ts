type RequiredKey = "DATABASE_URL" | "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getEnv(key: RequiredKey) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export function getOptionalEnv(key: string) {
  return process.env[key];
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Comma-separated list of emails allowed to access /admin. If not set, any signed-in user can access. */
export function getAdminAllowedEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS;
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
