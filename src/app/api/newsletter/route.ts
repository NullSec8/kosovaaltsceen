import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const existing = await (prisma as any).newsletterSubscriber?.findUnique?.({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Already subscribed." });
    }

    if (typeof (prisma as any).newsletterSubscriber?.create !== "function") {
      return NextResponse.json(
        { error: "Newsletter not configured. Run: npx prisma generate" },
        { status: 503 },
      );
    }

    await (prisma as any).newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ message: "Subscribed successfully." }, { status: 201 });

    // To integrate with Mailchimp/SendGrid, add the API call here:
    // await fetch("https://api.mailchimp.com/...", { method: "POST", ... })
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ message: "Already subscribed." });
    }
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }
}
