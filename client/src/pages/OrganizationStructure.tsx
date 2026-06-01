import { useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
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

type AssignmentStatus = "active" | "inactive" | "completed";

type OrganizationTerm = {
  id: number;
  name: string;
  type: "academic_year" | "semester" | "term" | "special";
  status: "active" | "inactive" | "closed";
};

type OrganizationRole = {
  id: number;
  roleName: string;
  roleGroup:
    | "management"
    | "room"
    | "liturgy"
    | "academic"
    | "activity"
    | "skill"
    | "communication"
    | "other";
  status: "active" | "inactive";
};

type OrganizationAssignment = {
  id: number;
  termId: number;
  termName: string;
  roleId: number;
  roleName: string;
  roleGroup: OrganizationRole["roleGroup"];
  residentId: number;
  residentName: string;
  residentCode: string;
  startDate?: string;
  endDate?: string;
  status: AssignmentStatus;
  responsibilities?: string;
  note?: string;
};

type AssignmentFormData = {
  termId: string;
  roleId: string;
  residentId: string;
  startDate: string;
  endDate: string;
  status: AssignmentStatus;
  responsibilities: string;
  note: string;
};

const initialTerms: OrganizationTerm[] = [
  {
    id: 1,
    name: "Năm học 2026 - 2027",
    type: "academic_year",
    status: "active",
  },
  {
    id: 2,
    name: "Nhiệm kỳ Ban điều hành 2026",
    type: "term",
    status: "active",
  },
  {
    id: 3,
    name: "Học kỳ 1 - 2026",
    type: "semester",
    status: "inactive",
  },
];

const initialRoles: OrganizationRole[] = [
  {
    id: 1,
    roleName: "Trưởng lưu xá",
    roleGroup: "management",
    status: "active",
  },
  {
    id: 2,
    roleName: "Trưởng phòng",
    roleGroup: "room",
    status: "active",
  },
  {
    id: 3,
    roleName: "Phụ trách phụng vụ",
    roleGroup: "liturgy",
    status: "active",
  },
  {
    id: 4,
    roleName: "Phụ trách học tập",
    roleGroup: "academic",
    status: "active",
  },
  {
    id: 5,
    roleName: "Phụ trách sinh hoạt",
    roleGroup: "activity",
    status: "active",
  },
  {
    id: 6,
    roleName: "Phụ trách kỹ năng",
    roleGroup: "skill",
    status: "active",
  },
  {
    id: 7,
    roleName: "Truyền thông",
    roleGroup: "communication",
    status: "active",
  },
];

const initialAssignments: OrganizationAssignment[] = [
  {
    id: 1,
    termId: 2,
    termName: "Nhiệm kỳ Ban điều hành 2026",
    roleId: 1,
    roleName: "Trưởng lưu xá",
    roleGroup: "management",
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    status: "active",
    responsibilities:
      "Phối hợp điều hành sinh hoạt chung, hỗ trợ kết nối giữa học viên và người phụ trách lưu xá.",
    note: "Vai trò nòng cốt trong nhiệm kỳ.",
  },
  {
    id: 2,
    termId: 2,
    termName: "Nhiệm kỳ Ban điều hành 2026",
    roleId: 3,
    roleName: "Phụ trách phụng vụ",
    roleGroup: "liturgy",
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    status: "active",
    responsibilities:
      "Theo dõi lịch phụng vụ, hỗ trợ điểm danh kinh tối và phân công phục vụ.",
    note: "Liên kết với nhóm phụng vụ.",
  },
  {
    id: 3,
    termId: 2,
    termName: "Nhiệm kỳ Ban điều hành 2026",
    roleId: 5,
    roleName: "Phụ trách sinh hoạt",
    roleGroup: "activity",
    residentId: 3,
    residentName: "Lê Minh C",
    residentCode: "HV0003",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    status: "active",
    responsibilities:
      "Chuẩn bị kế hoạch sinh hoạt, trò chơi lớn, hoạt động cộng đoàn và tổng kết sau hoạt động.",
    note: "Phối hợp với các CLB.",
  },
];

const defaultFormData: AssignmentFormData = {
  termId: "",
  roleId: "",
  residentId: "",
  startDate: "",
  endDate: "",
  status: "active",
  responsibilities: "",
  note: "",
};

function getRoleGroupLabel(group: OrganizationRole["roleGroup"]) {
  if (group === "management") return "Ban điều hành";
  if (group === "room") return "Phòng ở";
  if (group === "liturgy") return "Phụng vụ";
  if (group === "academic") return "Học vụ";
  if (group === "activity") return "Sinh hoạt / Hoạt động";
  if (group === "skill") return "Đào tạo / Kỹ năng";
  if (group === "communication") return "Truyền thông";
  return "Khác";
}

function getRoleGroupClass(group: OrganizationRole["roleGroup"]) {
  if (group === "management") return "bg-purple-50 text-purple-700";
  if (group === "room") return "bg-blue-50 text-blue-700";
  if (group === "liturgy") return "bg-indigo-50 text-indigo-700";
  if (group === "academic") return "bg-green-50 text-green-700";
  if (group === "activity") return "bg-orange-50 text-orange-700";
  if (group === "skill") return "bg-pink-50 text-pink-700";
  if (group === "communication") return "bg-cyan-50 text-cyan-700";
  return "bg-neutral-100 text-neutral-700";
}

function getStatusLabel(status: AssignmentStatus) {
  if (status === "active") return "Đang đảm nhiệm";
  if (status === "completed") return "Đã kết thúc";
  return "Tạm ngưng";
}

function getStatusClass(status: AssignmentStatus) {
  if (status === "active") return "bg-green-50 text-green-700";
  if (status === "completed") return "bg-neutral-100 text-neutral-700";
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

export default function OrganizationStructure() {
  const [terms] = useState<OrganizationTerm[]>(initialTerms);
  const [roles] = useState<OrganizationRole[]>(initialRoles);
  const [assignments, setAssignments] =
    useState<OrganizationAssignment[]>(initialAssignments);

  const [searchTerm, setSearchTerm] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [roleGroupFilter, setRoleGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<OrganizationAssignment | null>(null);
  const [formData, setFormData] =
    useState<AssignmentFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Cơ cấu tổ chức hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const activeTerms = terms.filter((term) => term.status === "active");
  const activeRoles = roles.filter((role) => role.status === "active");

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.termName.toLowerCase().includes(keyword) ||
        item.roleName.toLowerCase().includes(keyword) ||
        getRoleGroupLabel(item.roleGroup).toLowerCase().includes(keyword) ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        (item.responsibilities || "").toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword);

      const matchesTerm =
        termFilter === "all" || String(item.termId) === termFilter;

      const matchesGroup =
        roleGroupFilter === "all" || item.roleGroup === roleGroupFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesTerm && matchesGroup && matchesStatus;
    });
  }, [assignments, searchTerm, termFilter, roleGroupFilter, statusFilter]);

  const activeAssignmentCount = assignments.filter(
    (item) => item.status === "active"
  ).length;

  const uniqueAssignedResidentsCount = new Set(
    assignments
      .filter((item) => item.status === "active")
      .map((item) => item.residentId)
  ).size;

  const managementCount = assignments.filter(
    (item) => item.roleGroup === "management" && item.status === "active"
  ).length;

  const roomCount = assignments.filter(
    (item) => item.roleGroup === "room" && item.status === "active"
  ).length;

  const groupStats = useMemo(() => {
    const groups: OrganizationRole["roleGroup"][] = [
      "management",
      "room",
      "liturgy",
      "academic",
      "activity",
      "skill",
      "communication",
      "other",
    ];

    return groups
      .map((group) => ({
        group,
        label: getRoleGroupLabel(group),
        count: assignments.filter(
          (item) => item.roleGroup === group && item.status === "active"
        ).length,
      }))
      .filter((item) => item.count > 0);
  }, [assignments]);

  const openCreateForm = () => {
    setEditingAssignment(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (assignment: OrganizationAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      termId: String(assignment.termId),
      roleId: String(assignment.roleId),
      residentId: String(assignment.residentId),
      startDate: assignment.startDate || "",
      endDate: assignment.endDate || "",
      status: assignment.status,
      responsibilities: assignment.responsibilities || "",
      note: assignment.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const selectedTerm = terms.find(
      (term) => String(term.id) === formData.termId
    );

    const selectedRole = roles.find(
      (role) => String(role.id) === formData.roleId
    );

    const selectedResident = members.find(
      (member: any) => String(member.id) === formData.residentId
    );

    if (!selectedTerm) {
      alert("Vui lòng chọn nhiệm kỳ / giai đoạn.");
      return;
    }

    if (!selectedRole) {
      alert("Vui lòng chọn vai trò.");
      return;
    }

    if (!selectedResident) {
      alert("Vui lòng chọn học viên.");
      return;
    }

    const duplicated = assignments.some(
      (item) =>
        item.termId === selectedTerm.id &&
        item.roleId === selectedRole.id &&
        item.residentId === selectedResident.id &&
        item.id !== editingAssignment?.id
    );

    if (duplicated) {
      alert(
        "Học viên này đã được phân công vai trò này trong nhiệm kỳ/giai đoạn đã chọn."
      );
      return;
    }

    if (editingAssignment) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingAssignment.id
            ? {
                ...item,
                termId: selectedTerm.id,
                termName: selectedTerm.name,
                roleId: selectedRole.id,
                roleName: selectedRole.roleName,
                roleGroup: selectedRole.roleGroup,
                residentId: selectedResident.id,
                residentName: selectedResident.fullName || "-",
                residentCode:
                  selectedResident.residentCode || `ID: ${selectedResident.id}`,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status,
                responsibilities: formData.responsibilities,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newAssignment: OrganizationAssignment = {
        id: Date.now(),
        termId: selectedTerm.id,
        termName: selectedTerm.name,
        roleId: selectedRole.id,
        roleName: selectedRole.roleName,
        roleGroup: selectedRole.roleGroup,
        residentId: selectedResident.id,
        residentName: selectedResident.fullName || "-",
        residentCode:
          selectedResident.residentCode || `ID: ${selectedResident.id}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        responsibilities: formData.responsibilities,
        note: formData.note,
      };

      setAssignments((prev) => [newAssignment, ...prev]);
    }

    setIsFormOpen(false);
    setEditingAssignment(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phân công cơ cấu này khỏi UI mock?")) {
      return;
    }

    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleComplete = (assignment: OrganizationAssignment) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              status: "completed",
              endDate: item.endDate || new Date().toISOString().split("T")[0],
              note: item.note || "Đã kết thúc vai trò từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTermFilter("all");
    setRoleGroupFilter("all");
    setStatusFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Tổ chức lưu xá
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Cơ cấu tổ chức
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Phân công học viên vào các vai trò trong cơ cấu lưu xá theo từng
              nhiệm kỳ hoặc giai đoạn: trưởng lưu xá, trưởng phòng, phụ trách
              phụng vụ, học vụ, sinh hoạt, kỹ năng và truyền thông.
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
                UI mock cho cơ cấu tổ chức - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Nhiệm
                kỳ, vai trò và phân công hiện chỉ lưu bằng state mock trên UI,
                chưa ghi database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">organizationAssignments</span>.
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
            icon={<Briefcase className="h-5 w-5" />}
          />

          <StatCard
            label="Đang đảm nhiệm"
            value={activeAssignmentCount}
            description="Vai trò đang còn hiệu lực"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Học viên có vai trò"
            value={uniqueAssignedResidentsCount}
            description="Tính theo học viên duy nhất"
            icon={<UserCheck className="h-5 w-5" />}
          />

          <StatCard
            label="Điều hành / Phòng"
            value={`${managementCount}/${roomCount}`}
            description="Vai trò quản lý và phòng ở"
            icon={<Users className="h-5 w-5" />}
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
                Phân công học viên vào vai trò theo nhiệm kỳ / giai đoạn.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Một học viên có thể giữ nhiều vai trò nếu cần.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Một vai trò có thể có nhiều học viên ở các nhóm/phân hệ khác nhau.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho phân quyền, báo cáo trách nhiệm và lịch phân công.
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
                Bảng đề xuất: <b>organizationAssignments</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Liên kết chính: <b>termId</b>, <b>roleId</b>,{" "}
                <b>residentId</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                API cần sau: list, create, update, delete, endAssignment.
              </div>
            </div>
          </div>
        </div>

        {/* Group stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            Thống kê cơ cấu theo nhóm vai trò
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Số liệu mock dựa trên các phân công đang đảm nhiệm.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {groupStats.map((item) => (
              <div
                key={item.group}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <p className="text-sm font-semibold text-neutral-700">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-neutral-900">
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, vai trò, nhiệm kỳ, trách nhiệm..."
                className="pl-10"
              />
            </div>

            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhiệm kỳ</option>
              {terms.map((term) => (
                <option key={term.id} value={String(term.id)}>
                  {term.name}
                </option>
              ))}
            </select>

            <select
              value={roleGroupFilter}
              onChange={(event) => setRoleGroupFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhóm vai trò</option>
              <option value="management">Ban điều hành</option>
              <option value="room">Phòng ở</option>
              <option value="liturgy">Phụng vụ</option>
              <option value="academic">Học vụ</option>
              <option value="activity">Sinh hoạt / Hoạt động</option>
              <option value="skill">Đào tạo / Kỹ năng</option>
              <option value="communication">Truyền thông</option>
              <option value="other">Khác</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang đảm nhiệm</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="completed">Đã kết thúc</option>
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
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Danh sách phân công cơ cấu tổ chức
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredAssignments.length} dòng đang hiển thị. Dữ liệu hiện là
              mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1220px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Vai trò
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhiệm kỳ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Thời gian
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trách nhiệm / Ghi chú
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition hover:bg-neutral-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {assignment.residentName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {assignment.residentCode}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {assignment.roleName}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleGroupClass(
                          assignment.roleGroup
                        )}`}
                      >
                        {getRoleGroupLabel(assignment.roleGroup)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {assignment.termName}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {formatDate(assignment.startDate)} -{" "}
                      {formatDate(assignment.endDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          assignment.status
                        )}`}
                      >
                        {getStatusLabel(assignment.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-md">
                        <p className="line-clamp-2">
                          {assignment.responsibilities || "-"}
                        </p>
                        {assignment.note && (
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {assignment.note}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {assignment.status === "active" && (
                          <button
                            type="button"
                            onClick={() => handleComplete(assignment)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                          >
                            Kết thúc
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(assignment)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa phân công"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(assignment.id)}
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
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có phân công cơ cấu nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <OrganizationAssignmentFormModal
            title={
              editingAssignment
                ? "Chỉnh sửa phân công cơ cấu"
                : "Thêm phân công cơ cấu"
            }
            formData={formData}
            setFormData={setFormData}
            terms={activeTerms.length > 0 ? activeTerms : terms}
            roles={activeRoles}
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

function OrganizationAssignmentFormModal({
  title,
  formData,
  setFormData,
  terms,
  roles,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: AssignmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssignmentFormData>>;
  terms: OrganizationTerm[];
  roles: OrganizationRole[];
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
              Chọn học viên từ danh sách thật. Phân công cơ cấu hiện chỉ lưu
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
            <Label htmlFor="termId">Nhiệm kỳ / Giai đoạn *</Label>
            <select
              id="termId"
              value={formData.termId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  termId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn nhiệm kỳ / giai đoạn --</option>

              {terms.map((term) => (
                <option key={term.id} value={String(term.id)}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="roleId">Vai trò / Chức vụ *</Label>
            <select
              id="roleId"
              value={formData.roleId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  roleId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn vai trò --</option>

              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.roleName} - {getRoleGroupLabel(role.roleGroup)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="residentId">Học viên *</Label>
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    startDate: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    endDate: event.target.value,
                  })
                }
              />
            </div>
          </div>

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
              <option value="active">Đang đảm nhiệm</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>

          <div>
            <Label htmlFor="responsibilities">Trách nhiệm chính</Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  responsibilities: event.target.value,
                })
              }
              placeholder="Nhập trách nhiệm chính trong vai trò này"
              className="min-h-28"
            />
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
              className="min-h-20"
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