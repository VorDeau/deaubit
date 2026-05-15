import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc, count, lt, sql } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import { hashPassword, verifyPassword } from "../lib/hash";
import { generateSlug, isValidSlug } from "../lib/slug";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const links = new Hono<HonoEnv>();

// ─── GET /api/links ─────────────────────────────────
links.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const page = Math.max(1, parseInt(c.req.query("page") ?? "1"));
  const limit = Math.min(50, parseInt(c.req.query("limit") ?? "10"));
  const offset = (page - 1) * limit;

  const db = drizzle(c.env.DB);

  const [rows, totalResult] = await Promise.all([
    db.select().from(schema.shortLinks)
      .where(eq(schema.shortLinks.userId, user.id))
      .orderBy(desc(schema.shortLinks.createdAt))
      .limit(limit).offset(offset),
    db.select({ total: count() }).from(schema.shortLinks).where(eq(schema.shortLinks.userId, user.id)),
  ]);

  // Get click counts per link
  const clickCounts = rows.length > 0
    ? await Promise.all(rows.map(async (link) => {
        const [r] = await db.select({ n: count() }).from(schema.clicks).where(eq(schema.clicks.shortLinkId, link.id));
        return { id: link.id, n: r?.n ?? 0 };
      }))
    : [];

  const clickMap = Object.fromEntries(clickCounts.map(c => [c.id, c.n]));
  const total = totalResult[0]?.total ?? 0;

  return c.json({
    data: rows.map(l => ({
      id: l.id, slug: l.slug, targetUrl: l.targetUrl,
      expiresAt: l.expiresAt, createdAt: l.createdAt,
      _count: { clicks: clickMap[l.id] ?? 0 },
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ─── POST /api/links ────────────────────────────────
links.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ targetUrl?: string; slug?: string; password?: string; expiresAt?: string }>();

  if (!body.targetUrl) return c.json({ error: "Target URL required" }, 400);
  let targetUrl: string;
  try { targetUrl = new URL(body.targetUrl).href; }
  catch { return c.json({ error: "Invalid URL" }, 400); }

  const db = drizzle(c.env.DB);
  let slug = body.slug?.toLowerCase().trim();

  if (slug) {
    if (!isValidSlug(slug)) return c.json({ error: "Invalid or reserved slug" }, 400);
    const existing = await db.select({ id: schema.shortLinks.id }).from(schema.shortLinks).where(eq(schema.shortLinks.slug, slug)).limit(1);
    if (existing.length > 0) return c.json({ error: "Slug already taken" }, 409);
  } else {
    for (let i = 0; i < 5; i++) {
      const candidate = generateSlug(6);
      const existing = await db.select({ id: schema.shortLinks.id }).from(schema.shortLinks).where(eq(schema.shortLinks.slug, candidate)).limit(1);
      if (existing.length === 0) { slug = candidate; break; }
    }
    if (!slug) return c.json({ error: "Could not generate unique slug" }, 500);
  }

  const hashedPw = body.password ? await hashPassword(body.password) : null;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;

  await db.insert(schema.shortLinks).values({ slug, targetUrl, userId: user.id, password: hashedPw, expiresAt });

  const host = c.env.SHORT_HOST ?? c.env.APP_HOST;
  return c.json({ slug, shortUrl: `${c.env.PROTOCOL ?? "https"}://${host}/${slug}` }, 201);
});

// ─── PATCH /api/links/:slug ─────────────────────────
links.patch("/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const slug = c.req.param("slug");
  const body = await c.req.json<{ targetUrl?: string; password?: string; expiresAt?: string; removeExpiry?: boolean }>();

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.shortLinks)
    .where(and(eq(schema.shortLinks.slug, slug), eq(schema.shortLinks.userId, user.id))).limit(1);
  if (!rows[0]) return c.json({ error: "Link not found" }, 404);

  const updates: Partial<typeof schema.shortLinks.$inferInsert> = {};
  if (body.targetUrl) {
    try { updates.targetUrl = new URL(body.targetUrl).href; }
    catch { return c.json({ error: "Invalid URL" }, 400); }
  }
  if (body.password) updates.password = await hashPassword(body.password);
  if (body.removeExpiry) updates.expiresAt = null;
  else if (body.expiresAt) updates.expiresAt = new Date(body.expiresAt).toISOString();

  await db.update(schema.shortLinks).set(updates).where(eq(schema.shortLinks.id, rows[0].id));
  return c.json({ success: true });
});

// ─── DELETE /api/links/:slug ─────────────────────────
links.delete("/:slug", requireAuth, async (c) => {
  const user = c.get("user");
  const slug = c.req.param("slug");
  const db = drizzle(c.env.DB);

  if (user.role === "ADMIN") {
    await db.delete(schema.shortLinks).where(eq(schema.shortLinks.slug, slug));
  } else {
    const rows = await db.select({ id: schema.shortLinks.id }).from(schema.shortLinks)
      .where(and(eq(schema.shortLinks.slug, slug), eq(schema.shortLinks.userId, user.id))).limit(1);
    if (!rows[0]) return c.json({ error: "Link not found" }, 404);
    await db.delete(schema.shortLinks).where(eq(schema.shortLinks.id, rows[0].id));
  }

  return c.json({ success: true });
});

// ─── POST /api/links/:slug/verify ───────────────────
links.post("/:slug/verify", async (c) => {
  const slug = c.req.param("slug");
  const { password } = await c.req.json<{ password?: string }>();
  if (!password) return c.json({ error: "Password required" }, 400);

  const db = drizzle(c.env.DB);
  const rows = await db.select().from(schema.shortLinks).where(eq(schema.shortLinks.slug, slug)).limit(1);
  const link = rows[0];

  if (!link || !link.password) return c.json({ error: "Link not found" }, 404);
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return c.json({ error: "Link expired" }, 410);
  if (!await verifyPassword(password, link.password)) return c.json({ error: "Incorrect password" }, 401);

  return c.json({ targetUrl: link.targetUrl });
});

// ─── GET /api/links/:slug/stats ─────────────────────
links.get("/:slug/stats", requireAuth, async (c) => {
  const user = c.get("user");
  const slug = c.req.param("slug");
  const db = drizzle(c.env.DB);

  const linkRows = user.role === "ADMIN"
    ? await db.select().from(schema.shortLinks).where(eq(schema.shortLinks.slug, slug)).limit(1)
    : await db.select().from(schema.shortLinks)
        .where(and(eq(schema.shortLinks.slug, slug), eq(schema.shortLinks.userId, user.id))).limit(1);

  if (!linkRows[0]) return c.json({ error: "Not found" }, 404);
  const link = linkRows[0];

  const allClicks = await db.select().from(schema.clicks)
    .where(eq(schema.clicks.shortLinkId, link.id))
    .orderBy(desc(schema.clicks.clickedAt));

  const last7 = new Date(Date.now() - 7 * 86400_000).toISOString();
  const recent = allClicks.filter(cl => cl.clickedAt >= last7);

  return c.json({
    total: allClicks.length,
    chartData: buildChartData(recent),
    topBrowsers: topN(recent, "browser"),
    topOS: topN(recent, "os"),
    topCountries: topN(recent, "country"),
    topReferrers: topN(recent, "referrer"),
  });
});

function buildChartData(clicks: schema.Click[]): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  for (const cl of clicks) {
    const day = cl.clickedAt.slice(0, 10);
    if (day in map) map[day]++;
  }
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function topN(clicks: schema.Click[], field: keyof schema.Click): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  for (const cl of clicks) {
    const val = (cl[field] as string | null) ?? "Unknown";
    map[val] = (map[val] ?? 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
}

export default links;
