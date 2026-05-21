import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { deleteSession } from "../lib/session";
import { verifyTurnstile } from "../lib/turnstile";
import { requireAuth, clearSessionCookie } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const auth = new Hono<HonoEnv>();

auth.post("/verify-turnstile", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: "Missing token" }, 400);
  const ok = await verifyTurnstile(token, c.env.TURNSTILE_SECRET_KEY, c.req.header("cf-connecting-ip"));
  if (!ok) return c.json({ error: "Verification failed" }, 400);
  return c.json({ success: true });
});

auth.post("/update-profile", requireAuth, async (c) => {
  const user = c.get("user");
  const { name } = await c.req.json<{ name?: string }>();
  if (name === undefined) return c.json({ error: "Missing name" }, 400);

  const db = drizzle(c.env.DB);
  await db.update(schema.users).set({ name: name.trim() || null }).where(eq(schema.users.id, user.id));
  return c.json({ success: true });
});

auth.post("/delete-data", requireAuth, async (c) => {
  const user = c.get("user");
  const db = drizzle(c.env.DB);
  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  await deleteSession(c.env.SESSION, user.jti);
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ success: true });
});

export default auth;
