'use client';

import { useState } from 'react';
import {
      CheckCircle2,
      ChevronDown,
      ChevronUp,
      SkipForward,
      X,
} from 'lucide-react';

import {
      Badge,
      DateNavigator,
      EmptyState,
      SectionCard,
      getAssigneeTypeLabel,
      getDutyVisualState,
} from '@/components/daily-routine/shared';
import { formatTime as formatTimeText } from '@/lib/format';

type DutyStatusFilter =
      | 'all'
      | 'open'
      | 'overdue'
      | 'completed'
      | 'skipped'
      | 'absent'
      | 'cancelled';

type DutyDayViewProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      statusFilter: DutyStatusFilter;
      onStatusFilterChange: (value: DutyStatusFilter) => void;
      assignments: any[];
      dutyConfigs?: any[];
      isLoading?: boolean;
      onAssignDutyConfig?: (dutyConfig: any) => void;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
      onCancelDuty: (assignment: any) => void;
};

type DutyGroup = {
      id: string;
      representative: any;
      assignments: any[];
      dutyName: string;
      date: string;
      timeRange: string;
      place: string;
      status: string;
      visualState: string;
};

function normalizeDutyStatus(status?: string | null) {
      return String(status || 'pending').toLowerCase();
}

function isFinalDutyStatus(status?: string | null) {
      return ['completed', 'skipped', 'absent', 'cancelled'].includes(
            normalizeDutyStatus(status)
      );
}

