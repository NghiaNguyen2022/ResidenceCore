import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Edit2,
  Music,
  Plus,
  Search,
  Target,
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

type SkillStatus = "active" | "inactive";
type SkillCategory =
  | "music"
  | "movement"
  | "leadership"
  | "communication"
  | "service"
  | "other";

type Skill = {
  id: number;
  name: string;
  category: SkillCategory;
  description?: string;
  ownerResidentId?: number;
  ownerName?: string;
  ownerCode?: string;
  status: SkillStatus;
  note?: string;
};

type SkillFormData = {
  name: string;
  category: SkillCategory;
  description: string;
  ownerResidentId: string;
  status: SkillStatus;
  note: string;
};

const initialSkills: Skill[] = [
  {
    id: 1,
    name: "Đàn",
    category: "music",
    description: "Kỹ năng đàn căn bản phục vụ sinh hoạt, phụng vụ và văn nghệ.",
    ownerResidentId: 1,
    ownerName: "Nguyễn Văn A",
    ownerCode: "HV0001",
    status: "active",
    note: "Ưu tiên cho nhóm phụng vụ và văn nghệ.",
  },
  {
    id: 2,
    name: "Biên đạo",
    category: "movement",
    description: "Kỹ năng dàn dựng tiết mục, sinh hoạt cộng đoàn.",
    ownerResidentId: 2,
    ownerName: "Trần Thị B",
    ownerCode: "HV0002",
    status: "active",
    note: "Dùng cho hoạt động văn nghệ, Noel, Tất niên.",
  },
  {
    id: 3,
    name: "Linh hoạt viên",
    category: "leadership",
    description: "Kỹ năng dẫn sinh hoạt, trò chơi, kết nối nhóm.",
    status: "active",
    note: "Phù hợp cho các hoạt động trò chơi lớn, Mùa hè hy vọng.",
  },
  {
    id: 4,
    name: "Truyền thông",
    category: "communication",
    description: "Kỹ năng chụp ảnh, viết tin, truyền thông nội bộ.",
    status: "inactive",
    note: "Tạm để trong backlog.",
  },
];

const defaultFormData: SkillFormData = {
  name: "",
  category: "music",
  description: "",
  ownerResidentId: "",
  status: "active",
  note: "",
};

function getCategoryLabel(category: SkillCategory) {
  if (category === "music") return "Âm nhạc";
  if (category === "movement") return "Biên đạo / Vận động";
  if (category === "leadership") return "Lãnh đạo / Sinh hoạt";
  if (category === "communication") return "Truyền thông";
  if (category === "service") return "Phục vụ";
  return "Khác";
}

function getCategoryClass(category: SkillCategory) {
  if (category === "music") return "bg-purple-50 text-purple-700";
  if (category === "movement") return "bg-pink-50 text-pink-700";
  if (category === "leadership") return "bg-blue-50 text-blue-700";
  if (category === "communication") return "bg-orange-50 text-orange-700";
  if (category === "service") return "bg-green-50 text-green-700";
  return "bg-neutral-100 text-neutral-700";
}

function getStatusLabel(status: SkillStatus) {
  if (status === "active") return "Đang dùng";
  return "Tạm ngưng";
}

