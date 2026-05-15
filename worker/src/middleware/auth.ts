import type { MiddlewareHandler } from "hono";
import type { Env } from "../lib/env";
import { verifyToken } from "../lib/auth";
import { getSession } from "../lib/session";

export type AuthVariables = {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
    jti: string;
  };
};

export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> = async (c, next) => {
  const cookie = c.req.header("cookie") ?? "";
  const token = parseCookie(cookie, "deaubit_session");

  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: "Unauthorized" }, 401);

  const session = await getSession(c.env.SESSION, payload.jti);
  if (!session) return c.json({ error: "Session expired" }, 401);

  c.set("user", session);
  await next();
};

export const requireAdmin: MiddlewareHandler<{ Bindings: Env; Variables: AuthVariables }> = async (c, next) => {
  await requireAuth(c as Parameters<typeof requireAdmin>[0], async () => {});
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (user.role !== "ADMIN") return c.json({ error: "Forbidden" }, 403);
  await next();
};

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function makeSessionCookie(token: string, maxAge = 60 * 60 * 24 * 7): string {
  return `deaubit_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `deaubit_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
