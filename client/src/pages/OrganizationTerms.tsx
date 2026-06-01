import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TermType = "academic_year" | "semester" | "term" | "special";
type TermStatus = "active" | "inactive" | "closed";

type OrganizationTerm = {
  id: number;
  name: string;
  type: TermType;
  startDate: string;
  endDate: string;
  status: TermStatus;
  description?: string;
  note?: string;
};

type TermFormData = {
  name: string;
  type: TermType;
  startDate: string;
  endDate: string;
  status: TermStatus;
  description: string;
  note: string;
};

const initialTerms: OrganizationTerm[] = [
  {
    id: 1,
    name: "Năm học 2026 - 2027",
    type: "academic_year",
    startDate: "2026-09-01",
    endDate: "2027-06-30",
    status: "active",
    description: "Giai đoạn tổ chức chính của lưu xá trong năm học.",
    note: "Đang áp dụng.",
  },
  {
    id: 2,
    name: "Học kỳ 1 - 2026",
    type: "semester",
    startDate: "2026-09-01",
    endDate: "2027-01-15",
    status: "inactive",
    description: "Giai đoạn theo học kỳ để lượng giá và tổ chức hoạt động.",
    note: "Có thể liên kết với học vụ.",
  },
  {
    id: 3,
    name: "Nhiệm kỳ Ban điều hành 2026",
    type: "term",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    status: "active",
    description: "Nhiệm kỳ phân công ban điều hành, trưởng phòng, phụ trách nhóm.",
    note: "Dùng cho cơ cấu tổ chức lưu xá.",
  },
];

const defaultFormData: TermFormData = {
  name: "",
  type: "academic_year",
  startDate: "",
  endDate: "",
  status: "inactive",
  description: "",
  note: "",
};

function getTermTypeLabel(type: TermType) {
  if (type === "academic_year") return "Năm học";
  if (type === "semester") return "Học kỳ";
  if (type === "term") return "Nhiệm kỳ";
  return "Giai đoạn đặc biệt";
}

function getTermTypeClass(type: TermType) {
  if (type === "academic_year") return "bg-blue-50 text-blue-700";
  if (type === "semester") return "bg-green-50 text-green-700";
  if (type === "term") return "bg-purple-50 text-purple-700";
  return "bg-orange-50 text-orange-700";
}

function getStatusLabel(status: TermStatus) {
  if (status === "active") return "Đang áp dụng";
  if (status === "closed") return "Đã đóng";
  return "Không áp dụng";
}

