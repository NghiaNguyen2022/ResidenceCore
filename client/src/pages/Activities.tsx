"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TimePickerInput } from "@/components/shared/form/TimePickerInput";
import {
  AppModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormDateInput,
  FormField,
  LoadingState,
  StatusBadge,
} from "@/components/shared";

const ACTIVITY_TYPES = [
  { value: "community", label: "Sinh hoạt chung", icon: "🌿" },
  { value: "spiritual", label: "Thiêng liêng", icon: "⛪" },
  { value: "study", label: "Học tập", icon: "📚" },
  { value: "sports", label: "Thể thao", icon: "🏃" },
  { value: "culture", label: "Văn hóa", icon: "🎭" },
  { value: "volunteer", label: "Phục vụ", icon: "🤝" },
  { value: "meeting", label: "Họp", icon: "📝" },
  { value: "other", label: "Khác", icon: "✨" },
] as const;

const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES.map(({ value, label }) => ({
  value,
  label,
}));

const ACTIVITY_STATUSES = [
  { value: "draft", label: "Nháp" },
  { value: "scheduled", label: "Dự kiến" },
  { value: "in_progress", label: "Đang diễn ra" },
  { value: "completed", label: "Đã diễn ra" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

const ACTIVITY_STATUS_OPTIONS = ACTIVITY_STATUSES.map(({ value, label }) => ({
  value,
  label,
}));

type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];
type ActivityStatus = (typeof ACTIVITY_STATUSES)[number]["value"];

type Activity = {
  id: number;
  code: string;
  title: string;
  activityType: ActivityType;
  status: ActivityStatus;
  activityDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  ownerGroup?: string | null;
  expectedParticipants?: number | null;
  actualParticipants?: number | null;
  description?: string | null;
  notes?: string | null;
  isPublicOnPortal?: boolean | number | null;
};

type ActivityForm = {
  code: string;
  title: string;
  activityType: ActivityType;
  status: ActivityStatus;
  activityDate: string;
  startTime: string;
  endTime: string;
  location: string;
  ownerGroup: string;
  expectedParticipants: string;
  description: string;
  notes: string;
  isPublicOnPortal: boolean;
};

const DEFAULT_FORM: ActivityForm = {
  code: "",
  title: "",
  activityType: "community",
  status: "scheduled",
  activityDate: "",
  startTime: "19:00",
  endTime: "20:30",
  location: "",
  ownerGroup: "",
  expectedParticipants: "0",
  description: "",
  notes: "",
  isPublicOnPortal: true,
};

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getActivityTypeMeta(type?: string | null) {
  return (
    ACTIVITY_TYPES.find((item) => item.value === type) ?? ACTIVITY_TYPES[0]
  );
}

function getStatusLabel(status?: string | null) {
  return (
    ACTIVITY_STATUSES.find((item) => item.value === status)?.label ?? "Dự kiến"
  );
}

function getStatusTone(status?: string | null) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "warning" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "draft") return "default" as const;
  return "info" as const;
}

function formatTimeRange(activity: Activity) {
  if (activity.startTime && activity.endTime)
    return `${activity.startTime} – ${activity.endTime}`;
  if (activity.startTime) return activity.startTime;
  if (activity.endTime) return `Đến ${activity.endTime}`;
  return "Chưa ghi giờ";
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
}) {
  return (
    <div
      className={`${residenceMediumStyle.premiumGoldBlackCardSoft} px-5 py-4`}
    >
      <span className={residenceMediumStyle.premiumGoldBlackGlossThin} />
      <span className={residenceMediumStyle.premiumGoldBlackGlass} />
      <span className={residenceMediumStyle.premiumGoldBlackGlow} />
      <span className={residenceMediumStyle.premiumGoldBlackGoldBeam} />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black leading-8 text-slate-700">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/82 text-amber-700 shadow-[0_10px_24px_rgba(12,10,9,0.08)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

const modalInputClass =
  "h-9 rounded-xl border-slate-200/80 bg-white/95 text-sm font-semibold text-slate-900 shadow-[0_5px_14px_rgba(15,23,42,0.04)] focus-visible:border-amber-300 focus-visible:ring-amber-200/70";
const modalSelectClass =
  "h-9 w-full appearance-none rounded-xl border border-slate-200/80 bg-white/95 px-3.5 pr-9 text-sm font-semibold text-slate-900 shadow-[0_5px_14px_rgba(15,23,42,0.04)] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/60";
const modalTextareaClass =
  "min-h-[58px] rounded-xl border-slate-200/80 bg-white/95 text-sm shadow-[0_5px_14px_rgba(15,23,42,0.04)] focus-visible:border-amber-300 focus-visible:ring-amber-200/70";

function ModalSelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <FormField label={label} className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={modalSelectClass}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ⌄
        </span>
      </div>
    </FormField>
  );
}

