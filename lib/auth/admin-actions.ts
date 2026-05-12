"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "./permissions";

// Replaces RPC: get_admin_users
export async function getAdminUsers() {
  await requireAdmin();
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

// Replaces RPC: set_user_role
export async function setUserRole(
  targetUserId: string,
  newRole: "admin" | "editor" | "member",
) {
  await requireAdmin();
  await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId));
}

// Replaces RPC: delete_user
export async function deleteUser(targetUserId: string) {
  const admin = await requireAdmin();
  if (admin.id === targetUserId) {
    throw new Error("Cannot delete yourself");
  }
  await db.delete(users).where(eq(users.id, targetUserId));
}

// Replaces RPC: admin_create_user
export async function adminCreateUser(input: {
  email: string;
  password: string;
  role: "admin" | "editor" | "member";
  isActive: boolean;
}) {
  await requireAdmin();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role,
      isActive: input.isActive,
      emailVerified: new Date(),
    })
    .returning({ id: users.id });
  return user.id;
}

// Replaces RPC: set_user_active_status
export async function setUserActiveStatus(
  targetUserId: string,
  isActive: boolean,
) {
  await requireAdmin();
  await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, targetUserId));
}
