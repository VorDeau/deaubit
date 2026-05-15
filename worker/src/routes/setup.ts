import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, count } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import { hashPassword } from "../lib/hash";
import { generateOTP, otpExpiry } from "../lib/otp";
import { sendMail, otpEmail } from "../lib/mail";

type HonoEnv = { Bindings: Env };
const setup = new Hono<HonoEnv>();

setup.get("/status", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select({ total: count() }).from(schema.users).where(eq(schema.users.role, "ADMIN"));
  return c.json({ initialized: (result[0]?.total ?? 0) > 0 });
});

setup.post("/", async (c) => {
  const db = drizzle(c.env.DB);
  const adminRows = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "ADMIN")).limit(1);
  if (adminRows.length > 0) return c.json({ error: "Already initialized" }, 409);

  const body = await c.req.json<{ email?: string; password?: string; name?: string }>();
  if (!body.email || !body.password) return c.json({ error: "Missing fields" }, 400);
  if (body.password.length < 8) return c.json({ error: "Password too short" }, 400);

  const otp = generateOTP();
  await db.insert(schema.users).values({
    email: body.email.toLowerCase().trim(),
    password: await hashPassword(body.password),
    name: body.name?.trim() || "Administrator",
    role: "ADMIN",
    otpSecret: otp,
    otpExpiresAt: otpExpiry(30),
  });

  await sendMail({ to: body.email, subject: "DeauBit — Admin setup verification", html: otpEmail(otp, c.env.APP_HOST) }, c.env).catch(e => console.error("Setup mail error:", e));
  return c.json({ success: true });
});

export default setup;
