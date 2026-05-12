# Migration Runbook — Supabase → Vercel + Neon

## Prerequisites

- Phases 1-4 đã hoàn tất
- `.env.local` có:
  - `POSTGRES_URL` (Vercel Postgres - đích)
  - `BLOB_READ_WRITE_TOKEN` (Vercel Blob - đích)
  - `SUPABASE_DB_URL` (Supabase Postgres - nguồn) ⚠️ cần add manual

## Lấy SUPABASE_DB_URL

1. Đăng nhập Supabase Dashboard
2. Project Settings → Database → Connection String
3. Chọn tab **URI**, scheme **Direct connection** (KHÔNG dùng pooled qua port 6543)
4. Copy connection string (dạng `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` với DB password thực
6. Add vào `.env.local`: `SUPABASE_DB_URL="postgresql://..."`

## Steps

### Step 1: Backup Supabase

```bash
# Cài pg_dump nếu chưa có (Postgres client tools)
pg_dump "$SUPABASE_DB_URL" --schema=public --schema=auth --no-owner --no-privileges -f backups/supabase-backup-$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Export data sang JSON

```bash
bun run scripts/migration/01-export-supabase-data.ts
```

Output: `backups/exported/*.json` (6 files)

### Step 3: Import vào Vercel Postgres

```bash
bun run scripts/migration/02-import-to-vercel-postgres.ts
```

⚠️ Sẽ insert vào tables hiện có. Re-run với fresh data: drop tables Vercel Postgres trước (`bun run db:push --force` sau khi xoá schema), rồi chạy lại.

### Step 4: Migrate avatars

```bash
bun run scripts/migration/03-migrate-avatars.ts
```

### Step 5: Verify

```bash
bun run scripts/verify-schema.ts
```

Mở Drizzle Studio:
```bash
bun run db:studio
```

So row count Supabase vs Vercel Postgres.

## Rollback

Nếu fail mid-migration trên Vercel Postgres:
1. Drop tables: `bun run db:push --force` sau khi xoá schema files (hoặc qua psql)
2. Push schema lại: `bun run db:push --force`
3. Chạy lại từ Step 2

Supabase data KHÔNG bị động vào — backup vẫn còn.

## Decommission Supabase (sau Phase 6 + 7 ngày stable)

Pause project Supabase trong dashboard (giữ 30 ngày grace).
