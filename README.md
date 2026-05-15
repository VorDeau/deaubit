# DeauBit

Self-hosted URL shortener with analytics, QR codes, and abuse reporting. Runs on Cloudflare Workers with D1 (SQLite) and KV.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (static export) |
| Backend | Hono.js on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Sessions | Cloudflare KV |
| Email | Resend API |
| Bot protection | Cloudflare Turnstile |
| Styling | Tailwind CSS v4 |

## Features

- Custom or auto-generated short slugs
- Password-protected links
- Self-destruct (expiry date)
- Click analytics (browser, OS, country, referrer)
- QR code generation
- Abuse reporting system
- Admin panel
- Dark theme, Nothing OS aesthetic

---

## Local Setup

### Prerequisites

- Node.js 20+
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account

### 1. Install dependencies

```bash
npm install
cd worker && npm install && cd ..
```

### 2. Configure environment

Create `.env.local` in the root:

```env
NEXT_PUBLIC_APP_HOST=localhost:3000
NEXT_PUBLIC_SHORT_HOST=localhost:3000
NEXT_PUBLIC_PROTOCOL=http
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### 3. Create Cloudflare resources

```bash
cd worker

# Create D1 database
npx wrangler d1 create deaubit-db
# Copy the database_id to wrangler.toml

# Create KV namespace
npx wrangler kv namespace create SESSION
# Copy the id to wrangler.toml

# Apply database migrations
npx wrangler d1 migrations apply deaubit-db --local
```

### 4. Set secrets

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RESEND_API_KEY
```

### 5. Run locally

```bash
# Terminal 1 — Next.js frontend
npm run dev

# Terminal 2 — Hono Worker
cd worker && npm run dev
```

---

## Production Deployment

### 1. Build frontend

```bash
NEXT_PUBLIC_APP_HOST=your-domain.com \
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_key \
NEXT_PUBLIC_PROTOCOL=https \
npm run build
```

### 2. Apply remote migrations

```bash
cd worker
npx wrangler d1 migrations apply deaubit-db --remote
```

### 3. Deploy

```bash
cd worker
npm run deploy
```

### 4. Setup admin account

Visit `https://your-domain.com/setup` to create the first admin account.

---

## Environment Variables Reference

### Frontend (build-time, `NEXT_PUBLIC_*`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_HOST` | Your domain (e.g. `example.com`) |
| `NEXT_PUBLIC_SHORT_HOST` | Short URL host (can be same as APP_HOST) |
| `NEXT_PUBLIC_PROTOCOL` | `https` in production |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public) |

### Worker (via `wrangler secret put`)

| Variable | Description |
|---|---|
| `JWT_SECRET` | Random string, min 32 chars |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `RESEND_API_KEY` | From resend.com dashboard |

### Worker (via `wrangler.toml [vars]`)

| Variable | Description |
|---|---|
| `APP_HOST` | Your domain |
| `SHORT_HOST` | Short URL host |
| `PROTOCOL` | `https` |
| `TURNSTILE_SITE_KEY` | Same as NEXT_PUBLIC_TURNSTILE_SITE_KEY |
| `MAIL_FROM` | Sender email address |
| `MAIL_FROM_NAME` | Sender display name |

---

## License

MIT
