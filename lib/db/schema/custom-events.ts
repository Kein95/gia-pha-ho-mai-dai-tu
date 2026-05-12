import { pgTable, uuid, text, date, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Custom events — user-created events (giỗ chạp, sự kiện gia đình)
export const customEvents = pgTable(
  "custom_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    content: text("content"),
    eventDate: date("event_date").notNull(),
    location: text("location"),
    createdBy: text("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    dateIdx: index("idx_custom_events_date").on(t.eventDate),
    createdByIdx: index("idx_custom_events_created_by").on(t.createdBy),
  }),
);
