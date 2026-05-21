-- DeauBit D1 Schema (SQLite)
-- Apply with: wrangler d1 migrations apply deaubit-db

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  name        TEXT,
  role        TEXT    NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  verified_at TEXT,
  otp_secret      TEXT,
  otp_expires_at  TEXT,
  reset_token       TEXT,
  reset_token_expiry TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS short_links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  target_url  TEXT    NOT NULL,
  password    TEXT,
  expires_at  TEXT,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);
CREATE INDEX IF NOT EXISTS idx_short_links_user_id ON short_links(user_id);

CREATE TABLE IF NOT EXISTS clicks (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  short_link_id  INTEGER NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
  browser        TEXT,
  os             TEXT,
  device         TEXT,
  country        TEXT,
  city           TEXT,
  ip             TEXT,
  referrer       TEXT,
  clicked_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clicks_short_link_id ON clicks(short_link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);

CREATE TABLE IF NOT EXISTS reports (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  short_link_id  INTEGER REFERENCES short_links(id) ON DELETE SET NULL,
  reason         TEXT    NOT NULL,
  details        TEXT,
  contact        TEXT,
  status         TEXT    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','RESOLVED','IGNORED')),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
