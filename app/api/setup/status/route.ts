//app/api/setup/status/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    return NextResponse.json({ initialized: adminCount > 0 });
  } catch (error) {
    console.error("Setup status check error:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
