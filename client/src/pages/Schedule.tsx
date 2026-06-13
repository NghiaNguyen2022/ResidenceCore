'use client';

import { useMemo, useState } from 'react';
import {
      BookOpen,
      CalendarDays,
      Clock,
      Edit2,
      MapPin,
      Plus,
      Trash2,
      User,
} from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
      AppCard,
      AppModal,
      ConfirmDialog,
      DataTable,
      type DataTableColumn,
      EmptyState,
      ErrorState,
      FormField,
      FormSelect,
      FormTimeInput,
      LoadingState,
      StatusBadge,
} from '@/components/shared';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import { normalizeText } from '@/lib/text';
import { DAY_OPTIONS, getDayLabel, getDayOrder, type DayOfWeek as DayOfWeekKey } from '@/lib/days';

type ScheduleFormData = {
      dayOfWeek: DayOfWeekKey;
      startTime: string;
      endTime: string;
      subjectName: string;
      location: string;
      notes: string;
};

const DEFAULT_FORM: ScheduleFormData = {
      dayOfWeek: 'monday',
      startTime: '07:30',
      endTime: '11:00',
      subjectName: '',
      location: '',
      notes: '',
};

type StudySchedule = {
      id: number;
      residentId: number;
      dayOfWeek: DayOfWeekKey;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
      isActive: boolean;
};


