import { useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SkillResultStatus = "learning" | "completed" | "dropped" | "not_passed";

type SkillItem = {
  id: number;
  name: string;
  category: string;
};

type SkillResult = {
  id: number;
  residentId: number;
  residentName: string;
  residentCode: string;
  skillId: number;
  skillName: string;
  className?: string;
  status: SkillResultStatus;
  evaluationLevel?: "basic" | "good" | "excellent";
  evaluatedBy?: string;
  evaluatedAt?: string;
  note?: string;
};

type ResultFormData = {
  residentId: string;
  skillId: string;
  className: string;
  status: SkillResultStatus;
  evaluationLevel: "basic" | "good" | "excellent";
  evaluatedBy: string;
  evaluatedAt: string;
  note: string;
};

const initialSkills: SkillItem[] = [
  { id: 1, name: "Đàn", category: "Âm nhạc" },
  { id: 2, name: "Biên đạo", category: "Biên đạo / Vận động" },
  { id: 3, name: "Linh hoạt viên", category: "Lãnh đạo / Sinh hoạt" },
  { id: 4, name: "Truyền thông", category: "Truyền thông" },
];

const initialResults: SkillResult[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    skillId: 1,
    skillName: "Đàn",
    className: "Lớp đàn căn bản",
    status: "learning",
    evaluationLevel: "basic",
    evaluatedBy: "Người phụ trách âm nhạc",
    evaluatedAt: "2026-10-15",
    note: "Đang học, cần luyện thêm phần đệm hát.",
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    skillId: 2,
    skillName: "Biên đạo",
    className: "Biên đạo căn bản",
    status: "completed",
    evaluationLevel: "good",
    evaluatedBy: "Ban sinh hoạt",
    evaluatedAt: "2026-10-20",
    note: "Hoàn thành tốt, có thể hỗ trợ hoạt động văn nghệ.",
  },
  {
    id: 3,
    residentId: 3,
    residentName: "Lê Minh C",
    residentCode: "HV0003",
    skillId: 3,
    skillName: "Linh hoạt viên",
    className: "Linh hoạt viên cơ bản",
    status: "not_passed",
    evaluationLevel: "basic",
    evaluatedBy: "Ban sinh hoạt",
    evaluatedAt: "2026-10-22",
    note: "Cần rèn thêm kỹ năng dẫn nhóm và quản trò.",
  },
];

const defaultFormData: ResultFormData = {
  residentId: "",
  skillId: "",
  className: "",
  status: "learning",
  evaluationLevel: "basic",
  evaluatedBy: "",
  evaluatedAt: "",
  note: "",
};

function getStatusLabel(status: SkillResultStatus) {
  if (status === "learning") return "Đang học";
  if (status === "completed") return "Hoàn thành";
  if (status === "dropped") return "Nghỉ học";
  return "Chưa đạt";
}

function getStatusClass(status: SkillResultStatus) {
  if (status === "learning") return "bg-blue-50 text-blue-700";
  if (status === "completed") return "bg-green-50 text-green-700";
  if (status === "dropped") return "bg-neutral-100 text-neutral-700";
  return "bg-red-50 text-red-700";
}

function getLevelLabel(level?: SkillResult["evaluationLevel"]) {
  if (level === "excellent") return "Tốt";
  if (level === "good") return "Đạt";
  return "Căn bản";
}

