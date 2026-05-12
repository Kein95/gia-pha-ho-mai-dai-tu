# Deployment Guide — Gia Phả Họ Mai Đại Từ

## Prerequisites

- [Node.js](https://nodejs.org/en) 20+
- [Bun](https://bun.sh/)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel@latest`
- Access to Vercel project (Settings → Storage → Neon Postgres + Blob)

## First-time Production Setup

### 1. Vercel + Neon + Blob

1. Tạo project trên Vercel → import repo
2. Tab **Storage** → **Neon Postgres** (Region: Singapore sin1)
3. Tab **Storage** → **Blob** (Name: `giapha-mai-avatars`, Public)

### 2. Environment Variables

Vercel → **Settings → Environment Variables** (all environments):

| Variable | Value | Notes |
|----------|-------|-------|
| `AUTH_SECRET` | `openssl rand -base64 32` | Generate random |
| `AUTH_URL` | `http://localhost:3000` | Development only |
| `SITE_NAME` | `Gia Phả Họ Mai Đại Từ` | All environments |

Tự động thêm khi connect Neon Postgres: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`.
Tự động thêm khi connect Blob: `BLOB_READ_WRITE_TOKEN`.

### 3. Pull env về local

```bash
npx vercel link
npx vercel env pull .env.local
```

### 4. Push schema

```bash
# Chỉ lần đầu (tạo tables)
bun run db:push
```

> **Sau lần đầu:** Luôn dùng `bun run db:generate` + `bun run db:migrate` để tạo migration files.

### 5. Tạo admin

Thêm vào `.env.local`:
```
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=<strong-random-password>
ADMIN_NAME=Admin
```

Chạy:
```bash
bun scripts/seed-admin.ts
```

Hoặc dùng argv (password sẽ hiện trong shell history):
```bash
bun scripts/seed-admin.ts your@email.com "password" "Admin"
```

### 6. Nạp dữ liệu gia phả

```bash
# Lần đầu (DB trống)
bun run seed:mai

# Re-seed (CÓ TRUNCATE — mất data hiện tại)
bun run seed:mai --force
```

### 7. Verify

```bash
bun run dev
# Mở http://localhost:3000 → đăng nhập với admin vừa tạo
```

### 8. Deploy

```bash
git push origin master
# Vercel tự deploy
```

Hoặc force redeploy: Vercel Dashboard → Deployments → Redeploy.

## Subsequent Deploys

Push lên `master` → Vercel auto-deploy.

Nếu cần thay đổi schema:
```bash
bun run db:generate   # Tạo migration SQL
bun run db:migrate    # Apply migration
git add . && git commit -m "feat: add migration" && git push
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Auto | Neon connection string (pooled) |
| `POSTGRES_PRISMA_URL` | Auto | Neon connection string (Prisma) |
| `POSTGRES_URL_NON_POOLING` | Auto | Neon direct connection |
| `AUTH_SECRET` | Manual | NextAuth secret key |
| `AUTH_URL` | Manual | App URL (dev: localhost:3000) |
| `SITE_NAME` | Manual | Display name |
| `BLOB_READ_WRITE_TOKEN` | Auto | Vercel Blob token |
| `ADMIN_EMAIL` | Optional | seed-admin reads from env (local only) |
| `ADMIN_PASSWORD` | Optional | seed-admin reads from env (local only) |
| `ADMIN_NAME` | Optional | seed-admin reads from env (local only) |

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| First request slow (5-10s) | Neon cold start (free plan) | Normal behavior, DB auto-resumes |
| `db:push` fails | Wrong POSTGRES_URL | Check `.env.local` has correct Neon URL |
| `seed:mai` aborts | Persons table not empty | Run with `--force` to re-seed |
| Build fails on Vercel | Node.js version mismatch | Check `engines` in package.json |
| Login fails | AUTH_SECRET mismatch | Ensure same across environments |
| Blob upload fails | Missing BLOB_READ_WRITE_TOKEN | Re-connect Blob storage in Vercel |

## Security Notes

- **Never** commit `.env.local` to git
- Generate `AUTH_SECRET` with `openssl rand -base64 32`
- Use strong admin passwords (12+ chars, mixed case, symbols)
- Rotate secrets periodically via Vercel dashboard
