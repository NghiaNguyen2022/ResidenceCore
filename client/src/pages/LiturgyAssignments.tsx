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

type AssignmentStatus = "pending" | "in_progress" | "completed";

type AssignmentType =
  | "reader"
  | "choir"
  | "altar_preparation"
  | "evening_prayer_lead"
  | "general";

type LiturgyAssignment = {
  id: number;
  weekName: string;
  date: string;
  assignmentType: AssignmentType;
  taskName: string;
  residentId?: number;
  residentName?: string;
  residentCode?: string;
  groupName?: string;
  status: AssignmentStatus;
  note?: string;
  completedAt?: string;
};

type AssignmentFormData = {
  weekName: string;
  date: string;
  assignmentType: AssignmentType;
  taskName: string;
  assignMode: "resident" | "group";
  residentId: string;
  groupName: string;
  status: AssignmentStatus;
  note: string;
};

const initialAssignments: LiturgyAssignment[] = [
  {
    id: 1,
    weekName: "Tuần 01",
    date: "2026-09-07",
    assignmentType: "evening_prayer_lead",
    taskName: "Dẫn kinh tối",
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    status: "completed",
    note: "Đã hoàn thành.",
    completedAt: "2026-09-07",
  },
  {
    id: 2,
    weekName: "Tuần 01",
    date: "2026-09-10",
    assignmentType: "altar_preparation",
    taskName: "Chuẩn bị nhà nguyện",
    groupName: "Phòng 1",
    status: "in_progress",
    note: "Nhóm phụ trách chuẩn bị trước 20:45.",
  },
  {
    id: 3,
    weekName: "Tuần 01",
    date: "2026-09-13",
    assignmentType: "choir",
    taskName: "Phụ trách hát lễ",
    groupName: "Nhóm phụng vụ",
    status: "pending",
    note: "Cần xác nhận danh sách tham gia.",
  },
];

const defaultFormData: AssignmentFormData = {
  weekName: "Tuần 01",
  date: "",
  assignmentType: "general",
  taskName: "",
  assignMode: "resident",
  residentId: "",
  groupName: "",
  status: "pending",
  note: "",
};

function getAssignmentTypeLabel(type: AssignmentType) {
  if (type === "reader") return "Đọc sách / Lời nguyện";
  if (type === "choir") return "Ca đoàn / Hát lễ";
  if (type === "altar_preparation") return "Chuẩn bị nhà nguyện";
  if (type === "evening_prayer_lead") return "Dẫn kinh tối";
  return "Nhiệm vụ chung";
}

function getAssignmentTypeClass(type: AssignmentType) {
  if (type === "reader") return "bg-purple-50 text-purple-700";
  if (type === "choir") return "bg-blue-50 text-blue-700";
  if (type === "altar_preparation") return "bg-orange-50 text-orange-700";
  if (type === "evening_prayer_lead") return "bg-green-50 text-green-700";
  return "bg-neutral-100 text-neutral-700";
}

function getStatusLabel(status: AssignmentStatus) {
  if (status === "completed") return "Hoàn thành";
  if (status === "in_progress") return "Đang thực hiện";
  return "Chưa thực hiện";
}

