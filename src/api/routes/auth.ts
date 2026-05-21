import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { signToken } from "../lib/auth";
import { storeSession, deleteSession } from "../lib/session";
import { verifyTurnstile } from "../lib/turnstile";
import { requireAuth, makeSessionCookie, clearSessionCookie } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const auth = new Hono<HonoEnv>();

auth.post("/verify-turnstile", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: "Missing token" }, 400);
  const ok = await verifyTurnstile(token, c.env.TURNSTILE_SECRET_KEY, c.req.header("cf-connecting-ip"));
  if (!ok) return c.json({ error: "Verification failed" }, 400);
  return c.json({ success: true });
});

auth.post("/oauth-complete", async (c) => {
  const cookieHeader = c.req.header("cookie") ?? "";
  const sid = cookieHeader.match(/(?:^|; )sid=([^;]+)/)?.[1];
  if (!sid) return c.json({ error: "No auth session found" }, 401);

  const res = await fetch(`${c.env.AUTH_URL}/auth/verify-token`, {
    headers: { Authorization: `Bearer ${sid}` },
  });
  const data = await res.json<{ valid?: boolean; payload?: { sub: string; email: string; name: string; role: string } }>();
  if (!res.ok || !data.valid || !data.payload) return c.json({ error: "Invalid session" }, 401);

  const { email, name, role } = data.payload;
  const db = drizzle(c.env.DB);

  let localUser = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  if (!localUser) {
    await db.insert(schema.users).values({ email, name, role });
    localUser = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  } else if (localUser.name !== name) {
    await db.update(schema.users).set({ name }).where(eq(schema.users.id, localUser.id));
    localUser = { ...localUser, name };
  }

  const { token, jti } = await signToken(
    { id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role },
    c.env.JWT_SECRET,
  );
  await storeSession(c.env.SESSION, jti, { id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role, jti });
  c.header("Set-Cookie", makeSessionCookie(token));
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
