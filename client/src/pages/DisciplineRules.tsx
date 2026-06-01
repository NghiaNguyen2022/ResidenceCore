import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileWarning,
  Plus,
  Search,
  ShieldAlert,
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

type CaseStatus = "open" | "following" | "resolved" | "cancelled";
type CaseAction = "remind" | "talk" | "warning" | "report" | "other";
type CaseLevel = "low" | "medium" | "high" | "critical";

type DisciplineRuleOption = {
  id: number;
  ruleCode: string;
  title: string;
  level: CaseLevel;
  category: string;
};

type DisciplineCase = {
  id: number;
  residentId: number;
  residentName: string;
  residentCode: string;
  ruleId?: number;
  ruleCode?: string;
  ruleTitle: string;
  level: CaseLevel;
  incidentDate: string;
  action: CaseAction;
  status: CaseStatus;
  handledBy?: string;
  description: string;
  followUpNote?: string;
  resolvedAt?: string;
};

type CaseFormData = {
  residentId: string;
  ruleId: string;
  ruleTitle: string;
  level: CaseLevel;
  incidentDate: string;
  action: CaseAction;
  status: CaseStatus;
  handledBy: string;
  description: string;
  followUpNote: string;
  resolvedAt: string;
};

const initialRules: DisciplineRuleOption[] = [
  {
    id: 1,
    ruleCode: "NQ-001",
    title: "Về trễ sau giờ quy định",
    level: "medium",
    category: "Giờ giấc",
  },
  {
    id: 2,
    ruleCode: "NQ-002",
    title: "Không tham gia kinh tối / sinh hoạt bắt buộc",
    level: "medium",
    category: "Phụng vụ / Sinh hoạt",
  },
  {
    id: 3,
    ruleCode: "NQ-003",
    title: "Không giữ vệ sinh phòng ở",
    level: "low",
    category: "Phòng ở / Vệ sinh",
  },
  {
    id: 4,
    ruleCode: "NQ-004",
    title: "Thái độ thiếu tôn trọng",
    level: "high",
    category: "Thái độ / Ứng xử",
  },
];

const initialCases: DisciplineCase[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    ruleId: 1,
    ruleCode: "NQ-001",
    ruleTitle: "Về trễ sau giờ quy định",
    level: "medium",
    incidentDate: "2026-09-12",
    action: "remind",
    status: "following",
    handledBy: "Người phụ trách lưu xá",
    description: "Học viên về sau giờ quy định và có báo trễ sau đó.",
    followUpNote: "Theo dõi thêm trong tháng.",
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    ruleId: 3,
    ruleCode: "NQ-003",
    ruleTitle: "Không giữ vệ sinh phòng ở",
    level: "low",
    incidentDate: "2026-09-15",
    action: "talk",
    status: "resolved",
    handledBy: "Trưởng phòng",
    description: "Khu vực cá nhân chưa gọn gàng, đã được nhắc nhở.",
    followUpNote: "Đã khắc phục trong ngày.",
    resolvedAt: "2026-09-15",
  },
];

const defaultFormData: CaseFormData = {
  residentId: "",
  ruleId: "",
  ruleTitle: "",
  level: "low",
  incidentDate: "",
  action: "remind",
  status: "open",
  handledBy: "",
  description: "",
  followUpNote: "",
  resolvedAt: "",
};

function getLevelLabel(level: CaseLevel) {
  if (level === "low") return "Nhẹ";
  if (level === "medium") return "Trung bình";
  if (level === "high") return "Nghiêm trọng";
  return "Rất nghiêm trọng";
}

function getLevelClass(level: CaseLevel) {
  if (level === "low") return "bg-green-50 text-green-700";
  if (level === "medium") return "bg-orange-50 text-orange-700";
  if (level === "high") return "bg-red-50 text-red-700";
  return "bg-red-100 text-red-800";
}

function getActionLabel(action: CaseAction) {
  if (action === "remind") return "Nhắc nhở";
  if (action === "talk") return "Trao đổi riêng";
  if (action === "warning") return "Cảnh báo";
  if (action === "report") return "Lập biên bản";
  return "Khác";
}

function getStatusLabel(status: CaseStatus) {
  if (status === "open") return "Mới ghi nhận";
  if (status === "following") return "Đang theo dõi";
  if (status === "resolved") return "Đã xử lý";
  return "Hủy";
}

