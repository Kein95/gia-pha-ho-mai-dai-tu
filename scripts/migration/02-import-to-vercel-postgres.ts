/**
 * Phase 5 - Step 2: Import data từ JSON files vào Vercel Postgres (Drizzle).
 *
 * Prerequisites: Đã chạy 01-export-supabase-data.ts thành công.
 *
 * Usage:
 *   bun run scripts/migration/02-import-to-vercel-postgres.ts
 *
 * Idempotent: dùng onConflictDoNothing — re-run sẽ skip duplicates.
 * Để re-run với data fresh: drop tables Vercel Postgres trước rồi push schema lại.
 *
 * Order: users (gộp auth.users + profiles) → persons → person_details_private →
 *        relationships → custom_events
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { db } from "../../lib/db";
import {
  users,
  persons,
  personDetailsPrivate,
  relationships,
  customEvents,
} from "../../lib/db/schema";

const dir = "./backups/exported";

interface AuthUser {
  id: string;
  email: string;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  role: "admin" | "editor" | "member";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PersonRow {
  id: string;
  full_name: string;
  gender: "male" | "female" | "other";
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  death_lunar_year: number | null;
  death_lunar_month: number | null;
  death_lunar_day: number | null;
  is_deceased: boolean;
  is_in_law: boolean;
  birth_order: number | null;
  generation: number | null;
  other_names: string | null;
  avatar_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

function loadJson<T>(file: string): T[] {
  return JSON.parse(readFileSync(`${dir}/${file}`, "utf-8")) as T[];
}

async function main() {
  console.log("Loading exported JSON files...");
  const authUsers = loadJson<AuthUser>("auth-users.json");
  const profiles = loadJson<Profile>("profiles.json");
  const personsData = loadJson<PersonRow>("persons.json");
  const detailsPrivate = loadJson<{
    person_id: string;
    phone_number: string | null;
    occupation: string | null;
    current_residence: string | null;
    created_at: string;
    updated_at: string;
  }>("person-details-private.json");
  const relsData = loadJson<{
    id: string;
    type: "marriage" | "biological_child" | "adopted_child";
    person_a: string;
    person_b: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  }>("relationships.json");
  const eventsData = loadJson<{
    id: string;
    name: string;
    content: string | null;
    event_date: string;
    location: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>("custom-events.json");

  // 1. Merge auth.users + profiles → users
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const usersToInsert = authUsers.map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email,
      passwordHash: u.encrypted_password,
      emailVerified: u.email_confirmed_at ? new Date(u.email_confirmed_at) : null,
      role: profile?.role ?? ("member" as const),
      isActive: profile?.is_active ?? false,
      createdAt: new Date(u.created_at),
    };
  });
  if (usersToInsert.length > 0) {
    await db.insert(users).values(usersToInsert).onConflictDoNothing();
  }
  console.log(`  ✓ users: ${usersToInsert.length}`);

  // 2. Persons (snake_case → camelCase)
  const personsToInsert = personsData.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    gender: p.gender,
    birthYear: p.birth_year,
    birthMonth: p.birth_month,
    birthDay: p.birth_day,
    deathYear: p.death_year,
    deathMonth: p.death_month,
    deathDay: p.death_day,
    deathLunarYear: p.death_lunar_year,
    deathLunarMonth: p.death_lunar_month,
    deathLunarDay: p.death_lunar_day,
    isDeceased: p.is_deceased,
    isInLaw: p.is_in_law,
    birthOrder: p.birth_order,
    generation: p.generation,
    otherNames: p.other_names,
    avatarUrl: p.avatar_url,
    note: p.note,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }));
  if (personsToInsert.length > 0) {
    await db.insert(persons).values(personsToInsert).onConflictDoNothing();
  }
  console.log(`  ✓ persons: ${personsToInsert.length}`);

  // 3. person_details_private
  if (detailsPrivate.length > 0) {
    await db
      .insert(personDetailsPrivate)
      .values(
        detailsPrivate.map((d) => ({
          personId: d.person_id,
          phoneNumber: d.phone_number,
          occupation: d.occupation,
          currentResidence: d.current_residence,
          createdAt: new Date(d.created_at),
          updatedAt: new Date(d.updated_at),
        })),
      )
      .onConflictDoNothing();
  }
  console.log(`  ✓ person_details_private: ${detailsPrivate.length}`);

  // 4. relationships
  if (relsData.length > 0) {
    await db
      .insert(relationships)
      .values(
        relsData.map((r) => ({
          id: r.id,
          type: r.type,
          personA: r.person_a,
          personB: r.person_b,
          note: r.note,
          createdAt: new Date(r.created_at),
          updatedAt: new Date(r.updated_at),
        })),
      )
      .onConflictDoNothing();
  }
  console.log(`  ✓ relationships: ${relsData.length}`);

  // 5. custom_events
  if (eventsData.length > 0) {
    await db
      .insert(customEvents)
      .values(
        eventsData.map((e) => ({
          id: e.id,
          name: e.name,
          content: e.content,
          eventDate: e.event_date,
          location: e.location,
          createdBy: e.created_by,
          createdAt: new Date(e.created_at),
          updatedAt: new Date(e.updated_at),
        })),
      )
      .onConflictDoNothing();
  }
  console.log(`  ✓ custom_events: ${eventsData.length}`);

  console.log("\nImport complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