function getStatusClass(status: AssignmentStatus) {
  if (status === "completed") return "bg-green-50 text-green-700";
  if (status === "in_progress") return "bg-blue-50 text-blue-700";
  return "bg-orange-50 text-orange-700";
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

export default function LiturgyAssignments() {
  const [assignments, setAssignments] =
    useState<LiturgyAssignment[]>(initialAssignments);

  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<LiturgyAssignment | null>(null);
  const [formData, setFormData] =
    useState<AssignmentFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Phân công phụng vụ hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const weeks = useMemo(() => {
    return Array.from(new Set(assignments.map((item) => item.weekName)));
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.weekName.toLowerCase().includes(keyword) ||
        item.taskName.toLowerCase().includes(keyword) ||
        (item.residentName || "").toLowerCase().includes(keyword) ||
        (item.residentCode || "").toLowerCase().includes(keyword) ||
        (item.groupName || "").toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword);

      const matchesWeek = weekFilter === "all" || item.weekName === weekFilter;

      const matchesType =
        typeFilter === "all" || item.assignmentType === typeFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesWeek && matchesType && matchesStatus;
    });
  }, [assignments, searchTerm, weekFilter, typeFilter, statusFilter]);

  const completedCount = assignments.filter(
    (item) => item.status === "completed"
  ).length;

  const pendingCount = assignments.filter(
    (item) => item.status === "pending"
  ).length;

  const individualAssignmentCount = assignments.filter(
    (item) => item.residentId
  ).length;

  const groupAssignmentCount = assignments.filter((item) => item.groupName).length;

  const openCreateForm = () => {
    setEditingAssignment(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (assignment: LiturgyAssignment) => {
    setEditingAssignment(assignment);

    setFormData({
      weekName: assignment.weekName,
      date: assignment.date,
      assignmentType: assignment.assignmentType,
      taskName: assignment.taskName,
      assignMode: assignment.residentId ? "resident" : "group",
      residentId: assignment.residentId ? String(assignment.residentId) : "",
      groupName: assignment.groupName || "",
      status: assignment.status,
      note: assignment.note || "",
    });

    setIsFormOpen(true);
  };

  const handleSave = () => {
    let selectedResident: any = null;

    if (formData.assignMode === "resident") {
      selectedResident = members.find(
        (member: any) => String(member.id) === formData.residentId
      );

      if (!selectedResident) {
        alert("Vui lòng chọn học viên phụ trách.");
        return;
      }
    }

    if (formData.assignMode === "group" && !formData.groupName.trim()) {
      alert("Vui lòng nhập nhóm/phòng phụ trách.");
      return;
    }

    const completedAt =
      formData.status === "completed"
        ? new Date().toISOString().split("T")[0]
        : undefined;

    if (editingAssignment) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingAssignment.id
            ? {
                ...item,
                weekName: formData.weekName,
                date: formData.date,
                assignmentType: formData.assignmentType,
                taskName: formData.taskName,
                residentId:
                  formData.assignMode === "resident"
                    ? selectedResident.id
                    : undefined,
                residentName:
                  formData.assignMode === "resident"
                    ? selectedResident.fullName || "-"
                    : undefined,
                residentCode:
                  formData.assignMode === "resident"
                    ? selectedResident.residentCode ||
                      `ID: ${selectedResident.id}`
                    : undefined,
                groupName:
                  formData.assignMode === "group"
                    ? formData.groupName
                    : undefined,
                status: formData.status,
                note: formData.note,
                completedAt,
              }
            : item
        )
      );
    } else {
      const newAssignment: LiturgyAssignment = {
        id: Date.now(),
        weekName: formData.weekName,
        date: formData.date,
        assignmentType: formData.assignmentType,
        taskName: formData.taskName,
        residentId:
          formData.assignMode === "resident" ? selectedResident.id : undefined,
        residentName:
          formData.assignMode === "resident"
            ? selectedResident.fullName || "-"
            : undefined,
        residentCode:
          formData.assignMode === "resident"
            ? selectedResident.residentCode || `ID: ${selectedResident.id}`
            : undefined,
        groupName:
          formData.assignMode === "group" ? formData.groupName : undefined,
        status: formData.status,
        note: formData.note,
        completedAt,
      };

      setAssignments((prev) => [newAssignment, ...prev]);
    }

    setIsFormOpen(false);
    setEditingAssignment(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (
      !confirm("Bạn có chắc chắn muốn xóa phân công phụng vụ này khỏi UI mock?")
    ) {
      return;
    }

    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMarkCompleted = (assignment: LiturgyAssignment) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              status: "completed",
              completedAt: new Date().toISOString().split("T")[0],
              note: item.note || "Đã đánh dấu hoàn thành từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setWeekFilter("all");
    setTypeFilter("all");
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
              Phân công phụng vụ
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý phân công đọc sách, dẫn kinh, chuẩn bị nhà nguyện, hát lễ
              và các nhiệm vụ phụng vụ khác theo tuần.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm phân công
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho phân công phụng vụ - danh sách học viên lấy data
                thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Dữ
                liệu phân công hiện chỉ lưu trong state mock trên UI, chưa ghi
                database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">liturgyAssignments</span> và có
                thể liên kết với{" "}
                <span className="font-semibold">organizationRoles</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng phân công"
            value={assignments.length}
            description="Dữ liệu mock hiện tại"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Hoàn thành"
            value={completedCount}
            description="Nhiệm vụ đã hoàn thành"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Chưa thực hiện"
            value={pendingCount}
            description="Cần theo dõi tiếp"
            icon={<Clock className="h-5 w-5" />}
          />

          <StatCard
            label="Cá nhân / Nhóm"
            value={`${individualAssignmentCount}/${groupAssignmentCount}`}
            description="Phân công cá nhân và nhóm"
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
                Phân công nhóm hoặc học viên phụ trách phụng vụ.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Theo dõi nhiệm vụ: đọc sách, hát lễ, dẫn kinh, chuẩn bị nhà
                nguyện.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có trạng thái hoàn thành / đang thực hiện / chưa thực hiện.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này liên kết với lịch phụng vụ và cơ cấu tổ chức.
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
                Bảng đề xuất: <b>liturgyAssignments</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>liturgySchedules</b> theo ngày/tuần.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>organizationRoles</b> cho vai trò phụng
                vụ.
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_160px_220px_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm tuần, nhiệm vụ, học viên, nhóm, ghi chú..."
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
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhiệm vụ</option>
              <option value="reader">Đọc sách / Lời nguyện</option>
              <option value="choir">Ca đoàn / Hát lễ</option>
              <option value="altar_preparation">Chuẩn bị nhà nguyện</option>
              <option value="evening_prayer_lead">Dẫn kinh tối</option>
              <option value="general">Nhiệm vụ chung</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chưa thực hiện</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
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

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách phân công phụng vụ
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredAssignments.length} dòng đang hiển thị. Dữ liệu hiện
                là mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Tuần / Ngày
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhiệm vụ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Phụ trách
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
                {filteredAssignments.map((item) => (
                  <tr key={item.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.weekName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(item.date)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.taskName}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAssignmentTypeClass(
                          item.assignmentType
                        )}`}
                      >
                        {getAssignmentTypeLabel(item.assignmentType)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.residentId ? (
                        <div>
                          <p className="font-medium text-neutral-900">
                            {item.residentName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.residentCode}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-neutral-900">
                            {item.groupName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Nhóm / phòng phụ trách
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>

                      {item.completedAt && (
                        <p className="mt-1 text-xs text-neutral-400">
                          Ngày HT: {formatDate(item.completedAt)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">{item.note || "-"}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {item.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(item)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            Hoàn thành
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa phân công"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa phân công mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredAssignments.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có phân công nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <LiturgyAssignmentFormModal
            title={
              editingAssignment
                ? "Chỉnh sửa phân công phụng vụ"
                : "Thêm phân công phụng vụ"
            }
            formData={formData}
            setFormData={setFormData}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingAssignment(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function LiturgyAssignmentFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: AssignmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssignmentFormData>>;
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
              Có thể phân công cho một học viên hoặc một nhóm/phòng. Dữ liệu
              hiện chỉ lưu mock trên UI, chưa ghi database.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Label htmlFor="date">Ngày *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    date: event.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assignmentType">Loại nhiệm vụ *</Label>
            <select
              id="assignmentType"
              value={formData.assignmentType}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  assignmentType: event.target.value as AssignmentType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="reader">Đọc sách / Lời nguyện</option>
              <option value="choir">Ca đoàn / Hát lễ</option>
              <option value="altar_preparation">Chuẩn bị nhà nguyện</option>
              <option value="evening_prayer_lead">Dẫn kinh tối</option>
              <option value="general">Nhiệm vụ chung</option>
            </select>
          </div>

          <div>
            <Label htmlFor="taskName">Tên nhiệm vụ *</Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  taskName: event.target.value,
                })
              }
              placeholder="VD: Dẫn kinh tối, chuẩn bị nhà nguyện..."
              required
            />
          </div>

          <div>
            <Label htmlFor="assignMode">Phân công cho *</Label>
            <select
              id="assignMode"
              value={formData.assignMode}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  assignMode: event.target.value as "resident" | "group",
                  residentId: "",
                  groupName: "",
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="resident">Một học viên</option>
              <option value="group">Nhóm / Phòng</option>
            </select>
          </div>

          {formData.assignMode === "resident" ? (
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
                    {member.fullName} -{" "}
                    {member.residentCode || `ID: ${member.id}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <Label htmlFor="groupName">Nhóm / Phòng phụ trách *</Label>
              <Input
                id="groupName"
                value={formData.groupName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    groupName: event.target.value,
                  })
                }
                placeholder="VD: Phòng 1, Nhóm phụng vụ..."
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="status">Trạng thái *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as AssignmentStatus,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">Chưa thực hiện</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
            </select>
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
              placeholder="Ghi chú thêm nếu có"
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