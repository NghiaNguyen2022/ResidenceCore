'use client';

import { useMemo, useState } from 'react';
import {
      CalendarDays,
      Clock,
      Edit2,
      MapPin,
      Plus,
      Sparkles,
      Trash2,
      Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
      AppCard,
      AppModal,
      ConfirmDialog,
      DataTable,
      type DataTableColumn,
      EmptyState,
      ErrorState,
      FormDateInput,
      FormField,
      FormSelect,
      FormTimeInput,
      LoadingState,
      StatusBadge,
} from '@/components/shared';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';

type ActivityType =
      | 'community'
      | 'spiritual'
      | 'study'
      | 'sports'
      | 'culture'
      | 'volunteer'
      | 'meeting'
      | 'other';

type ActivityStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

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
};

type ActivityFormData = {
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
};

const DEFAULT_FORM: ActivityFormData = {
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
};

const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
      { value: 'community', label: 'Sinh hoạt cộng đoàn' },
      { value: 'spiritual', label: 'Đời sống thiêng liêng' },
      { value: 'study', label: 'Học tập / Đào tạo' },
      { value: 'sports', label: 'Thể thao / Sức khỏe' },
      { value: 'culture', label: 'Văn hóa / Nghệ thuật' },
      { value: 'volunteer', label: 'Thiện nguyện / Phục vụ' },
      { value: 'meeting', label: 'Họp / Hội nghị' },
      { value: 'other', label: 'Khác' },
];

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
      { value: 'draft', label: 'Nháp' },
      { value: 'scheduled', label: 'Đã lên lịch' },
      { value: 'in_progress', label: 'Đang diễn ra' },
      { value: 'completed', label: 'Đã hoàn thành' },
      { value: 'cancelled', label: 'Đã hủy' },
];

