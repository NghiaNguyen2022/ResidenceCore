import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit2,
  PartyPopper,
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

type ActivityStatus = "planned" | "preparing" | "completed" | "summarized";
type ActivityType =
  | "community"
  | "liturgy"
  | "culture"
  | "charity"
  | "training"
  | "other";

type ActivityPlan = {
  id: number;
  academicYear: string;
  activityName: string;
  activityType: ActivityType;
  expectedTime: string;
  owner: string;
  status: ActivityStatus;
  expectedParticipants?: number;
  budgetNote?: string;
  note?: string;
};

type ActivityPlanFormData = {
  academicYear: string;
  activityName: string;
  activityType: ActivityType;
  expectedTime: string;
  owner: string;
  status: ActivityStatus;
  expectedParticipants: string;
  budgetNote: string;
  note: string;
};

const initialPlans: ActivityPlan[] = [
  {
    id: 1,
    academicYear: "2026 - 2027",
    activityName: "Trò chơi lớn",
    activityType: "community",
    expectedTime: "Tháng 10",
    owner: "Ban sinh hoạt",
    status: "planned",
    expectedParticipants: 80,
    budgetNote: "Dự kiến có chi phí dụng cụ và nước uống.",
    note: "Hoạt động gắn kết đầu năm.",
  },
  {
    id: 2,
    academicYear: "2026 - 2027",
    activityName: "Noel",
    activityType: "liturgy",
    expectedTime: "Tháng 12",
    owner: "Nhóm phụng vụ / văn nghệ",
    status: "preparing",
    expectedParticipants: 100,
    budgetNote: "Có thể phát sinh chi phí trang trí, âm thanh, quà.",
    note: "Cần phối hợp phụng vụ, văn nghệ và truyền thông.",
  },
  {
    id: 3,
    academicYear: "2026 - 2027",
    activityName: "Phục sinh",
    activityType: "liturgy",
    expectedTime: "Theo lịch phụng vụ",
    owner: "Nhóm phụng vụ",
    status: "planned",
    expectedParticipants: 90,
    budgetNote: "Chưa xác định.",
    note: "Hoạt động phụng vụ đặc biệt.",
  },
  {
    id: 4,
    academicYear: "2026 - 2027",
    activityName: "Tất niên",
    activityType: "culture",
    expectedTime: "Cuối năm học",
    owner: "Ban điều hành lưu xá",
    status: "planned",
    expectedParticipants: 100,
    budgetNote: "Dự kiến có chi phí ăn uống và tổng kết.",
    note: "Tổng kết năm học và tri ân.",
  },
  {
    id: 5,
    academicYear: "2026 - 2027",
    activityName: "Mùa hè hy vọng",
    activityType: "charity",
    expectedTime: "Mùa hè",
    owner: "Ban sinh hoạt / thiện nguyện",
    status: "planned",
    expectedParticipants: 50,
    budgetNote: "Có thể cần ngân sách di chuyển, quà tặng.",
    note: "Hoạt động phục vụ cộng đồng.",
  },
];

const defaultFormData: ActivityPlanFormData = {
  academicYear: "2026 - 2027",
  activityName: "",
  activityType: "community",
  expectedTime: "",
  owner: "",
  status: "planned",
  expectedParticipants: "",
  budgetNote: "",
  note: "",
};

function getActivityTypeLabel(type: ActivityType) {
  if (type === "community") return "Sinh hoạt cộng đoàn";
  if (type === "liturgy") return "Phụng vụ";
  if (type === "culture") return "Văn hóa / Văn nghệ";
  if (type === "charity") return "Thiện nguyện";
  if (type === "training") return "Đào tạo / Kỹ năng";
  return "Khác";
}

function getActivityTypeClass(type: ActivityType) {
  if (type === "community") return "bg-blue-50 text-blue-700";
  if (type === "liturgy") return "bg-purple-50 text-purple-700";
  if (type === "culture") return "bg-pink-50 text-pink-700";
  if (type === "charity") return "bg-green-50 text-green-700";
  if (type === "training") return "bg-orange-50 text-orange-700";
  return "bg-neutral-100 text-neutral-700";
}

