//app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail, sendAdminWelcomeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.otpSecret !== otp) {
      return NextResponse.json({ error: "Kode verifikasi salah" }, { status: 401 });
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "Kode verifikasi sudah kadaluarsa, silakan minta ulang" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: { verifiedAt: new Date(), otpSecret: null, otpExpiresAt: null },
    });

    try {
        if (user.role === "ADMIN") {
            await sendAdminWelcomeEmail(user.email, user.name || "Admin");
        } else {
            await sendWelcomeEmail(user.email, user.name || "User");
        }
    } catch (e) {
        console.error("Gagal kirim welcome email:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal verifikasi" }, { status: 500 });
  }
}
