"use client";

import { getActivityLogs, addLogNote } from "@/app/actions/activity-log";
import { ActivityAction } from "@/lib/activity-logger";
import { MessageSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

// Action badge color mapping
const ACTION_COLORS: Record<string, string> = {
  CREATE_PERSON: "bg-emerald-100 text-emerald-800 border-emerald-200",
  UPDATE_PERSON: "bg-amber-100 text-amber-800 border-amber-200",
  DELETE_PERSON: "bg-red-100 text-red-800 border-red-200",
  CREATE_RELATIONSHIP: "bg-emerald-100 text-emerald-800 border-emerald-200",
  DELETE_RELATIONSHIP: "bg-red-100 text-red-800 border-red-200",
  UPDATE_LINEAGE: "bg-amber-100 text-amber-800 border-amber-200",
  CREATE_EVENT: "bg-emerald-100 text-emerald-800 border-emerald-200",
  UPDATE_EVENT: "bg-amber-100 text-amber-800 border-amber-200",
  DELETE_EVENT: "bg-red-100 text-red-800 border-red-200",
  IMPORT_DATA: "bg-blue-100 text-blue-800 border-blue-200",
  EXPORT_DATA: "bg-blue-100 text-blue-800 border-blue-200",
  UPLOAD_AVATAR: "bg-sky-100 text-sky-800 border-sky-200",
  USER_CREATE: "bg-purple-100 text-purple-800 border-purple-200",
  USER_DELETE: "bg-red-100 text-red-800 border-red-200",
  USER_ROLE_CHANGE: "bg-purple-100 text-purple-800 border-purple-200",
  USER_TOGGLE_STATUS: "bg-purple-100 text-purple-800 border-purple-200",
};

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "CREATE_PERSON", label: "Thêm thành viên" },
  { value: "UPDATE_PERSON", label: "Sửa thành viên" },
  { value: "DELETE_PERSON", label: "Xóa thành viên" },
  { value: "CREATE_RELATIONSHIP", label: "Thêm quan hệ" },
  { value: "DELETE_RELATIONSHIP", label: "Xóa quan hệ" },
  { value: "UPDATE_LINEAGE", label: "Cập nhật đời" },
  { value: "IMPORT_DATA", label: "Nhập dữ liệu" },
  { value: "EXPORT_DATA", label: "Xuất dữ liệu" },
  { value: "UPLOAD_AVATAR", label: "Upload ảnh" },
  { value: "USER_CREATE", label: "Tạo user" },
  { value: "USER_DELETE", label: "Xóa user" },
  { value: "USER_ROLE_CHANGE", label: "Đổi vai trò" },
  { value: "USER_TOGGLE_STATUS", label: "Đổi trạng thái" },
];

interface LogRow {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  note: string | null;
  createdAt: Date;
}

interface LogData {
  logs: LogRow[];
  total: number;
  page: number;
  pageSize: number;
}

interface Props {
  initialData: LogData;
}

export default function ActivityLogViewer({ initialData }: Props) {
  const [data, setData] = useState<LogData>(initialData);
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const result = await getActivityLogs({
          page,
          pageSize: 50,
          action: actionFilter || undefined,
          search: search || undefined,
        });
        setData(result);
      } catch (e) {
        console.error("Failed to fetch logs:", e);
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, search],
  );

  const handleFilter = () => fetchLogs(1);

  const handleAddNote = async (logId: string) => {
    const note = noteInput[logId]?.trim();
    if (!note) return;
    setSavingNote(logId);
    try {
      await addLogNote(logId, note);
      setData((prev) => ({
        ...prev,
        logs: prev.logs.map((l) => (l.id === logId ? { ...l, note } : l)),
      }));
      setNoteInput((prev) => {
        const next = { ...prev };
        delete next[logId];
        return next;
      });
    } catch (e) {
      console.error("Failed to save note:", e);
    } finally {
      setSavingNote(null);
    }
  };

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            placeholder="Tìm chi tiết..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={loading}
          className="btn-primary text-sm"
        >
          {loading ? "Đang tải..." : "Lọc"}
        </button>
      </div>

      {/* Log table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="uppercase tracking-wider border-b border-stone-200/60 bg-stone-50/50">
              <tr>
                <th className="px-4 py-3 text-stone-500 font-semibold text-xs">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-stone-500 font-semibold text-xs">
                  Người dùng
                </th>
                <th className="px-4 py-3 text-stone-500 font-semibold text-xs">
                  Hành động
                </th>
                <th className="px-4 py-3 text-stone-500 font-semibold text-xs">
                  Chi tiết
                </th>
                <th className="px-4 py-3 text-stone-500 font-semibold text-xs">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-stone-50/80 transition-colors"
                >
                  <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900 whitespace-nowrap">
                    {log.userEmail}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
                        ACTION_COLORS[log.action] ??
                        "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-stone-600 max-w-xs truncate"
                    title={log.detail ?? ""}
                  >
                    {log.detail}
                  </td>
                  <td className="px-4 py-3">
                    {log.note ? (
                      <span className="text-stone-600 text-xs">{log.note}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Thêm ghi chú..."
                          value={noteInput[log.id] ?? ""}
                          onChange={(e) =>
                            setNoteInput((prev) => ({
                              ...prev,
                              [log.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddNote(log.id)
                          }
                          className="w-28 px-2 py-1 text-xs border border-stone-200 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                          disabled={savingNote === log.id}
                        />
                        <button
                          onClick={() => handleAddNote(log.id)}
                          disabled={
                            savingNote === log.id ||
                            !noteInput[log.id]?.trim()
                          }
                          className="p-1 text-stone-400 hover:text-amber-600 disabled:opacity-30"
                          title="Lưu ghi chú"
                        >
                          <MessageSquare className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data.logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-stone-500"
                  >
                    Chưa có hoạt động nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {data.total} bản ghi — Trang {data.page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs(data.page - 1)}
              disabled={data.page <= 1 || loading}
              className="btn text-sm"
            >
              <ChevronLeft className="size-4" />
              Trước
            </button>
            <button
              onClick={() => fetchLogs(data.page + 1)}
              disabled={data.page >= totalPages || loading}
              className="btn text-sm"
            >
              Sau
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