function getLevelClass(level?: SkillResult["evaluationLevel"]) {
  if (level === "excellent") return "bg-purple-50 text-purple-700";
  if (level === "good") return "bg-green-50 text-green-700";
  return "bg-neutral-100 text-neutral-700";
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

export default function SkillResults() {
  const [skills] = useState<SkillItem[]>(initialSkills);
  const [results, setResults] = useState<SkillResult[]>(initialResults);

  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<SkillResult | null>(null);
  const [formData, setFormData] = useState<ResultFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Kết quả kỹ năng hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        item.skillName.toLowerCase().includes(keyword) ||
        (item.className || "").toLowerCase().includes(keyword) ||
        (item.evaluatedBy || "").toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword);

      const matchesSkill =
        skillFilter === "all" || String(item.skillId) === skillFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesLevel =
        levelFilter === "all" || item.evaluationLevel === levelFilter;

      return matchesSearch && matchesSkill && matchesStatus && matchesLevel;
    });
  }, [results, searchTerm, skillFilter, statusFilter, levelFilter]);

  const learningCount = results.filter((item) => item.status === "learning").length;
  const completedCount = results.filter(
    (item) => item.status === "completed"
  ).length;
  const droppedCount = results.filter((item) => item.status === "dropped").length;
  const notPassedCount = results.filter(
    (item) => item.status === "not_passed"
  ).length;

  const uniqueResidentsCount = new Set(results.map((item) => item.residentId)).size;

  const skillStats = useMemo(() => {
    return skills.map((skill) => ({
      ...skill,
      total: results.filter((item) => item.skillId === skill.id).length,
      completed: results.filter(
        (item) => item.skillId === skill.id && item.status === "completed"
      ).length,
    }));
  }, [skills, results]);

  const openCreateForm = () => {
    setEditingResult(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (result: SkillResult) => {
    setEditingResult(result);
    setFormData({
      residentId: String(result.residentId),
      skillId: String(result.skillId),
      className: result.className || "",
      status: result.status,
      evaluationLevel: result.evaluationLevel || "basic",
      evaluatedBy: result.evaluatedBy || "",
      evaluatedAt: result.evaluatedAt || "",
      note: result.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === formData.residentId
    );

    const selectedSkill = skills.find(
      (skill) => String(skill.id) === formData.skillId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên.");
      return;
    }

    if (!selectedSkill) {
      alert("Vui lòng chọn kỹ năng.");
      return;
    }

    const duplicated = results.some(
      (item) =>
        item.residentId === selectedResident.id &&
        item.skillId === selectedSkill.id &&
        (item.className || "") === formData.className &&
        item.id !== editingResult?.id
    );

    if (duplicated) {
      alert(
        "Học viên này đã có kết quả cho kỹ năng/lớp đã chọn. Vui lòng sửa dòng hiện có."
      );
      return;
    }

    if (editingResult) {
      setResults((prev) =>
        prev.map((item) =>
          item.id === editingResult.id
            ? {
                ...item,
                residentId: selectedResident.id,
                residentName: selectedResident.fullName || "-",
                residentCode:
                  selectedResident.residentCode || `ID: ${selectedResident.id}`,
                skillId: selectedSkill.id,
                skillName: selectedSkill.name,
                className: formData.className,
                status: formData.status,
                evaluationLevel: formData.evaluationLevel,
                evaluatedBy: formData.evaluatedBy,
                evaluatedAt: formData.evaluatedAt,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newResult: SkillResult = {
        id: Date.now(),
        residentId: selectedResident.id,
        residentName: selectedResident.fullName || "-",
        residentCode:
          selectedResident.residentCode || `ID: ${selectedResident.id}`,
        skillId: selectedSkill.id,
        skillName: selectedSkill.name,
        className: formData.className,
        status: formData.status,
        evaluationLevel: formData.evaluationLevel,
        evaluatedBy: formData.evaluatedBy,
        evaluatedAt: formData.evaluatedAt,
        note: formData.note,
      };

      setResults((prev) => [newResult, ...prev]);
    }

    setIsFormOpen(false);
    setEditingResult(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kết quả kỹ năng này khỏi UI mock?")) {
      return;
    }

    setResults((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMarkCompleted = (result: SkillResult) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === result.id
          ? {
              ...item,
              status: "completed",
              evaluationLevel:
                item.evaluationLevel === "basic" ? "good" : item.evaluationLevel,
              evaluatedAt: item.evaluatedAt || new Date().toISOString().split("T")[0],
              note: item.note || "Đã đánh dấu hoàn thành từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSkillFilter("all");
    setStatusFilter("all");
    setLevelFilter("all");
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
              Kết quả hoàn thành kỹ năng
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Theo dõi kết quả học kỹ năng của từng học viên: đang học, hoàn
              thành, nghỉ học hoặc chưa đạt.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm kết quả kỹ năng
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho kết quả kỹ năng - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Kết
                quả kỹ năng hiện chỉ lưu bằng state mock trên UI, chưa ghi
                database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">skillEvaluations</span> và{" "}
                <span className="font-semibold">residentSkillEnrollments</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Học viên có kỹ năng"
            value={uniqueResidentsCount}
            description="Tính theo học viên duy nhất"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Đang học"
            value={learningCount}
            description="Đang tham gia kỹ năng"
            icon={<Target className="h-5 w-5" />}
          />

          <StatCard
            label="Hoàn thành"
            value={completedCount}
            description="Đã hoàn thành kỹ năng"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Nghỉ học"
            value={droppedCount}
            description="Dừng tham gia"
            icon={<AlertCircle className="h-5 w-5" />}
          />

          <StatCard
            label="Chưa đạt"
            value={notPassedCount}
            description="Cần học lại / bổ sung"
            icon={<TrendingUp className="h-5 w-5" />}
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
                Theo dõi kết quả học kỹ năng theo học viên.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Trạng thái đúng yêu cầu: đang học, hoàn thành, nghỉ học.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bổ sung trạng thái chưa đạt để quản lý trường hợp cần học lại.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này hiển thị trong tab Kỹ năng của hồ sơ học viên.
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
                Bảng đề xuất: <b>residentSkillEnrollments</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>skillEvaluations</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quan hệ dữ liệu: <b>residents 1 - n skillEvaluations</b>.
              </div>
            </div>
          </div>
        </div>

        {/* Skill stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            Thống kê theo kỹ năng
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Số liệu mock dựa trên kết quả kỹ năng hiện tại.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {skillStats.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {item.category}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {item.completed}/{item.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, kỹ năng, lớp, người đánh giá, ghi chú..."
                className="pl-10"
              />
            </div>

            <select
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả kỹ năng</option>
              {skills.map((skill) => (
                <option key={skill.id} value={String(skill.id)}>
                  {skill.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="learning">Đang học</option>
              <option value="completed">Hoàn thành</option>
              <option value="dropped">Nghỉ học</option>
              <option value="not_passed">Chưa đạt</option>
            </select>

            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả mức</option>
              <option value="basic">Căn bản</option>
              <option value="good">Đạt</option>
              <option value="excellent">Tốt</option>
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

        {/* Results table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Danh sách kết quả kỹ năng
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredResults.length} dòng đang hiển thị. Dữ liệu hiện là mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Kỹ năng
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Lớp
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Mức đánh giá
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Đánh giá
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
                {filteredResults.map((item) => (
                  <tr key={item.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.residentName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.residentCode}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {item.skillName}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.className || "-"}
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

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getLevelClass(
                          item.evaluationLevel
                        )}`}
                      >
                        {getLevelLabel(item.evaluationLevel)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div>
                        <p>{item.evaluatedBy || "-"}</p>
                        <p className="text-xs text-neutral-500">
                          {formatDate(item.evaluatedAt)}
                        </p>
                      </div>
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
                          title="Sửa kết quả"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa kết quả mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredResults.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có kết quả kỹ năng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <SkillResultFormModal
            title={
              editingResult
                ? "Chỉnh sửa kết quả kỹ năng"
                : "Thêm kết quả kỹ năng"
            }
            formData={formData}
            setFormData={setFormData}
            skills={skills}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingResult(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function SkillResultFormModal({
  title,
  formData,
  setFormData,
  skills,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: ResultFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResultFormData>>;
  skills: SkillItem[];
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
              Chọn học viên từ danh sách thật. Kết quả kỹ năng hiện chỉ lưu mock
              trên UI, chưa ghi database.
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

          <div>
            <Label htmlFor="skillId">Kỹ năng *</Label>
            <select
              id="skillId"
              value={formData.skillId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  skillId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn kỹ năng --</option>

              {skills.map((skill) => (
                <option key={skill.id} value={String(skill.id)}>
                  {skill.name} - {skill.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="className">Lớp kỹ năng</Label>
            <Input
              id="className"
              value={formData.className}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  className: event.target.value,
                })
              }
              placeholder="VD: Lớp đàn căn bản"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="status">Trạng thái *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    status: event.target.value as SkillResultStatus,
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="learning">Đang học</option>
                <option value="completed">Hoàn thành</option>
                <option value="dropped">Nghỉ học</option>
                <option value="not_passed">Chưa đạt</option>
              </select>
            </div>

            <div>
              <Label htmlFor="evaluationLevel">Mức đánh giá</Label>
              <select
                id="evaluationLevel"
                value={formData.evaluationLevel}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    evaluationLevel: event.target.value as ResultFormData["evaluationLevel"],
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="basic">Căn bản</option>
                <option value="good">Đạt</option>
                <option value="excellent">Tốt</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="evaluatedBy">Người đánh giá</Label>
            <Input
              id="evaluatedBy"
              value={formData.evaluatedBy}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  evaluatedBy: event.target.value,
                })
              }
              placeholder="VD: Người phụ trách kỹ năng"
            />
          </div>

          <div>
            <Label htmlFor="evaluatedAt">Ngày đánh giá</Label>
            <Input
              id="evaluatedAt"
              type="date"
              value={formData.evaluatedAt}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  evaluatedAt: event.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="note">Nhận xét</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  note: event.target.value,
                })
              }
              placeholder="Nhận xét thêm về quá trình học kỹ năng"
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