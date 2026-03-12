// lib/rateLimit.ts

import { redis } from "@/lib/redis";

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

const CONFIG: Record<string, { limit: number; window: number }> = {
  resend_otp: { limit: 3, window: 3600 },
  resend_delete_code: { limit: 3, window: 3600 },
  report_abuse: { limit: 5, window: 3600 },
  public_link_creation: { limit: 10, window: 3600 },
};

export async function checkRateLimit(ip: string, actionKey: string): Promise<{ ok: boolean; retryAfter?: number }> {
  const config = CONFIG[actionKey] || { limit: 5, window: 60 };
  const key = `ratelimit:${actionKey}:${ip}`;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, config.window);
      }
      
      if (count > config.limit) {
        const ttl = await redis.ttl(key);
        return { ok: false, retryAfter: ttl };
      }
      
      return { ok: true };
    } catch (err) {
      console.error("[RateLimit] Redis error:", (err as Error).message);
    }
  }

  const now = Date.now();
  const entryKey = `${actionKey}:${ip}`;
  const entry = memoryStore.get(entryKey);

  if (!entry || now > entry.expiresAt) {
    memoryStore.set(entryKey, { count: 1, expiresAt: now + config.window * 1000 });
    return { ok: true };
  }

  if (entry.count >= config.limit) {
    return { ok: false, retryAfter: Math.ceil((entry.expiresAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}
