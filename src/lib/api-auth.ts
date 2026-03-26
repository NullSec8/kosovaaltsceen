import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, errorResponse: null };
}
