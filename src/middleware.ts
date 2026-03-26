import { NextResponse, type NextRequest } from "next/server";

import { getAdminAllowedEmails } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    const allowed = getAdminAllowedEmails();
    if (allowed.length > 0) {
      const email = user.email?.trim().toLowerCase();
      if (!email || !allowed.includes(email)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
