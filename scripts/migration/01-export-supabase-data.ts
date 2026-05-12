/**
 * Phase 5 - Step 1: Export data từ Supabase Postgres về JSON files.
 *
 * Usage:
 *   1. Lấy SUPABASE_DB_URL từ Supabase Dashboard → Project Settings → Database → Connection String (Direct, không pgbouncer)
 *   2. Add vào .env.local: SUPABASE_DB_URL="postgresql://postgres:..."
 *   3. Chạy: bun run scripts/migration/01-export-supabase-data.ts
 *
 * Output: backups/exported/*.json (auth-users, profiles, persons, person-details-private,
 *         relationships, custom-events)
 *
 * Idempotent — chạy lại sẽ overwrite files cũ.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "pg";
import { writeFileSync, mkdirSync } from "fs";

const supabaseUrl = process.env.SUPABASE_DB_URL;
if (!supabaseUrl) {
  console.error("Missing SUPABASE_DB_URL in .env.local");
  console.error(
    "Lấy từ: Supabase Dashboard → Project Settings → Database → Connection String",
  );
  process.exit(1);
}

const outDir = "./backups/exported";
mkdirSync(outDir, { recursive: true });

const tables: { sql: string; file: string; label: string }[] = [
  {
    label: "auth.users (cho password hash)",
    sql: "SELECT id, email, encrypted_password, email_confirmed_at, created_at FROM auth.users",
    file: "auth-users.json",
  },
  { label: "profiles", sql: "SELECT * FROM public.profiles", file: "profiles.json" },
  { label: "persons", sql: "SELECT * FROM public.persons", file: "persons.json" },
  {
    label: "person_details_private",
    sql: "SELECT * FROM public.person_details_private",
    file: "person-details-private.json",
  },
  {
    label: "relationships",
    sql: "SELECT * FROM public.relationships",
    file: "relationships.json",
  },
  {
    label: "custom_events",
    sql: "SELECT * FROM public.custom_events",
    file: "custom-events.json",
  },
];

async function main() {
  const client = new Client({ connectionString: supabaseUrl });
  await client.connect();
  console.log("Connected to Supabase Postgres\n");

  for (const t of tables) {
    try {
      const { rows } = await client.query(t.sql);
      writeFileSync(`${outDir}/${t.file}`, JSON.stringify(rows, null, 2));
      console.log(`  ✓ ${t.label}: ${rows.length} rows → ${t.file}`);
    } catch (e) {
      console.error(`  ✗ ${t.label}: ${(e as Error).message}`);
    }
  }

  await client.end();
  console.log(`\nExport complete. Files trong: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
