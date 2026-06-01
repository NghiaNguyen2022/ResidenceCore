import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Edit2,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Major = {
  id: number;
  name: string;
  group: string;
  description?: string;
  isActive: boolean;
};

type StudentMajorAssignment = {
  id: number;
  residentId: number;
  residentName: string;
  residentCode: string;
  majorId: number;
  majorName: string;
  schoolName?: string;
  className?: string;
  note?: string;
};

type MajorFormData = {
  name: string;
  group: string;
  description: string;
  isActive: boolean;
};

type AssignmentFormData = {
  residentId: string;
  majorId: string;
  schoolName: string;
  className: string;
  note: string;
};

const initialMajors: Major[] = [
  {
    id: 1,
    name: "Y",
    group: "Sức khỏe",
    description: "Nhóm ngành y, điều dưỡng, dược, chăm sóc sức khỏe.",
    isActive: true,
  },
  {
    id: 2,
    name: "Sư phạm",
    group: "Giáo dục",
    description: "Nhóm ngành giáo dục, đào tạo, sư phạm.",
    isActive: true,
  },
  {
    id: 3,
    name: "Kinh tế",
    group: "Kinh tế / Quản trị",
    description: "Nhóm ngành kinh tế, tài chính, kế toán, quản trị.",
    isActive: true,
  },
  {
    id: 4,
    name: "Công nghệ thực phẩm",
    group: "Kỹ thuật / Ứng dụng",
    description: "Nhóm ngành công nghệ thực phẩm và ứng dụng.",
    isActive: true,
  },
];

const initialAssignments: StudentMajorAssignment[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    majorId: 1,
    majorName: "Y",
    schoolName: "Đại học Y Dược",
    className: "Y2026",
    note: "Mock data",
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    majorId: 2,
    majorName: "Sư phạm",
    schoolName: "Đại học Sư phạm",
    className: "SP2026",
    note: "Mock data",
  },
];

const defaultMajorForm: MajorFormData = {
  name: "",
  group: "",
  description: "",
  isActive: true,
};

const defaultAssignmentForm: AssignmentFormData = {
  residentId: "",
  majorId: "",
  schoolName: "",
  className: "",
  note: "",
};

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

