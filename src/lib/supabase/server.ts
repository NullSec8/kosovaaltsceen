import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasSupabaseEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasSupabaseEnv() || !url || !key) {
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server components cannot always write cookies; middleware handles refresh.
            }
          },
        },
      },
    );
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return null;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}
