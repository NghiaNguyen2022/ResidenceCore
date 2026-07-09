'use client';

import { useMemo, useState, type ReactNode } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';
import { formatDate } from '@/lib/format';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TimePickerInput } from '@/components/shared/form/TimePickerInput';
import {
      AppCard,
      AppModal,
      ConfirmDialog,
      EmptyState,
      ErrorState,
      FormDateInput,
      FormField,
      FormSelect,
      LoadingState,
      StatusBadge,
} from '@/components/shared';

const ACTIVITY_TYPES = [
      { value: 'community', label: 'Sinh hoạt chung', icon: '🌿' },
      { value: 'spiritual', label: 'Thiêng liêng', icon: '⛪' },
      { value: 'study', label: 'Học tập', icon: '📚' },
      { value: 'sports', label: 'Thể thao', icon: '🏃' },
      { value: 'culture', label: 'Văn hóa', icon: '🎭' },
      { value: 'volunteer', label: 'Phục vụ', icon: '🤝' },
      { value: 'meeting', label: 'Họp', icon: '📝' },
      { value: 'other', label: 'Khác', icon: '✨' },
] as const;

const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES.map(({ value, label }) => ({ value, label }));

const ACTIVITY_STATUSES = [
      { value: 'draft', label: 'Nháp' },
      { value: 'scheduled', label: 'Dự kiến' },
      { value: 'in_progress', label: 'Đang diễn ra' },
      { value: 'completed', label: 'Đã diễn ra' },
      { value: 'cancelled', label: 'Đã hủy' },
] as const;

const ACTIVITY_STATUS_OPTIONS = ACTIVITY_STATUSES.map(({ value, label }) => ({ value, label }));

type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];
type ActivityStatus = (typeof ACTIVITY_STATUSES)[number]['value'];

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
      code: '',
      title: '',
      activityType: 'community',
      status: 'scheduled',
      activityDate: '',
      startTime: '19:00',
      endTime: '20:30',
      location: '',
      ownerGroup: '',
      expectedParticipants: '0',
      description: '',
      notes: '',
      isPublicOnPortal: true,
};

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
}

function getActivityTypeMeta(type?: string | null) {
      return ACTIVITY_TYPES.find((item) => item.value === type) ?? ACTIVITY_TYPES[0];
}

function getStatusLabel(status?: string | null) {
      return ACTIVITY_STATUSES.find((item) => item.value === status)?.label ?? 'Dự kiến';
}

function getStatusTone(status?: string | null) {
      if (status === 'completed') return 'success' as const;
      if (status === 'in_progress') return 'warning' as const;
      if (status === 'cancelled') return 'danger' as const;
      if (status === 'draft') return 'default' as const;
      return 'info' as const;
}

function formatTimeRange(activity: Activity) {
      if (activity.startTime && activity.endTime) return `${activity.startTime} – ${activity.endTime}`;
      if (activity.startTime) return activity.startTime;
      if (activity.endTime) return `Đến ${activity.endTime}`;
      return 'Chưa ghi giờ';
}

