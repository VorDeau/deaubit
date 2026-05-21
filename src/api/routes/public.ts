import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import { generateSlug } from "../lib/slug";
import { rateLimit } from "../lib/rateLimit";
import { sendMail, abuseDeleteEmail } from "../lib/mail";

async function getAdminEmail(db: ReturnType<typeof drizzle>, fallback: string): Promise<string> {
  const row = await db.select({ email: schema.users.email }).from(schema.users)
    .where(eq(schema.users.role, "ADMIN")).limit(1);
  return row[0]?.email ?? fallback;
}

type HonoEnv = { Bindings: Env };
const pub = new Hono<HonoEnv>();

pub.post("/api/public-links", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await rateLimit(c.env.SESSION, `publink:${ip}`, 10, 3600);
  if (!rl.ok) return c.json({ error: "Rate limit exceeded", retryAfter: rl.retryAfter }, 429);

  const body = await c.req.json<{ targetUrl?: string }>();
  let targetUrl: string;
  try { targetUrl = new URL(body.targetUrl ?? "").href; }
  catch { return c.json({ error: "Invalid URL" }, 400); }

  const db = drizzle(c.env.DB);
  let slug: string | null = null;
  for (let i = 0; i < 5; i++) {
    const candidate = generateSlug(6);
    const existing = await db.select({ id: schema.shortLinks.id }).from(schema.shortLinks).where(eq(schema.shortLinks.slug, candidate)).limit(1);
    if (existing.length === 0) { slug = candidate; break; }
  }
  if (!slug) return c.json({ error: "Could not generate slug" }, 500);

  await db.insert(schema.shortLinks).values({ slug, targetUrl });

  const host = c.env.SHORT_HOST ?? c.env.APP_HOST;
  return c.json({ shortUrl: `${c.env.PROTOCOL ?? "https"}://${host}/${slug}` }, 201);
});

pub.post("/api/report", async (c) => {
  const body = await c.req.json<{ linkUrl?: string; reason?: string; details?: string; contact?: string }>();
  if (!body.linkUrl || !body.reason) return c.json({ error: "Missing fields" }, 400);

  let slug: string;
  try {
    const url = new URL(body.linkUrl);
    slug = url.pathname.replace(/^\//, "");
  } catch { return c.json({ error: "Invalid link URL" }, 400); }

  const db = drizzle(c.env.DB);
  const linkRows = await db.select({ id: schema.shortLinks.id }).from(schema.shortLinks).where(eq(schema.shortLinks.slug, slug)).limit(1);

  await db.insert(schema.reports).values({
    shortLinkId: linkRows[0]?.id ?? null,
    reason: body.reason,
    details: body.details ?? null,
    contact: body.contact ?? null,
    status: "PENDING",
  });

  try {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    const token = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
    await c.env.SESSION.put(`abuse:${slug}:${token}`, "1", { expirationTtl: 259200 });

    const db = drizzle(c.env.DB);
    const adminEmail = await getAdminEmail(db, `admin@${c.env.APP_HOST}`);
    const deleteLink = `${c.env.PROTOCOL ?? "https"}://${c.env.APP_HOST}/admin/delete?slug=${slug}&token=${token}`;
    await sendMail({
      to: adminEmail,
      subject: `DeauBit — Abuse report: /${slug}`,
      html: abuseDeleteEmail(deleteLink, slug, c.env.APP_HOST),
    }, c.env);
  } catch (e) { console.error("Report mail error:", e); }

  return c.json({ success: true });
});

export default pub;
