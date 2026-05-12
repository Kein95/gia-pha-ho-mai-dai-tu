import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

// Activity logs — audit trail for all admin/editor mutations
// Dual-write: DB + Google Sheet webhook (fire-and-forget)
export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    userEmail: text("user_email").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    detail: text("detail"),
    ipAddress: text("ip_address"),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    actionIdx: index("idx_activity_logs_action").on(t.action),
    createdIdx: index("idx_activity_logs_created_at").on(t.createdAt),
    targetIdx: index("idx_activity_logs_target").on(t.targetType, t.targetId),
  }),
);
