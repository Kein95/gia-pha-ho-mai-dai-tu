"use server";

import {
  getAdminUsers,
  setUserRole,
  deleteUser as _deleteUser,
  adminCreateUser as _adminCreateUser,
  setUserActiveStatus,
} from "@/lib/auth/admin-actions";
import { UserRole } from "@/types";
import { revalidatePath } from "next/cache";

export async function listAdminUsers() {
  return getAdminUsers();
}

export async function changeUserRole(userId: string, newRole: UserRole) {
  try {
    await setUserRole(userId, newRole);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e) {
    console.error("Failed to change user role:", e);
    return { error: (e as Error).message ?? "Không thể thay đổi vai trò." };
  }
}

export async function deleteUser(userId: string) {
  try {
    await _deleteUser(userId);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete user:", e);
    return { error: (e as Error).message ?? "Không thể xoá người dùng." };
  }
}

export async function adminCreateUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = (formData.get("role")?.toString() ?? "member") as UserRole;
  const isActiveStr = formData.get("is_active")?.toString();
  const isActive = isActiveStr !== "false";

  if (!email || !password) {
    return { error: "Email và mật khẩu là bắt buộc." };
  }
  if (role !== "admin" && role !== "editor" && role !== "member") {
    return { error: "Vai trò không hợp lệ." };
  }

  try {
    await _adminCreateUser({ email, password, role, isActive });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e) {
    console.error("Failed to create user:", e);
    return { error: (e as Error).message ?? "Không thể tạo người dùng." };
  }
}

export async function toggleUserStatus(userId: string, newStatus: boolean) {
  try {
    await setUserActiveStatus(userId, newStatus);
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (e) {
    console.error("Failed to change user status:", e);
    return { error: (e as Error).message ?? "Không thể thay đổi trạng thái." };
  }
}
