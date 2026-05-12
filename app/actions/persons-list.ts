"use server";

import { db } from "@/lib/db";
import { persons } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Person } from "@/types";

/** Lightweight persons list for client-side selectors (e.g. DataImportExport root picker) */
export async function getPersonsList(): Promise<
  Pick<Person, "id" | "full_name" | "birth_year" | "gender" | "avatar_url" | "generation">[]
> {
  const rows = await db
    .select({
      id: persons.id,
      fullName: persons.fullName,
      birthYear: persons.birthYear,
      gender: persons.gender,
      avatarUrl: persons.avatarUrl,
      generation: persons.generation,
    })
    .from(persons)
    .orderBy(asc(persons.birthYear));

  return rows.map((p) => ({
    id: p.id,
    full_name: p.fullName,
    birth_year: p.birthYear ?? null,
    gender: p.gender,
    avatar_url: p.avatarUrl ?? null,
    generation: p.generation ?? null,
  }));
}
