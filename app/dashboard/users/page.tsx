import AdminUserList from "@/components/AdminUserList";
import { getAdminUsers } from "@/lib/auth/admin-actions";
import { requireAdmin } from "@/lib/auth/permissions";
import { getUser } from "@/lib/auth/queries";
import { AdminUserData } from "@/types";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const currentUser = await getUser();

  let users: AdminUserData[] = [];
  try {
    const rows = await getAdminUsers();
    users = rows.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      is_active: u.isActive,
      created_at: u.createdAt instanceof Date
        ? u.createdAt.toISOString()
        : String(u.createdAt),
    }));
  } catch (e) {
    console.error("Error fetching users:", e);
  }

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="title">Quản lý Người dùng</h1>
            <p className="text-stone-500 mt-2 text-sm sm:text-base">
              Danh sách các tài khoản đang tham gia vào hệ thống.
            </p>
          </div>
        </div>
        <AdminUserList
          initialUsers={users}
          currentUserId={currentUser?.id ?? ""}
        />
      </div>
    </main>
  );
}
