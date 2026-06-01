import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
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

type LiturgyType =
  | "mass"
  | "evening_prayer"
  | "morning_prayer"
  | "adoration"
  | "special_liturgy";

type RequirementType = "required" | "optional";

type LiturgyScheduleItem = {
  id: number;
  weekName: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime?: string;
  type: LiturgyType;
  title: string;
  location: string;
  requirementType: RequirementType;
  responsibleGroup?: string;
  note?: string;
};

type LiturgyFormData = {
  weekName: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime: string;
  type: LiturgyType;
  title: string;
  location: string;
  requirementType: RequirementType;
  responsibleGroup: string;
  note: string;
};

const initialSchedules: LiturgyScheduleItem[] = [
  {
    id: 1,
    weekName: "Tuần 01",
    date: "2026-09-07",
    dayName: "Thứ 2",
    startTime: "21:00",
    endTime: "21:30",
    type: "evening_prayer",
    title: "Kinh tối cộng đoàn",
    location: "Nhà nguyện lưu xá",
    requirementType: "required",
    responsibleGroup: "Nhóm phụng vụ",
    note: "Điểm danh sau kinh tối.",
  },
  {
    id: 2,
    weekName: "Tuần 01",
    date: "2026-09-10",
    dayName: "Thứ 5",
    startTime: "21:00",
    endTime: "21:30",
    type: "evening_prayer",
    title: "Kinh tối",
    location: "Nhà nguyện lưu xá",
    requirementType: "required",
    responsibleGroup: "Phòng 1",
    note: "Phòng 1 chuẩn bị.",
  },
  {
    id: 3,
    weekName: "Tuần 01",
    date: "2026-09-13",
    dayName: "Chúa nhật",
    startTime: "06:00",
    endTime: "07:00",
    type: "mass",
    title: "Thánh lễ Chúa nhật",
    location: "Nhà thờ giáo xứ",
    requirementType: "required",
    responsibleGroup: "Toàn lưu xá",
    note: "Yêu cầu tham dự.",
  },
  {
    id: 4,
    weekName: "Tuần 01",
    date: "2026-09-12",
    dayName: "Thứ 7",
    startTime: "19:30",
    endTime: "20:30",
    type: "adoration",
    title: "Chầu Thánh Thể",
    location: "Nhà nguyện lưu xá",
    requirementType: "optional",
    responsibleGroup: "Nhóm phụng vụ",
    note: "Khuyến khích tham dự.",
  },
];

const defaultFormData: LiturgyFormData = {
  weekName: "Tuần 01",
  date: "",
  dayName: "Thứ 2",
  startTime: "",
  endTime: "",
  type: "evening_prayer",
  title: "",
  location: "",
  requirementType: "required",
  responsibleGroup: "",
  note: "",
};

function getTypeLabel(type: LiturgyType) {
  if (type === "mass") return "Thánh lễ";
  if (type === "evening_prayer") return "Kinh tối";
  if (type === "morning_prayer") return "Kinh sáng";
  if (type === "adoration") return "Chầu Thánh Thể";
  return "Phụng vụ đặc biệt";
}

