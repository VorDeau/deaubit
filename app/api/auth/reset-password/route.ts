//app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
    }

    if (!user.resetToken || user.resetToken !== token) {
      return NextResponse.json({ error: "Token tidak valid atau sudah dipakai" }, { status: 400 });
    }

    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Token sudah kadaluarsa" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password berhasil diubah" });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}