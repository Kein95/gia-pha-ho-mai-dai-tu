"use server";

import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/permissions";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** Fetch activity logs with pagination and filters */
export async function getActivityLogs(params: {
  page?: number;
  pageSize?: number;
  action?: string;
  userId?: string;
  search?: string;
}) {
  await requireAdmin();

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 100);
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (params.action) conditions.push(eq(activityLogs.action, params.action));
  if (params.userId) conditions.push(eq(activityLogs.userId, params.userId));
  if (params.search) {
    conditions.push(ilike(activityLogs.detail, `%${params.search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(activityLogs)
      .where(where)
      .orderBy(desc(activityLogs.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(activityLogs)
      .where(where),
  ]);

  return {
    logs: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
  };
}

/** Admin adds a note to a log entry */
export async function addLogNote(logId: string, note: string) {
  await requireAdmin();

  await db
    .update(activityLogs)
    .set({ note })
    .where(eq(activityLogs.id, logId));

  revalidatePath("/dashboard/logs");
  return { success: true };
}