export default function Schedule() {
      const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [dayFilter, setDayFilter] = useState<'all' | DayOfWeekKey>('all');

      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingSchedule, setEditingSchedule] = useState<StudySchedule | null>(null);
      const [formData, setFormData] = useState<ScheduleFormData>(DEFAULT_FORM);
      const [formError, setFormError] = useState<string | null>(null);
      const [deletingSchedule, setDeletingSchedule] = useState<StudySchedule | null>(null);

      const membersQuery = trpc.members.list.useQuery({ limit: 500, offset: 0 });
      const residents = useMemo(() => {
            return (membersQuery.data || []).filter(
                  (r: any) => r.status === 'active'
            );
      }, [membersQuery.data]);

      const schedulesQuery = trpc.members.getStudySchedules.useQuery(
            { residentId: selectedResidentId! },
            { enabled: selectedResidentId != null }
      );

      const schedules = useMemo<StudySchedule[]>(() => {
            if (!schedulesQuery.data) return [];
            return (schedulesQuery.data as StudySchedule[]).filter((s) => s.isActive !== false);
      }, [schedulesQuery.data]);

      const filteredSchedules = useMemo(() => {
            const kw = normalizeText(searchTerm);
            return schedules
                  .filter((s) => {
                        if (dayFilter !== 'all' && s.dayOfWeek !== dayFilter) return false;
                        if (!kw) return true;
                        const hay = [s.subjectName, s.location, s.notes, getDayLabel(s.dayOfWeek)]
                              .map(normalizeText)
                              .join(' ');
                        return hay.includes(kw);
                  })
                  .sort((a, b) => getDayOrder(a.dayOfWeek) - getDayOrder(b.dayOfWeek));
      }, [schedules, searchTerm, dayFilter]);

      const utils = trpc.useUtils();

      const createMutation = trpc.members.createStudySchedule.useMutation({
            onSuccess: () => {
                  utils.members.getStudySchedules.invalidate({ residentId: selectedResidentId! });
                  toast.success('Đã thêm lịch học.');
                  closeForm();
            },
            onError: (err) => setFormError(err.message),
      });

      const updateMutation = trpc.members.updateStudySchedule.useMutation({
            onSuccess: () => {
                  utils.members.getStudySchedules.invalidate({ residentId: selectedResidentId! });
                  toast.success('Đã cập nhật lịch học.');
                  closeForm();
            },
            onError: (err) => setFormError(err.message),
      });

      const deleteMutation = trpc.members.deleteStudySchedule.useMutation({
            onSuccess: () => {
                  utils.members.getStudySchedules.invalidate({ residentId: selectedResidentId! });
                  toast.success('Đã xóa lịch học.');
                  setDeletingSchedule(null);
            },
            onError: (err) => toast.error(err.message),
      });

      const selectedResident = useMemo(
            () => residents.find((r: any) => r.id === selectedResidentId) as any,
            [residents, selectedResidentId]
      );

      function openCreate() {
            setEditingSchedule(null);
            setFormData(DEFAULT_FORM);
            setFormError(null);
            setIsFormOpen(true);
      }

      function openEdit(s: StudySchedule) {
            setEditingSchedule(s);
            setFormData({
                  dayOfWeek: s.dayOfWeek,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  subjectName: s.subjectName || '',
                  location: s.location || '',
                  notes: s.notes || '',
            });
            setFormError(null);
            setIsFormOpen(true);
      }

      function closeForm() {
            setIsFormOpen(false);
            setEditingSchedule(null);
            setFormData(DEFAULT_FORM);
            setFormError(null);
      }

      function handleSave() {
            if (!selectedResidentId) return;
            if (!formData.subjectName.trim()) {
                  setFormError('Vui lòng nhập tên môn học.');
                  return;
            }
            if (!formData.startTime || !formData.endTime) {
                  setFormError('Vui lòng nhập giờ bắt đầu và kết thúc.');
                  return;
            }
            if (formData.startTime >= formData.endTime) {
                  setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
                  return;
            }
            setFormError(null);
            const payload = {
                  residentId: selectedResidentId,
                  dayOfWeek: formData.dayOfWeek,
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  subjectName: formData.subjectName.trim() || null,
                  location: formData.location.trim() || null,
                  notes: formData.notes.trim() || null,
            };
            if (editingSchedule) {
                  updateMutation.mutate({ id: editingSchedule.id, ...payload });
            } else {
                  createMutation.mutate(payload);
            }
      }

      const isSaving = createMutation.isPending || updateMutation.isPending;

      const residentOptions = residents.map((r: any) => ({
            value: String(r.id),
            label: `${r.fullName}${r.roomCode ? ` — ${r.roomCode}` : ''}`,
      }));

      const columns: DataTableColumn<StudySchedule>[] = [
            {
                  key: 'day',
                  header: 'Thứ',
                  cell: (s) => (
                        <StatusBadge tone="info">{getDayLabel(s.dayOfWeek)}</StatusBadge>
                  ),
                  className: 'w-28',
            },
            {
                  key: 'time',
                  header: 'Giờ học',
                  cell: (s) => (
                        <span className="flex items-center gap-1 text-sm text-slate-700">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {s.startTime} – {s.endTime}
                        </span>
                  ),
                  className: 'w-36',
            },
            {
                  key: 'subject',
                  header: 'Môn học / Nội dung',
                  cell: (s) => (
                        <div>
                              <p className="font-medium text-slate-900">{s.subjectName || '—'}</p>
                              {s.location && (
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                          <MapPin className="h-3 w-3" />
                                          {s.location}
                                    </p>
                              )}
                        </div>
                  ),
            },
            {
                  key: 'notes',
                  header: 'Ghi chú',
                  cell: (s) => (
                        <p className="text-xs text-slate-500 line-clamp-2">{s.notes || '—'}</p>
                  ),
            },
            {
                  key: 'actions',
                  header: '',
                  cell: (s) => (
                        <div className="flex items-center justify-end gap-1">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          openEdit(s);
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
                                          setDeletingSchedule(s);
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
                                    <h1 className="text-2xl font-bold text-slate-900">Lịch học</h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                          Quản lý lịch học của từng học viên để tránh xung đột khi phân công công tác
                                    </p>
                              </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="total-residents"
                                    title="Học viên có lịch"
                                    value={String(residents.filter((r: any) => r.status === 'active').length)}
                                    icon={<User className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="total-subjects"
                                    title="Môn học đã nhập"
                                    value={selectedResidentId ? String(schedules.length) : '—'}
                                    icon={<BookOpen className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="schedule"
                                    cardKey="days-per-week"
                                    title="Số buổi / tuần"
                                    value={
                                          selectedResidentId
                                                ? String(
                                                        new Set(schedules.map((s) => s.dayOfWeek)).size
                                                  )
                                                : '—'
                                    }
                                    icon={<CalendarDays className="h-4 w-4" />}
                              />
                        </div>

                        {/* Resident selector */}
                        <AppCard title="Chọn học viên" compact>
                              {membersQuery.isLoading ? (
                                    <LoadingState message="Đang tải danh sách học viên..." size="sm" />
                              ) : (
                                    <div className="max-w-sm">
                                          <FormSelect
                                                value={selectedResidentId ? String(selectedResidentId) : ''}
                                                onValueChange={(v) => {
                                                      setSelectedResidentId(Number(v));
                                                      setSearchTerm('');
                                                      setDayFilter('all');
                                                }}
                                                options={residentOptions}
                                                placeholder="Chọn học viên để xem lịch học..."
                                          />
                                    </div>
                              )}
                        </AppCard>

                        {/* Schedules list */}
                        {selectedResidentId && (
                              <AppCard
                                    title={
                                          selectedResident
                                                ? `Lịch học — ${selectedResident.fullName}`
                                                : 'Lịch học'
                                    }
                                    action={
                                          <Button size="sm" onClick={openCreate}>
                                                <Plus className="mr-1.5 h-4 w-4" />
                                                Thêm lịch học
                                          </Button>
                                    }
                              >
                                    {/* Filters */}
                                    <div className="mb-4 flex flex-wrap gap-3">
                                          <Input
                                                placeholder="Tìm môn học, địa điểm..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-8 w-52 text-sm"
                                          />
                                          <FormSelect
                                                value={dayFilter}
                                                onValueChange={(v) =>
                                                      setDayFilter(v as 'all' | DayOfWeekKey)
                                                }
                                                options={[
                                                      { value: 'all', label: 'Tất cả ngày' },
                                                      ...DAY_OPTIONS.map((d) => ({
                                                            value: d.value,
                                                            label: d.label,
                                                      })),
                                                ]}
                                                className="h-8 w-36 text-sm"
                                          />
                                    </div>

                                    {schedulesQuery.isLoading ? (
                                          <LoadingState />
                                    ) : schedulesQuery.isError ? (
                                          <ErrorState
                                                message={schedulesQuery.error.message}
                                                onRetry={() => schedulesQuery.refetch()}
                                          />
                                    ) : (
                                          <DataTable
                                                columns={columns}
                                                data={filteredSchedules}
                                                rowKey={(s) => s.id}
                                                emptyMessage="Chưa có lịch học"
                                                emptyDescription="Thêm lịch học để hệ thống tránh phân công công tác trùng giờ."
                                          />
                                    )}
                              </AppCard>
                        )}

                        {!selectedResidentId && (
                              <EmptyState
                                    title="Chọn học viên để xem lịch học"
                                    description="Lịch học giúp hệ thống tự động tránh phân công công tác trùng với giờ học của học viên."
                              />
                        )}
                  </div>

                  {/* Form modal */}
                  <AppModal
                        open={isFormOpen}
                        onOpenChange={(open) => !open && closeForm()}
                        title={editingSchedule ? 'Sửa lịch học' : 'Thêm lịch học'}
                        size="md"
                        footer={
                              <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                                          Hủy
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                          {isSaving ? 'Đang lưu...' : editingSchedule ? 'Cập nhật' : 'Thêm'}
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

                              <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Ngày trong tuần" required className="col-span-2 sm:col-span-1">
                                          <FormSelect
                                                value={formData.dayOfWeek}
                                                onValueChange={(v) =>
                                                      setFormData((d) => ({ ...d, dayOfWeek: v as DayOfWeekKey }))
                                                }
                                                options={DAY_OPTIONS.map((d) => ({
                                                      value: d.value,
                                                      label: d.label,
                                                }))}
                                          />
                                    </FormField>

                                    <FormField label="Môn học / Nội dung" required className="col-span-2 sm:col-span-1">
                                          <Input
                                                value={formData.subjectName}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, subjectName: e.target.value }))
                                                }
                                                placeholder="VD: Lập trình cơ bản"
                                          />
                                    </FormField>

                                    <FormField label="Giờ bắt đầu" required>
                                          <FormTimeInput
                                                value={formData.startTime}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, startTime: e.target.value }))
                                                }
                                          />
                                    </FormField>

                                    <FormField label="Giờ kết thúc" required>
                                          <FormTimeInput
                                                value={formData.endTime}
                                                onChange={(e) =>
                                                      setFormData((d) => ({ ...d, endTime: e.target.value }))
                                                }
                                          />
                                    </FormField>
                              </div>

                              <FormField label="Địa điểm">
                                    <Input
                                          value={formData.location}
                                          onChange={(e) =>
                                                setFormData((d) => ({ ...d, location: e.target.value }))
                                          }
                                          placeholder="VD: Cơ sở chính, Giảng đường A..."
                                    />
                              </FormField>

                              <FormField label="Ghi chú">
                                    <Input
                                          value={formData.notes}
                                          onChange={(e) =>
                                                setFormData((d) => ({ ...d, notes: e.target.value }))
                                          }
                                          placeholder="Ghi chú thêm (nếu có)"
                                    />
                              </FormField>
                        </div>
                  </AppModal>

                  {/* Confirm delete */}
                  <ConfirmDialog
                        open={deletingSchedule != null}
                        onOpenChange={(open) => !open && setDeletingSchedule(null)}
                        title="Xóa lịch học"
                        description={`Bạn có chắc chắn muốn xóa lịch học "${deletingSchedule?.subjectName || ''}"?`}
                        confirmLabel="Xóa"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onConfirm={() => {
                              if (!deletingSchedule || !selectedResidentId) return;
                              deleteMutation.mutate({
                                    id: deletingSchedule.id,
                                    residentId: selectedResidentId,
                              });
                        }}
                  />
            </ResidenceCareLayout>
      );
}