export default function AcademicInfo() {
  const [majors, setMajors] = useState<Major[]>(initialMajors);
  const [assignments, setAssignments] =
    useState<StudentMajorAssignment[]>(initialAssignments);

  const [searchTerm, setSearchTerm] = useState("");
  const [majorFilter, setMajorFilter] = useState("all");

  const [isMajorFormOpen, setIsMajorFormOpen] = useState(false);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);

  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [editingAssignment, setEditingAssignment] =
    useState<StudentMajorAssignment | null>(null);

  const [majorForm, setMajorForm] = useState<MajorFormData>(defaultMajorForm);
  const [assignmentForm, setAssignmentForm] =
    useState<AssignmentFormData>(defaultAssignmentForm);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy từ API thật.
   * Danh mục ngành và gán ngành hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        item.majorName.toLowerCase().includes(keyword) ||
        (item.schoolName || "").toLowerCase().includes(keyword) ||
        (item.className || "").toLowerCase().includes(keyword);

      const matchesMajor =
        majorFilter === "all" || String(item.majorId) === majorFilter;

      return matchesSearch && matchesMajor;
    });
  }, [assignments, searchTerm, majorFilter]);

  const assignedResidentCount = new Set(assignments.map((item) => item.residentId))
    .size;

  const majorStats = useMemo(() => {
    return majors.map((major) => {
      const count = assignments.filter((item) => item.majorId === major.id).length;

      return {
        ...major,
        count,
      };
    });
  }, [majors, assignments]);

  const openCreateMajor = () => {
    setEditingMajor(null);
    setMajorForm(defaultMajorForm);
    setIsMajorFormOpen(true);
  };

  const openEditMajor = (major: Major) => {
    setEditingMajor(major);
    setMajorForm({
      name: major.name,
      group: major.group,
      description: major.description || "",
      isActive: major.isActive,
    });
    setIsMajorFormOpen(true);
  };

  const handleSaveMajor = () => {
    if (editingMajor) {
      setMajors((prev) =>
        prev.map((item) =>
          item.id === editingMajor.id
            ? {
                ...item,
                name: majorForm.name,
                group: majorForm.group,
                description: majorForm.description,
                isActive: majorForm.isActive,
              }
            : item
        )
      );

      setAssignments((prev) =>
        prev.map((item) =>
          item.majorId === editingMajor.id
            ? {
                ...item,
                majorName: majorForm.name,
              }
            : item
        )
      );
    } else {
      const newMajor: Major = {
        id: Date.now(),
        name: majorForm.name,
        group: majorForm.group,
        description: majorForm.description,
        isActive: majorForm.isActive,
      };

      setMajors((prev) => [newMajor, ...prev]);
    }

    setIsMajorFormOpen(false);
    setEditingMajor(null);
    setMajorForm(defaultMajorForm);
  };

  const handleDeleteMajor = (id: number) => {
    const hasAssignments = assignments.some((item) => item.majorId === id);

    if (hasAssignments) {
      alert("Ngành này đang được gán cho học viên trong UI mock, chưa thể xóa.");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa ngành này khỏi UI mock?")) {
      return;
    }

    setMajors((prev) => prev.filter((item) => item.id !== id));
  };

  const openCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm(defaultAssignmentForm);
    setIsAssignmentFormOpen(true);
  };

  const openEditAssignment = (assignment: StudentMajorAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      residentId: String(assignment.residentId),
      majorId: String(assignment.majorId),
      schoolName: assignment.schoolName || "",
      className: assignment.className || "",
      note: assignment.note || "",
    });
    setIsAssignmentFormOpen(true);
  };

  const handleSaveAssignment = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === assignmentForm.residentId
    );

    const selectedMajor = majors.find(
      (major) => String(major.id) === assignmentForm.majorId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên từ danh sách.");
      return;
    }

    if (!selectedMajor) {
      alert("Vui lòng chọn ngành học.");
      return;
    }

    const residentId = selectedResident.id;
    const residentName = selectedResident.fullName || "-";
    const residentCode =
      selectedResident.residentCode || `ID: ${selectedResident.id}`;

    if (editingAssignment) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingAssignment.id
            ? {
                ...item,
                residentId,
                residentName,
                residentCode,
                majorId: selectedMajor.id,
                majorName: selectedMajor.name,
                schoolName: assignmentForm.schoolName,
                className: assignmentForm.className,
                note: assignmentForm.note,
              }
            : item
        )
      );
    } else {
      const existed = assignments.some((item) => item.residentId === residentId);

      if (existed) {
        const confirmReplace = confirm(
          "Học viên này đã có ngành trong UI mock. Bạn muốn cập nhật lại ngành cho học viên này?"
        );

        if (!confirmReplace) return;

        setAssignments((prev) =>
          prev.map((item) =>
            item.residentId === residentId
              ? {
                  ...item,
                  majorId: selectedMajor.id,
                  majorName: selectedMajor.name,
                  schoolName: assignmentForm.schoolName,
                  className: assignmentForm.className,
                  note: assignmentForm.note,
                }
              : item
          )
        );
      } else {
        const newAssignment: StudentMajorAssignment = {
          id: Date.now(),
          residentId,
          residentName,
          residentCode,
          majorId: selectedMajor.id,
          majorName: selectedMajor.name,
          schoolName: assignmentForm.schoolName,
          className: assignmentForm.className,
          note: assignmentForm.note,
        };

        setAssignments((prev) => [newAssignment, ...prev]);
      }
    }

    setIsAssignmentFormOpen(false);
    setEditingAssignment(null);
    setAssignmentForm(defaultAssignmentForm);
  };

  const handleDeleteAssignment = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa gán ngành này khỏi UI mock?")) {
      return;
    }

    setAssignments((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMajorFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Học vụ</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Trường học / Ngành học
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý nhóm ngành học và theo dõi số học viên theo từng ngành.
              Phần danh sách học viên lấy từ API thật, còn ngành học hiện đang
              là UI mock để review nghiệp vụ.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openCreateMajor}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
              Thêm ngành
            </button>

            <button
              type="button"
              onClick={openCreateAssignment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Gán ngành cho học viên
            </button>
          </div>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI partial - học viên lấy data thật, ngành học đang là mock
              </p>
              <p className="mt-1 text-sm">
                Danh sách học viên lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Danh
                mục ngành và việc gán ngành hiện chỉ lưu trong state mock trên
                UI. Sau này sẽ mapping với{" "}
                <span className="font-semibold">residentAcademicInfo</span>,{" "}
                <span className="font-semibold">programs</span> hoặc bảng{" "}
                <span className="font-semibold">majors</span>.
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
            label="Ngành học"
            value={majors.length}
            description="Danh mục ngành mock UI"
            icon={<BookOpen className="h-5 w-5" />}
          />

          <StatCard
            label="Đã gán ngành"
            value={assignedResidentCount}
            description="Tính theo học viên duy nhất"
            icon={<GraduationCap className="h-5 w-5" />}
          />

          <StatCard
            label="Chưa gán ngành"
            value={Math.max(members.length - assignedResidentCount, 0)}
            description="Số liệu tạm từ danh sách học viên"
            icon={<AlertCircle className="h-5 w-5" />}
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
                Sắp xếp số học viên theo ngành: Y, Sư phạm, Kinh tế, Công nghệ
                thực phẩm...
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Gán ngành học cho học viên.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Hỗ trợ lọc học viên theo ngành.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này hiển thị trong tab Học vụ của hồ sơ học viên.
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
                Có thể tận dụng: <b>schools</b>, <b>programs</b>,{" "}
                <b>residentAcademicInfo</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Nếu programs chưa đủ ý nghĩa ngành học, nên bổ sung bảng{" "}
                <b>majors</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                API cần sau: listMajors, createMajor, assignMajorToResident,
                getMajorStats.
              </div>
            </div>
          </div>
        </div>

        {/* Major stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Thống kê học viên theo ngành
              </h2>
              <p className="text-sm text-neutral-500">
                Số liệu mock dựa trên danh sách gán ngành trên UI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {majorStats.map((major) => (
              <div
                key={major.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900">{major.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">{major.group}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {major.count}
                  </span>
                </div>
                {major.description && (
                  <p className="mt-3 text-xs text-neutral-500">
                    {major.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, mã học viên, ngành, trường, lớp..."
                className="pl-10"
              />
            </div>

            <select
              value={majorFilter}
              onChange={(event) => setMajorFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả ngành</option>
              {majors.map((major) => (
                <option key={major.id} value={String(major.id)}>
                  {major.name}
                </option>
              ))}
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

        {/* Assignment table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách học viên theo ngành
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredAssignments.length} dòng đang hiển thị. Dữ liệu gán
                ngành hiện là mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ngành học
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trường
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Lớp / Khóa
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
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {item.residentName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {item.residentCode}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {item.majorName}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.schoolName || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.className || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.note || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditAssignment(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa gán ngành"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa gán ngành mock"
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
                      Không có học viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Majors table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh mục ngành học
              </h2>
              <p className="text-sm text-neutral-500">
                Danh mục này hiện là mock UI, chưa ghi database.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ngành học
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhóm ngành
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Mô tả
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Số học viên
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {majorStats.map((major) => (
                  <tr key={major.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4 font-semibold text-neutral-900">
                      {major.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {major.group}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {major.description || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {major.count}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditMajor(major)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa ngành"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMajor(major.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa ngành mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {majorStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Chưa có ngành học nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isMajorFormOpen && (
          <MajorFormModal
            title={editingMajor ? "Chỉnh sửa ngành học" : "Thêm ngành học"}
            formData={majorForm}
            setFormData={setMajorForm}
            onClose={() => {
              setIsMajorFormOpen(false);
              setEditingMajor(null);
            }}
            onSubmit={handleSaveMajor}
          />
        )}

        {isAssignmentFormOpen && (
          <AssignmentFormModal
            title={
              editingAssignment
                ? "Chỉnh sửa ngành của học viên"
                : "Gán ngành cho học viên"
            }
            formData={assignmentForm}
            setFormData={setAssignmentForm}
            members={members}
            membersLoading={membersQuery.isLoading}
            majors={majors}
            onClose={() => {
              setIsAssignmentFormOpen(false);
              setEditingAssignment(null);
            }}
            onSubmit={handleSaveAssignment}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function MajorFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: MajorFormData;
  setFormData: React.Dispatch<React.SetStateAction<MajorFormData>>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Form này hiện chỉ cập nhật ngành học trong UI mock, chưa ghi
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
            <Label htmlFor="majorName">Tên ngành *</Label>
            <Input
              id="majorName"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
              placeholder="VD: Y, Sư phạm, Kinh tế..."
              required
            />
          </div>

          <div>
            <Label htmlFor="majorGroup">Nhóm ngành *</Label>
            <Input
              id="majorGroup"
              value={formData.group}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  group: event.target.value,
                })
              }
              placeholder="VD: Sức khỏe, Giáo dục, Kinh tế..."
              required
            />
          </div>

          <div>
            <Label htmlFor="majorDescription">Mô tả</Label>
            <Textarea
              id="majorDescription"
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
              placeholder="Mô tả thêm về nhóm ngành"
              className="min-h-24"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  isActive: event.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Đang sử dụng
              </p>
              <p className="text-xs text-neutral-500">
                Ngành này sẽ xuất hiện trong danh sách gán ngành cho học viên.
              </p>
            </div>
          </label>

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

function AssignmentFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  majors,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: AssignmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssignmentFormData>>;
  members: any[];
  membersLoading: boolean;
  majors: Major[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const activeMajors = majors.filter((major) => major.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Chọn học viên từ danh sách thật. Gán ngành hiện chỉ lưu trong UI
              mock, chưa ghi database.
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
            <Label htmlFor="majorId">Chọn ngành *</Label>
            <select
              id="majorId"
              value={formData.majorId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  majorId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn ngành --</option>

              {activeMajors.map((major) => (
                <option key={major.id} value={String(major.id)}>
                  {major.name} - {major.group}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="schoolName">Trường học</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    schoolName: event.target.value,
                  })
                }
                placeholder="VD: Đại học Y Dược"
              />
            </div>

            <div>
              <Label htmlFor="className">Lớp / Khóa</Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    className: event.target.value,
                  })
                }
                placeholder="VD: Y2026"
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