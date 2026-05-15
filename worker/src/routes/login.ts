import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { signToken, verifyToken } from "../lib/auth";
import { storeSession, deleteSession, getSession } from "../lib/session";
import { verifyPassword } from "../lib/hash";
import { rateLimit } from "../lib/rateLimit";
import { requireAuth, makeSessionCookie, clearSessionCookie } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const loginRoutes = new Hono<HonoEnv>();

// ─── Login ──────────────────────────────────────────
loginRoutes.post("/api/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await rateLimit(c.env.SESSION, `login:${ip}`, 10, 900);
  if (!rl.ok) return c.json({ error: "Too many attempts", retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) return c.json({ error: "Missing credentials" }, 400);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = rows[0];

  if (!user) return c.json({ error: "Invalid credentials" }, 401);
  if (!user.verifiedAt) return c.json({ error: "Account not verified" }, 403);

  const valid = await verifyPassword(password, user.password);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const { token, jti } = await signToken(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    c.env.JWT_SECRET,
  );

  await storeSession(c.env.SESSION, jti, { id: user.id, email: user.email, name: user.name, role: user.role, jti });

  c.header("Set-Cookie", makeSessionCookie(token));
  return c.json({ success: true });
});

// ─── Logout ─────────────────────────────────────────
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

// ─── Session ─────────────────────────────────────────
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
