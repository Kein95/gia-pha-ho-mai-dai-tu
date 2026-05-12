import { pgEnum } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender_enum", ["male", "female", "other"]);

export const relationshipTypeEnum = pgEnum("relationship_type_enum", [
  "marriage",
  "biological_child",
  "adopted_child",
]);

export const userRoleEnum = pgEnum("user_role_enum", ["admin", "editor", "member"]);
