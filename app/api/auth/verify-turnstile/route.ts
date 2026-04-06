// app/api/auth/verify-turnstile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileWithCookie } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "No token provided." }, { status: 400 });
    }

    const check = await verifyTurnstileWithCookie(req, token);
    if (!check.success) {
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    if (check.cookieAction) {
      return check.cookieAction(res);
    }
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
