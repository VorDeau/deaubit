import type { JWTPayload } from "./auth";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function storeSession(kv: KVNamespace, jti: string, user: JWTPayload): Promise<void> {
  await kv.put(`session:${jti}`, JSON.stringify(user), { expirationTtl: TTL_SECONDS });
}

export async function getSession(kv: KVNamespace, jti: string): Promise<JWTPayload | null> {
  const val = await kv.get(`session:${jti}`);
  if (!val) return null;
  try { return JSON.parse(val) as JWTPayload; } catch { return null; }
}

export async function deleteSession(kv: KVNamespace, jti: string): Promise<void> {
  await kv.delete(`session:${jti}`);
}
