//lib/turnstile.ts

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_COOKIE_NAME = "db-cv";
const TURNSTILE_VALIDITY = 300;
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("JWT_SECRET is not set");
}
const SECRET: string = rawSecret;

function signData(data: string) {
    return createHmac("sha256", SECRET).update(data).digest("hex");
}

export async function verifyTurnstileToken(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("⚠️ Turnstile Secret Key is missing. Skipping verification.");
    return true;
  }

  if (!token) return false;

  try {
    const res = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error("Turnstile Verification Error:", error);
    return false;
  }
}

export async function verifyTurnstileWithCookie(req: NextRequest, token?: string) {
    const cvCookie = req.cookies.get(TURNSTILE_COOKIE_NAME)?.value;
    
    if (cvCookie) {
        const [timestamp, signature] = cvCookie.split(".");
        if (timestamp && signature) {
            const now = Math.floor(Date.now() / 1000);
            if (parseInt(timestamp) > now - TURNSTILE_VALIDITY) {
                const expectedSignature = signData(timestamp);
                if (signature === expectedSignature) {
                    return { success: true, isBypass: true };
                }
            }
        }
    }

    const isHuman = await verifyTurnstileToken(token || "");
    
    let cookieAction = null;
    if (isHuman) {
        const now = Math.floor(Date.now() / 1000);
        const signature = signData(now.toString());
        const cookieValue = `${now}.${signature}`;
        
        cookieAction = (res: NextResponse) => {
            res.cookies.set(TURNSTILE_COOKIE_NAME, cookieValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: TURNSTILE_VALIDITY,
            });
            return res;
        };
    }

    return { success: isHuman, isBypass: false, cookieAction };
}
