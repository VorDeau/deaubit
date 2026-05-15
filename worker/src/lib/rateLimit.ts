// Simple KV-based rate limiting
// Each key stores a count with TTL. On limit exceeded, returns remaining seconds.

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number;
}

export async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const kvKey = `rl:${key}`;
  const raw = await kv.get(kvKey, { type: "json" }) as { count: number; expires: number } | null;

  const now = Math.floor(Date.now() / 1000);

  if (!raw || raw.expires < now) {
    // New window
    await kv.put(kvKey, JSON.stringify({ count: 1, expires: now + windowSeconds }), {
      expirationTtl: windowSeconds,
    });
    return { ok: true };
  }

  if (raw.count >= limit) {
    return { ok: false, retryAfter: raw.expires - now };
  }

  await kv.put(kvKey, JSON.stringify({ count: raw.count + 1, expires: raw.expires }), {
    expirationTtl: raw.expires - now,
  });
  return { ok: true };
}