function getStatusClass(status: SkillStatus) {
  if (status === "active") return "bg-green-50 text-green-700";
  return "bg-neutral-100 text-neutral-600";
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

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Danh mục kỹ năng hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        skill.name.toLowerCase().includes(keyword) ||
        getCategoryLabel(skill.category).toLowerCase().includes(keyword) ||
        (skill.description || "").toLowerCase().includes(keyword) ||
        (skill.ownerName || "").toLowerCase().includes(keyword) ||
        (skill.note || "").toLowerCase().includes(keyword);

      const matchesCategory =
        categoryFilter === "all" || skill.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || skill.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [skills, searchTerm, categoryFilter, statusFilter]);

  const activeCount = skills.filter((item) => item.status === "active").length;
  const inactiveCount = skills.filter((item) => item.status === "inactive").length;

  const categoryStats = useMemo(() => {
    const categories: SkillCategory[] = [
      "music",
      "movement",
      "leadership",
      "communication",
      "service",
      "other",
    ];

    return categories
      .map((category) => ({
        category,
        label: getCategoryLabel(category),
        count: skills.filter((item) => item.category === category).length,
      }))
      .filter((item) => item.count > 0);
  }, [skills]);

  const openCreateForm = () => {
    setEditingSkill(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description || "",
      ownerResidentId: skill.ownerResidentId ? String(skill.ownerResidentId) : "",
      status: skill.status,
      note: skill.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const selectedOwner = members.find(
      (member: any) => String(member.id) === formData.ownerResidentId
    );

    if (editingSkill) {
      setSkills((prev) =>
        prev.map((item) =>
          item.id === editingSkill.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                description: formData.description,
                ownerResidentId: selectedOwner?.id,
                ownerName: selectedOwner?.fullName,
                ownerCode: selectedOwner?.residentCode || selectedOwner?.id,
                status: formData.status,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newSkill: Skill = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        ownerResidentId: selectedOwner?.id,
        ownerName: selectedOwner?.fullName,
        ownerCode: selectedOwner?.residentCode || selectedOwner?.id,
        status: formData.status,
        note: formData.note,
      };

      setSkills((prev) => [newSkill, ...prev]);
    }

    setIsFormOpen(false);
    setEditingSkill(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kỹ năng này khỏi UI mock?")) {
      return;
    }

    setSkills((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Đào tạo & Kỹ năng
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Danh mục kỹ năng
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý các kỹ năng đào tạo trong lưu xá như đàn, biên đạo, linh
              hoạt viên, truyền thông, phục vụ cộng đoàn.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm kỹ năng
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho danh mục kỹ năng - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Người phụ trách kỹ năng được chọn từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Danh
                mục kỹ năng hiện chỉ lưu bằng state mock trên UI, chưa ghi
                database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">skillCategories</span> và{" "}
                <span className="font-semibold">skills</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng kỹ năng"
            value={skills.length}
            description="Dữ liệu mock hiện tại"
            icon={<Target className="h-5 w-5" />}
          />

          <StatCard
            label="Đang dùng"
            value={activeCount}
            description="Kỹ năng còn đang triển khai"
            icon={<CheckIcon />}
          />

          <StatCard
            label="Tạm ngưng"
            value={inactiveCount}
            description="Kỹ năng tạm thời chưa mở"
            icon={<BookOpen className="h-5 w-5" />}
          />

          <StatCard
            label="Học viên"
            value={members.length}
            description="Nguồn từ API members.list"
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
                Quản lý các kỹ năng: Đàn, Biên đạo, Linh hoạt viên...
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Phân nhóm kỹ năng: âm nhạc, sinh hoạt, lãnh đạo, truyền thông.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Gán người phụ trách kỹ năng từ danh sách học viên.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho lớp kỹ năng và kết quả hoàn thành.
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
                Bảng đề xuất: <b>skillCategories</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>skills</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này liên kết với <b>skillClasses</b> và{" "}
                <b>residentSkillEnrollments</b>.
              </div>
            </div>
          </div>
        </div>

        {/* Category stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            Thống kê theo nhóm kỹ năng
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Số liệu mock dựa trên danh mục kỹ năng hiện tại.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {categoryStats.map((item) => (
              <div
                key={item.category}
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
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kỹ năng, nhóm kỹ năng, người phụ trách..."
                className="pl-10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="music">Âm nhạc</option>
              <option value="movement">Biên đạo / Vận động</option>
              <option value="leadership">Lãnh đạo / Sinh hoạt</option>
              <option value="communication">Truyền thông</option>
              <option value="service">Phục vụ</option>
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

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách kỹ năng
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredSkills.length} kỹ năng đang hiển thị. Dữ liệu hiện là
                mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Kỹ năng
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhóm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Người phụ trách
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
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Music className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-neutral-900">
                            {skill.name}
                          </p>
                          <p className="mt-1 max-w-sm text-xs text-neutral-500">
                            {skill.description || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryClass(
                          skill.category
                        )}`}
                      >
                        {getCategoryLabel(skill.category)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {skill.ownerName ? (
                        <div>
                          <p className="font-medium text-neutral-900">
                            {skill.ownerName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {skill.ownerCode || "-"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500">
                          Chưa gán
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          skill.status
                        )}`}
                      >
                        {getStatusLabel(skill.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">
                        {skill.note || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(skill)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa kỹ năng"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(skill.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa kỹ năng mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSkills.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có kỹ năng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <SkillFormModal
            title={editingSkill ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng"}
            formData={formData}
            setFormData={setFormData}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingSkill(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function SkillFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: SkillFormData;
  setFormData: React.Dispatch<React.SetStateAction<SkillFormData>>;
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
              Form này hiện chỉ lưu danh mục kỹ năng trong UI mock, chưa ghi
              database.
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
            <Label htmlFor="skillName">Tên kỹ năng *</Label>
            <Input
              id="skillName"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
              placeholder="VD: Đàn, Biên đạo, Linh hoạt viên..."
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Nhóm kỹ năng *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  category: event.target.value as SkillCategory,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="music">Âm nhạc</option>
              <option value="movement">Biên đạo / Vận động</option>
              <option value="leadership">Lãnh đạo / Sinh hoạt</option>
              <option value="communication">Truyền thông</option>
              <option value="service">Phục vụ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
              placeholder="Mô tả kỹ năng, mục đích đào tạo..."
              className="min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="ownerResidentId">Người phụ trách</Label>
            <select
              id="ownerResidentId"
              value={formData.ownerResidentId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  ownerResidentId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {membersLoading
                  ? "Đang tải danh sách học viên..."
                  : "-- Chọn học viên phụ trách nếu có --"}
              </option>

              {members.map((member: any) => (
                <option key={member.id} value={String(member.id)}>
                  {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="status">Trạng thái *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  status: event.target.value as SkillStatus,
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

function CheckIcon() {
  return <UserCheck className="h-5 w-5" />;
}