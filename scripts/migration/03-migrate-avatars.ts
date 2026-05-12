/**
 * Phase 5 - Step 3: Migrate avatars Supabase Storage → Vercel Blob.
 *
 * Prerequisites: Đã chạy import data thành công (persons có avatar_url Supabase).
 *
 * Usage:
 *   bun run scripts/migration/03-migrate-avatars.ts
 *
 * Tìm tất cả persons có avatarUrl chứa "supabase.co/storage/" → download → upload Vercel Blob → update avatarUrl.
 * Idempotent: skip persons đã có avatar trên Vercel Blob.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "../../lib/db";
import { persons } from "../../lib/db/schema";

const SUPABASE_HOST_FRAGMENT = ".supabase.co/storage/v1/object/public/";

async function main() {
  const all = await db.select().from(persons);
  const toMigrate = all.filter(
    (p) => p.avatarUrl && p.avatarUrl.includes(SUPABASE_HOST_FRAGMENT),
  );

  console.log(`Found ${toMigrate.length} avatars to migrate (of ${all.length} persons total)`);

  let success = 0;
  let failed = 0;

  for (const person of toMigrate) {
    try {
      const res = await fetch(person.avatarUrl!);
      if (!res.ok) {
        console.warn(`  ⚠ ${person.fullName}: download failed (${res.status})`);
        failed++;
        continue;
      }

      const blob = await res.blob();
      const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const filename = `avatars/${person.id}.${ext}`;

      const uploaded = await put(filename, blob, {
        access: "public",
        contentType: blob.type,
        allowOverwrite: true,
      });

      await db.update(persons).set({ avatarUrl: uploaded.url }).where(eq(persons.id, person.id));
      console.log(`  ✓ ${person.fullName} → ${uploaded.url.substring(0, 60)}...`);
      success++;
    } catch (e) {
      console.error(`  ✗ ${person.fullName}: ${(e as Error).message}`);
      failed++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
