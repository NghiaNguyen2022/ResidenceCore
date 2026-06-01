import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LiturgyStatus = "completed" | "incomplete" | "excused";

type LiturgyAttendanceRecord = {
  id: number;
  residentId: number;
  residentName: string;
  residentCode: string;
  weekName: string;
  requiredCount: number;
  attendedMassCount: number;
  attendedPrayerCount: number;
  excusedCount: number;
  status: LiturgyStatus;
  note?: string;
  updatedAt: string;
};

type AttendanceFormData = {
  residentId: string;
  weekName: string;
  requiredCount: string;
  attendedMassCount: string;
  attendedPrayerCount: string;
  excusedCount: string;
  note: string;
};

const initialRecords: LiturgyAttendanceRecord[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    weekName: "Tuần 01",
    requiredCount: 3,
    attendedMassCount: 1,
    attendedPrayerCount: 1,
    excusedCount: 0,
    status: "incomplete",
    note: "Còn thiếu 1 buổi.",
    updatedAt: "2026-09-13",
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    weekName: "Tuần 01",
    requiredCount: 3,
    attendedMassCount: 1,
    attendedPrayerCount: 2,
    excusedCount: 0,
    status: "completed",
    note: "Hoàn thành đủ số buổi.",
    updatedAt: "2026-09-13",
  },
  {
    id: 3,
    residentId: 3,
    residentName: "Lê Minh C",
    residentCode: "HV0003",
    weekName: "Tuần 01",
    requiredCount: 3,
    attendedMassCount: 1,
    attendedPrayerCount: 1,
    excusedCount: 1,
    status: "excused",
    note: "Có phép 1 buổi.",
    updatedAt: "2026-09-13",
  },
];

const defaultFormData: AttendanceFormData = {
  residentId: "",
  weekName: "Tuần 01",
  requiredCount: "3",
  attendedMassCount: "0",
  attendedPrayerCount: "0",
  excusedCount: "0",
  note: "",
};

function calculateStatus({
  requiredCount,
  attendedMassCount,
  attendedPrayerCount,
  excusedCount,
}: {
  requiredCount: number;
  attendedMassCount: number;
  attendedPrayerCount: number;
  excusedCount: number;
}): LiturgyStatus {
  const totalValid = attendedMassCount + attendedPrayerCount + excusedCount;

  if (totalValid >= requiredCount && excusedCount > 0) {
    return "excused";
  }

  if (totalValid >= requiredCount) {
    return "completed";
  }

  return "incomplete";
}

function getStatusLabel(status: LiturgyStatus) {
  if (status === "completed") return "Hoàn thành";
  if (status === "excused") return "Có phép";
  return "Chưa hoàn thành";
}

function getStatusClass(status: LiturgyStatus) {
  if (status === "completed") {
    return "bg-green-50 text-green-700";
  }

  if (status === "excused") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-red-50 text-red-700";
}