function getStatusClass(status: TermStatus) {
  if (status === "active") return "bg-green-50 text-green-700";
  if (status === "closed") return "bg-neutral-100 text-neutral-700";
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

export default function OrganizationTerms() {
  const [terms, setTerms] = useState<OrganizationTerm[]>(initialTerms);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<OrganizationTerm | null>(null);
  const [formData, setFormData] = useState<TermFormData>(defaultFormData);

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        term.name.toLowerCase().includes(keyword) ||
        getTermTypeLabel(term.type).toLowerCase().includes(keyword) ||
        (term.description || "").toLowerCase().includes(keyword) ||
        (term.note || "").toLowerCase().includes(keyword);

      const matchesType = typeFilter === "all" || term.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || term.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [terms, searchTerm, typeFilter, statusFilter]);

  const activeCount = terms.filter((item) => item.status === "active").length;
  const academicYearCount = terms.filter(
    (item) => item.type === "academic_year"
  ).length;
  const semesterCount = terms.filter((item) => item.type === "semester").length;
  const orgTermCount = terms.filter((item) => item.type === "term").length;

  const openCreateForm = () => {
    setEditingTerm(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (term: OrganizationTerm) => {
    setEditingTerm(term);
    setFormData({
      name: term.name,
      type: term.type,
      startDate: term.startDate,
      endDate: term.endDate,
      status: term.status,
      description: term.description || "",
      note: term.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingTerm) {
      setTerms((prev) =>
        prev.map((item) =>
          item.id === editingTerm.id
            ? {
                ...item,
                name: formData.name,
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status,
                description: formData.description,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newTerm: OrganizationTerm = {
        id: Date.now(),
        name: formData.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        description: formData.description,
        note: formData.note,
      };

      setTerms((prev) => [newTerm, ...prev]);
    }

    setIsFormOpen(false);
    setEditingTerm(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giai đoạn/nhiệm kỳ này khỏi UI mock?")) {
      return;
    }

    setTerms((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSetActive = (term: OrganizationTerm) => {
    setTerms((prev) =>
      prev.map((item) =>
        item.id === term.id
          ? { ...item, status: "active" }
          : item.type === term.type
          ? { ...item, status: "inactive" }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
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
              Nhiệm kỳ / Giai đoạn
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý năm học, học kỳ, nhiệm kỳ tổ chức và các giai đoạn đặc biệt
              để làm nền cho cơ cấu tổ chức, lượng giá và phân công trong lưu xá.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm giai đoạn
          </button>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">UI mock - chưa ghi database</p>
              <p className="mt-1 text-sm">
                Dữ liệu hiện chỉ lưu bằng state mock trên UI. Sau này sẽ mapping với{" "}
                <span className="font-semibold">organizationTerms</span>. Có thể
                dùng chung ý tưởng với <span className="font-semibold">academicTerms</span>{" "}
                nếu muốn đồng bộ học kỳ và nhiệm kỳ.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng giai đoạn"
            value={terms.length}
            description="Dữ liệu mock hiện tại"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            label="Đang áp dụng"
            value={activeCount}
            description="Giai đoạn/nhiệm kỳ hiện hành"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Năm học / Học kỳ"
            value={`${academicYearCount}/${semesterCount}`}
            description="Phân loại học vụ"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            label="Nhiệm kỳ tổ chức"
            value={orgTermCount}
            description="Dùng cho cơ cấu lưu xá"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Quản lý năm học, học kỳ, nhiệm kỳ linh hoạt.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho cơ cấu tổ chức thay đổi theo từng kỳ.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Hỗ trợ phân công vai trò theo nhiệm kỳ.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với học vụ, phụng vụ, hoạt động và báo cáo.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>organizationTerms</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Liên kết sau: <b>organizationAssignments.termId</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể tham chiếu: <b>academicTerms</b> nếu muốn dùng chung kỳ.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                API cần sau: list, create, update, delete, setActive.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_200px_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm tên giai đoạn, loại, ghi chú..."
                className="pl-10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả loại</option>
              <option value="academic_year">Năm học</option>
              <option value="semester">Học kỳ</option>
              <option value="term">Nhiệm kỳ</option>
              <option value="special">Giai đoạn đặc biệt</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang áp dụng</option>
              <option value="inactive">Không áp dụng</option>
              <option value="closed">Đã đóng</option>
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
              Danh sách nhiệm kỳ / giai đoạn
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredTerms.length} dòng đang hiển thị. Dữ liệu hiện là mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Giai đoạn
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Loại
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Thời gian
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
                {filteredTerms.map((term) => (
                  <tr key={term.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">{term.name}</p>
                      <p className="mt-1 max-w-sm text-xs text-neutral-500">
                        {term.description || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTermTypeClass(
                          term.type
                        )}`}
                      >
                        {getTermTypeLabel(term.type)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {formatDate(term.startDate)} - {formatDate(term.endDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          term.status
                        )}`}
                      >
                        {getStatusLabel(term.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">{term.note || "-"}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {term.status !== "active" && (
                          <button
                            type="button"
                            onClick={() => handleSetActive(term)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            Áp dụng
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(term)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(term.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTerms.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có giai đoạn nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <OrganizationTermFormModal
            title={editingTerm ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn"}
            formData={formData}
            setFormData={setFormData}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTerm(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function OrganizationTermFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: TermFormData;
  setFormData: React.Dispatch<React.SetStateAction<TermFormData>>;
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
              Form này hiện chỉ lưu giai đoạn/nhiệm kỳ trong UI mock, chưa ghi database.
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
            <Label htmlFor="name">Tên giai đoạn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
              placeholder="VD: Năm học 2026 - 2027"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Loại giai đoạn *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  type: event.target.value as TermType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="academic_year">Năm học</option>
              <option value="semester">Học kỳ</option>
              <option value="term">Nhiệm kỳ</option>
              <option value="special">Giai đoạn đặc biệt</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Từ ngày *</Label>
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
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Đến ngày *</Label>
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
                required
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
                  status: event.target.value as TermStatus,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="active">Đang áp dụng</option>
              <option value="inactive">Không áp dụng</option>
              <option value="closed">Đã đóng</option>
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
              placeholder="Mô tả ý nghĩa, phạm vi áp dụng của giai đoạn..."
              className="min-h-24"
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