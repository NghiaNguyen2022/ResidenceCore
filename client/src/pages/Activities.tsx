'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CalendarDays, CheckCircle2, Clock, Plus, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { Input } from '@/components/ui/input';
import { ConfirmDialog, EmptyState, ErrorState, FormSelect, LoadingState } from '@/components/shared';
import { ActivityFormModal } from '@/components/activities/ActivityFormModal';
import { ActivityRow } from '@/components/activities/ActivityRow';
import { StatusQuickFilter } from '@/components/activities/StatusQuickFilter';
import {
      ACTIVITY_STATUS_OPTIONS,
      ACTIVITY_TYPE_OPTIONS,
      DEFAULT_FORM,
      normalizeCode,
      type Activity,
      type ActivityForm,
      type ActivityStatus,
      type ActivityType,
} from '@/components/activities/types';

function StatPill({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
      return (
            <div className={`${residenceMediumStyle.premiumGoldBlackCardSoft} px-5 py-4`}>
                  <span className={residenceMediumStyle.premiumGoldBlackGlossThin} />
                  <span className={residenceMediumStyle.premiumGoldBlackGlass} />
                  <span className={residenceMediumStyle.premiumGoldBlackGlow} />
                  <span className={residenceMediumStyle.premiumGoldBlackGoldBeam} />
                  <div className="relative flex items-center justify-between gap-4">
                        <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
                              <p className="mt-2 text-3xl font-black leading-8 text-slate-700">{value}</p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/82 text-amber-700 shadow-[0_10px_24px_rgba(12,10,9,0.08)]">
                              {icon}
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
                                                <h1 className={residenceMediumStyle.standardHeaderTitle}>Quản lý hoạt động lưu xá</h1>
                                                <p className={residenceMediumStyle.standardHeaderSubtitle}>
                                                      Theo dõi sinh hoạt, họp, học tập, phục vụ và chọn hoạt động nào hiển thị cho học viên.
                                                </p>
                                          </div>
                                          <div className={residenceMediumStyle.standardHeaderActions}>
                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setStatusFilter('all');
                                                            setTypeFilter('all');
                                                            setSearch('');
                                                      }}
                                                      className={residenceMediumStyle.buttonCard}
                                                >
                                                      Tất cả hoạt động
                                                </button>
                                                <button type="button" onClick={openCreate} className={residenceMediumStyle.buttonCardPrimary}>
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Tạo hoạt động
                                                </button>
                                          </div>
                                    </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <StatPill label="Tổng" value={stats?.total ?? 0} icon={<Sparkles className="h-5 w-5" />} />
                                    <StatPill label="Dự kiến" value={stats?.scheduled ?? 0} icon={<CalendarDays className="h-5 w-5" />} />
                                    <StatPill label="Đang diễn ra" value={stats?.inProgress ?? 0} icon={<Clock className="h-5 w-5" />} />
                                    <StatPill label="Đã diễn ra" value={stats?.completed ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} />
                              </div>

                              <section className={`${residenceMediumStyle.filterPanel} px-5 py-4`}>
                                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,0.32fr)_1fr] lg:items-center">
                                          <div>
                                                <p className="text-[12px] font-black uppercase tracking-[0.28em] text-slate-500">Bộ lọc</p>
                                                <p className="mt-1 text-sm text-slate-500">Lọc nhanh theo trạng thái, loại hoạt động và nội dung cần tìm.</p>
                                          </div>
                                          <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_220px_220px]">
                                                <div className="relative min-w-0">
                                                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                      <Input
                                                            value={search}
                                                            onChange={(event) => setSearch(event.target.value)}
                                                            placeholder="Tìm theo tên, mã, địa điểm, ban phụ trách..."
                                                            className={residenceMediumStyle.searchInput}
                                                      />
                                                </div>
                                                <FormSelect
                                                      value={statusFilter}
                                                      onValueChange={(value) => setStatusFilter(value as 'all' | ActivityStatus)}
                                                      options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...ACTIVITY_STATUS_OPTIONS]}
                                                      className="h-10 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_20px_rgba(120,53,15,0.06)] focus-visible:ring-amber-200"
                                                />
                                                <FormSelect
                                                      value={typeFilter}
                                                      onValueChange={(value) => setTypeFilter(value as 'all' | ActivityType)}
                                                      options={[{ value: 'all', label: 'Tất cả loại' }, ...ACTIVITY_TYPE_OPTIONS]}
                                                      className="h-10 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_20px_rgba(120,53,15,0.06)] focus-visible:ring-amber-200"
                                                />
                                          </div>
                                    </div>
                              </section>

                              <StatusQuickFilter value={statusFilter} onChange={setStatusFilter} />

                              <section className={residenceMediumStyle.section}>
                                    <div className={residenceMediumStyle.sectionHeader}>
                                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-700">Danh sách</p>
                                                      <h2 className={residenceMediumStyle.sectionTitle}>Hoạt động lưu xá</h2>
                                                      <p className="mt-1 text-sm text-slate-500">{activities.length} hoạt động theo bộ lọc hiện tại.</p>
                                                </div>
                                                <button type="button" onClick={openCreate} className={residenceMediumStyle.buttonCardPrimary}>
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Tạo hoạt động
                                                </button>
                                          </div>
                                    </div>
                                    <div className={residenceMediumStyle.sectionBody}>
                                          {activitiesQuery.isLoading ? (
                                                <LoadingState />
                                          ) : activitiesQuery.isError ? (
                                                <ErrorState message={activitiesQuery.error.message} onRetry={() => activitiesQuery.refetch()} />
                                          ) : activities.length === 0 ? (
                                                <EmptyState
                                                      title="Chưa có hoạt động nào"
                                                      description="Tạo hoạt động đầu tiên để demo lịch sinh hoạt, họp, thiện nguyện hoặc sự kiện chung của lưu xá."
                                                      action={
                                                            <button type="button" onClick={openCreate} className={residenceMediumStyle.buttonCardPrimary}>
                                                                  <Plus className="mr-2 h-4 w-4" />
                                                                  Tạo hoạt động
                                                            </button>
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

                        <ActivityFormModal
                              open={isFormOpen}
                              editingActivity={editingActivity}
                              form={form}
                              formError={formError}
                              isSaving={isSaving}
                              setForm={setForm}
                              onClose={closeForm}
                              onSave={saveForm}
                        />

                        <ConfirmDialog
                              open={activityToCancel != null}
                              onOpenChange={(open) => !open && setActivityToCancel(null)}
                              title="Hủy hoạt động"
                              description={`Bạn có chắc chắn muốn hủy hoạt động “${activityToCancel?.title ?? ''}”?`}
                              confirmLabel="Hủy hoạt động"
                              variant="danger"
                              loading={cancelMutation.isPending}
                              onConfirm={() => {
                                    if (!activityToCancel) return;
                                    cancelMutation.mutate({ id: activityToCancel.id });
                              }}
                        />

                        <ConfirmDialog
                              open={activityToDelete != null}
                              onOpenChange={(open) => !open && setActivityToDelete(null)}
                              title="Xóa hoạt động"
                              description={`Bạn có chắc chắn muốn xóa hoạt động “${activityToDelete?.title ?? ''}”? Dữ liệu sẽ được ẩn khỏi danh sách.`}
                              confirmLabel="Xóa"
                              variant="danger"
                              loading={deleteMutation.isPending}
                              onConfirm={() => {
                                    if (!activityToDelete) return;
                                    deleteMutation.mutate({ id: activityToDelete.id });
                              }}
                        />
                  </div>
            </ResidenceCareLayout>
      );
}