function formatDate(date?: string) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return "-";
  }
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function LiturgyAttendance() {
  const [records, setRecords] =
    useState<LiturgyAttendanceRecord[]>(initialRecords);

  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<LiturgyAttendanceRecord | null>(null);
  const [formData, setFormData] =
    useState<AttendanceFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Đi lễ / Kinh tối hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const weeks = useMemo(() => {
    return Array.from(new Set(records.map((item) => item.weekName)));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        item.weekName.toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword);

      const matchesWeek = weekFilter === "all" || item.weekName === weekFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesWeek && matchesStatus;
    });
  }, [records, searchTerm, weekFilter, statusFilter]);

  const completedCount = records.filter(
    (item) => item.status === "completed"
  ).length;

  const incompleteCount = records.filter(
    (item) => item.status === "incomplete"
  ).length;

  const excusedCount = records.filter((item) => item.status === "excused").length;

  const averageCompletion = useMemo(() => {
    if (records.length === 0) return 0;

    const totalPercent = records.reduce((sum, item) => {
      const totalValid =
        item.attendedMassCount + item.attendedPrayerCount + item.excusedCount;

      const percent =
        item.requiredCount > 0
          ? Math.min((totalValid / item.requiredCount) * 100, 100)
          : 0;

      return sum + percent;
    }, 0);

    return Math.round(totalPercent / records.length);
  }, [records]);

  const openCreateForm = () => {
    setEditingRecord(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (record: LiturgyAttendanceRecord) => {
    setEditingRecord(record);

    setFormData({
      residentId: String(record.residentId),
      weekName: record.weekName,
      requiredCount: String(record.requiredCount),
      attendedMassCount: String(record.attendedMassCount),
      attendedPrayerCount: String(record.attendedPrayerCount),
      excusedCount: String(record.excusedCount),
      note: record.note || "",
    });

    setIsFormOpen(true);
  };

  const handleSave = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === formData.residentId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên từ danh sách.");
      return;
    }

    const residentId = selectedResident.id;
    const residentName = selectedResident.fullName || "-";
    const residentCode =
      selectedResident.residentCode || `ID: ${selectedResident.id}`;

    const requiredCount = Number(formData.requiredCount || 0);
    const attendedMassCount = Number(formData.attendedMassCount || 0);
    const attendedPrayerCount = Number(formData.attendedPrayerCount || 0);
    const excusedCount = Number(formData.excusedCount || 0);

    const status = calculateStatus({
      requiredCount,
      attendedMassCount,
      attendedPrayerCount,
      excusedCount,
    });

    const duplicated = records.some(
      (item) =>
        item.residentId === residentId &&
        item.weekName === formData.weekName &&
        item.id !== editingRecord?.id
    );

    if (duplicated) {
      alert(
        "Học viên này đã có theo dõi phụng vụ trong tuần đã chọn. Vui lòng sửa dòng hiện có thay vì tạo mới."
      );
      return;
    }

    if (editingRecord) {
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id
            ? {
                ...item,
                residentId,
                residentName,
                residentCode,
                weekName: formData.weekName,
                requiredCount,
                attendedMassCount,
                attendedPrayerCount,
                excusedCount,
                status,
                note: formData.note,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } else {
      const newRecord: LiturgyAttendanceRecord = {
        id: Date.now(),
        residentId,
        residentName,
        residentCode,
        weekName: formData.weekName,
        requiredCount,
        attendedMassCount,
        attendedPrayerCount,
        excusedCount,
        status,
        note: formData.note,
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setRecords((prev) => [newRecord, ...prev]);
    }

    setIsFormOpen(false);
    setEditingRecord(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa theo dõi đi lễ / kinh tối này khỏi UI mock?"
      )
    ) {
      return;
    }

    setRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMarkCompleted = (record: LiturgyAttendanceRecord) => {
    const missing = Math.max(
      record.requiredCount -
        (record.attendedMassCount +
          record.attendedPrayerCount +
          record.excusedCount),
      0
    );

    setRecords((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              attendedPrayerCount: item.attendedPrayerCount + missing,
              status: "completed",
              note: item.note || "Đã đánh dấu hoàn thành từ thao tác nhanh.",
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
  };

  const handleMarkExcused = (record: LiturgyAttendanceRecord) => {
    const missing = Math.max(
      record.requiredCount -
        (record.attendedMassCount +
          record.attendedPrayerCount +
          record.excusedCount),
      0
    );

    setRecords((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              excusedCount: item.excusedCount + missing,
              status: "excused",
              note: item.note || "Đã ghi nhận có phép từ thao tác nhanh.",
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setWeekFilter("all");
    setStatusFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Phụng vụ & Cộng đoàn
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Đi lễ / Kinh tối
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Theo dõi việc tham gia Thánh lễ, kinh tối và các sinh hoạt phụng
              vụ theo tuần. Một học viên có một dòng theo dõi cho mỗi tuần.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm theo dõi
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho đi lễ / kinh tối - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Dữ
                liệu theo dõi phụng vụ hiện chỉ lưu trong state mock trên UI,
                chưa ghi database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">liturgyAttendance</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Học viên"
            value={members.length}
            description="Lấy từ API members.list"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Hoàn thành"
            value={completedCount}
            description="Đủ số buổi yêu cầu"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Chưa hoàn thành"
            value={incompleteCount}
            description="Cần theo dõi / nhắc nhở"
            icon={<Clock className="h-5 w-5" />}
          />

          <StatCard
            label="Tỷ lệ hoàn thành"
            value={`${averageCompletion}%`}
            description="Tính trên dữ liệu mock hiện tại"
            icon={<UserCheck className="h-5 w-5" />}
          />
        </div>

        {/* Mapping */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Theo dõi đi lễ mỗi tuần.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Theo dõi kinh tối và các sinh hoạt cầu nguyện.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Đánh dấu hoàn thành, chưa hoàn thành hoặc có phép.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quản lý số buổi yêu cầu mỗi tuần, ví dụ 2-3 buổi.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Danh sách học viên: <b>trpc.members.list</b> - đã connect.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>liturgyAttendance</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>liturgySchedules</b> để lấy số buổi yêu
                cầu trong tuần.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quan hệ dữ liệu: <b>residents 1 - n liturgyAttendance</b>.
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, mã học viên, tuần, ghi chú..."
                className="pl-10"
              />
            </div>

            <select
              value={weekFilter}
              onChange={(event) => setWeekFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả tuần</option>
              {weeks.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="incomplete">Chưa hoàn thành</option>
              <option value="excused">Có phép</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        {/* Attendance table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách theo dõi phụng vụ
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredRecords.length} dòng đang hiển thị. Dữ liệu hiện là
                mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Tuần
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Yêu cầu
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Đã tham gia
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Có phép
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ghi chú
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredRecords.map((item) => {
                  const attendedTotal =
                    item.attendedMassCount + item.attendedPrayerCount;

                  return (
                    <tr key={item.id} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-900">
                          {item.residentName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {item.residentCode}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {item.weekName}
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {item.requiredCount} buổi
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <div>
                          <p>{attendedTotal} buổi</p>
                          <p className="text-xs text-neutral-500">
                            Lễ: {item.attendedMassCount}, Kinh:{" "}
                            {item.attendedPrayerCount}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        {item.excusedCount} buổi
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-700">
                        <div className="max-w-xs truncate">
                          {item.note || "-"}
                        </div>
                        <p className="mt-1 text-xs text-neutral-400">
                          Cập nhật: {formatDate(item.updatedAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "incomplete" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMarkCompleted(item)}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                              >
                                Hoàn thành
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMarkExcused(item)}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                              >
                                Có phép
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa theo dõi"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Xóa theo dõi mock"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có dữ liệu theo dõi phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <LiturgyAttendanceFormModal
            title={
              editingRecord
                ? "Chỉnh sửa theo dõi phụng vụ"
                : "Thêm theo dõi phụng vụ"
            }
            formData={formData}
            setFormData={setFormData}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingRecord(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function LiturgyAttendanceFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: AttendanceFormData;
  setFormData: React.Dispatch<React.SetStateAction<AttendanceFormData>>;
  members: any[];
  membersLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Chọn học viên từ danh sách thật. Dữ liệu phụng vụ hiện chỉ lưu
              mock trên UI, chưa ghi database.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-5 p-6"
        >
          <div>
            <Label htmlFor="residentId">Chọn học viên *</Label>
            <select
              id="residentId"
              value={formData.residentId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  residentId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">
                {membersLoading
                  ? "Đang tải danh sách học viên..."
                  : "-- Chọn học viên --"}
              </option>

              {members.map((member: any) => (
                <option key={member.id} value={String(member.id)}>
                  {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="weekName">Tuần *</Label>
            <Input
              id="weekName"
              value={formData.weekName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  weekName: event.target.value,
                })
              }
              placeholder="VD: Tuần 01"
              required
            />
          </div>

          <div>
            <Label htmlFor="requiredCount">Số buổi yêu cầu / tuần *</Label>
            <Input
              id="requiredCount"
              type="number"
              min="0"
              value={formData.requiredCount}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  requiredCount: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="attendedMassCount">Số buổi Thánh lễ</Label>
              <Input
                id="attendedMassCount"
                type="number"
                min="0"
                value={formData.attendedMassCount}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    attendedMassCount: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="attendedPrayerCount">Số buổi kinh tối</Label>
              <Input
                id="attendedPrayerCount"
                type="number"
                min="0"
                value={formData.attendedPrayerCount}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    attendedPrayerCount: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="excusedCount">Số buổi có phép</Label>
              <Input
                id="excusedCount"
                type="number"
                min="0"
                value={formData.excusedCount}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    excusedCount: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  note: event.target.value,
                })
              }
              placeholder="VD: Có phép, cần nhắc nhở, đã bổ sung..."
              className="min-h-24"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Lưu mock UI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}