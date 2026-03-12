// lib/loginRateLimit.ts

import { redis } from "@/lib/redis";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60 * 15; 

const memoryStore = new Map<string, { attempts: number; blockUntil: number }>();

export async function isLoginBlocked(ip: string): Promise<{ blocked: boolean; retryAfter?: number }> {
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      const blockKey = `login_block:${ip}`;
      const blockUntil = await redis.get(blockKey);
      if (blockUntil) {
        const remaining = parseInt(blockUntil) - now;
        if (remaining > 0) return { blocked: true, retryAfter: remaining };
      }

      const attemptKey = `login_attempts:${ip}`;
      const attempts = await redis.get(attemptKey);
      if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
        return { blocked: true, retryAfter: 60 };
      }
    } catch (err) {
      console.error("[LoginRateLimit] Redis error:", (err as Error).message);
    }
  }

  const entry = memoryStore.get(ip);
  if (entry && entry.attempts >= MAX_ATTEMPTS) {
    const remaining = Math.ceil((entry.blockUntil - Date.now()) / 1000);
    if (remaining > 0) return { blocked: true, retryAfter: remaining };
    memoryStore.delete(ip);
  }

  return { blocked: false };
}

export async function registerFailedLogin(ip: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      const attemptKey = `login_attempts:${ip}`;
      const attempts = await redis.incr(attemptKey);
      if (attempts === 1) await redis.expire(attemptKey, 3600);

      if (attempts >= MAX_ATTEMPTS) {
        const blockKey = `login_block:${ip}`;
        await redis.set(blockKey, (now + BLOCK_DURATION).toString(), "EX", BLOCK_DURATION);
      }
      return;
    } catch (err) {
      console.error("[LoginRateLimit] Redis error:", (err as Error).message);
    }
  }

  const entry = memoryStore.get(ip) || { attempts: 0, blockUntil: 0 };
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockUntil = Date.now() + BLOCK_DURATION * 1000;
  }
  memoryStore.set(ip, entry);
}
