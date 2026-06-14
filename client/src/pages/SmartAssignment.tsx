'use client';

import { useMemo, useState } from 'react';
import {
      AlertTriangle,
      Calendar,
      CheckCircle2,
      ClipboardList,
      Loader2,
      UserCheck,
      UserX,
      Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
      AppCard,
      AppSection,
      ConfirmDialog,
      EmptyState,
      ErrorState,
      FormField,
      FormSelect,
      LoadingState,
      StatusBadge,
} from '@/components/shared';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';

const DAY_LABELS: Record<number, string> = {
      0: 'Chủ nhật',
      1: 'Thứ hai',
      2: 'Thứ ba',
      3: 'Thứ tư',
      4: 'Thứ năm',
      5: 'Thứ sáu',
      6: 'Thứ bảy',
};

function todayString() {
      return format(new Date(), 'yyyy-MM-dd');
}

export default function SmartAssignment() {
      const [dutyConfigId, setDutyConfigId] = useState<number | null>(null);
      const [targetDate, setTargetDate] = useState(todayString());
      const [selectedResidentIds, setSelectedResidentIds] = useState<Set<number>>(new Set());
      const [confirmOpen, setConfirmOpen] = useState(false);
      const [notes, setNotes] = useState('');

      const configsQuery = trpc.duties.listConfigs.useQuery(undefined);

      const suggestionsQuery = trpc.duties.getSmartSuggestions.useQuery(
            { dutyConfigId: dutyConfigId!, targetDate, travelMinutes: 60 },
            { enabled: !!dutyConfigId && !!targetDate }
      );

      const bulkAssignMutation = trpc.duties.bulkAssignResidents.useMutation({
            onSuccess: (data) => {
                  toast.success(`Đã phân công ${data.count} học viên thành công`);
                  setConfirmOpen(false);
                  setSelectedResidentIds(new Set());
                  suggestionsQuery.refetch();
            },
            onError: (err) => toast.error(err.message),
      });

      const configOptions = useMemo(
            () =>
                  (configsQuery.data || []).map((c: any) => ({
                        value: String(c.id),
                        label: `${c.dutyName} (${c.dutyCode})`,
                  })),
            [configsQuery.data]
      );

      const suggestions = suggestionsQuery.data;
      const available = suggestions?.available ?? [];
      const conflicted = suggestions?.conflicted ?? [];

      function toggleResident(id: number) {
            setSelectedResidentIds((prev) => {
                  const next = new Set(prev);
                  next.has(id) ? next.delete(id) : next.add(id);
                  return next;
            });
      }

      function selectAllAvailable() {
            setSelectedResidentIds(new Set(available.map((r: any) => r.id)));
      }

      function clearSelection() {
            setSelectedResidentIds(new Set());
      }

      async function handleAssign() {
            if (!dutyConfigId || selectedResidentIds.size === 0) return;
            await bulkAssignMutation.mutateAsync({
                  dutyConfigId,
                  residentIds: Array.from(selectedResidentIds),
                  assignedDate: targetDate,
                  notes: notes.trim() || null,
            });
      }

      const selectedConfig = (configsQuery.data || []).find((c: any) => c.id === dutyConfigId);

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6">
                        {/* Header */}
                        <div>
                              <h1 className="text-2xl font-bold text-slate-900">Phân công thông minh</h1>
                              <p className="mt-1 text-sm text-slate-500">
                                    Tự động gợi ý học viên khả dụng dựa trên lịch học — tránh xung đột giờ học
                              </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="smart-assignment"
                                    cardKey="available"
                                    title="Khả dụng"
                                    value={suggestions ? String(available.length) : '—'}
                                    icon={<UserCheck className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="smart-assignment"
                                    cardKey="conflicted"
                                    title="Bận học"
                                    value={suggestions ? String(conflicted.length) : '—'}
                                    icon={<UserX className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="smart-assignment"
                                    cardKey="selected"
                                    title="Đã chọn"
                                    value={String(selectedResidentIds.size)}
                                    icon={<CheckCircle2 className="h-4 w-4" />}
                              />
                              <ConfigurableStatCard
                                    moduleKey="smart-assignment"
                                    cardKey="total"
                                    title="Tổng học viên"
                                    value={suggestions ? String(available.length + conflicted.length) : '—'}
                                    icon={<ClipboardList className="h-4 w-4" />}
                              />
                        </div>

                        {/* Filters */}
                        <AppCard title="Cấu hình phân công">
                              <div className="grid gap-4 sm:grid-cols-3">
                                    <FormField label="Công tác" required>
                                          {configsQuery.isLoading ? (
                                                <div className="flex h-10 items-center gap-2 text-sm text-slate-400">
                                                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                                                </div>
                                          ) : (
                                                <FormSelect
                                                      value={dutyConfigId ? String(dutyConfigId) : ''}
                                                      onValueChange={(v) => {
                                                            setDutyConfigId(Number(v));
                                                            setSelectedResidentIds(new Set());
                                                      }}
                                                      options={configOptions}
                                                      placeholder="Chọn loại công tác..."
                                                />
                                          )}
                                    </FormField>

                                    <FormField label="Ngày phân công" required>
                                          <DatePickerInput
                                                value={targetDate}
                                                onChange={(e) => {
                                                      setTargetDate(e.target.value);
                                                      setSelectedResidentIds(new Set());
                                                }}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          />
                                    </FormField>

                                    <FormField label="Ghi chú phân công">
                                          <input
                                                type="text"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Ghi chú (tùy chọn)"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          />
                                    </FormField>
                              </div>

                              {selectedConfig && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm">
                                          <span className="font-medium text-blue-800">{selectedConfig.dutyName}</span>
                                          {selectedConfig.startTime && selectedConfig.endTime && (
                                                <Badge variant="secondary">
                                                      {String(selectedConfig.startTime)} – {String(selectedConfig.endTime)}
                                                </Badge>
                                          )}
                                          {selectedConfig.dayOfWeek != null && (
                                                <Badge variant="outline">{DAY_LABELS[selectedConfig.dayOfWeek] ?? ''}</Badge>
                                          )}
                                          {targetDate && (
                                                <span className="text-blue-600">
                                                      <Calendar className="mr-1 inline h-3.5 w-3.5" />
                                                      {targetDate}
                                                </span>
                                          )}
                                    </div>
                              )}
                        </AppCard>

                        {/* Results */}
                        {!dutyConfigId ? (
                              <EmptyState
                                    title="Chọn công tác để bắt đầu"
                                    description="Chọn loại công tác và ngày phân công để xem gợi ý."
                                    icon={<Zap className="h-8 w-8 text-slate-300" />}
                              />
                        ) : suggestionsQuery.isLoading ? (
                              <LoadingState message="Đang phân tích lịch học..." />
                        ) : suggestionsQuery.isError ? (
                              <ErrorState
                                    message={suggestionsQuery.error.message}
                                    onRetry={() => suggestionsQuery.refetch()}
                              />
                        ) : (
                              <>
                                    {/* Action bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3">
                                          <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span>
                                                      Đã chọn{' '}
                                                      <span className="font-semibold text-slate-900">
                                                            {selectedResidentIds.size}
                                                      </span>{' '}
                                                      học viên
                                                </span>
                                          </div>
                                          <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={selectAllAvailable} disabled={available.length === 0}>
                                                      Chọn tất cả khả dụng ({available.length})
                                                </Button>
                                                {selectedResidentIds.size > 0 && (
                                                      <Button size="sm" variant="outline" onClick={clearSelection}>
                                                            Bỏ chọn
                                                      </Button>
                                                )}
                                                <Button
                                                      size="sm"
                                                      onClick={() => setConfirmOpen(true)}
                                                      disabled={selectedResidentIds.size === 0}
                                                >
                                                      <Zap className="mr-1.5 h-4 w-4" />
                                                      Phân công ({selectedResidentIds.size})
                                                </Button>
                                          </div>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                          {/* Available */}
                                          <AppSection
                                                title={
                                                      <span className="flex items-center gap-2 text-green-700">
                                                            <UserCheck className="h-4 w-4" />
                                                            Khả dụng ({available.length})
                                                      </span>
                                                }
                                          >
                                                {available.length === 0 ? (
                                                      <EmptyState
                                                            title="Không có học viên khả dụng"
                                                            description="Tất cả học viên đều có lịch học vào khung giờ này."
                                                      />
                                                ) : (
                                                      <div className="space-y-2">
                                                            {available.map((r: any) => {
                                                                  const isSelected = selectedResidentIds.has(r.id);
                                                                  return (
                                                                        <button
                                                                              key={r.id}
                                                                              onClick={() => toggleResident(r.id)}
                                                                              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                                                                                    isSelected
                                                                                          ? 'border-green-400 bg-green-50'
                                                                                          : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                                                                              }`}
                                                                        >
                                                                              <div>
                                                                                    <p className="font-medium text-slate-900">
                                                                                          {r.holyName ? `${r.holyName} ` : ''}{r.fullName}
                                                                                    </p>
                                                                                    {r.roomCode && (
                                                                                          <p className="text-xs text-slate-500">
                                                                                                Phòng {r.roomCode}
                                                                                          </p>
                                                                                    )}
                                                                              </div>
                                                                              {isSelected ? (
                                                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                                                                              ) : (
                                                                                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
                                                                              )}
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>
                                                )}
                                          </AppSection>

                                          {/* Conflicted */}
                                          <AppSection
                                                title={
                                                      <span className="flex items-center gap-2 text-amber-700">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            Bận học ({conflicted.length})
                                                      </span>
                                                }
                                          >
                                                {conflicted.length === 0 ? (
                                                      <EmptyState
                                                            title="Không có xung đột"
                                                            description="Không có học viên nào bị trùng lịch học."
                                                      />
                                                ) : (
                                                      <div className="space-y-2">
                                                            {conflicted.map(({ resident, conflicts }: any) => {
                                                                  const isSelected = selectedResidentIds.has(resident.id);
                                                                  return (
                                                                        <button
                                                                              key={resident.id}
                                                                              onClick={() => toggleResident(resident.id)}
                                                                              className={`flex w-full items-start justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                                                                                    isSelected
                                                                                          ? 'border-amber-400 bg-amber-50'
                                                                                          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                                                                              }`}
                                                                        >
                                                                              <div className="min-w-0 flex-1">
                                                                                    <p className="font-medium text-slate-900">
                                                                                          {resident.holyName ? `${resident.holyName} ` : ''}{resident.fullName}
                                                                                    </p>
                                                                                    {resident.roomCode && (
                                                                                          <p className="text-xs text-slate-500">
                                                                                                Phòng {resident.roomCode}
                                                                                          </p>
                                                                                    )}
                                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                                          {conflicts.map((c: any, i: number) => (
                                                                                                <StatusBadge key={i} tone="warning">
                                                                                                      {String(c.startTime)} – {String(c.endTime)}
                                                                                                      {c.subjectName ? ` · ${c.subjectName}` : ''}
                                                                                                </StatusBadge>
                                                                                          ))}
                                                                                    </div>
                                                                              </div>
                                                                              <div className="ml-3 shrink-0">
                                                                                    {isSelected ? (
                                                                                          <CheckCircle2 className="h-5 w-5 text-amber-500" />
                                                                                    ) : (
                                                                                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                                                                                    )}
                                                                              </div>
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>
                                                )}
                                          </AppSection>
                                    </div>
                              </>
                        )}
                  </div>

                  <ConfirmDialog
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        title="Xác nhận phân công"
                        description={`Phân công ${selectedResidentIds.size} học viên vào công tác "${selectedConfig?.dutyName ?? ''}" ngày ${targetDate}?`}
                        confirmLabel="Phân công"
                        onConfirm={handleAssign}
                        loading={bulkAssignMutation.isPending}
                  />
            </ResidenceCareLayout>
      );
}
