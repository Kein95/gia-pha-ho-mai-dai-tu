"use server";

import { db } from "@/lib/db";
import { persons, relationships } from "@/lib/db/schema";
import { requireEditor } from "@/lib/auth/permissions";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteMemberProfile(memberId: string) {
  await requireEditor();

  // Check for existing relationships first (FK constraint guard)
  const existingRels = await db
    .select({ id: relationships.id })
    .from(relationships)
    .where(
      or(eq(relationships.personA, memberId), eq(relationships.personB, memberId)),
    )
    .limit(1);

  if (existingRels.length > 0) {
    return {
      error:
        "Không thể xoá. Vui lòng xoá hết các mối quan hệ gia đình của người này trước.",
    };
  }

  try {
    await db.delete(persons).where(eq(persons.id, memberId));
  } catch (e) {
    console.error("Error deleting person:", e);
    return { error: "Đã xảy ra lỗi khi xoá hồ sơ." };
  }

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
