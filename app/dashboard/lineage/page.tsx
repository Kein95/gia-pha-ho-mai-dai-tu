import LineageManager from "@/components/LineageManager";
import { db } from "@/lib/db";
import { persons, relationships } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";
import { asc } from "drizzle-orm";
import { Person, Relationship } from "@/types";
import { redirect } from "next/navigation";

export default async function LineagePage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [personsRows, relsRows] = await Promise.all([
    db.select().from(persons).orderBy(asc(persons.birthYear)),
    db.select().from(relationships),
  ]);

  const personsData: Person[] = personsRows.map((p) => ({
    id: p.id,
    full_name: p.fullName,
    gender: p.gender,
    birth_year: p.birthYear ?? null,
    birth_month: p.birthMonth ?? null,
    birth_day: p.birthDay ?? null,
    death_year: p.deathYear ?? null,
    death_month: p.deathMonth ?? null,
    death_day: p.deathDay ?? null,
    death_lunar_year: p.deathLunarYear ?? null,
    death_lunar_month: p.deathLunarMonth ?? null,
    death_lunar_day: p.deathLunarDay ?? null,
    is_deceased: p.isDeceased,
    is_in_law: p.isInLaw,
    birth_order: p.birthOrder ?? null,
    generation: p.generation ?? null,
    other_names: p.otherNames ?? null,
    avatar_url: p.avatarUrl ?? null,
    note: p.note ?? null,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }));

  const relationshipsData: Relationship[] = relsRows.map((r) => ({
    id: r.id,
    type: r.type,
    person_a: r.personA,
    person_b: r.personB,
    note: r.note ?? null,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  }));

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8">
          <h1 className="title">Thứ tự gia phả</h1>
          <p className="text-stone-500 mt-2 text-sm sm:text-base max-w-2xl">
            Tự động tính toán và cập nhật{" "}
            <strong className="text-stone-700">thế hệ</strong> (đời thứ mấy tính
            từ tổ) và <strong className="text-stone-700">thứ tự sinh</strong>{" "}
            (con trưởng, con thứ…) cho tất cả thành viên. Xem preview trước khi
            áp dụng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/80 rounded-2xl p-5 border border-stone-200/60 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <h3 className="font-bold text-stone-800 text-sm mb-1">
                  Thế hệ (Generation)
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Dùng thuật toán BFS từ các tổ tiên gốc (người chưa có thông
                  tin bố/mẹ trong hệ thống). Tổ tiên = Đời 1, con = Đời 2, cháu
                  = Đời 3... Con dâu/rể kế thừa đời của người bạn đời.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-5 border border-stone-200/60 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👶</span>
              <div>
                <h3 className="font-bold text-stone-800 text-sm mb-1">
                  Thứ tự sinh (Birth Order)
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Trong danh sách anh/chị/em cùng cha, sắp xếp theo năm sinh
                  tăng dần và gán số thứ tự 1, 2, 3... Con dâu/rể không được
                  tính thứ tự.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl border border-stone-200/60 shadow-sm p-5 sm:p-8">
          <LineageManager persons={personsData} relationships={relationshipsData} />
        </div>
      </div>
    </main>
  );
}