function getTypeLabel(type: ActivityType) {
      return ACTIVITY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function getStatusLabel(status: ActivityStatus) {
      return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function getStatusTone(status: ActivityStatus) {
      if (status === 'scheduled') return 'info' as const;
      if (status === 'in_progress') return 'warning' as const;
      if (status === 'completed') return 'success' as const;
      if (status === 'cancelled') return 'danger' as const;
      return 'default' as const;
}

function getTypeTone(type: ActivityType) {
      if (type === 'community') return 'info' as const;
      if (type === 'spiritual') return 'purple' as const;
      if (type === 'volunteer') return 'success' as const;
      if (type === 'sports') return 'warning' as const;
      return 'default' as const;
}

function normalizeCode(v: string) {
      return v
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function normalizeText(v?: string | null) {
      return (v || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/\s+/g, ' ');
}

function formatDate(dateStr?: string | null) {
      if (!dateStr) return '—';
      try {
            return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
      } catch {
            return dateStr;
      }
}

export default function Activities() {
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
      const [typeFilter, setTypeFilter] = useState<'all' | ActivityType>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
      const [formData, setFormData] = useState<ActivityFormData>(DEFAULT_FORM);
      const [formError, setFormError] = useState<string | null>(null);
      const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

      const activitiesQuery = trpc.activities.list.useQuery({
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            activityType: typeFilter !== 'all' ? typeFilter : undefined,
            limit: 200,
            offset: 0,
      });

      const statsQuery = trpc.activities.getStats.useQuery();

      const activities = useMemo<Activity[]>(() => {
            return (activitiesQuery.data ?? []) as Activity[];
      }, [activitiesQuery.data]);

      const utils = trpc.useUtils();

      const createMutation = trpc.activities.create.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã tạo hoạt động.');
                  closeForm();
            },
            onError: (err) => setFormError(err.message),
      });

      const updateMutation = trpc.activities.update.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  toast.success('Đã cập nhật hoạt động.');
                  closeForm();
            },
            onError: (err) => setFormError(err.message),
      });

      const deleteMutation = trpc.activities.delete.useMutation({
            onSuccess: () => {
                  utils.activities.list.invalidate();
                  utils.activities.getStats.invalidate();
                  toast.success('Đã xóa hoạt động.');
                  setDeletingActivity(null);
            },
            onError: (err) => toast.error(err.message),
      });

      function openCreate() {
            setEditingActivity(null);
            const today = new Date().toISOString().split('T')[0];
            setFormData({ ...DEFAULT_FORM, activityDate: today });
            setFormError(null);
            setIsFormOpen(true);
      }

      function openEdit(a: Activity) {
            setEditingActivity(a);
            setFormData({
                  code: a.code,
                  title: a.title,
                  activityType: a.activityType,
                  status: a.status,
                  activityDate: typeof a.activityDate === 'string'
                        ? a.activityDate.slice(0, 10)
                        : a.activityDate,
                  startTime: a.startTime || '19:00',
                  endTime: a.endTime || '20:30',
                  location: a.location || '',
                  ownerGroup: a.ownerGroup || '',
                  expectedParticipants: String(a.expectedParticipants ?? 0),
                  description: a.description || '',
                  notes: a.notes || '',
            });
            setFormError(null);
            setIsFormOpen(true);
      }

      function closeForm() {
            setIsFormOpen(false);
            setEditingActivity(null);
            setFormData(DEFAULT_FORM);
            setFormError(null);
      }

      function handleSave() {
            const code = normalizeCode(formData.code);
            if (!code) {
                  setFormError('Vui lòng nhập mã hoạt động.');
                  return;
            }
            if (!formData.title.trim()) {
                  setFormError('Vui lòng nhập tên hoạt động.');
                  return;
            }
            if (!formData.activityDate) {
                  setFormError('Vui lòng chọn ngày tổ chức.');
                  return;
            }
            setFormError(null);

            const payload = {
                  title: formData.title.trim(),
                  activityType: formData.activityType,
                  status: formData.status,
                  activityDate: formData.activityDate,
                  startTime: formData.startTime || null,
                  endTime: formData.endTime || null,
                  location: formData.location.trim() || null,
                  ownerGroup: formData.ownerGroup.trim() || null,
                  expectedParticipants: parseInt(formData.expectedParticipants) || 0,
                  description: formData.description.trim() || null,
                  notes: formData.notes.trim() || null,
            };

            if (editingActivity) {
                  updateMutation.mutate({ id: editingActivity.id, ...payload });
            } else {
                  createMutation.mutate({ code, ...payload });
            }
      }

      const isSaving = createMutation.isPending || updateMutation.isPending;
      const stats = statsQuery.data as any;

      const columns: DataTableColumn<Activity>[] = [
            {
                  key: 'title',
                  header: 'Hoạt động',
                  cell: (a) => (
                        <div>
                              <p className="font-semibold text-slate-900">{a.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{a.code}</p>
                        </div>
                  ),
            },
            {
                  key: 'type',
                  header: 'Loại',
                  cell: (a) => (
                        <StatusBadge tone={getTypeTone(a.activityType)}>
                              {getTypeLabel(a.activityType)}
                        </StatusBadge>
                  ),
                  className: 'w-44',
            },
            {
                  key: 'date',
                  header: 'Ngày',
                  cell: (a) => (
                        <div className="text-sm">
                              <p className="flex items-center gap-1 text-slate-700">
                                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDate(a.activityDate)}
                              </p>
                              {(a.startTime || a.endTime) && (
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                          <Clock className="h-3 w-3" />
                                          {a.startTime} – {a.endTime}
                                    </p>
                              )}
                        </div>
                  ),
                  className: 'w-40',
            },
            {
                  key: 'location',
                  header: 'Địa điểm',
                  cell: (a) => (
                        <span className="flex items-center gap-1 text-sm text-slate-600">
                              {a.location ? (
                                    <>
                                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                          {a.location}
                                    </>
                              ) : (
                                    '—'
                              )}
                        </span>
                  ),
                  className: 'w-40',
            },
            {
                  key: 'participants',
                  header: 'Người tham gia',
                  cell: (a) => (
                        <span className="flex items-center gap-1 text-sm text-slate-700">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              {a.actualParticipants ?? 0} / {a.expectedParticipants ?? 0}
                        </span>
                  ),
                  className: 'w-36',
            },
            {
                  key: 'status',
                  header: 'Trạng thái',
                  cell: (a) => (
                        <StatusBadge tone={getStatusTone(a.status)}>
                              {getStatusLabel(a.status)}
                        </StatusBadge>
                  ),
                  className: 'w-32',
            },
            {
                  key: 'actions',
                  header: '',
                  cell: (a) => (
                        <div className="flex items-center justify-end gap-1">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          openEdit(a);
                                    }}
                              >
                                    <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          setDeletingActivity(a);
                                    }}
                              >
                                    <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                        </div>
                  ),
                  className: 'w-20',
            },
      ];

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                              <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Hoạt động</h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Quản lý các hoạt động chung của lưu xá
                                    </p>
                              </div>
                              <Button onClick={openCreate}>
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Tạo hoạt động
                              </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="total"
                                    title="Tổng hoạt động"
                                    value={String(stats?.total ?? 0)}
                                    icon={<Sparkles className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="scheduled"
                                    title="Đã lên lịch"
                                    value={String(stats?.scheduled ?? 0)}
                                    icon={<CalendarDays className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="in-progress"
                                    title="Đang diễn ra"
                                    value={String(stats?.inProgress ?? 0)}
                                    icon={<Clock className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="activities"
                                    cardKey="completed"
                                    title="Đã hoàn thành"
                                    value={String(stats?.completed ?? 0)}
                                    icon={<Users className="h-4 w-4" />}
                              />
                        </div>

                        {/* Filters */}
                        <AppCard>
                              <div className="flex flex-wrap gap-3">
                                    <Input
                                          placeholder="Tìm theo tên, mã, địa điểm..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="h-8 w-56 text-sm"
                                    />
                                    <FormSelect
                                          value={statusFilter}
                                          onValueChange={(v) =>
                                                setStatusFilter(v as 'all' | ActivityStatus)
                                          }
                                          options={[
                                                { value: 'all', label: 'Tất cả trạng thái' },
                                                ...STATUS_OPTIONS,
                                          ]}
                                          className="h-8 w-44 text-sm"
                                    />
                                    <FormSelect
                                          value={typeFilter}
                                          onValueChange={(v) =>
                                                setTypeFilter(v as 'all' | ActivityType)
                                          }
                                          options={[
                                                { value: 'all', label: 'Tất cả loại' },
                                                ...ACTIVITY_TYPE_OPTIONS,
                                          ]}
                                          className="h-8 w-52 text-sm"
                                    />
                              </div>
                        </AppCard>

                        {/* Table */}
                        {activitiesQuery.isLoading ? (
                              <LoadingState />
                        ) : activitiesQuery.isError ? (
                              <ErrorState
                                    message={activitiesQuery.error.message}
                                    onRetry={() => activitiesQuery.refetch()}
                              />
                        ) : (
                              <DataTable
                                    columns={columns}
                                    data={activities}
                                    rowKey={(a) => a.id}
                                    emptyMessage="Chưa có hoạt động nào"
                                    emptyDescription="Tạo hoạt động để bắt đầu quản lý lịch sinh hoạt cộng đoàn."
                              />
                        )}
                  </div>

                  {/* Form modal */}
                  <AppModal
                        open={isFormOpen}
                        onOpenChange={(open) => !open && closeForm()}
                        title={editingActivity ? 'Sửa hoạt động' : 'Tạo hoạt động mới'}
                        size="lg"
                        footer={
                              <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                                          Hủy
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                          {isSaving ? 'Đang lưu...' : editingActivity ? 'Cập nhật' : 'Tạo'}
                                    </Button>
                              </div>
                        }
                  >
                        <div className="space-y-4">
                              {formError && (
                                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                          {formError}
                                    </p>
                              )}

                              <div className="grid gap-4 sm:grid-cols-2">
                                    {!editingActivity && (
                                          <FormField label="Mã hoạt động" required>
                                                <Input
                                                      value={formData.code}
                                                      onChange={(e) =>
                                                            setFormData((d) => ({ ...d, code: e.target.value }))
                                                      }
                                                      placeholder="VD: COMMUNITY_MEETING_01"
                                                />
                                          </FormField>
                                    )}

                                    <FormField
                                          label="Tên hoạt động"
                                          required
                                          className={!editingActivity ? '' : 'sm:col-span-2'}
                                    >
                                          <Input
                                                value={formData.title}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, title: e.target.value }))
                                                }
                                                placeholder="VD: Sinh hoạt cộng đoàn tháng"
                                          />
                                    </FormField>

                                    <FormField label="Loại hoạt động">
                                          <FormSelect
                                                value={formData.activityType}
                                                onValueChange={(v) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            activityType: v as ActivityType,
                                                      }))
                                                }
                                                options={ACTIVITY_TYPE_OPTIONS}
                                          />
                                    </FormField>

                                    <FormField label="Trạng thái">
                                          <FormSelect
                                                value={formData.status}
                                                onValueChange={(v) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            status: v as ActivityStatus,
                                                      }))
                                                }
                                                options={STATUS_OPTIONS}
                                          />
                                    </FormField>

                                    <FormField label="Ngày tổ chức" required>
                                          <FormDateInput
                                                value={formData.activityDate}
                                                onChange={(e) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            activityDate: e.target.value,
                                                      }))
                                                }
                                          />
                                    </FormField>

                                    <FormField label="Số người dự kiến">
                                          <Input
                                                type="number"
                                                min={0}
                                                value={formData.expectedParticipants}
                                                onChange={(e) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            expectedParticipants: e.target.value,
                                                      }))
                                                }
                                          />
                                    </FormField>

                                    <FormField label="Giờ bắt đầu">
                                          <FormTimeInput
                                                value={formData.startTime}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, startTime: e.target.value }))
                                                }
                                          />
                                    </FormField>

                                    <FormField label="Giờ kết thúc">
                                          <FormTimeInput
                                                value={formData.endTime}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, endTime: e.target.value }))
                                                }
                                          />
                                    </FormField>

                                    <FormField label="Địa điểm" className="sm:col-span-2">
                                          <Input
                                                value={formData.location}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, location: e.target.value }))
                                                }
                                                placeholder="VD: Phòng sinh hoạt chung"
                                          />
                                    </FormField>

                                    <FormField label="Nhóm phụ trách" className="sm:col-span-2">
                                          <Input
                                                value={formData.ownerGroup}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, ownerGroup: e.target.value }))
                                                }
                                                placeholder="VD: Ban sinh hoạt"
                                          />
                                    </FormField>

                                    <FormField label="Mô tả" className="sm:col-span-2">
                                          <Textarea
                                                value={formData.description}
                                                onChange={(e) =>
                                                      setFormData((d) => ({
                                                            ...d,
                                                            description: e.target.value,
                                                      }))
                                                }
                                                rows={3}
                                                placeholder="Mô tả hoạt động..."
                                          />
                                    </FormField>

                                    <FormField label="Ghi chú" className="sm:col-span-2">
                                          <Input
                                                value={formData.notes}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, notes: e.target.value }))
                                                }
                                                placeholder="Ghi chú thêm (nếu có)"
                                          />
                                    </FormField>
                              </div>
                        </div>
                  </AppModal>

                  {/* Confirm delete */}
                  <ConfirmDialog
                        open={deletingActivity != null}
                        onOpenChange={(open) => !open && setDeletingActivity(null)}
                        title="Xóa hoạt động"
                        description={`Bạn có chắc chắn muốn xóa hoạt động "${deletingActivity?.title ?? ''}"?`}
                        confirmLabel="Xóa"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onConfirm={() => {
                              if (!deletingActivity) return;
                              deleteMutation.mutate({ id: deletingActivity.id });
                        }}
                  />
            </ResidenceCareLayout>
      );
}
