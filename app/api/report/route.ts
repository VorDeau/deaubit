//app/api/report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbuseReportEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeAndValidateUrl, sanitizeInput } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  
  const limit = await checkRateLimit(ip, "report_abuse"); 
  
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { linkUrl, reason, details, contact } = body;

    if (!linkUrl || !reason) {
        return NextResponse.json({ error: "Link and Reason are required." }, { status: 400 });
    }

    const validUrl = sanitizeAndValidateUrl(linkUrl);
    if (!validUrl) {
        return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const urlObj = new URL(validUrl);
    const slug = urlObj.pathname.replace(/^\//, "");

    if (!slug) {
        return NextResponse.json({ error: "Could not identify shortlink from URL." }, { status: 400 });
    }

    const shortLink = await prisma.shortLink.findUnique({
        where: { slug }
    });

    if (!shortLink) {
        return NextResponse.json({ error: "Link not found in our database." }, { status: 404 });
    }

    await prisma.report.create({
        data: {
            shortLinkId: shortLink.id,
            reason: sanitizeInput(reason),
            details: details ? sanitizeInput(details) : "",
            contact: contact ? sanitizeInput(contact) : "",
        }
    });

    try {
        await sendAbuseReportEmail({
            linkUrl: validUrl,
            reason,
            details: details || "-",
            reporter: ip
        });
    } catch (emailErr) {
        console.error("[Report] Failed to send email alert:", emailErr);
    }

    return NextResponse.json({ success: true, message: "Report submitted. Thank you." });

  } catch (error) {
    console.error("[Report] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
