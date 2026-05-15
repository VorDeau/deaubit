import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { deleteSession } from "../lib/session";
import { hashPassword, verifyPassword } from "../lib/hash";
import { generateOTP, otpExpiry, isOtpExpired } from "../lib/otp";
import { sendMail, otpEmail, resetEmail, deleteAccountEmail } from "../lib/mail";
import { rateLimit } from "../lib/rateLimit";
import { verifyTurnstile } from "../lib/turnstile";
import { requireAuth, clearSessionCookie } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const auth = new Hono<HonoEnv>();

// ─── Verify Turnstile ─────────────────────────────────
auth.post("/verify-turnstile", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: "Missing token" }, 400);
  const ok = await verifyTurnstile(token, c.env.TURNSTILE_SECRET_KEY, c.req.header("cf-connecting-ip"));
  if (!ok) return c.json({ error: "Verification failed" }, 400);
  return c.json({ success: true });
});

// ─── Register ─────────────────────────────────────────
auth.post("/register", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim() || null;

  if (!email || !password) return c.json({ error: "Email and password required" }, 400);
  if (password.length < 8) return c.json({ error: "Password must be at least 8 characters" }, 400);

  const db = drizzle(c.env.DB);
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length > 0) return c.json({ error: "Email already registered" }, 409);

  const hashed = await hashPassword(password);
  const otp = generateOTP();

  await db.insert(schema.users).values({
    email, password: hashed, name, role: "USER",
    otpSecret: otp, otpExpiresAt: otpExpiry(15),
  });

  await sendMail({ to: email, subject: "DeauBit — Verify your account", html: otpEmail(otp, c.env.APP_HOST) }, c.env).catch(e => console.error("Mail error:", e));
  return c.json({ success: true });
});

// ─── Verify OTP ───────────────────────────────────────
auth.post("/verify", async (c) => {
  const { email, otp } = await c.req.json<{ email?: string; otp?: string }>();
  if (!email || !otp) return c.json({ error: "Missing fields" }, 400);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
  const user = rows[0];

  if (!user) return c.json({ error: "User not found" }, 404);
  if (user.verifiedAt) return c.json({ error: "Already verified" }, 400);
  if (user.otpSecret !== otp) return c.json({ error: "Invalid code" }, 400);
  if (isOtpExpired(user.otpExpiresAt)) return c.json({ error: "Code expired" }, 400);

  await db.update(schema.users)
    .set({ verifiedAt: new Date().toISOString(), otpSecret: null, otpExpiresAt: null })
    .where(eq(schema.users.id, user.id));

  return c.json({ success: true });
});

// ─── Resend OTP ───────────────────────────────────────
auth.post("/resend-otp", async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email) return c.json({ error: "Missing email" }, 400);

  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await rateLimit(c.env.SESSION, `resend:${ip}`, 5, 3600);
  if (!rl.ok) return c.json({ error: "Too many requests", retryAfter: rl.retryAfter }, 429);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
  const user = rows[0];

  if (!user || user.verifiedAt) return c.json({ success: true });

  const otp = generateOTP();
  await db.update(schema.users).set({ otpSecret: otp, otpExpiresAt: otpExpiry(15) }).where(eq(schema.users.id, user.id));
  await sendMail({ to: email, subject: "DeauBit — New verification code", html: otpEmail(otp, c.env.APP_HOST) }, c.env).catch(e => console.error("Mail error:", e));
  return c.json({ success: true });
});

