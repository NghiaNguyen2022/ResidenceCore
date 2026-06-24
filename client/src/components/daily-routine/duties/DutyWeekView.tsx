'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      getAssignmentDate,
      getShortDateLabel,
      getWeekDateValues,
      getWeekdayLabel,
} from '@/components/daily-routine/shared';

type DutyWeekViewProps = {
      selectedDate: string;
      assignments: any[];
      onSelectDate: (date: string) => void;
};

function formatTimeText(value?: string | Date | null) {
      if (!value) return '--:--';

      if (value instanceof Date) return value.toTimeString().slice(0, 5);

      const text = String(value);
      if (text.includes('T')) return text.slice(11, 16);

      return text.slice(0, 5);
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

function normalizeDutyStatus(status?: string | null) {
      return String(status || 'pending').toLowerCase();
}

function isOpenAssignment(assignment: any) {
      return !['completed', 'cancelled', 'skipped', 'absent'].includes(
            normalizeDutyStatus(assignment.status)
      );
}

function getGroupKey(assignment: any, date: string) {
      return [
            date,
            assignment.dutyConfigId || assignment.dutyConfig?.id || getDutyName(assignment),
            getDutyName(assignment),
            getDutyTimeRange(assignment),
            getDutyPlace(assignment),
      ].join('|');
}

function buildDutyGroups(assignments: any[], date: string) {
      const map = new Map<string, any[]>();

      assignments.forEach((assignment) => {
            const key = getGroupKey(assignment, date);
            const current = map.get(key) || [];
            current.push(assignment);
            map.set(key, current);
      });

      return Array.from(map.entries())
            .map(([key, rows]) => {
                  const representative = rows[0];

                  return {
                        id: key,
                        name: getDutyName(representative),
                        timeRange: getDutyTimeRange(representative),
                        place: getDutyPlace(representative),
                        count: rows.length,
                        openCount: rows.filter(isOpenAssignment).length,
                        completedCount: rows.filter(
                              (assignment: any) =>
                                    normalizeDutyStatus(assignment.status) === 'completed'
                        ).length,
                  };
            })
            .sort((a, b) => a.timeRange.localeCompare(b.timeRange));
}

export function DutyWeekView({
      selectedDate,
      assignments,
      onSelectDate,
}: DutyWeekViewProps) {
      const weekDates = getWeekDateValues(selectedDate);

      return (
            <SectionCard>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        {weekDates.map((date) => {
                              const dayAssignments = assignments.filter(
                                    (assignment: any) => getAssignmentDate(assignment) === date
                              );
                              const dutyGroups = buildDutyGroups(dayAssignments, date);
                              const openDutyCount = dutyGroups.filter(
                                    (group) => group.openCount > 0
                              ).length;
                              const assignedPeopleCount = dutyGroups.reduce(
                                    (total, group) => total + group.count,
                                    0
                              );
                              const isSelected = date === selectedDate;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'min-h-[168px] rounded-[22px] border p-3 text-left transition hover:-translate-y-0.5',
                                                isSelected
                                                      ? 'border-amber-200 bg-amber-50/70 shadow-sm shadow-slate-900/5'
                                                      : 'border-amber-100/70 bg-white/78 hover:bg-amber-50/40',
                                          ].join(' ')}
                                    >
                                          <div className="flex items-start justify-between gap-2">
                                                <div>
                                                      <p className="font-bold text-slate-900">
                                                            {getWeekdayLabel(date)}
                                                      </p>
                                                      <p className="text-sm text-slate-500">
                                                            {getShortDateLabel(date)}
                                                      </p>
                                                </div>

                                                {dutyGroups.length > 0 && (
                                                      <Badge className="border-amber-100 bg-white/82 text-amber-800">
                                                            {dutyGroups.length} công tác
                                                      </Badge>
                                                )}
                                          </div>

                                          {dutyGroups.length === 0 ? (
                                                <p className="mt-4 text-sm text-slate-400">
                                                      Chưa có công tác
                                                </p>
                                          ) : (
                                                <div className="mt-3 space-y-2">
                                                      {openDutyCount > 0 && (
                                                            <Badge className="border-amber-100 bg-amber-50 text-amber-800">
                                                                  {openDutyCount} công tác mở
                                                            </Badge>
                                                      )}

                                                      {assignedPeopleCount > 0 && (
                                                            <Badge className="border-slate-100 bg-white/82 text-slate-600">
                                                                  {assignedPeopleCount} người
                                                            </Badge>
                                                      )}

                                                      {dutyGroups.map((group) => (
                                                            <div
                                                                  key={group.id}
                                                                  className="rounded-xl border border-amber-100/70 bg-white/84 px-2.5 py-2"
                                                            >
                                                                  <div className="flex items-center justify-between gap-2">
                                                                        <p className="truncate text-xs font-bold text-slate-800">
                                                                              {group.name}
                                                                        </p>
                                                                        <span className="shrink-0 text-[11px] font-semibold text-amber-700">
                                                                              {group.count} người
                                                                        </span>
                                                                  </div>
                                                                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                                        {group.timeRange} · {group.place}
                                                                  </p>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </button>
                              );
                        })}
                  </div>

                  {assignments.length === 0 && (
                        <div className="mt-4">
                              <EmptyState
                                    title="Chưa có công tác trong tuần"
                                    description="Khi có phân công, các công tác sẽ được gom theo từng ngày."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyWeekView;
