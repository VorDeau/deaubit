import { drizzle } from "drizzle-orm/d1";
import { lt, isNotNull } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";

// Runs daily via Cloudflare Cron Trigger (configured in wrangler.toml)
export async function handleCron(env: Env): Promise<void> {
  const db = drizzle(env.DB, { schema });
  const now = new Date().toISOString();

  const result = await db
    .delete(schema.shortLinks)
    .where(lt(schema.shortLinks.expiresAt, now))
    .returning({ id: schema.shortLinks.id });

  console.log(`[CRON] Cleaned up ${result.length} expired links`);
}
