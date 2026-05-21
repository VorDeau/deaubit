import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id:        integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email:     text("email").notNull().unique(),
  name:      text("name"),
  role:      text("role").notNull().default("USER"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const shortLinks = sqliteTable("short_links", {
  id:        integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  slug:      text("slug").notNull().unique(),
  targetUrl: text("target_url").notNull(),
  password:  text("password"),
  expiresAt: text("expires_at"),
  userId:    integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const clicks = sqliteTable("clicks", {
  id:          integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  shortLinkId: integer("short_link_id").notNull().references(() => shortLinks.id, { onDelete: "cascade" }),
  browser:     text("browser"),
  os:          text("os"),
  device:      text("device"),
  country:     text("country"),
  city:        text("city"),
  ip:          text("ip"),
  referrer:    text("referrer"),
  clickedAt:   text("clicked_at").notNull().default(sql`(datetime('now'))`),
});

export const reports = sqliteTable("reports", {
  id:          integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  shortLinkId: integer("short_link_id").references(() => shortLinks.id, { onDelete: "set null" }),
  reason:      text("reason").notNull(),
  details:     text("details"),
  contact:     text("contact"),
  status:      text("status").notNull().default("PENDING"),
  createdAt:   text("created_at").notNull().default(sql`(datetime('now'))`),
});

export type User      = typeof users.$inferSelect;
export type ShortLink = typeof shortLinks.$inferSelect;
export type Click     = typeof clicks.$inferSelect;
export type Report    = typeof reports.$inferSelect;
