import { useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RoleGroup =
  | "management"
  | "room"
  | "liturgy"
  | "academic"
  | "activity"
  | "skill"
  | "communication"
  | "other";

type RoleStatus = "active" | "inactive";

type OrganizationRole = {
  id: number;
  roleName: string;
  roleGroup: RoleGroup;
  description?: string;
  responsibilities: string;
  status: RoleStatus;
  note?: string;
};

type RoleFormData = {
  roleName: string;
  roleGroup: RoleGroup;
  description: string;
  responsibilities: string;
  status: RoleStatus;
  note: string;
};

const initialRoles: OrganizationRole[] = [
  {
    id: 1,
    roleName: "Trưởng lưu xá",
    roleGroup: "management",
    description: "Vai trò phụ trách chung trong cơ cấu học viên lưu trú.",
    responsibilities:
      "Phối hợp điều hành sinh hoạt chung, hỗ trợ kết nối giữa học viên và người phụ trách lưu xá.",
    status: "active",
    note: "Vai trò nòng cốt.",
  },
  {
    id: 2,
    roleName: "Trưởng phòng",
    roleGroup: "room",
    description: "Vai trò phụ trách nề nếp và sinh hoạt trong phòng.",
    responsibilities:
      "Theo dõi vệ sinh phòng, giờ giấc, nhắc nhở thành viên và báo cáo tình hình phòng.",
    status: "active",
    note: "Có thể liên kết với phòng ở.",
  },
  {
    id: 3,
    roleName: "Phụ trách phụng vụ",
    roleGroup: "liturgy",
    description: "Vai trò hỗ trợ lịch phụng vụ, kinh tối, phân công phụng vụ.",
    responsibilities:
      "Theo dõi lịch phụng vụ, hỗ trợ điểm danh kinh tối, nhắc lịch lễ và phân công phục vụ.",
    status: "active",
    note: "Liên kết với module phụng vụ.",
  },
  {
    id: 4,
    roleName: "Phụ trách học tập",
    roleGroup: "academic",
    description: "Vai trò hỗ trợ học vụ và lượng giá học kỳ.",
    responsibilities:
      "Theo dõi tình hình học tập, nhắc nhở học viên cần hỗ trợ và phối hợp lượng giá học kỳ.",
    status: "active",
    note: "Liên kết với học vụ.",
  },
  {
    id: 5,
    roleName: "Phụ trách sinh hoạt",
    roleGroup: "activity",
    description: "Vai trò điều phối các hoạt động chung.",
    responsibilities:
      "Chuẩn bị kế hoạch sinh hoạt, trò chơi lớn, hoạt động cộng đoàn và tổng kết sau hoạt động.",
    status: "active",
    note: "Liên kết với hoạt động năm.",
  },
  {
    id: 6,
    roleName: "Phụ trách kỹ năng",
    roleGroup: "skill",
    description: "Vai trò theo dõi lớp kỹ năng và kết quả kỹ năng.",
    responsibilities:
      "Quản lý danh mục kỹ năng, lớp kỹ năng và theo dõi kết quả hoàn thành của học viên.",
    status: "active",
    note: "Liên kết với đào tạo kỹ năng.",
  },
];

const defaultFormData: RoleFormData = {
  roleName: "",
  roleGroup: "management",
  description: "",
  responsibilities: "",
  status: "active",
  note: "",
};

function getRoleGroupLabel(group: RoleGroup) {
  if (group === "management") return "Ban điều hành";
  if (group === "room") return "Phòng ở";
  if (group === "liturgy") return "Phụng vụ";
  if (group === "academic") return "Học vụ";
  if (group === "activity") return "Sinh hoạt / Hoạt động";
  if (group === "skill") return "Đào tạo / Kỹ năng";
  if (group === "communication") return "Truyền thông";
  return "Khác";
}

function getRoleGroupClass(group: RoleGroup) {
  if (group === "management") return "bg-purple-50 text-purple-700";
  if (group === "room") return "bg-blue-50 text-blue-700";
  if (group === "liturgy") return "bg-indigo-50 text-indigo-700";
  if (group === "academic") return "bg-green-50 text-green-700";
  if (group === "activity") return "bg-orange-50 text-orange-700";
  if (group === "skill") return "bg-pink-50 text-pink-700";
  if (group === "communication") return "bg-cyan-50 text-cyan-700";
  return "bg-neutral-100 text-neutral-700";
}

function getStatusLabel(status: RoleStatus) {
  if (status === "active") return "Đang dùng";
  return "Tạm ngưng";
}

function getStatusClass(status: RoleStatus) {
  if (status === "active") return "bg-green-50 text-green-700";
  return "bg-neutral-100 text-neutral-700";
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

export default function OrganizationRoles() {
  const [roles, setRoles] = useState<OrganizationRole[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(defaultFormData);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        role.roleName.toLowerCase().includes(keyword) ||
        getRoleGroupLabel(role.roleGroup).toLowerCase().includes(keyword) ||
        (role.description || "").toLowerCase().includes(keyword) ||
        role.responsibilities.toLowerCase().includes(keyword) ||
        (role.note || "").toLowerCase().includes(keyword);

      const matchesGroup =
        groupFilter === "all" || role.roleGroup === groupFilter;

      const matchesStatus =
        statusFilter === "all" || role.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [roles, searchTerm, groupFilter, statusFilter]);

  const activeCount = roles.filter((item) => item.status === "active").length;
  const managementCount = roles.filter(
    (item) => item.roleGroup === "management"
  ).length;
  const liturgyCount = roles.filter((item) => item.roleGroup === "liturgy").length;
  const activityCount = roles.filter((item) => item.roleGroup === "activity").length;

  const groupStats = useMemo(() => {
    const groups: RoleGroup[] = [
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
        count: roles.filter((role) => role.roleGroup === group).length,
      }))
      .filter((item) => item.count > 0);
  }, [roles]);

  const openCreateForm = () => {
    setEditingRole(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (role: OrganizationRole) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
      roleGroup: role.roleGroup,
      description: role.description || "",
      responsibilities: role.responsibilities,
      status: role.status,
      note: role.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingRole) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id === editingRole.id
            ? {
                ...item,
                roleName: formData.roleName,
                roleGroup: formData.roleGroup,
                description: formData.description,
                responsibilities: formData.responsibilities,
                status: formData.status,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newRole: OrganizationRole = {
        id: Date.now(),
        roleName: formData.roleName,
        roleGroup: formData.roleGroup,
        description: formData.description,
        responsibilities: formData.responsibilities,
        status: formData.status,
        note: formData.note,
      };

      setRoles((prev) => [newRole, ...prev]);
    }

    setIsFormOpen(false);
    setEditingRole(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vai trò này khỏi UI mock?")) {
      return;
    }

    setRoles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGroupFilter("all");
    setStatusFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Tổ chức lưu xá
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Vai trò / Chức vụ
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý danh mục vai trò trong lưu xá như trưởng lưu xá, trưởng phòng,
              phụ trách phụng vụ, học tập, sinh hoạt, kỹ năng và truyền thông.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm vai trò
          </button>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">UI mock - chưa ghi database</p>
              <p className="mt-1 text-sm">
                Dữ liệu hiện chỉ lưu bằng state mock trên UI. Sau này sẽ mapping với{" "}
                <span className="font-semibold">organizationRoles</span> và liên kết với{" "}
                <span className="font-semibold">organizationAssignments</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng vai trò"
            value={roles.length}
            description="Dữ liệu mock hiện tại"
            icon={<Briefcase className="h-5 w-5" />}
          />

          <StatCard
            label="Đang dùng"
            value={activeCount}
            description="Vai trò còn áp dụng"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Điều hành"
            value={managementCount}
            description="Vai trò quản lý chung"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Phụng vụ / Sinh hoạt"
            value={`${liturgyCount}/${activityCount}`}
            description="Vai trò theo nhóm nghiệp vụ"
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Quản lý danh mục vai trò/chức vụ trong lưu xá.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Tách vai trò theo nhóm: điều hành, phòng ở, phụng vụ, học vụ, kỹ năng.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Mỗi vai trò có mô tả trách nhiệm rõ ràng.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho phân công cơ cấu tổ chức ở bước tiếp theo.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>organizationRoles</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Liên kết sau: <b>organizationAssignments.roleId</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với phòng ở, phụng vụ, kỹ năng và hoạt động.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                API cần sau: list, create, update, delete, setActive.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            Thống kê theo nhóm vai trò
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Số liệu mock dựa trên danh mục vai trò hiện tại.
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

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm vai trò, nhóm vai trò, trách nhiệm..."
                className="pl-10"
              />
            </div>

            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhóm</option>
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
              <option value="active">Đang dùng</option>
              <option value="inactive">Tạm ngưng</option>
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

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Danh sách vai trò / chức vụ
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredRoles.length} vai trò đang hiển thị. Dữ liệu hiện là mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Vai trò
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhóm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trách nhiệm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {role.roleName}
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-neutral-500">
                        {role.description || "-"}
                      </p>
                      {role.note && (
                        <p className="mt-1 max-w-sm text-xs text-neutral-400">
                          {role.note}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleGroupClass(
                          role.roleGroup
                        )}`}
                      >
                        {getRoleGroupLabel(role.roleGroup)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-md">{role.responsibilities}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          role.status
                        )}`}
                      >
                        {getStatusLabel(role.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(role)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa vai trò"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(role.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa vai trò mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRoles.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có vai trò nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <OrganizationRoleFormModal
            title={editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò"}
            formData={formData}
            setFormData={setFormData}
            onClose={() => {
              setIsFormOpen(false);
              setEditingRole(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function OrganizationRoleFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: RoleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RoleFormData>>;
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
              Form này hiện chỉ lưu vai trò trong UI mock, chưa ghi database.
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
            <Label htmlFor="roleName">Tên vai trò *</Label>
            <Input
              id="roleName"
              value={formData.roleName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  roleName: event.target.value,
                })
              }
              placeholder="VD: Trưởng lưu xá, Trưởng phòng..."
              required
            />
          </div>

          <div>
            <Label htmlFor="roleGroup">Nhóm vai trò *</Label>
            <select
              id="roleGroup"
              value={formData.roleGroup}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  roleGroup: event.target.value as RoleGroup,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="management">Ban điều hành</option>
              <option value="room">Phòng ở</option>
              <option value="liturgy">Phụng vụ</option>
              <option value="academic">Học vụ</option>
              <option value="activity">Sinh hoạt / Hoạt động</option>
              <option value="skill">Đào tạo / Kỹ năng</option>
              <option value="communication">Truyền thông</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Mô tả ngắn</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
              placeholder="Mô tả ngắn về vai trò"
              className="min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="responsibilities">Trách nhiệm chính *</Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  responsibilities: event.target.value,
                })
              }
              placeholder="Nhập các trách nhiệm chính của vai trò"
              className="min-h-28"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as RoleStatus,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="active">Đang dùng</option>
              <option value="inactive">Tạm ngưng</option>
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