import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, count, desc, isNull } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../lib/env";
import type { AuthVariables } from "../middleware/auth";
import { requireAdmin } from "../middleware/auth";

type HonoEnv = { Bindings: Env; Variables: AuthVariables };
const admin = new Hono<HonoEnv>();

// ─── GET /api/admin/data ─────────────────────────────
admin.get("/data", requireAdmin, async (c) => {
  const db = drizzle(c.env.DB);

  const [userCount, linkCount, pendingCount, reportRows, publicLinkRows] = await Promise.all([
    db.select({ total: count() }).from(schema.users),
    db.select({ total: count() }).from(schema.shortLinks),
    db.select({ total: count() }).from(schema.reports).where(eq(schema.reports.status, "PENDING")),
    db.select().from(schema.reports).where(eq(schema.reports.status, "PENDING"))
      .orderBy(desc(schema.reports.createdAt)).limit(50),
    db.select({ id: schema.shortLinks.id, slug: schema.shortLinks.slug, targetUrl: schema.shortLinks.targetUrl })
      .from(schema.shortLinks).where(isNull(schema.shortLinks.userId))
      .orderBy(desc(schema.shortLinks.createdAt)).limit(100),
  ]);

  // Join shortlinks to reports
  const reportWithLinks = await Promise.all(reportRows.map(async (report) => {
    if (!report.shortLinkId) return { ...report, shortLink: null };
    const linkRows = await db.select({ slug: schema.shortLinks.slug, targetUrl: schema.shortLinks.targetUrl })
      .from(schema.shortLinks).where(eq(schema.shortLinks.id, report.shortLinkId)).limit(1);
    return { ...report, shortLink: linkRows[0] ?? null };
  }));

  return c.json({
    stats: {
      totalUsers: userCount[0]?.total ?? 0,
      totalLinks: linkCount[0]?.total ?? 0,
      pendingReports: pendingCount[0]?.total ?? 0,
    },
    reports: reportWithLinks.map(r => ({
      id: r.id,
      reason: r.reason,
      details: r.details,
      shortLink: r.shortLink,
    })),
    publicLinks: publicLinkRows,
  });
});

// ─── POST /api/admin/delete (abuse token) ────────────
admin.post("/delete", async (c) => {
  const { slug, token } = await c.req.json<{ slug?: string; token?: string }>();
  if (!slug || !token) return c.json({ error: "Missing params" }, 400);

  const valid = await c.env.SESSION.get(`abuse:${slug}:${token}`);
  if (!valid) return c.json({ error: "Invalid or expired token" }, 403);

  const db = drizzle(c.env.DB);
  await db.delete(schema.shortLinks).where(eq(schema.shortLinks.slug, slug));
  await c.env.SESSION.delete(`abuse:${slug}:${token}`);

  return c.json({ success: true });
});

export default admin;
