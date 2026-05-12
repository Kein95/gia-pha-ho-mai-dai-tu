/**
 * CLI script: create or promote a user to admin with is_active=true.
 *
 * Usage:
 *   bun scripts/seed-admin.ts <email> <password> [name]
 *
 * Reads DB connection from .env.local (POSTGRES_URL).
 * If the email already exists, updates role→admin and is_active→true.
 * If it does not exist, inserts a new user.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const db = drizzle(sql, { schema: { users } });

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: bun scripts/seed-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user already exists
  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    // Update existing user to admin + active
    await db
      .update(users)
      .set({
        role: "admin",
        isActive: true,
        passwordHash,
        ...(name ? { name } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    console.log(`Updated existing user "${email}" → role=admin, is_active=true`);
  } else {
    // Insert new admin user
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email,
      name: name ?? email,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log(`Created new admin user "${email}" (id: ${id})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("seed-admin failed:", err);
  process.exit(1);
});
