import MemberForm from "@/components/MemberForm";
import { db } from "@/lib/db";
import { persons, personDetailsPrivate } from "@/lib/db/schema";
import { getProfile } from "@/lib/auth/queries";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Person } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  const { id } = await params;

  const profile = await getProfile();
  const canEdit = profile?.role === "admin" || profile?.role === "editor";
  const isAdmin = profile?.role === "admin";

  if (!canEdit) {
    redirect("/dashboard");
  }

  // Fetch public person data
  const [row] = await db
    .select()
    .from(persons)
    .where(eq(persons.id, id))
    .limit(1);

  if (!row) notFound();

  const person: Person = {
    id: row.id,
    full_name: row.fullName,
    gender: row.gender,
    birth_year: row.birthYear ?? null,
    birth_month: row.birthMonth ?? null,
    birth_day: row.birthDay ?? null,
    death_year: row.deathYear ?? null,
    death_month: row.deathMonth ?? null,
    death_day: row.deathDay ?? null,
    death_lunar_year: row.deathLunarYear ?? null,
    death_lunar_month: row.deathLunarMonth ?? null,
    death_lunar_day: row.deathLunarDay ?? null,
    is_deceased: row.isDeceased,
    is_in_law: row.isInLaw,
    birth_order: row.birthOrder ?? null,
    generation: row.generation ?? null,
    other_names: row.otherNames ?? null,
    avatar_url: row.avatarUrl ?? null,
    note: row.note ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };

  // Fetch private data for admin
  let privateFields: {
    phone_number?: string | null;
    occupation?: string | null;
    current_residence?: string | null;
  } = {};

  if (isAdmin) {
    const [priv] = await db
      .select()
      .from(personDetailsPrivate)
      .where(eq(personDetailsPrivate.personId, id))
      .limit(1);
    if (priv) {
      privateFields = {
        phone_number: priv.phoneNumber,
        occupation: priv.occupation,
        current_residence: priv.currentResidence,
      };
    }
  }

  const initialData = { ...person, ...privateFields };

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/members/${id}`}
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại chi tiết"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="title">Chỉnh Sửa Thành Viên</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <MemberForm initialData={initialData} isEditing={true} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
