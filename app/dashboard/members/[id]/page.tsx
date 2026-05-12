import DeleteMemberButton from "@/components/DeleteMemberButton";
import MemberDetailContent from "@/components/MemberDetailContent";
import { db } from "@/lib/db";
import { persons, personDetailsPrivate } from "@/lib/db/schema";
import { getProfile } from "@/lib/auth/queries";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Person } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;

  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  // Fetch person
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

  // Fetch private data for admins
  let privateData: Record<string, unknown> | null = null;
  if (isAdmin) {
    const [priv] = await db
      .select()
      .from(personDetailsPrivate)
      .where(eq(personDetailsPrivate.personId, id))
      .limit(1);
    if (priv) {
      privateData = {
        phone_number: priv.phoneNumber,
        occupation: priv.occupation,
        current_residence: priv.currentResidence,
      };
    }
  }

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="title">Chi Tiết Thành Viên</h1>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2.5">
            <Link
              href={`/dashboard/members/${id}/edit`}
              className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
            >
              Chỉnh sửa
            </Link>
            <DeleteMemberButton memberId={id} />
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <div className="bg-white/60 rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <MemberDetailContent
            person={person}
            privateData={privateData}
            isAdmin={isAdmin}
            canEdit={canEdit}
          />
        </div>
      </main>
    </div>
  );
}