function ActivityToolbarButton({
  children,
  tone = "default",
  onClick,
}: {
  children: ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
        tone === "danger"
          ? "border-red-100 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function StatusQuickFilter({
  value,
  onChange,
}: {
  value: "all" | ActivityStatus;
  onChange: (value: "all" | ActivityStatus) => void;
}) {
  const items: Array<{ value: "all" | ActivityStatus; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "scheduled", label: "Dự kiến" },
    { value: "in_progress", label: "Đang diễn ra" },
    { value: "completed", label: "Đã diễn ra" },
  ];

  return (
    <div className={residenceMediumStyle.standardTabRail}>
      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                active
                  ? "bg-white text-amber-900 shadow-[0_10px_24px_rgba(120,53,15,0.10)] ring-1 ring-amber-100/80"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeQuickFilter({
  value,
  onChange,
}: {
  value: "all" | ActivityType;
  onChange: (value: "all" | ActivityType) => void;
}) {
  const options: Array<{ value: "all" | ActivityType; label: string }> = [
    { value: "all", label: "Tất cả loại" },
    ...ACTIVITY_TYPE_OPTIONS,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-9 rounded-full border px-4 text-sm font-extrabold transition ${
              active
                ? "border-amber-300 bg-white text-amber-800 shadow-[0_10px_24px_rgba(180,83,9,0.14)]"
                : "border-slate-200/80 bg-white/70 text-slate-500 hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ActivityRow({
  activity,
  onEdit,
  onCancel,
  onDelete,
}: {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onCancel: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}) {
  const typeMeta = getActivityTypeMeta(activity.activityType);
  const isPublic = Boolean(activity.isPublicOnPortal);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)] px-4 py-3 shadow-[0_14px_34px_rgba(120,53,15,0.055)] transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_20px_44px_rgba(120,53,15,0.10)]">
      <span className={residenceMediumStyle.premiumGoldBlackGlossThin} />
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base ring-1 ring-amber-100">
              {typeMeta.icon}
            </span>
            <h3 className="min-w-0 flex-1 truncate text-[15px] font-black text-slate-950">
              {activity.title}
            </h3>
            <StatusBadge tone={getStatusTone(activity.status)}>
              {getStatusLabel(activity.status)}
            </StatusBadge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isPublic
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {isPublic ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {isPublic ? "Portal" : "Nội bộ"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
              {formatDate(activity.activityDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              {formatTimeRange(activity)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="truncate">
                {activity.location || "Chưa ghi địa điểm"}
              </span>
            </span>
            <span className="text-slate-400">{activity.code}</span>
          </div>

          {(activity.ownerGroup || activity.description) && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {activity.ownerGroup ? (
                <span className="font-semibold text-slate-700">
                  {activity.ownerGroup}:{" "}
                </span>
              ) : null}
              {activity.description || "Chưa có mô tả."}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 xl:justify-start">
          <ActivityToolbarButton onClick={() => onEdit(activity)}>
            <Edit2 className="h-3.5 w-3.5" />
            Sửa
          </ActivityToolbarButton>
          {activity.status !== "cancelled" && (
            <ActivityToolbarButton onClick={() => onCancel(activity)}>
              <XCircle className="h-3.5 w-3.5" />
              Hủy
            </ActivityToolbarButton>
          )}
          <ActivityToolbarButton
            tone="danger"
            onClick={() => onDelete(activity)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa
          </ActivityToolbarButton>
        </div>
      </div>
    </div>
  );
}

export default function Activities() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ActivityStatus>(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | ActivityType>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityForm>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [activityToCancel, setActivityToCancel] = useState<Activity | null>(
    null,
  );
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null,
  );

  const utils = trpc.useUtils();
  const activitiesQuery = trpc.activities.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    activityType: typeFilter !== "all" ? typeFilter : undefined,
    limit: 200,
    offset: 0,
  });
  const statsQuery = trpc.activities.getStats.useQuery();

  const activities = useMemo<Activity[]>(
    () => (activitiesQuery.data ?? []) as Activity[],
    [activitiesQuery.data],
  );
  const stats = statsQuery.data as any;

  const createMutation = trpc.activities.create.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.activities.getStats.invalidate();
      toast.success("Đã tạo hoạt động.");
      closeForm();
    },
    onError: (error) => setFormError(error.message),
  });

  const updateMutation = trpc.activities.update.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.activities.getStats.invalidate();
      toast.success("Đã cập nhật hoạt động.");
      closeForm();
    },
    onError: (error) => setFormError(error.message),
  });

  const cancelMutation = trpc.activities.cancel.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.activities.getStats.invalidate();
      toast.success("Đã hủy hoạt động.");
      setActivityToCancel(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.activities.getStats.invalidate();
      toast.success("Đã xóa hoạt động.");
      setActivityToDelete(null);
    },
    onError: (error) => toast.error(error.message),
  });

  function openCreate() {
    const today = new Date().toISOString().slice(0, 10);
    setEditingActivity(null);
    setForm({ ...DEFAULT_FORM, activityDate: today });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditingActivity(activity);
    setForm({
      code: activity.code,
      title: activity.title,
      activityType: activity.activityType,
      status: activity.status,
      activityDate: String(activity.activityDate || "").slice(0, 10),
      startTime: activity.startTime || "",
      endTime: activity.endTime || "",
      location: activity.location || "",
      ownerGroup: activity.ownerGroup || "",
      expectedParticipants: String(activity.expectedParticipants ?? 0),
      description: activity.description || "",
      notes: activity.notes || "",
      isPublicOnPortal: Boolean(activity.isPublicOnPortal),
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingActivity(null);
    setForm(DEFAULT_FORM);
    setFormError(null);
  }

  function saveForm() {
    const code = normalizeCode(form.code);
    if (!editingActivity && !code) {
      setFormError("Vui lòng nhập mã hoạt động.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Vui lòng nhập tên hoạt động.");
      return;
    }
    if (!form.activityDate) {
      setFormError("Vui lòng chọn ngày tổ chức.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      activityType: form.activityType,
      status: form.status,
      activityDate: form.activityDate,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      location: form.location.trim() || null,
      ownerGroup: form.ownerGroup.trim() || null,
      expectedParticipants: Number(form.expectedParticipants || 0),
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
      isPublicOnPortal: form.isPublicOnPortal,
    };

    setFormError(null);
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, ...payload });
    } else {
      createMutation.mutate({ code, ...payload });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <ResidenceCareLayout>
      <div className={residenceMediumStyle.page}>
        <span className={residenceMediumStyle.pageAura} />
        <div className={residenceMediumStyle.standardPageContent}>
          <div className={residenceMediumStyle.standardHeader}>
            <div className={residenceMediumStyle.standardHeaderAura} />
            <div className={residenceMediumStyle.standardHeaderInner}>
              <div className={residenceMediumStyle.standardHeaderTextWrap}>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 shadow-sm shadow-amber-950/5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Hoạt động / Sự kiện
                </div>
                <h1 className={residenceMediumStyle.standardHeaderTitle}>
                  Quản lý hoạt động lưu xá
                </h1>
                <p className={residenceMediumStyle.standardHeaderSubtitle}>
                  Theo dõi sinh hoạt, họp, học tập, phục vụ và chọn hoạt động
                  nào hiển thị cho học viên.
                </p>
              </div>
              <div className={residenceMediumStyle.standardHeaderActions}>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setSearch("");
                  }}
                  className={residenceMediumStyle.buttonCard}
                >
                  Tất cả hoạt động
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className={residenceMediumStyle.buttonCardPrimary}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo hoạt động
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatPill
              label="Tổng"
              value={stats?.total ?? 0}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <StatPill
              label="Dự kiến"
              value={stats?.scheduled ?? 0}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatPill
              label="Đang diễn ra"
              value={stats?.inProgress ?? 0}
              icon={<Clock className="h-5 w-5" />}
            />
            <StatPill
              label="Đã diễn ra"
              value={stats?.completed ?? 0}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>

          <StatusQuickFilter value={statusFilter} onChange={setStatusFilter} />

          <section
            className={`${residenceMediumStyle.filterPanel} relative z-0 px-5 py-4`}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.28fr)_1fr] lg:items-start">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.28em] text-slate-500">
                  Bộ lọc
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Tìm kiếm và lọc loại hoạt động, không dùng dropdown để tránh
                  chồng layout.
                </p>
              </div>
              <div className="space-y-3">
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm theo tên, mã, địa điểm, ban phụ trách..."
                    className={residenceMediumStyle.searchInput}
                  />
                </div>
                <TypeQuickFilter value={typeFilter} onChange={setTypeFilter} />
              </div>
            </div>
          </section>

          <section className={residenceMediumStyle.section}>
            <div className={residenceMediumStyle.sectionHeader}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-700">
                    Danh sách
                  </p>
                  <h2 className={residenceMediumStyle.sectionTitle}>
                    Hoạt động lưu xá
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activities.length} hoạt động theo bộ lọc hiện tại.
                  </p>
                </div>
              </div>
            </div>
            <div className={residenceMediumStyle.sectionBody}>
              {activitiesQuery.isLoading ? (
                <LoadingState />
              ) : activitiesQuery.isError ? (
                <ErrorState
                  message={activitiesQuery.error.message}
                  onRetry={() => activitiesQuery.refetch()}
                />
              ) : activities.length === 0 ? (
                <EmptyState
                  title="Chưa có hoạt động nào"
                  description="Tạo hoạt động đầu tiên để demo lịch sinh hoạt, họp, thiện nguyện hoặc sự kiện chung của lưu xá."
                  action={
                    <Button
                      type="button"
                      className={residenceMediumStyle.buttonCardPrimary}
                      onClick={openCreate}
                    >
                      <Plus className="h-4 w-4" />
                      Tạo hoạt động
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      onEdit={openEdit}
                      onCancel={setActivityToCancel}
                      onDelete={setActivityToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <style>{`
                        .activity-modal-date-field input,
                        .activity-modal-date-field button,
                        .activity-modal-time-field input,
                        .activity-modal-time-field button {
                              min-width: 0;
                        }
                        .activity-modal-date-field > *,
                        .activity-modal-time-field > * {
                              width: 100%;
                        }
                        .activity-modal-date-field input,
                        .activity-modal-time-field input {
                              height: 2.5rem;
                              border-radius: 0.75rem;
                              font-size: 0.875rem;
                              font-weight: 600;
                        }
                  `}</style>
        <AppModal
          open={isFormOpen}
          onOpenChange={(open) => !open && closeForm()}
          title={editingActivity ? "Sửa hoạt động" : "Tạo hoạt động mới"}
          description="Giữ thông tin gọn để demo, có thể mở rộng đăng ký/điểm danh sau."
          size="lg"
          footer={
            <div className="flex w-full flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="outline"
                className="h-9 rounded-xl px-4 text-sm font-bold"
                onClick={closeForm}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button
                className="h-9 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)] hover:bg-slate-800"
                onClick={saveForm}
                disabled={isSaving}
              >
                {isSaving
                  ? "Đang lưu..."
                  : editingActivity
                    ? "Cập nhật"
                    : "Tạo hoạt động"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <div className="rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,#ffffff_0%,#fffdf8_100%)] p-4 shadow-[0_16px_38px_rgba(120,53,15,0.07)] ring-1 ring-white/80">
              <div className="mb-3 flex flex-col gap-3 border-b border-amber-50/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
                    Thông tin hoạt động
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Chỉ nhập những dữ liệu cần để hiển thị và demo.
                  </p>
                </div>
                <label className="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-3 text-xs font-black uppercase tracking-[0.12em] text-amber-800 shadow-[0_8px_18px_rgba(120,53,15,0.05)]">
                  <input
                    type="checkbox"
                    checked={form.isPublicOnPortal}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isPublicOnPortal: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  Portal
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-12">
                {!editingActivity && (
                  <FormField
                    label="Mã"
                    required
                    className="min-w-0 md:col-span-4"
                  >
                    <Input
                      value={form.code}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          code: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setForm((prev) => ({
                          ...prev,
                          code: normalizeCode(prev.code),
                        }))
                      }
                      placeholder="VD: SINH-HOAT-07"
                      className={modalInputClass}
                    />
                  </FormField>
                )}

                <FormField
                  label="Tên hoạt động"
                  required
                  className={
                    editingActivity
                      ? "min-w-0 md:col-span-12"
                      : "min-w-0 md:col-span-8"
                  }
                >
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="VD: Sinh hoạt cộng đoàn tháng 7"
                    className={modalInputClass}
                  />
                </FormField>

                <ModalSelectField
                  label="Loại"
                  value={form.activityType}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, activityType: value }))
                  }
                  options={ACTIVITY_TYPE_OPTIONS}
                  className="min-w-0 md:col-span-4"
                />

                <FormField
                  label="Ngày"
                  required
                  className="min-w-0 md:col-span-4"
                >
                  <div className="activity-modal-date-field">
                    <FormDateInput
                      value={form.activityDate}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          activityDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                </FormField>

                <FormField label="Khung giờ" className="min-w-0 md:col-span-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="activity-modal-time-field min-w-0">
                      <TimePickerInput
                        value={form.startTime}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, startTime: event.target.value }))
                        }
                        placeholder="Bắt đầu"
                      />
                    </div>
                    <div className="activity-modal-time-field min-w-0">
                      <TimePickerInput
                        value={form.endTime}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, endTime: event.target.value }))
                        }
                        placeholder="Kết thúc"
                      />
                    </div>
                  </div>
                </FormField>

                <FormField label="Địa điểm" className="min-w-0 md:col-span-6">
                  <Input
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    placeholder="VD: Phòng sinh hoạt chung"
                    className={modalInputClass}
                  />
                </FormField>

                <FormField label="Phụ trách" className="min-w-0 md:col-span-6">
                  <Input
                    value={form.ownerGroup}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        ownerGroup: event.target.value,
                      }))
                    }
                    placeholder="VD: Ban Sinh hoạt"
                    className={modalInputClass}
                  />
                </FormField>

                <FormField
                  label="Mô tả ngắn"
                  className="min-w-0 md:col-span-12"
                >
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Nội dung chính của hoạt động..."
                    className={modalTextareaClass}
                  />
                </FormField>
              </div>

              <details className="mt-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.035)]">
                <summary className="cursor-pointer select-none text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Thông tin bổ sung
                </summary>
                <div className="mt-3 grid gap-3 md:grid-cols-12">
                  <ModalSelectField
                    label="Trạng thái"
                    value={form.status}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, status: value }))
                    }
                    options={ACTIVITY_STATUS_OPTIONS}
                    className="min-w-0 md:col-span-4"
                  />

                  <FormField label="Dự kiến" className="min-w-0 md:col-span-4">
                    <Input
                      type="number"
                      min={0}
                      value={form.expectedParticipants}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          expectedParticipants: event.target.value,
                        }))
                      }
                      className={modalInputClass}
                    />
                  </FormField>

                  <FormField label="Ghi chú" className="min-w-0 md:col-span-4">
                    <Input
                      value={form.notes}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Ghi chú thêm nếu có"
                      className={modalInputClass}
                    />
                  </FormField>
                </div>
              </details>
            </div>
          </div>
        </AppModal>

        <ConfirmDialog
          open={activityToCancel != null}
          onOpenChange={(open) => !open && setActivityToCancel(null)}
          title="Hủy hoạt động"
          description={`Bạn có chắc chắn muốn hủy hoạt động “${activityToCancel?.title ?? ""}”?`}
          confirmLabel="Hủy hoạt động"
          variant="danger"
          loading={cancelMutation.isPending}
          onConfirm={() => {
            if (activityToCancel) {
              cancelMutation.mutate({ id: activityToCancel.id });
            }
          }}
        />

        <ConfirmDialog
          open={activityToDelete != null}
          onOpenChange={(open) => !open && setActivityToDelete(null)}
          title="Xóa hoạt động"
          description={`Bạn có chắc chắn muốn xóa hoạt động “${activityToDelete?.title ?? ""}”? Dữ liệu sẽ được ẩn khỏi danh sách.`}
          confirmLabel="Xóa"
          variant="danger"
          loading={deleteMutation.isPending}
          onConfirm={() => {
            if (activityToDelete) {
              deleteMutation.mutate({ id: activityToDelete.id });
            }
          }}
        />
      </div>
    </ResidenceCareLayout>
  );
}