function getStatusClass(status: CaseStatus) {
  if (status === "open") return "bg-blue-50 text-blue-700";
  if (status === "following") return "bg-orange-50 text-orange-700";
  if (status === "resolved") return "bg-green-50 text-green-700";
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

export default function DisciplineCases() {
  const [rules] = useState<DisciplineRuleOption[]>(initialRules);
  const [cases, setCases] = useState<DisciplineCase[]>(initialCases);

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<DisciplineCase | null>(null);
  const [formData, setFormData] = useState<CaseFormData>(defaultFormData);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy data thật từ API hiện tại.
   * Hồ sơ kỷ luật hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        (item.ruleCode || "").toLowerCase().includes(keyword) ||
        item.ruleTitle.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        (item.handledBy || "").toLowerCase().includes(keyword) ||
        (item.followUpNote || "").toLowerCase().includes(keyword);

      const matchesLevel = levelFilter === "all" || item.level === levelFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesAction =
        actionFilter === "all" || item.action === actionFilter;

      return matchesSearch && matchesLevel && matchesStatus && matchesAction;
    });
  }, [cases, searchTerm, levelFilter, statusFilter, actionFilter]);

  const openCount = cases.filter((item) => item.status === "open").length;
  const followingCount = cases.filter(
    (item) => item.status === "following"
  ).length;
  const resolvedCount = cases.filter((item) => item.status === "resolved").length;
  const highCount = cases.filter(
    (item) => item.level === "high" || item.level === "critical"
  ).length;

  const uniqueResidentsCount = new Set(cases.map((item) => item.residentId)).size;

  const openCreateForm = () => {
    setEditingCase(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (disciplineCase: DisciplineCase) => {
    setEditingCase(disciplineCase);
    setFormData({
      residentId: String(disciplineCase.residentId),
      ruleId: disciplineCase.ruleId ? String(disciplineCase.ruleId) : "",
      ruleTitle: disciplineCase.ruleTitle,
      level: disciplineCase.level,
      incidentDate: disciplineCase.incidentDate,
      action: disciplineCase.action,
      status: disciplineCase.status,
      handledBy: disciplineCase.handledBy || "",
      description: disciplineCase.description,
      followUpNote: disciplineCase.followUpNote || "",
      resolvedAt: disciplineCase.resolvedAt || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === formData.residentId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên.");
      return;
    }

    const selectedRule = rules.find(
      (rule) => String(rule.id) === formData.ruleId
    );

    const finalRuleTitle = selectedRule?.title || formData.ruleTitle;

    if (!finalRuleTitle.trim()) {
      alert("Vui lòng chọn nội quy hoặc nhập nội dung vi phạm.");
      return;
    }

    if (editingCase) {
      setCases((prev) =>
        prev.map((item) =>
          item.id === editingCase.id
            ? {
                ...item,
                residentId: selectedResident.id,
                residentName: selectedResident.fullName || "-",
                residentCode:
                  selectedResident.residentCode || `ID: ${selectedResident.id}`,
                ruleId: selectedRule?.id,
                ruleCode: selectedRule?.ruleCode,
                ruleTitle: finalRuleTitle,
                level: selectedRule?.level || formData.level,
                incidentDate: formData.incidentDate,
                action: formData.action,
                status: formData.status,
                handledBy: formData.handledBy,
                description: formData.description,
                followUpNote: formData.followUpNote,
                resolvedAt:
                  formData.status === "resolved"
                    ? formData.resolvedAt || new Date().toISOString().split("T")[0]
                    : formData.resolvedAt,
              }
            : item
        )
      );
    } else {
      const newCase: DisciplineCase = {
        id: Date.now(),
        residentId: selectedResident.id,
        residentName: selectedResident.fullName || "-",
        residentCode:
          selectedResident.residentCode || `ID: ${selectedResident.id}`,
        ruleId: selectedRule?.id,
        ruleCode: selectedRule?.ruleCode,
        ruleTitle: finalRuleTitle,
        level: selectedRule?.level || formData.level,
        incidentDate: formData.incidentDate,
        action: formData.action,
        status: formData.status,
        handledBy: formData.handledBy,
        description: formData.description,
        followUpNote: formData.followUpNote,
        resolvedAt:
          formData.status === "resolved"
            ? formData.resolvedAt || new Date().toISOString().split("T")[0]
            : formData.resolvedAt,
      };

      setCases((prev) => [newCase, ...prev]);
    }

    setIsFormOpen(false);
    setEditingCase(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ xử lý này khỏi UI mock?")) {
      return;
    }

    setCases((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResolve = (disciplineCase: DisciplineCase) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === disciplineCase.id
          ? {
              ...item,
              status: "resolved",
              resolvedAt: item.resolvedAt || new Date().toISOString().split("T")[0],
              followUpNote:
                item.followUpNote || "Đã đánh dấu xử lý xong từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setStatusFilter("all");
    setActionFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Nội quy & Kỷ luật
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Hồ sơ xử lý / Nhắc nhở
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Ghi nhận các trường hợp vi phạm nội quy, nhắc nhở, trao đổi riêng
              hoặc xử lý kỷ luật theo học viên.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm hồ sơ xử lý
          </button>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho hồ sơ xử lý - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Hồ sơ
                xử lý hiện chỉ lưu bằng state mock trên UI, chưa ghi database.
                Sau này sẽ mapping với{" "}
                <span className="font-semibold">disciplineCases</span> và{" "}
                <span className="font-semibold">disciplineActions</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Tổng hồ sơ"
            value={cases.length}
            description="Dữ liệu mock hiện tại"
            icon={<FileWarning className="h-5 w-5" />}
          />

          <StatCard
            label="Học viên liên quan"
            value={uniqueResidentsCount}
            description="Tính theo học viên duy nhất"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Mới / Theo dõi"
            value={`${openCount}/${followingCount}`}
            description="Cần xử lý hoặc theo dõi"
            icon={<ShieldAlert className="h-5 w-5" />}
          />

          <StatCard
            label="Đã xử lý"
            value={resolvedCount}
            description="Hồ sơ đã hoàn tất"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Nghiêm trọng"
            value={highCount}
            description="Mức nghiêm trọng trở lên"
            icon={<AlertCircle className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Ghi nhận hồ sơ nhắc nhở / xử lý theo từng học viên.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Chọn nội quy có sẵn hoặc nhập nội dung vi phạm riêng.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Theo dõi trạng thái: mới ghi nhận, đang theo dõi, đã xử lý.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này hiển thị trong hồ sơ học viên và báo cáo quản lý.
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
                Bảng đề xuất: <b>disciplineCases</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>disciplineActions</b> nếu cần nhiều lần xử lý.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Liên kết chính: <b>residentId</b>, <b>ruleId</b>.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_200px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, nội quy, mô tả, người xử lý..."
                className="pl-10"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả mức</option>
              <option value="low">Nhẹ</option>
              <option value="medium">Trung bình</option>
              <option value="high">Nghiêm trọng</option>
              <option value="critical">Rất nghiêm trọng</option>
            </select>

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả xử lý</option>
              <option value="remind">Nhắc nhở</option>
              <option value="talk">Trao đổi riêng</option>
              <option value="warning">Cảnh báo</option>
              <option value="report">Lập biên bản</option>
              <option value="other">Khác</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Mới ghi nhận</option>
              <option value="following">Đang theo dõi</option>
              <option value="resolved">Đã xử lý</option>
              <option value="cancelled">Hủy</option>
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
              Danh sách hồ sơ xử lý
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredCases.length} hồ sơ đang hiển thị. Dữ liệu hiện là mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nội dung
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ngày ghi nhận
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Mức độ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Xử lý
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Theo dõi
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredCases.map((item) => (
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
                      <p className="text-xs font-semibold text-blue-600">
                        {item.ruleCode || "Khác"}
                      </p>
                      <p className="font-semibold text-neutral-900">
                        {item.ruleTitle}
                      </p>
                      <p className="mt-1 max-w-md text-xs text-neutral-500">
                        {item.description}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {formatDate(item.incidentDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getLevelClass(
                          item.level
                        )}`}
                      >
                        {getLevelLabel(item.level)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <p>{getActionLabel(item.action)}</p>
                      <p className="text-xs text-neutral-500">
                        {item.handledBy || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                      {item.resolvedAt && (
                        <p className="mt-1 text-xs text-neutral-400">
                          Xong: {formatDate(item.resolvedAt)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">
                        {item.followUpNote || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {item.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => handleResolve(item)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            Đã xử lý
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa hồ sơ"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa hồ sơ mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCases.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có hồ sơ xử lý nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <DisciplineCaseFormModal
            title={editingCase ? "Chỉnh sửa hồ sơ xử lý" : "Thêm hồ sơ xử lý"}
            formData={formData}
            setFormData={setFormData}
            rules={rules}
            members={members}
            membersLoading={membersQuery.isLoading}
            onClose={() => {
              setIsFormOpen(false);
              setEditingCase(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function DisciplineCaseFormModal({
  title,
  formData,
  setFormData,
  rules,
  members,
  membersLoading,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: CaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CaseFormData>>;
  rules: DisciplineRuleOption[];
  members: any[];
  membersLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const handleRuleChange = (ruleId: string) => {
    const selectedRule = rules.find((rule) => String(rule.id) === ruleId);

    setFormData({
      ...formData,
      ruleId,
      ruleTitle: selectedRule?.title || "",
      level: selectedRule?.level || formData.level,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Chọn học viên từ danh sách thật. Hồ sơ xử lý hiện chỉ lưu mock trên UI.
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
                setFormData({ ...formData, residentId: event.target.value })
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
            <Label htmlFor="ruleId">Chọn nội quy</Label>
            <select
              id="ruleId"
              value={formData.ruleId}
              onChange={(event) => handleRuleChange(event.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Không chọn / nhập nội dung riêng --</option>

              {rules.map((rule) => (
                <option key={rule.id} value={String(rule.id)}>
                  {rule.ruleCode} - {rule.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="ruleTitle">Nội dung vi phạm *</Label>
            <Input
              id="ruleTitle"
              value={formData.ruleTitle}
              onChange={(event) =>
                setFormData({ ...formData, ruleTitle: event.target.value })
              }
              placeholder="VD: Về trễ sau giờ quy định"
              required
            />
          </div>

          <div>
            <Label htmlFor="incidentDate">Ngày ghi nhận *</Label>
            <Input
              id="incidentDate"
              type="date"
              value={formData.incidentDate}
              onChange={(event) =>
                setFormData({ ...formData, incidentDate: event.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="level">Mức độ *</Label>
            <select
              id="level"
              value={formData.level}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  level: event.target.value as CaseLevel,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="low">Nhẹ</option>
              <option value="medium">Trung bình</option>
              <option value="high">Nghiêm trọng</option>
              <option value="critical">Rất nghiêm trọng</option>
            </select>
          </div>

          <div>
            <Label htmlFor="action">Hình thức xử lý *</Label>
            <select
              id="action"
              value={formData.action}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  action: event.target.value as CaseAction,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="remind">Nhắc nhở</option>
              <option value="talk">Trao đổi riêng</option>
              <option value="warning">Cảnh báo</option>
              <option value="report">Lập biên bản</option>
              <option value="other">Khác</option>
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
                  status: event.target.value as CaseStatus,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="open">Mới ghi nhận</option>
              <option value="following">Đang theo dõi</option>
              <option value="resolved">Đã xử lý</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>

          <div>
            <Label htmlFor="handledBy">Người xử lý</Label>
            <Input
              id="handledBy"
              value={formData.handledBy}
              onChange={(event) =>
                setFormData({ ...formData, handledBy: event.target.value })
              }
              placeholder="VD: Người phụ trách lưu xá"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả sự việc *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Mô tả ngắn gọn, khách quan về sự việc"
              className="min-h-28"
              required
            />
          </div>

          <div>
            <Label htmlFor="followUpNote">Ghi chú theo dõi</Label>
            <Textarea
              id="followUpNote"
              value={formData.followUpNote}
              onChange={(event) =>
                setFormData({ ...formData, followUpNote: event.target.value })
              }
              placeholder="Ghi chú kết quả xử lý, theo dõi tiếp..."
              className="min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="resolvedAt">Ngày xử lý xong</Label>
            <Input
              id="resolvedAt"
              type="date"
              value={formData.resolvedAt}
              onChange={(event) =>
                setFormData({ ...formData, resolvedAt: event.target.value })
              }
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