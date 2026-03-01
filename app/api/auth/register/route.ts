//app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";
import { verifyTurnstileWithCookie } from "@/lib/turnstile";
import { generateOTP } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, cfTurnstile } = body;

    const turnstileCheck = await verifyTurnstileWithCookie(req, cfTurnstile);
    if (!turnstileCheck.success) {
        return NextResponse.json({ error: "Security check failed (Captcha)." }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    let finalName = name;
    if (!finalName || finalName.trim() === "") {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalName = `User-${randomSuffix}`;
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.verifiedAt) {
        const response = NextResponse.json({ error: "Email already registered." }, { status: 400 });
        if (turnstileCheck.cookieAction) return turnstileCheck.cookieAction(response);
        return response;
      }
      
      await prisma.user.update({
        where: { email },
        data: { 
            name: finalName, 
            password: hashedPassword, 
            otpSecret: otp,
            otpExpiresAt,
        },
      });
    } else {
      await prisma.user.create({
        data: { 
            name: finalName, 
            email, 
            password: hashedPassword, 
            otpSecret: otp,
            otpExpiresAt,
        },
      });
    }

    try {
      await sendVerificationEmail(email, otp);
    } catch (err) {
      console.error("Failed to send email:", err);
      const response = NextResponse.json(
        { message: "Registration successful, but failed to send email. Login to resend." },
        { status: 201 }
      );
      if (turnstileCheck.cookieAction) return turnstileCheck.cookieAction(response);
      return response;
    }

    const response = NextResponse.json({ message: "Verification code sent." }, { status: 201 });
    if (turnstileCheck.cookieAction) return turnstileCheck.cookieAction(response);
    return response;

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