function StatPill({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
      return (
            <div className="rounded-3xl border border-amber-100 bg-white/85 p-4 shadow-sm shadow-amber-950/5">
                  <div className="flex items-center justify-between gap-3">
                        <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700/70">{label}</p>
                              <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                              {icon}
                        </div>
                  </div>
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
            <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-950/10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-lg">
                                          {typeMeta.icon}
                                    </span>
                                    <div className="min-w-0">
                                          <h3 className="truncate text-base font-black text-slate-950">{activity.title}</h3>
                                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                {activity.code}
                                          </p>
                                    </div>
                                    <StatusBadge tone={getStatusTone(activity.status)}>{getStatusLabel(activity.status)}</StatusBadge>
                                    <span
                                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                                isPublic
                                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                          }`}
                                    >
                                          {isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                          {isPublic ? 'Công khai portal' : 'Nội bộ'}
                                    </span>
                              </div>

                              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{formatDate(activity.activityDate)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{formatTimeRange(activity)}</span>
                                    </span>
                                    <span className="inline-flex min-w-0 items-center gap-2">
                                          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                                          <span className="truncate">{activity.location || 'Chưa ghi địa điểm'}</span>
                                    </span>
                              </div>

                              {(activity.ownerGroup || activity.description) && (
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                                          {activity.ownerGroup ? `Phụ trách: ${activity.ownerGroup}. ` : ''}
                                          {activity.description || ''}
                                    </p>
                              )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
                                    <Edit2 className="mr-1.5 h-4 w-4" />
                                    Sửa
                              </Button>
                              {activity.status !== 'cancelled' && (
                                    <Button variant="outline" size="sm" onClick={() => onCancel(activity)}>
                                          <XCircle className="mr-1.5 h-4 w-4" />
                                          Hủy
                                    </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(activity)}>
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Xóa
                              </Button>
                        </div>
                  </div>
            </div>
      );
}

export default function Activities() {
      const [search, setSearch] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
      const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all');
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
      const [form, setForm] = useState<ActivityForm>(DEFAULT_FORM);
      const [formError, setFormError] = useState<string | null>(null);
      const [activityToCancel, setActivityToCancel] = useState<Activity | null>(null);
      const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

      const utils = trpc.useUtils();
      const activitiesQuery = trpc.activities.list.useQuery({
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            activityType: typeFilter !== 'all' ? typeFilter : undefined,
            limit: 200,
            offset: 0,
      });
      const statsQuery = trpc.activities.getStats.useQuery();

      const activities = useMemo<Activity[]>(() => (activitiesQuery.data ?? []) as Activity[], [activitiesQuery.data]);
      const stats = statsQuery.data as any;

      const createMutation = trpc.activities.create.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã tạo hoạt động.');
                  closeForm();
            },
            onError: (error) => setFormError(error.message),
      });

      const updateMutation = trpc.activities.update.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã cập nhật hoạt động.');
                  closeForm();
            },
            onError: (error) => setFormError(error.message),
      });

      const cancelMutation = trpc.activities.cancel.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã hủy hoạt động.');
                  setActivityToCancel(null);
            },
            onError: (error) => toast.error(error.message),
      });

      const deleteMutation = trpc.activities.delete.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã xóa hoạt động.');
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
                  activityDate: String(activity.activityDate || '').slice(0, 10),
                  startTime: activity.startTime || '',
                  endTime: activity.endTime || '',
                  location: activity.location || '',
                  ownerGroup: activity.ownerGroup || '',
                  expectedParticipants: String(activity.expectedParticipants ?? 0),
                  description: activity.description || '',
                  notes: activity.notes || '',
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
                  setFormError('Vui lòng nhập mã hoạt động.');
                  return;
            }
            if (!form.title.trim()) {
                  setFormError('Vui lòng nhập tên hoạt động.');
                  return;
            }
            if (!form.activityDate) {
                  setFormError('Vui lòng chọn ngày tổ chức.');
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
                  <div className="space-y-6">
                        <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_54%,#fffbeb_100%)] p-6 shadow-lg shadow-amber-950/10">
                              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />
                              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/80">
                                                Hoạt động / Sự kiện lite
                                          </p>
                                          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                                Quản lý hoạt động lưu xá
                                          </h1>
                                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                                Tạo hoạt động chung, hẹn thời gian, ghi địa điểm và quyết định hoạt động nào hiển thị trên portal học viên.
                                          </p>
                                    </div>
                                    <Button onClick={openCreate} className="rounded-2xl px-4 font-bold">
                                          <Plus className="mr-2 h-4 w-4" />
                                          Tạo hoạt động
                                    </Button>
                              </div>
                        </section>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              <StatPill label="Tổng" value={stats?.total ?? 0} icon={<Sparkles className="h-5 w-5" />} />
                              <StatPill label="Dự kiến" value={stats?.scheduled ?? 0} icon={<CalendarDays className="h-5 w-5" />} />
                              <StatPill label="Đang diễn ra" value={stats?.inProgress ?? 0} icon={<Clock className="h-5 w-5" />} />
                              <StatPill label="Đã diễn ra" value={stats?.completed ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} />
                        </div>

                        <AppCard className="rounded-3xl border-slate-200/80 bg-white/90 shadow-sm">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="relative min-w-0 flex-1">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                          <Input
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                placeholder="Tìm theo tên, mã, địa điểm, ban phụ trách..."
                                                className="h-10 rounded-2xl pl-9"
                                          />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                          <FormSelect
                                                value={statusFilter}
                                                onValueChange={(value) => setStatusFilter(value as 'all' | ActivityStatus)}
                                                options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...ACTIVITY_STATUS_OPTIONS]}
                                                className="h-10 w-44 rounded-2xl"
                                          />
                                          <FormSelect
                                                value={typeFilter}
                                                onValueChange={(value) => setTypeFilter(value as 'all' | ActivityType)}
                                                options={[{ value: 'all', label: 'Tất cả loại' }, ...ACTIVITY_TYPE_OPTIONS]}
                                                className="h-10 w-48 rounded-2xl"
                                          />
                                    </div>
                              </div>
                        </AppCard>

                        {activitiesQuery.isLoading ? (
                              <LoadingState />
                        ) : activitiesQuery.isError ? (
                              <ErrorState message={activitiesQuery.error.message} onRetry={() => activitiesQuery.refetch()} />
                        ) : activities.length === 0 ? (
                              <EmptyState
                                    title="Chưa có hoạt động nào"
                                    description="Tạo hoạt động đầu tiên để demo lịch sinh hoạt, họp, thiện nguyện hoặc sự kiện chung của lưu xá."
                                    actionLabel="Tạo hoạt động"
                                    onAction={openCreate}
                              />
                        ) : (
                              <div className="space-y-3">
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

                  <AppModal
                        open={isFormOpen}
                        onOpenChange={(open) => !open && closeForm()}
                        title={editingActivity ? 'Sửa hoạt động' : 'Tạo hoạt động mới'}
                        description="Giữ thông tin gọn để demo, có thể mở rộng đăng ký/điểm danh sau."
                        size="lg"
                        footer={
                              <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={closeForm} disabled={isSaving}>Hủy</Button>
                                    <Button onClick={saveForm} disabled={isSaving}>{isSaving ? 'Đang lưu...' : editingActivity ? 'Cập nhật' : 'Tạo hoạt động'}</Button>
                              </div>
                        }
                  >
                        <div className="space-y-4">
                              {formError && (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                          {formError}
                                    </div>
                              )}

                              <div className="grid gap-4 sm:grid-cols-2">
                                    {!editingActivity && (
                                          <FormField label="Mã hoạt động" required>
                                                <Input
                                                      value={form.code}
                                                      onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                                                      onBlur={() => setForm((prev) => ({ ...prev, code: normalizeCode(prev.code) }))}
                                                      placeholder="VD: SINH-HOAT-THANG-07"
                                                />
                                          </FormField>
                                    )}

                                    <FormField label="Tên hoạt động" required className={editingActivity ? 'sm:col-span-2' : ''}>
                                          <Input
                                                value={form.title}
                                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                                placeholder="VD: Sinh hoạt cộng đoàn tháng 7"
                                          />
                                    </FormField>

                                    <FormField label="Loại hoạt động">
                                          <FormSelect
                                                value={form.activityType}
                                                onValueChange={(value) => setForm((prev) => ({ ...prev, activityType: value as ActivityType }))}
                                                options={ACTIVITY_TYPE_OPTIONS}
                                          />
                                    </FormField>

                                    <FormField label="Trạng thái">
                                          <FormSelect
                                                value={form.status}
                                                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ActivityStatus }))}
                                                options={ACTIVITY_STATUS_OPTIONS}
                                          />
                                    </FormField>

                                    <FormField label="Ngày tổ chức" required>
                                          <FormDateInput
                                                value={form.activityDate}
                                                onChange={(event) => setForm((prev) => ({ ...prev, activityDate: event.target.value }))}
                                          />
                                    </FormField>

                                    <FormField label="Số người dự kiến">
                                          <Input
                                                type="number"
                                                min={0}
                                                value={form.expectedParticipants}
                                                onChange={(event) => setForm((prev) => ({ ...prev, expectedParticipants: event.target.value }))}
                                          />
                                    </FormField>

                                    <FormField label="Giờ bắt đầu">
                                          <TimePickerInput
                                                value={form.startTime}
                                                onChange={(value) => setForm((prev) => ({ ...prev, startTime: value }))}
                                                placeholder="Chọn giờ bắt đầu"
                                          />
                                    </FormField>

                                    <FormField label="Giờ kết thúc">
                                          <TimePickerInput
                                                value={form.endTime}
                                                onChange={(value) => setForm((prev) => ({ ...prev, endTime: value }))}
                                                placeholder="Chọn giờ kết thúc"
                                          />
                                    </FormField>

                                    <FormField label="Địa điểm" className="sm:col-span-2">
                                          <Input
                                                value={form.location}
                                                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                                                placeholder="VD: Phòng sinh hoạt chung"
                                          />
                                    </FormField>

                                    <FormField label="Người/Ban phụ trách" className="sm:col-span-2">
                                          <Input
                                                value={form.ownerGroup}
                                                onChange={(event) => setForm((prev) => ({ ...prev, ownerGroup: event.target.value }))}
                                                placeholder="VD: Ban Sinh hoạt"
                                          />
                                    </FormField>

                                    <FormField label="Mô tả" className="sm:col-span-2">
                                          <Textarea
                                                value={form.description}
                                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                                rows={3}
                                                placeholder="Mô tả ngắn về nội dung hoạt động..."
                                          />
                                    </FormField>

                                    <FormField label="Ghi chú" className="sm:col-span-2">
                                          <Input
                                                value={form.notes}
                                                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                                                placeholder="Ghi chú thêm nếu có"
                                          />
                                    </FormField>

                                    <label className="sm:col-span-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                          <input
                                                type="checkbox"
                                                checked={form.isPublicOnPortal}
                                                onChange={(event) => setForm((prev) => ({ ...prev, isPublicOnPortal: event.target.checked }))}
                                                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                          />
                                          <span>
                                                <span className="block text-sm font-black text-slate-900">Hiển thị trên portal học viên</span>
                                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                      Bật lựa chọn này nếu hoạt động cần thông báo công khai cho học viên.
                                                </span>
                                          </span>
                                    </label>
                              </div>
                        </div>
                  </AppModal>

                  <ConfirmDialog
                        open={activityToCancel != null}
                        onOpenChange={(open) => !open && setActivityToCancel(null)}
                        title="Hủy hoạt động"
                        description={`Bạn có chắc chắn muốn hủy hoạt động “${activityToCancel?.title ?? ''}”?`}
                        confirmLabel="Hủy hoạt động"
                        variant="danger"
                        loading={cancelMutation.isPending}
                        onConfirm={() => activityToCancel && cancelMutation.mutate({ id: activityToCancel.id })}
                  />

                  <ConfirmDialog
                        open={activityToDelete != null}
                        onOpenChange={(open) => !open && setActivityToDelete(null)}
                        title="Xóa hoạt động"
                        description={`Bạn có chắc chắn muốn xóa hoạt động “${activityToDelete?.title ?? ''}”? Dữ liệu sẽ được ẩn khỏi danh sách.`}
                        confirmLabel="Xóa"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onConfirm={() => activityToDelete && deleteMutation.mutate({ id: activityToDelete.id })}
                  />
            </ResidenceCareLayout>
      );
}
