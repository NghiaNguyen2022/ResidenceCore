'use client';

import { CheckCircle2, SkipForward, X } from 'lucide-react';

import {
      Badge,
      DateNavigator,
      EmptyState,
      SectionCard,
      getAssigneeTypeLabel,
      getDutyStatusClass,
      getDutyStatusLabel,
      getDutyTypeLabel,
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

function getSimpleDutyStatusLabel(status?: string | null) {
      const normalized = normalizeDutyStatus(status);

      if (normalized === 'completed') return 'Đã hoàn thành';
      if (normalized === 'cancelled') return 'Đã hủy';
      if (normalized === 'skipped' || normalized === 'absent') return 'Chưa hoàn thành';

      return 'Chưa hoàn thành';
}

function getSimpleDutyStatusClass(status?: string | null) {
      const normalized = normalizeDutyStatus(status);

      if (normalized === 'completed') {
            return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      }

      if (normalized === 'cancelled') {
            return 'border-amber-100 bg-amber-50/55 text-slate-500';
      }

      return 'border-amber-100 bg-amber-50 text-amber-700';
}

function formatTimeOnly(value: unknown) {
      if (!value) return '';

      if (typeof value === 'string') {
            const text = value.trim();

            if (!text) return '';

            const timeMatch = text.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

            if (timeMatch) {
                  return `${timeMatch[1]}:${timeMatch[2]}`;
            }

            if (text.includes('T')) {
                  const date = new Date(text);

                  if (!Number.isNaN(date.getTime())) {
                        const hours = String(date.getUTCHours()).padStart(2, '0');
                        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

                        return `${hours}:${minutes}`;
                  }
            }

            return text.slice(0, 5);
      }

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const hours = String(value.getUTCHours()).padStart(2, '0');
            const minutes = String(value.getUTCMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
      }

      return String(value).slice(0, 5);
}

function getAssignmentStartTime(assignment: any) {
      return formatTimeOnly(
            assignment.startTime ||
                  assignment.dutyConfig?.startTime ||
                  assignment.startDateTime
      );
}

function getAssignmentEndTime(assignment: any) {
      return formatTimeOnly(
            assignment.endTime ||
                  assignment.dutyConfig?.endTime ||
                  assignment.endDateTime
      );
}

function normalizeDutyStatus(status?: string | null) {
      return String(status || 'pending').toLowerCase();
}

function isFinalDutyStatus(status?: string | null) {
      const normalizedStatus = normalizeDutyStatus(status);

      return ['completed', 'skipped', 'absent', 'cancelled'].includes(
            normalizedStatus
      );
}

function DutyTimeBox({ startTime, endTime }: { startTime: string; endTime: string }) {
      return (
            <div className="flex min-w-[110px] flex-col items-center justify-center rounded-xl border border-amber-100 bg-white/88 px-3 py-2.5 text-center shadow-[0_4px_12px_rgba(120,53,15,0.035)]">
                  <span className="text-sm font-bold text-slate-700">
                        {startTime || '--:--'}
                  </span>
                  <span className="text-xs text-slate-400">đến</span>
                  <span className="text-sm font-bold text-slate-700">
                        {endTime || '--:--'}
                  </span>
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
                  description="Theo dõi đơn giản: ngày, nơi làm và trạng thái hoàn thành."
                  action={
                        <div className="flex flex-wrap items-center gap-2">
                              <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                          onStatusFilterChange(
                                                event.target.value as DutyStatusFilter
                                          )
                                    }
                                    className="h-10 rounded-xl border border-amber-100 bg-white/88 px-3 text-sm"
                              >
                                    <option value="all">Tất cả</option>
                                    <option value="open">Chưa hoàn thành</option>
                                    <option value="overdue">Đã quá giờ</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="skipped">Chưa hoàn thành</option>
                                    <option value="cancelled">Đã hủy</option>
                              </select>

                              <DateNavigator
                                    value={selectedDate}
                                    onChange={onDateChange}
                              />
                        </div>
                  }
            >
                  {isLoading ? (
                        <EmptyState
                              title="Đang tải công tác"
                              description="Vui lòng chờ trong giây lát."
                        />
                  ) : assignments.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác trong ngày"
                              description="Chưa có công tác phù hợp với bộ lọc hiện tại."
                        />
                  ) : (
                        <div className="space-y-3">
                              {assignments.map((assignment: any) => {
                                    const visualState = getDutyVisualState(
                                          assignment,
                                          selectedDate
                                    );

                                    return (
                                          <div
                                                key={assignment.id}
                                                className={[
                                                      'rounded-xl border p-3 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition',
                                                      getTimelineCardClass(
                                                            'duty',
                                                            visualState
                                                      ),
                                                ].join(' ')}
                                          >
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                      <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                  <h3 className="font-bold text-slate-900">
                                                                        {assignment.dutyName ||
                                                                              assignment.dutyConfig?.dutyName ||
                                                                              `Công tác #${assignment.id}`}
                                                                  </h3>

                                                                  <Badge className={getSimpleDutyStatusClass(assignment.status)}>
                                                                        {getSimpleDutyStatusLabel(assignment.status)}
                                                                  </Badge>

                                                                  {getVisualStateLabel('duty', visualState) && (
                                                                        <Badge className={getVisualStateBadgeClass('duty', visualState)}>
                                                                              {getVisualStateLabel('duty', visualState)}
                                                                        </Badge>
                                                                  )}
                                                            </div>

                                                            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                                                                  <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ngày</p>
                                                                        <p className="mt-1 font-semibold text-slate-800">{selectedDate}</p>
                                                                  </div>

                                                                  <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nơi làm</p>
                                                                        <p className="mt-1 font-semibold text-slate-800">{getDutyPlace(assignment)}</p>
                                                                  </div>

                                                                  <div className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phân công</p>
                                                                        <p className="mt-1 font-semibold text-slate-800">
                                                                              {getAssigneeTypeLabel(
                                                                                    assignment.assignedToType ||
                                                                                          (assignment.residentId ? 'resident' : null)
                                                                              )}
                                                                              : {getAssigneeName(assignment)}
                                                                        </p>
                                                                  </div>
                                                            </div>
                                                      </div>

                                                      {!isFinalDutyStatus(assignment.status) && (
                                                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onCompleteDuty(assignment)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                  >
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Đã hoàn thành
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onSkipDuty(assignment)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                  >
                                                                        <SkipForward className="h-3.5 w-3.5" />
                                                                        Chưa hoàn thành
                                                                  </button>

                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onCancelDuty(assignment)}
                                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                  >
                                                                        <X className="h-3.5 w-3.5" />
                                                                        Hủy
                                                                  </button>
                                                            </div>
                                                      )}
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
