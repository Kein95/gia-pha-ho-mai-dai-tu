import KinshipFinder from "@/components/KinshipFinder";
import { db } from "@/lib/db";
import { persons, relationships } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Relationship } from "@/types";

export const metadata = {
  title: "Tra cứu danh xưng",
};

export default async function KinshipPage() {
  const [personsRows, relsRows] = await Promise.all([
    db
      .select({
        id: persons.id,
        full_name: persons.fullName,
        gender: persons.gender,
        birth_year: persons.birthYear,
        birth_order: persons.birthOrder,
        generation: persons.generation,
        is_in_law: persons.isInLaw,
        avatar_url: persons.avatarUrl,
      })
      .from(persons)
      .orderBy(asc(persons.birthYear)),
    db
      .select({
        type: relationships.type,
        person_a: relationships.personA,
        person_b: relationships.personB,
      })
      .from(relationships),
  ]);

  const relsData = relsRows as Pick<Relationship, "type" | "person_a" | "person_b">[];

  return (
    <div className="flex-1 w-full relative flex flex-col pb-12">
      <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h1 className="title">Tra cứu danh xưng</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Chọn hai thành viên để tự động tính cách gọi theo quan hệ gia phả
        </p>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <KinshipFinder persons={personsRows} relationships={relsData} />
      </main>
    </div>
  );
}
