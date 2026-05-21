import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { signToken, verifyToken } from "../lib/auth";
import { storeSession, deleteSession, getSession } from "../lib/session";
import { rateLimit } from "../lib/rateLimit";
import { makeSessionCookie, clearSessionCookie } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const loginRoutes = new Hono<HonoEnv>();

loginRoutes.post("/api/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await rateLimit(c.env.SESSION, `login:${ip}`, 10, 900);
  if (!rl.ok) return c.json({ error: "Too many attempts", retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return c.json({ error: "Missing credentials" }, 400);

  const res = await fetch(`${c.env.AUTH_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json<{ ok?: boolean; user?: { id: string; email: string; name: string; role: string }; error?: string }>();
  if (!res.ok || !data.user) return c.json({ error: data.error || "Invalid credentials" }, res.status as 401 | 403);

  const db = drizzle(c.env.DB);
  let localUser = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  if (!localUser) {
    await db.insert(schema.users).values({
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
    });
    localUser = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  } else if (localUser.name !== data.user.name) {
    await db.update(schema.users).set({ name: data.user.name }).where(eq(schema.users.id, localUser.id));
    localUser = { ...localUser, name: data.user.name };
  }

  const { token, jti } = await signToken(
    { id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role },
    c.env.JWT_SECRET,
  );
  await storeSession(c.env.SESSION, jti, { id: localUser.id, email: localUser.email, name: localUser.name, role: localUser.role, jti });
  c.header("Set-Cookie", makeSessionCookie(token));
  return c.json({ success: true });
});

loginRoutes.post("/api/logout", async (c) => {
  const cookie = c.req.header("cookie") ?? "";
  const match = cookie.match(/deaubit_session=([^;]*)/);
  if (match) {
    const token = decodeURIComponent(match[1]);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (payload) await deleteSession(c.env.SESSION, payload.jti);
  }
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ success: true });
});

loginRoutes.get("/api/session", async (c) => {
  const cookie = c.req.header("cookie") ?? "";
  const match = cookie.match(/deaubit_session=([^;]*)/);
  if (!match) return c.json({ authenticated: false });

  const token = decodeURIComponent(match[1]);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ authenticated: false });

  const session = await getSession(c.env.SESSION, payload.jti);
  if (!session) return c.json({ authenticated: false });

  return c.json({ authenticated: true, user: { email: session.email, name: session.name, role: session.role } });
});

export default loginRoutes;
