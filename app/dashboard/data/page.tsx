import DataImportExport from "@/components/DataImportExport";
import { requireAdmin } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export default async function DataManagementPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="title">Sao lưu & Phục hồi</h1>
            <p className="text-stone-500 mt-2 text-sm sm:text-base max-w-2xl">
              Quản lý dữ liệu an toàn. Bạn có thể tải xuống bản sao lưu để lưu
              trữ hoặc phục hồi lại dữ liệu từ file đã lưu. Tính năng này chỉ
              dành cho Quản trị viên.
            </p>
          </div>
        </div>

        <DataImportExport />
      </div>
    </main>
  );
}
