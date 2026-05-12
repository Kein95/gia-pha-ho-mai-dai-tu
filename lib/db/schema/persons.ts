import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { genderEnum } from "./enums";

// Persons — core entity for family tree (gồm cả nam và nữ)
export const persons = pgTable(
  "persons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    gender: genderEnum("gender").notNull(),

    // Date components (allows partial dates — chỉ biết năm)
    birthYear: integer("birth_year"),
    birthMonth: integer("birth_month"),
    birthDay: integer("birth_day"),
    deathYear: integer("death_year"),
    deathMonth: integer("death_month"),
    deathDay: integer("death_day"),

    // Lunar death date (ngày giỗ âm lịch)
    deathLunarYear: integer("death_lunar_year"),
    deathLunarMonth: integer("death_lunar_month"),
    deathLunarDay: integer("death_lunar_day"),

    isDeceased: boolean("is_deceased").default(false).notNull(),
    isInLaw: boolean("is_in_law").default(false).notNull(),
    birthOrder: integer("birth_order"),
    generation: integer("generation"),
    otherNames: text("other_names"),
    avatarUrl: text("avatar_url"),
    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    fullNameIdx: index("idx_persons_full_name").on(t.fullName),
    generationIdx: index("idx_persons_generation").on(t.generation),
    genderIdx: index("idx_persons_gender").on(t.gender),
    isDeceasedIdx: index("idx_persons_is_deceased").on(t.isDeceased),
    birthYearIdx: index("idx_persons_birth_year").on(t.birthYear),
  }),
);

// Private details — chỉ admin xem được (qua app-level check)
export const personDetailsPrivate = pgTable("person_details_private", {
  personId: uuid("person_id")
    .primaryKey()
    .references(() => persons.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number"),
  occupation: text("occupation"),
  currentResidence: text("current_residence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
