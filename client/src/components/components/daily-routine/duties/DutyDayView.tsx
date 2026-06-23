'use client';

import { CheckCircle2, SkipForward, X } from 'lucide-react';

import {
      Badge,
      DateNavigator,
      EmptyState,
      SectionCard,
      getAssigneeTypeLabel,
      getDutyVisualState,
      getTimelineCardClass,
      getVisualStateBadgeClass,
      getVisualStateLabel,
} from '@/components/daily-routine/shared';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'absent' | 'cancelled';

type DutyDayViewProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      statusFilter: DutyStatusFilter;
      onStatusFilterChange: (value: DutyStatusFilter) => void;
      assignments: any[];
      isLoading?: boolean;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
      onCancelDuty: (assignment: any) => void;
};

function getAssigneeName(assignment: any) {
      return (
            assignment.assigneeName ||
            assignment.residentName ||
            assignment.memberName ||
            assignment.assignedToName ||
            assignment.roomName ||
            assignment.unitName ||
            assignment.resident?.fullName ||
            assignment.member?.fullName ||
            'Đối tượng được phân công'
      );
}

function getDutyPlace(assignment: any) {
      return (
            assignment.place ||
            assignment.location ||
            assignment.workPlace ||
            assignment.notes ||
            assignment.dutyConfig?.place ||
            assignment.dutyConfig?.location ||
            assignment.dutyConfig?.description ||
            'Chưa ghi nơi làm'
      );
}

function normalizeDutyStatus(status?: string | null) {
      return String(status || 'pending').toLowerCase();
}

function isFinalDutyStatus(status?: string | null) {
      const normalizedStatus = normalizeDutyStatus(status);

      return ['completed', 'skipped', 'absent', 'cancelled'].includes(normalizedStatus);
}

function getSimpleStatusLabel(status?: string | null) {
      const normalizedStatus = normalizeDutyStatus(status);

      if (normalizedStatus === 'completed') return 'Đã hoàn thành';
      if (normalizedStatus === 'cancelled') return 'Đã hủy';

      return 'Chưa hoàn thành';
}

function getSimpleStatusClass(status?: string | null) {
      const normalizedStatus = normalizeDutyStatus(status);

      if (normalizedStatus === 'completed') {
            return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      }

      if (normalizedStatus === 'cancelled') {
            return 'border-slate-200 bg-slate-100 text-slate-500';
      }

      return 'border-amber-100 bg-amber-50 text-amber-700';
}

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
      return (
            <div className="min-w-0 rounded-xl border border-amber-100/70 bg-white/82 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold leading-5 text-slate-700">
                        {children}
                  </p>
            </div>
      );
}

export function DutyDayView({
      selectedDate,
      onDateChange,
      statusFilter,
      onStatusFilterChange,
      assignments,
      isLoading,
      onCompleteDuty,
      onSkipDuty,
      onCancelDuty,
}: DutyDayViewProps) {
      return (
            <SectionCard
                  title="Công tác trong ngày"
                  description="Theo dõi ngắn gọn: ngày, nơi làm, phân công và tình trạng hoàn thành."
                  action={
                        <div className="flex flex-wrap items-center gap-2">
                              <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                          onStatusFilterChange(event.target.value as DutyStatusFilter)
                                    }
                                    className="h-10 rounded-xl border border-amber-100 bg-white/88 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100/80"
                              >
                                    <option value="all">Tất cả</option>
                                    <option value="open">Chưa hoàn thành</option>
                                    <option value="overdue">Đã quá giờ</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="skipped">Chưa hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                              </select>

                              <DateNavigator value={selectedDate} onChange={onDateChange} />
                        </div>
                  }
            >
                  {isLoading ? (
                        <EmptyState title="Đang tải công tác" description="Vui lòng chờ trong giây lát." />
                  ) : assignments.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác trong ngày"
                              description="Chưa có công tác phù hợp với bộ lọc hiện tại."
                        />
                  ) : (
                        <div className="space-y-3">
                              {assignments.map((assignment: any) => {
                                    const visualState = getDutyVisualState(assignment, selectedDate);

                                    return (
                                          <div
                                                key={assignment.id}
                                                className={[
                                                      'rounded-2xl border p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition',
                                                      getTimelineCardClass('duty', visualState),
                                                ].join(' ')}
                                          >
                                                <div className="flex flex-col gap-2">
                                                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="text-base font-bold leading-tight text-slate-900">
                                                                              {assignment.dutyName ||
                                                                                    assignment.dutyConfig?.dutyName ||
                                                                                    `Công tác #${assignment.id}`}
                                                                        </h3>

                                                                        <Badge className={getSimpleStatusClass(assignment.status)}>
                                                                              {getSimpleStatusLabel(assignment.status)}
                                                                        </Badge>

                                                                        {getVisualStateLabel('duty', visualState) && (
                                                                              <Badge className={getVisualStateBadgeClass('duty', visualState)}>
                                                                                    {getVisualStateLabel('duty', visualState)}
                                                                              </Badge>
                                                                        )}
                                                                  </div>
                                                            </div>

                                                            {!isFinalDutyStatus(assignment.status) && (
                                                                  <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onCompleteDuty(assignment)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                        >
                                                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                                                              Đã hoàn thành
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onSkipDuty(assignment)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                        >
                                                                              <SkipForward className="h-3.5 w-3.5" />
                                                                              Chưa hoàn thành
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onCancelDuty(assignment)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                        >
                                                                              <X className="h-3.5 w-3.5" />
                                                                              Hủy
                                                                        </button>
                                                                  </div>
                                                            )}
                                                      </div>

                                                      <div className="grid gap-2 md:grid-cols-[120px_1fr_1.2fr]">
                                                            <InfoBox label="Ngày">{selectedDate}</InfoBox>
                                                            <InfoBox label="Nơi làm">{getDutyPlace(assignment)}</InfoBox>
                                                            <InfoBox label="Phân công">
                                                                  {getAssigneeTypeLabel(
                                                                        assignment.assignedToType ||
                                                                              (assignment.residentId ? 'resident' : null)
                                                                  )}
                                                                  : {getAssigneeName(assignment)}
                                                            </InfoBox>
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyDayView;
