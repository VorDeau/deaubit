//app/api/public-links/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRandomSlug } from "@/lib/slug";
import { sanitizeAndValidateUrl } from "@/lib/validation";
import { verifyTurnstileWithCookie } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { targetUrl, cfTurnstile } = await req.json();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = await checkRateLimit(ip, "public_link_creation");
    if (!limit.ok) {
        return NextResponse.json({ error: "Too many links created. Please wait an hour." }, { status: 429 });
    }

    const turnstileCheck = await verifyTurnstileWithCookie(req, cfTurnstile);
    if (!turnstileCheck.success) {
        return NextResponse.json({ error: "Security check failed." }, { status: 400 });
    }

    const cleanUrl = sanitizeAndValidateUrl(targetUrl);
    if (!cleanUrl) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    let slug = generateRandomSlug(6);
    let retries = 0;
    while (retries < 5) {
      const exists = await prisma.shortLink.findUnique({ where: { slug } });
      if (!exists) break;
      slug = generateRandomSlug(6);
      retries++;
    }

    if (retries >= 5) {
        return NextResponse.json({ error: "Server busy, try again." }, { status: 500 });
    }

    const link = await prisma.shortLink.create({
      data: {
        slug,
        targetUrl: cleanUrl,
        userId: null,
      },
    });
    
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://deau.bit"}/${link.slug}`;

    const response = NextResponse.json({ shortUrl }, { status: 201 });
    
    if (turnstileCheck.cookieAction) {
        return turnstileCheck.cookieAction(response);
    }
    
    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
