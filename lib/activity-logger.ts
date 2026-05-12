/**
 * Activity logger — dual-write audit trail for admin/editor mutations.
 *
 * 1. Inserts into activity_logs table (Postgres)
 * 2. POSTs to GSHEET_WEBHOOK_URL (fire-and-forget, non-blocking)
 *
 * Usage in server actions:
 *   import { logActivity } from "@/lib/activity-logger";
 *   await logActivity({ action: "UPDATE_PERSON", targetType: "person", targetId, detail });
 */

import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/permissions";

// All tracked action types
export type ActivityAction =
  | "CREATE_PERSON" | "UPDATE_PERSON" | "DELETE_PERSON"
  | "CREATE_RELATIONSHIP" | "DELETE_RELATIONSHIP"
  | "UPDATE_LINEAGE"
  | "CREATE_EVENT" | "UPDATE_EVENT" | "DELETE_EVENT"
  | "IMPORT_DATA" | "EXPORT_DATA"
  | "UPLOAD_AVATAR"
  | "USER_CREATE" | "USER_DELETE" | "USER_ROLE_CHANGE" | "USER_TOGGLE_STATUS";

interface LogActivityInput {
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  detail?: string;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const row = {
    userId: user.id,
    userEmail: user.email ?? user.name ?? "unknown",
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    detail: input.detail ?? null,
    ipAddress: null,
  };

  // DB insert — failure logged but non-blocking
  try {
    await db.insert(activityLogs).values(row);
  } catch (e) {
    console.error("[activity-logger] DB insert failed:", e);
  }

  // Google Sheet webhook — fire-and-forget
  postToGSheet(row).catch(() => {});
}

async function postToGSheet(row: Record<string, unknown>): Promise<void> {
  const url = process.env.GSHEET_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...row,
      }),
    });
  } catch {
    // intentionally swallowed
  }
}