function getDutyName(assignment: any) {
      return (
            assignment.dutyConfig?.dutyName ||
            assignment.dutyName ||
            assignment.dutyConfigName ||
            `Công tác #${assignment.dutyConfigId || assignment.id}`
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

function getDutyTimeRange(assignment: any) {
      const start =
            assignment.dutyConfig?.startTime ||
            assignment.startTime ||
            assignment.startDateTime;
      const end =
            assignment.dutyConfig?.endTime ||
            assignment.endTime ||
            assignment.endDateTime;

      return `${formatTimeText(start)} - ${formatTimeText(end)}`;
}

function getDutyConfigType(dutyConfig?: any | null) {
      return dutyConfig?.dutyType || dutyConfig?.frequency || 'daily';
}

function isDailyDutyConfig(dutyConfig: any) {
      return getDutyConfigType(dutyConfig) === 'daily' && dutyConfig?.isActive !== false;
}

function getDutyConfigName(dutyConfig: any) {
      return dutyConfig?.dutyName || dutyConfig?.name || `Công tác #${dutyConfig?.id}`;
}

function getDutyConfigPlace(dutyConfig: any) {
      return dutyConfig?.place || dutyConfig?.location || dutyConfig?.description || 'Chưa ghi nơi làm';
}

function getDutyConfigTimeRange(dutyConfig: any) {
      return `${formatTimeText(dutyConfig?.startTime)} - ${formatTimeText(dutyConfig?.endTime)}`;
}

function getDutyConfigKey(dutyConfig: any, selectedDate: string) {
      return [
            selectedDate,
            dutyConfig?.id || getDutyConfigName(dutyConfig),
            getDutyConfigName(dutyConfig),
            getDutyConfigTimeRange(dutyConfig),
            getDutyConfigPlace(dutyConfig),
      ].join('|');
}

function getAssignmentDutyConfigId(assignment: any) {
      return String(
            assignment.dutyConfigId ||
                  assignment.dutyConfig?.id ||
                  ''
      );
}

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

function getAssigneeKey(assignment: any) {
      return [
            assignment.assignedToType || 'resident',
            assignment.assignedToId ||
                  assignment.residentId ||
                  assignment.memberId ||
                  getAssigneeName(assignment),
      ].join(':');
}

function getGroupKey(assignment: any, selectedDate: string) {
      return [
            assignment.assignedDate || selectedDate,
            assignment.dutyConfigId || assignment.dutyConfig?.id || getDutyName(assignment),
            getDutyName(assignment),
            getDutyTimeRange(assignment),
            getDutyPlace(assignment),
      ].join('|');
}

function getGroupStatus(assignments: any[]) {
      if (assignments.every((item) => normalizeDutyStatus(item.status) === 'completed')) {
            return 'completed';
      }
      if (assignments.every((item) => normalizeDutyStatus(item.status) === 'cancelled')) {
            return 'cancelled';
      }
      if (assignments.every((item) => isFinalDutyStatus(item.status))) {
            return 'skipped';
      }
      return 'pending';
}

function getGroupStatusLabel(status: string) {
      if (status === 'unassigned') return 'Chưa phân công';
      if (status === 'completed') return 'Đã hoàn thành';
      if (status === 'cancelled') return 'Đã hủy';
      if (status === 'skipped') return 'Đã xử lý';
      return 'Chưa hoàn thành';
}

function getGroupStatusClass(status: string) {
      if (status === 'unassigned') return 'border-violet-100 bg-violet-50 text-violet-700';
      if (status === 'completed') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      if (status === 'cancelled') return 'border-slate-200 bg-slate-100 text-slate-500';
      if (status === 'skipped') return 'border-amber-100 bg-amber-50 text-amber-700';
      return 'border-amber-100 bg-white/80 text-amber-800';
}

function buildDutyGroups(
      assignments: any[],
      selectedDate: string,
      dutyConfigs: any[] = []
): DutyGroup[] {
      const groupMap = new Map<string, any[]>();

      assignments.forEach((assignment) => {
            const key = getGroupKey(assignment, selectedDate);
            groupMap.set(key, [...(groupMap.get(key) || []), assignment]);
      });

      const assignedDutyConfigIds = new Set(
            assignments.map(getAssignmentDutyConfigId).filter(Boolean)
      );

      dutyConfigs.filter(isDailyDutyConfig).forEach((dutyConfig) => {
            const dutyConfigId = String(dutyConfig?.id || '');
            if (dutyConfigId && assignedDutyConfigIds.has(dutyConfigId)) return;

            const key = getDutyConfigKey(dutyConfig, selectedDate);
            if (groupMap.has(key)) return;

            groupMap.set(key, [{
                  id: `unassigned-${dutyConfig?.id}`,
                  dutyConfigId: dutyConfig?.id,
                  dutyConfig,
                  status: 'unassigned',
                  isUnassignedDuty: true,
            }]);
      });

      return Array.from(groupMap.entries())
            .map(([key, rows]) => {
                  const representative = rows[0];
                  const isUnassignedDuty = Boolean(representative.isUnassignedDuty);
                  const status = isUnassignedDuty ? 'unassigned' : getGroupStatus(rows);

                  return {
                        id: key,
                        representative: {
                              ...representative,
                              assignments: isUnassignedDuty ? [] : rows,
                              status,
                              dutyName: getDutyName(representative),
                        },
                        assignments: isUnassignedDuty ? [] : rows,
                        dutyName: getDutyName(representative),
                        date: selectedDate,
                        timeRange: getDutyTimeRange(representative),
                        place: getDutyPlace(representative),
                        status,
                        visualState: getDutyVisualState(
                              {
                                    ...representative,
                                    status,
                                    startTime:
                                          representative.dutyConfig?.startTime ||
                                          representative.startTime,
                                    endTime:
                                          representative.dutyConfig?.endTime ||
                                          representative.endTime,
                              },
                              selectedDate
                        ),
                  };
            })
            .sort((a, b) => a.timeRange.localeCompare(b.timeRange));
}

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
      return (
            <div className="min-w-0 rounded-xl border border-amber-100/70 bg-white/78 px-3 py-2">
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
      dutyConfigs = [],
      isLoading,
      onAssignDutyConfig,
      onCompleteDuty,
      onSkipDuty,
      onCancelDuty,
}: DutyDayViewProps) {
      const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
      const dutyGroups = buildDutyGroups(assignments, selectedDate, dutyConfigs);

      return (
            <SectionCard
                  action={
                        <div className="flex flex-wrap items-center gap-2">
                              <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                          onStatusFilterChange(event.target.value as DutyStatusFilter)
                                    }
                                    className="h-10 rounded-xl border border-amber-100/70 bg-white/78 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-100/80"
                              >
                                    <option value="all">Tất cả</option>
                                    <option value="open">Chưa hoàn thành</option>
                                    <option value="overdue">Đã quá giờ</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="skipped">Vắng / không làm</option>
                                    <option value="cancelled">Đã hủy</option>
                              </select>
                              <DateNavigator value={selectedDate} onChange={onDateChange} />
                        </div>
                  }
            >
                  {isLoading ? (
                        <EmptyState title="Đang tải công tác" description="Vui lòng chờ trong giây lát." />
                  ) : dutyGroups.length === 0 ? (
                        <EmptyState
                              title="Chưa có công tác trong ngày"
                              description="Chưa có công tác phù hợp với bộ lọc hiện tại."
                        />
                  ) : (
                        <div className="space-y-3">
                              {dutyGroups.map((group) => {
                                    const isFinal = isFinalDutyStatus(group.status);
                                    const isOverdue = group.visualState === 'overdue';
                                    const expanded = expandedGroupId === group.id;

                                    return (
                                          <div
                                                key={group.id}
                                                className="relative overflow-hidden rounded-[22px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.84)_0%,rgba(255,251,235,0.38)_100%)] p-3 transition"
                                          >
                                                <span
                                                      className={[
                                                            'absolute inset-x-0 top-0 h-1',
                                                            group.status === 'unassigned'
                                                                  ? 'bg-violet-300'
                                                                  : group.status === 'completed'
                                                                        ? 'bg-emerald-400'
                                                                        : group.status === 'cancelled'
                                                                              ? 'bg-slate-300'
                                                                              : isOverdue
                                                                                    ? 'bg-rose-300'
                                                                                    : 'bg-amber-300',
                                                      ].join(' ')}
                                                />

                                                <div className="flex flex-col gap-3 pt-1">
                                                      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="text-base font-bold leading-tight text-slate-900">
                                                                              {group.dutyName}
                                                                        </h3>
                                                                        <Badge className={getGroupStatusClass(group.status)}>
                                                                              {getGroupStatusLabel(group.status)}
                                                                        </Badge>
                                                                        {group.assignments.length > 1 && (
                                                                              <Badge className="border-amber-100 bg-white/82 text-amber-800">
                                                                                    {group.assignments.length} người/đối tượng
                                                                              </Badge>
                                                                        )}
                                                                        {isOverdue && !isFinal && (
                                                                              <Badge className="border-rose-100 bg-rose-50 text-rose-700">
                                                                                    Đã quá giờ
                                                                              </Badge>
                                                                        )}
                                                                  </div>
                                                            </div>

                                                            {group.status === 'unassigned' ? (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onAssignDutyConfig?.(group.representative.dutyConfig)}
                                                                        className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                                                                  >
                                                                        Phân công
                                                                  </button>
                                                            ) : (
                                                                  <div className="flex flex-wrap gap-2">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() =>
                                                                                    setExpandedGroupId(expanded ? null : group.id)
                                                                              }
                                                                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                        >
                                                                              {expanded ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                              ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                              )}
                                                                              {expanded ? 'Thu gọn' : 'Chi tiết'}
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onCompleteDuty(group.representative)}
                                                                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                                        >
                                                                              <CheckCircle2 className="h-4 w-4" />
                                                                              Đã hoàn thành
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onSkipDuty(group.representative)}
                                                                              className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                                                        >
                                                                              <SkipForward className="h-4 w-4" />
                                                                              Chưa hoàn thành
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => onCancelDuty(group.representative)}
                                                                              className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                                                                        >
                                                                              <X className="h-4 w-4" />
                                                                              Hủy
                                                                        </button>
                                                                  </div>
                                                            )}
                                                      </div>

                                                      <div className="grid gap-2 md:grid-cols-[120px_120px_1fr_1.25fr]">
                                                            <InfoBox label="Ngày">{selectedDate}</InfoBox>
                                                            <InfoBox label="Khung giờ">{group.timeRange}</InfoBox>
                                                            <InfoBox label="Nơi làm">{group.place}</InfoBox>
                                                            <div className="min-w-0 rounded-xl border border-amber-100/70 bg-white/78 px-3 py-2">
                                                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                                        Phân công
                                                                  </p>
                                                                  {group.status === 'unassigned' ? (
                                                                        <p className="mt-1 text-sm font-semibold text-violet-700">
                                                                              Công tác hằng ngày chưa có người được phân công.
                                                                        </p>
                                                                  ) : (
                                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                                              {group.assignments.map((assignment: any) => (
                                                                                    <span
                                                                                          key={getAssigneeKey(assignment)}
                                                                                          className="rounded-full border border-amber-100 bg-white/86 px-2.5 py-1 text-xs font-semibold text-slate-700"
                                                                                    >
                                                                                          {getAssigneeTypeLabel(assignment.assignedToType)}: {getAssigneeName(assignment)}
                                                                                    </span>
                                                                              ))}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      {expanded && (
                                                            <div className="rounded-2xl border border-amber-100 bg-white/90 p-4">
                                                                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                                        <InfoBox label="Ngày">{group.date}</InfoBox>
                                                                        <InfoBox label="Khung giờ">{group.timeRange}</InfoBox>
                                                                        <InfoBox label="Nơi làm">{group.place}</InfoBox>
                                                                        <InfoBox label="Trạng thái">
                                                                              {getGroupStatusLabel(group.status)}
                                                                        </InfoBox>
                                                                  </div>

                                                                  {group.representative?.notes && (
                                                                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                                                    Ghi chú
                                                                              </p>
                                                                              <p className="mt-1 text-sm leading-6 text-slate-700">
                                                                                    {group.representative.notes}
                                                                              </p>
                                                                        </div>
                                                                  )}
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
