// lib/session.ts

import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { SESSION_COOKIE_NAME, verifyUserJWT, UserJwtPayload } from "@/lib/auth";

const SESSION_PREFIX = "session:";

export async function getAuthenticatedUser(req: NextRequest): Promise<UserJwtPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyUserJWT(token);
  if (!payload || !payload.jti) return null;

  const isValid = await validateSession(payload.jti);
  if (!isValid) return null;

  return payload;
}

export async function storeSession(jti: string, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`${SESSION_PREFIX}${jti}`, "1", "EX", ttlSeconds);
  } catch (err) {
    console.error("[Session] storeSession error:", (err as Error).message);
  }
}

export async function validateSession(jti: string): Promise<boolean> {
  if (!redis) return true; 
  try {
    const exists = await redis.exists(`${SESSION_PREFIX}${jti}`);
    return exists === 1;
  } catch (err) {
    console.error("[Session] validateSession error:", (err as Error).message);
    return true; 
  }
}

export async function deleteSession(jti: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(`${SESSION_PREFIX}${jti}`);
  } catch (err) {
    console.error("[Session] deleteSession error:", (err as Error).message);
  }
}