function getStatusLabel(status: ActivityStatus) {
  if (status === "planned") return "Dự kiến";
  if (status === "preparing") return "Đang chuẩn bị";
  if (status === "completed") return "Đã tổ chức";
  return "Đã tổng kết";
}

function getStatusClass(status: ActivityStatus) {
  if (status === "planned") return "bg-blue-50 text-blue-700";
  if (status === "preparing") return "bg-orange-50 text-orange-700";
  if (status === "completed") return "bg-green-50 text-green-700";
  return "bg-purple-50 text-purple-700";
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

export default function ActivityPlans() {
  const [plans, setPlans] = useState<ActivityPlan[]>(initialPlans);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActivityPlan | null>(null);
  const [formData, setFormData] =
    useState<ActivityPlanFormData>(defaultFormData);

  const years = useMemo(() => {
    return Array.from(new Set(plans.map((item) => item.academicYear)));
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.activityName.toLowerCase().includes(keyword) ||
        item.expectedTime.toLowerCase().includes(keyword) ||
        item.owner.toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword) ||
        (item.budgetNote || "").toLowerCase().includes(keyword);

      const matchesYear =
        yearFilter === "all" || item.academicYear === yearFilter;

      const matchesType =
        typeFilter === "all" || item.activityType === typeFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesYear && matchesType && matchesStatus;
    });
  }, [plans, searchTerm, yearFilter, typeFilter, statusFilter]);

  const plannedCount = plans.filter((item) => item.status === "planned").length;
  const preparingCount = plans.filter(
    (item) => item.status === "preparing"
  ).length;
  const completedCount = plans.filter(
    (item) => item.status === "completed" || item.status === "summarized"
  ).length;

  const totalExpectedParticipants = plans.reduce(
    (sum, item) => sum + (item.expectedParticipants || 0),
    0
  );

  const typeStats = useMemo(() => {
    const types: ActivityType[] = [
      "community",
      "liturgy",
      "culture",
      "charity",
      "training",
      "other",
    ];

    return types
      .map((type) => ({
        type,
        label: getActivityTypeLabel(type),
        count: plans.filter((item) => item.activityType === type).length,
      }))
      .filter((item) => item.count > 0);
  }, [plans]);

  const openCreateForm = () => {
    setEditingPlan(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (plan: ActivityPlan) => {
    setEditingPlan(plan);
    setFormData({
      academicYear: plan.academicYear,
      activityName: plan.activityName,
      activityType: plan.activityType,
      expectedTime: plan.expectedTime,
      owner: plan.owner,
      status: plan.status,
      expectedParticipants: plan.expectedParticipants
        ? String(plan.expectedParticipants)
        : "",
      budgetNote: plan.budgetNote || "",
      note: plan.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const expectedParticipants = formData.expectedParticipants
      ? Number(formData.expectedParticipants)
      : undefined;

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((item) =>
          item.id === editingPlan.id
            ? {
                ...item,
                academicYear: formData.academicYear,
                activityName: formData.activityName,
                activityType: formData.activityType,
                expectedTime: formData.expectedTime,
                owner: formData.owner,
                status: formData.status,
                expectedParticipants,
                budgetNote: formData.budgetNote,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newPlan: ActivityPlan = {
        id: Date.now(),
        academicYear: formData.academicYear,
        activityName: formData.activityName,
        activityType: formData.activityType,
        expectedTime: formData.expectedTime,
        owner: formData.owner,
        status: formData.status,
        expectedParticipants,
        budgetNote: formData.budgetNote,
        note: formData.note,
      };

      setPlans((prev) => [newPlan, ...prev]);
    }

    setIsFormOpen(false);
    setEditingPlan(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kế hoạch hoạt động này khỏi UI mock?")) {
      return;
    }

    setPlans((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMarkCompleted = (plan: ActivityPlan) => {
    setPlans((prev) =>
      prev.map((item) =>
        item.id === plan.id
          ? {
              ...item,
              status: "completed",
              note: item.note || "Đã đánh dấu tổ chức xong từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const handleMarkSummarized = (plan: ActivityPlan) => {
    setPlans((prev) =>
      prev.map((item) =>
        item.id === plan.id
          ? {
              ...item,
              status: "summarized",
              note: item.note || "Đã tổng kết hoạt động từ thao tác nhanh.",
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setYearFilter("all");
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
              Hoạt động & Sự kiện
            </p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Kế hoạch hoạt động năm
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Quản lý kế hoạch hoạt động trong năm như trò chơi lớn, Noel, Phục
              sinh, Tất niên, Mùa hè hy vọng và các sinh hoạt cộng đoàn.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm hoạt động năm
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">UI mock - chưa ghi database</p>
              <p className="mt-1 text-sm">
                Màn hình này dùng để chốt nghiệp vụ kế hoạch hoạt động năm. Dữ
                liệu hiện chỉ lưu bằng state mock trên UI. Sau này sẽ mapping
                với <span className="font-semibold">annualActivityPlans</span>{" "}
                và <span className="font-semibold">activityPlanItems</span>. Nếu
                hoạt động phát sinh chi phí, có thể liên kết thêm module tài
                chính.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng hoạt động"
            value={plans.length}
            description="Kế hoạch hoạt động mock hiện tại"
            icon={<PartyPopper className="h-5 w-5" />}
          />

          <StatCard
            label="Dự kiến"
            value={plannedCount}
            description="Hoạt động chưa bắt đầu chuẩn bị"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            label="Đang chuẩn bị"
            value={preparingCount}
            description="Hoạt động đang triển khai chuẩn bị"
            icon={<Clock className="h-5 w-5" />}
          />

          <StatCard
            label="Đã tổ chức"
            value={completedCount}
            description={`Dự kiến tham gia: ${totalExpectedParticipants}`}
            icon={<CheckCircle2 className="h-5 w-5" />}
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
                Lập kế hoạch hoạt động theo năm học.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quản lý hoạt động: Trò chơi lớn, Noel, Phục sinh, Tất niên, Mùa hè hy vọng.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Theo dõi trạng thái: dự kiến, đang chuẩn bị, đã tổ chức, đã tổng kết.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho tổng kết hoạt động và báo cáo cuối năm.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>annualActivityPlans</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>activityPlanItems</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>activities</b> khi hoạt động được tổ chức thật.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>financial</b> nếu hoạt động có ngân sách/chi phí.
              </div>
            </div>
          </div>
        </div>

        {/* Type stats */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">
            Thống kê theo nhóm hoạt động
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Số liệu mock dựa trên kế hoạch hoạt động hiện tại.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {typeStats.map((item) => (
              <div
                key={item.type}
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
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_220px_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm hoạt động, thời điểm, phụ trách, ghi chú..."
                className="pl-10"
              />
            </div>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả năm</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="community">Sinh hoạt cộng đoàn</option>
              <option value="liturgy">Phụng vụ</option>
              <option value="culture">Văn hóa / Văn nghệ</option>
              <option value="charity">Thiện nguyện</option>
              <option value="training">Đào tạo / Kỹ năng</option>
              <option value="other">Khác</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="planned">Dự kiến</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="completed">Đã tổ chức</option>
              <option value="summarized">Đã tổng kết</option>
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
              Danh sách kế hoạch hoạt động năm
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredPlans.length} hoạt động đang hiển thị. Dữ liệu hiện là mock UI.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hoạt động
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Năm học
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Thời điểm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Phụ trách
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Dự kiến tham gia
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ngân sách / Ghi chú
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredPlans.map((item) => (
                  <tr key={item.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.activityName}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActivityTypeClass(
                          item.activityType
                        )}`}
                      >
                        {getActivityTypeLabel(item.activityType)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.academicYear}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.expectedTime}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.owner || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.expectedParticipants
                        ? `${item.expectedParticipants} người`
                        : "-"}
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
                      <div className="max-w-xs">
                        {item.budgetNote && (
                          <p className="truncate">{item.budgetNote}</p>
                        )}
                        {item.note && (
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {item.note}
                          </p>
                        )}
                        {!item.budgetNote && !item.note && "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "planned" ||
                        item.status === "preparing" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(item)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
                          >
                            Đã tổ chức
                          </button>
                        ) : null}

                        {item.status === "completed" && (
                          <button
                            type="button"
                            onClick={() => handleMarkSummarized(item)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                          >
                            Tổng kết
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa hoạt động"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa hoạt động mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPlans.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có hoạt động nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <ActivityPlanFormModal
            title={
              editingPlan
                ? "Chỉnh sửa kế hoạch hoạt động"
                : "Thêm kế hoạch hoạt động"
            }
            formData={formData}
            setFormData={setFormData}
            onClose={() => {
              setIsFormOpen(false);
              setEditingPlan(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function ActivityPlanFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: ActivityPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<ActivityPlanFormData>>;
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
              Form này hiện chỉ lưu kế hoạch hoạt động trong UI mock, chưa ghi database.
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
            <Label htmlFor="academicYear">Năm học *</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  academicYear: event.target.value,
                })
              }
              placeholder="VD: 2026 - 2027"
              required
            />
          </div>

          <div>
            <Label htmlFor="activityName">Tên hoạt động *</Label>
            <Input
              id="activityName"
              value={formData.activityName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  activityName: event.target.value,
                })
              }
              placeholder="VD: Noel, Phục sinh, Trò chơi lớn..."
              required
            />
          </div>

          <div>
            <Label htmlFor="activityType">Nhóm hoạt động *</Label>
            <select
              id="activityType"
              value={formData.activityType}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  activityType: event.target.value as ActivityType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="community">Sinh hoạt cộng đoàn</option>
              <option value="liturgy">Phụng vụ</option>
              <option value="culture">Văn hóa / Văn nghệ</option>
              <option value="charity">Thiện nguyện</option>
              <option value="training">Đào tạo / Kỹ năng</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <Label htmlFor="expectedTime">Thời điểm dự kiến *</Label>
            <Input
              id="expectedTime"
              value={formData.expectedTime}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  expectedTime: event.target.value,
                })
              }
              placeholder="VD: Tháng 12, Cuối năm học, Mùa hè..."
              required
            />
          </div>

          <div>
            <Label htmlFor="owner">Người / Nhóm phụ trách *</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  owner: event.target.value,
                })
              }
              placeholder="VD: Ban sinh hoạt, Nhóm phụng vụ..."
              required
            />
          </div>

          <div>
            <Label htmlFor="expectedParticipants">Số người dự kiến tham gia</Label>
            <Input
              id="expectedParticipants"
              type="number"
              min="0"
              value={formData.expectedParticipants}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  expectedParticipants: event.target.value,
                })
              }
              placeholder="VD: 80"
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
                  status: event.target.value as ActivityStatus,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="planned">Dự kiến</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="completed">Đã tổ chức</option>
              <option value="summarized">Đã tổng kết</option>
            </select>
          </div>

          <div>
            <Label htmlFor="budgetNote">Ghi chú ngân sách / chi phí</Label>
            <Textarea
              id="budgetNote"
              value={formData.budgetNote}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  budgetNote: event.target.value,
                })
              }
              placeholder="Ghi chú chi phí dự kiến, ngân sách, khoản cần theo dõi..."
              className="min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="note">Ghi chú hoạt động</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  note: event.target.value,
                })
              }
              placeholder="Ghi chú thêm về hoạt động"
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