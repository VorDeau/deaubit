# DeauBit Utility

DeauBit adalah aplikasi URL shortener self-hosted yang dirancang dengan fokus pada privasi, keamanan infrastruktur, dan desain minimalis. Aplikasi ini memungkinkan pengguna untuk mengelola tautan pendek dengan sistem autentikasi mandiri dan analitik real-time.

## Fitur Utama

- **Shortening**: Pembuatan tautan pendek kustom atau acak dengan opsi perlindungan kata sandi dan tanggal kadaluarsa.
- **Global Security Gate**: Proteksi infrastruktur menggunakan Cloudflare Turnstile interstitial (SYS.CHECK) untuk mencegah akses bot secara menyeluruh.
- **Dashboard & Management**: Antarmuka manajemen tautan dengan sistem "Link Capsules" yang informatif.
- **Analytics**: Statistik kunjungan real-time mencakup data Browser, OS, Lokasi (GeoIP), dan Referrer.
- **QR Code**: Pembuatan kode QR dinamis untuk setiap tautan yang dibuat.
- **Admin Control**: Panel khusus untuk mengelola laporan penyalahgunaan (abuse reports) dan memantau statistik global sistem.
- **Session Security**: Manajemen sesi berbasis Redis dengan rotasi token otomatis untuk keamanan tingkat tinggi.

## Stack Teknologi

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Runtime**: Node.js v22
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache & Session**: Redis
- **Security**: Cloudflare Turnstile
- **Styling**: Tailwind CSS v4
- **Fonts**: DotGothic16 & Inter

## Informasi Environment

Aplikasi ini menggunakan beberapa variabel lingkungan kritis untuk operasionalnya:
- `DATABASE_URL`: Koneksi ke database PostgreSQL.
- `REDIS_URL`: Koneksi ke server Redis untuk manajemen sesi.
- `JWT_SECRET`: Kunci rahasia untuk penandatanganan token sesi.
- `CRON_SECRET`: Token otorisasi untuk endpoint pembersihan otomatis (/api/cron/cleanup).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY`: Kredibilitas Cloudflare Turnstile.
- `SMTP_*`: Konfigurasi server email untuk layanan OTP dan pemulihan akun.

---
Powered by VorDeau © 2026.
