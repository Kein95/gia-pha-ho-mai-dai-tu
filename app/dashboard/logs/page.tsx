import ActivityLogViewer from "@/components/ActivityLogViewer";
import { getActivityLogs } from "@/app/actions/activity-log";
import { requireAdmin } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export default async function ActivityLogsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const initialData = await getActivityLogs({ page: 1, pageSize: 50 });

  return (
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col pt-8 relative w-full">
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="title">Nhật ký hoạt động</h1>
            <p className="text-stone-500 mt-2 text-sm sm:text-base">
              Theo dõi các thao tác của Quản trị viên và Biên tập viên.
            </p>
          </div>
        </div>
        <ActivityLogViewer initialData={initialData} />
      </div>
    </main>
  );
}
