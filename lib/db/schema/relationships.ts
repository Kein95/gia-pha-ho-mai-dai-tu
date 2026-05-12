import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relationshipTypeEnum } from "./enums";
import { persons } from "./persons";

// Relationships giữa persons — marriage, biological_child, adopted_child
export const relationships = pgTable(
  "relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: relationshipTypeEnum("type").notNull(),
    personA: uuid("person_a")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    personB: uuid("person_b")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    noSelfRel: check("no_self_relationship", sql`${t.personA} != ${t.personB}`),
    uniquePair: unique("relationships_person_a_person_b_type_unique").on(
      t.personA,
      t.personB,
      t.type,
    ),
    personAIdx: index("idx_relationships_person_a").on(t.personA),
    personBIdx: index("idx_relationships_person_b").on(t.personB),
    typeIdx: index("idx_relationships_type").on(t.type),
  }),
);
