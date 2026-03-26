import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function getCountryFromHeaders(request: NextRequest): string | null {
  const vercel = request.headers.get("x-vercel-ip-country");
  if (vercel) return vercel.trim();
  const cf = request.headers.get("cf-ipcountry");
  if (cf && cf !== "XX") return cf.trim();
  return null;
}

/** Optional geo lookup when host doesn't provide country. Rate-limited on provider side. */
async function getCountryFromIp(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { countryCode?: string };
    return data.countryCode ?? null;
  } catch {
    return null;
  }
}

/** Max one visit per IP per 10 minutes to avoid duplicate records from same user. */
const RATE_LIMIT_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    let country = getCountryFromHeaders(request);
    if (!country && ip) {
      country = await getCountryFromIp(ip);
    }

    if (ip) {
      const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
      const recent = await prisma.visit.findFirst({
        where: { ip, createdAt: { gte: since } },
        select: { id: true },
      });
      if (recent) {
        return NextResponse.json({ ok: true, skipped: "rate_limit" });
      }
    }

    await prisma.visit.create({
      data: {
        country: country ?? undefined,
        ip: ip ?? undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as Error)?.message ?? "";
    const isMissingModel = e instanceof TypeError && (msg.includes("undefined") || msg.includes("findFirst") || msg.includes("create"));
    if (isMissingModel) {
      console.warn("Visit model not available. Run: npx prisma generate");
      return NextResponse.json({ ok: true });
    }
    console.error("Visit recording failed:", e);
    return NextResponse.json({ error: "Recording failed." }, { status: 500 });
  }
}