// ─── Forgot Password ──────────────────────────────────
auth.post("/forgot-password", async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email) return c.json({ success: true });

  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await rateLimit(c.env.SESSION, `forgot:${ip}`, 3, 3600);
  if (!rl.ok) return c.json({ error: "Too many requests", retryAfter: rl.retryAfter }, 429);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
  const user = rows[0];
  if (!user || !user.verifiedAt) return c.json({ success: true });

  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  const token = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
  const expiry = new Date(Date.now() + 3600_000).toISOString();

  await db.update(schema.users).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(schema.users.id, user.id));

  const link = `${c.env.PROTOCOL ?? "https"}://${c.env.APP_HOST}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  await sendMail({ to: user.email, subject: "DeauBit — Reset your password", html: resetEmail(link, c.env.APP_HOST) }, c.env).catch(e => console.error("Mail error:", e));
  return c.json({ success: true });
});

// ─── Reset Password ───────────────────────────────────
auth.post("/reset-password", async (c) => {
  const { email, token, newPassword } = await c.req.json<{ email?: string; token?: string; newPassword?: string }>();
  if (!email || !token || !newPassword) return c.json({ error: "Missing fields" }, 400);
  if (newPassword.length < 8) return c.json({ error: "Password too short" }, 400);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
  const user = rows[0];

  if (!user || user.resetToken !== token) return c.json({ error: "Invalid or expired link" }, 400);
  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) return c.json({ error: "Link expired" }, 400);

  const hashed = await hashPassword(newPassword);
  await db.update(schema.users).set({ password: hashed, resetToken: null, resetTokenExpiry: null }).where(eq(schema.users.id, user.id));
  return c.json({ success: true });
});

// ─── Update Profile ───────────────────────────────────
auth.post("/update-profile", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ name?: string; oldPassword?: string; newPassword?: string }>();
  const db = drizzle(c.env.DB);

  const rows = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  const dbUser = rows[0];
  if (!dbUser) return c.json({ error: "User not found" }, 404);

  if (body.newPassword) {
    if (!body.oldPassword) return c.json({ error: "Current password required" }, 400);
    const valid = await verifyPassword(body.oldPassword, dbUser.password);
    if (!valid) return c.json({ error: "Current password incorrect" }, 400);
    if (body.newPassword.length < 8) return c.json({ error: "Password too short" }, 400);
    await db.update(schema.users).set({ password: await hashPassword(body.newPassword) }).where(eq(schema.users.id, user.id));
  } else if (body.name !== undefined) {
    await db.update(schema.users).set({ name: body.name.trim() || null }).where(eq(schema.users.id, user.id));
  }

  return c.json({ success: true });
});

// ─── Delete Account ───────────────────────────────────
auth.post("/delete-account", requireAuth, async (c) => {
  const user = c.get("user");
  const { password, otp } = await c.req.json<{ password?: string; otp?: string }>();
  if (!password) return c.json({ error: "Password required" }, 400);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  const dbUser = rows[0];
  if (!dbUser) return c.json({ error: "User not found" }, 404);

  if (!await verifyPassword(password, dbUser.password)) return c.json({ error: "Incorrect password" }, 400);

  if (!otp) {
    const code = generateOTP();
    await db.update(schema.users).set({ otpSecret: code, otpExpiresAt: otpExpiry(15) }).where(eq(schema.users.id, user.id));
    await sendMail({ to: dbUser.email, subject: "DeauBit — Confirm account deletion", html: deleteAccountEmail(code, c.env.APP_HOST) }, c.env).catch(e => console.error("Mail error:", e));
    return c.json({ requireOtp: true });
  }

  if (dbUser.otpSecret !== otp) return c.json({ error: "Invalid code" }, 400);
  if (isOtpExpired(dbUser.otpExpiresAt)) return c.json({ error: "Code expired" }, 400);

  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  await deleteSession(c.env.SESSION, user.jti);
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ success: true });
});

// ─── Resend Delete Code ───────────────────────────────
auth.post("/resend-delete-code", requireAuth, async (c) => {
  const user = c.get("user");
  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  const dbUser = rows[0];
  if (!dbUser) return c.json({ error: "Not found" }, 404);

  const code = generateOTP();
  await db.update(schema.users).set({ otpSecret: code, otpExpiresAt: otpExpiry(15) }).where(eq(schema.users.id, user.id));
  await sendMail({ to: dbUser.email, subject: "DeauBit — Confirm account deletion", html: deleteAccountEmail(code, c.env.APP_HOST) }, c.env).catch(e => console.error("Mail error:", e));
  return c.json({ success: true });
});

export default auth;