function getTypeClass(type: LiturgyType) {
  if (type === "mass") return "bg-purple-50 text-purple-700";
  if (type === "evening_prayer") return "bg-blue-50 text-blue-700";
  if (type === "morning_prayer") return "bg-green-50 text-green-700";
  if (type === "adoration") return "bg-orange-50 text-orange-700";
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

export default function LiturgySchedule() {
  const [schedules, setSchedules] =
    useState<LiturgyScheduleItem[]>(initialSchedules);

  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [requirementFilter, setRequirementFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<LiturgyScheduleItem | null>(null);
  const [formData, setFormData] = useState<LiturgyFormData>(defaultFormData);

  const weeks = useMemo(() => {
    return Array.from(new Set(schedules.map((item) => item.weekName)));
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.weekName.toLowerCase().includes(keyword) ||
        item.dayName.toLowerCase().includes(keyword) ||
        (item.responsibleGroup || "").toLowerCase().includes(keyword);

      const matchesWeek = weekFilter === "all" || item.weekName === weekFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;

      const matchesRequirement =
        requirementFilter === "all" ||
        item.requirementType === requirementFilter;

      return (
        matchesSearch && matchesWeek && matchesType && matchesRequirement
      );
    });
  }, [schedules, searchTerm, weekFilter, typeFilter, requirementFilter]);

  const requiredCount = schedules.filter(
    (item) => item.requirementType === "required"
  ).length;

  const massCount = schedules.filter((item) => item.type === "mass").length;
  const prayerCount = schedules.filter(
    (item) => item.type === "evening_prayer" || item.type === "morning_prayer"
  ).length;

  const openCreateForm = () => {
    setEditingSchedule(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (schedule: LiturgyScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      weekName: schedule.weekName,
      date: schedule.date,
      dayName: schedule.dayName,
      startTime: schedule.startTime,
      endTime: schedule.endTime || "",
      type: schedule.type,
      title: schedule.title,
      location: schedule.location,
      requirementType: schedule.requirementType,
      responsibleGroup: schedule.responsibleGroup || "",
      note: schedule.note || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((item) =>
          item.id === editingSchedule.id
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );
    } else {
      const newSchedule: LiturgyScheduleItem = {
        id: Date.now(),
        ...formData,
      };

      setSchedules((prev) => [newSchedule, ...prev]);
    }

    setIsFormOpen(false);
    setEditingSchedule(null);
    setFormData(defaultFormData);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch phụng vụ này khỏi UI mock?")) {
      return;
    }

    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setWeekFilter("all");
    setTypeFilter("all");
    setRequirementFilter("all");
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
              Lịch phụng vụ
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Thiết lập lịch Thánh lễ, kinh tối, cầu nguyện và các sinh hoạt
              phụng vụ theo tuần cho học viên lưu trú.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm lịch phụng vụ
          </button>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">UI mock - chưa ghi database</p>
              <p className="mt-1 text-sm">
                Màn hình này dùng để chốt nghiệp vụ lịch phụng vụ. Dữ liệu hiện
                chỉ lưu bằng state mock trên UI. Sau này sẽ mapping với{" "}
                <span className="font-semibold">liturgySchedules</span> và{" "}
                <span className="font-semibold">liturgyScheduleItems</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng buổi"
            value={schedules.length}
            description="Số buổi trong lịch mock"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            label="Bắt buộc"
            value={requiredCount}
            description="Cần theo dõi tham gia"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Thánh lễ"
            value={massCount}
            description="Các buổi Thánh lễ"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Kinh nguyện"
            value={prayerCount}
            description="Kinh sáng / kinh tối"
            icon={<Clock className="h-5 w-5" />}
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
                Tạo lịch phụng vụ theo tuần.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quản lý các buổi Thánh lễ, kinh tối, cầu nguyện.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Phân biệt hoạt động bắt buộc và tùy chọn.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Làm nền cho theo dõi đi lễ / kinh tối ở bước tiếp theo.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>liturgySchedules</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>liturgyScheduleItems</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>liturgyAttendance</b> để theo dõi hoàn
                thành.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Có thể liên kết với <b>organizationRoles</b> nếu có nhóm phụng
                vụ phụ trách.
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_160px_190px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo hoạt động, tuần, địa điểm, nhóm phụ trách..."
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
              <option value="all">Tất cả loại</option>
              <option value="mass">Thánh lễ</option>
              <option value="evening_prayer">Kinh tối</option>
              <option value="morning_prayer">Kinh sáng</option>
              <option value="adoration">Chầu Thánh Thể</option>
              <option value="special_liturgy">Phụng vụ đặc biệt</option>
            </select>

            <select
              value={requirementFilter}
              onChange={(event) => setRequirementFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả yêu cầu</option>
              <option value="required">Bắt buộc</option>
              <option value="optional">Tùy chọn</option>
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

        {/* Schedule table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách lịch phụng vụ
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredSchedules.length} dòng đang hiển thị. Dữ liệu hiện là
                mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Tuần / Ngày
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hoạt động
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Thời gian
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Địa điểm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Yêu cầu
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Phụ trách
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredSchedules.map((item) => (
                  <tr key={item.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.weekName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.dayName}, {formatDate(item.date)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900">
                        {item.title}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeClass(
                          item.type
                        )}`}
                      >
                        {getTypeLabel(item.type)}
                      </span>
                      {item.note && (
                        <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                          {item.note}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        {item.startTime}
                        {item.endTime ? ` - ${item.endTime}` : ""}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        {item.location}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {item.requirementType === "required" ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Bắt buộc
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                          Tùy chọn
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.responsibleGroup || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa lịch"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa lịch mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSchedules.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có lịch phụng vụ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <LiturgyScheduleFormModal
            title={
              editingSchedule
                ? "Chỉnh sửa lịch phụng vụ"
                : "Thêm lịch phụng vụ"
            }
            formData={formData}
            setFormData={setFormData}
            onClose={() => {
              setIsFormOpen(false);
              setEditingSchedule(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function LiturgyScheduleFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: LiturgyFormData;
  setFormData: React.Dispatch<React.SetStateAction<LiturgyFormData>>;
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
              Form này hiện chỉ lưu lịch phụng vụ trong UI mock, chưa ghi
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
              <Label htmlFor="dayName">Thứ / Ngày trong tuần *</Label>
              <select
                id="dayName"
                value={formData.dayName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    dayName: event.target.value,
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Thứ 2">Thứ 2</option>
                <option value="Thứ 3">Thứ 3</option>
                <option value="Thứ 4">Thứ 4</option>
                <option value="Thứ 5">Thứ 5</option>
                <option value="Thứ 6">Thứ 6</option>
                <option value="Thứ 7">Thứ 7</option>
                <option value="Chúa nhật">Chúa nhật</option>
              </select>
            </div>
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

          <div>
            <Label htmlFor="title">Tên hoạt động *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  title: event.target.value,
                })
              }
              placeholder="VD: Kinh tối cộng đoàn, Thánh lễ Chúa nhật..."
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Loại phụng vụ *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  type: event.target.value as LiturgyType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="mass">Thánh lễ</option>
              <option value="evening_prayer">Kinh tối</option>
              <option value="morning_prayer">Kinh sáng</option>
              <option value="adoration">Chầu Thánh Thể</option>
              <option value="special_liturgy">Phụng vụ đặc biệt</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startTime">Giờ bắt đầu *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    startTime: event.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">Giờ kết thúc</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    endTime: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Địa điểm *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  location: event.target.value,
                })
              }
              placeholder="VD: Nhà nguyện lưu xá, nhà thờ giáo xứ..."
              required
            />
          </div>

          <div>
            <Label htmlFor="requirementType">Yêu cầu tham gia *</Label>
            <select
              id="requirementType"
              value={formData.requirementType}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  requirementType: event.target.value as RequirementType,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="required">Bắt buộc</option>
              <option value="optional">Tùy chọn</option>
            </select>
          </div>

          <div>
            <Label htmlFor="responsibleGroup">Nhóm / Người phụ trách</Label>
            <Input
              id="responsibleGroup"
              value={formData.responsibleGroup}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  responsibleGroup: event.target.value,
                })
              }
              placeholder="VD: Nhóm phụng vụ, Phòng 1..."
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