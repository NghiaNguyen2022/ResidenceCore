'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      formatDateValue,
      getAssignmentDate,
} from '@/components/daily-routine/shared';

type DutyMonthViewProps = {
      selectedDate: string;
      assignments: any[];
      onSelectDate: (date: string) => void;
};

function getMonthCalendarDates(selectedDate: string) {
      const [year, month] = selectedDate.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      const start = new Date(firstDay);
      const firstDayOfWeek = start.getDay();
      const diffToMonday = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
      start.setDate(firstDay.getDate() + diffToMonday);

      const end = new Date(lastDay);
      const lastDayOfWeek = end.getDay();
      const diffToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
      end.setDate(lastDay.getDate() + diffToSunday);

      const dates: string[] = [];
      const cursor = new Date(start);

      while (cursor <= end) {
            dates.push(formatDateValue(cursor));
            cursor.setDate(cursor.getDate() + 1);
      }

      return dates;
}

function getDayNumber(dateText: string) {
      return Number(dateText.slice(8, 10));
}

function isSameMonth(dateText: string, selectedDate: string) {
      return dateText.slice(0, 7) === selectedDate.slice(0, 7);
}

function normalizeDutyStatus(status?: string | null) {
      return String(status || 'pending').toLowerCase();
}

function isOpenAssignment(assignment: any) {
      return !['completed', 'cancelled', 'skipped', 'absent'].includes(
            normalizeDutyStatus(assignment.status)
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

function formatTimeText(value?: string | Date | null) {
      if (!value) return '--:--';

      if (value instanceof Date) return value.toTimeString().slice(0, 5);

      const text = String(value);
      if (text.includes('T')) return text.slice(11, 16);

      return text.slice(0, 5);
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

function getGroupKey(assignment: any, date: string) {
      return [
            date,
            assignment.dutyConfigId || assignment.dutyConfig?.id || getDutyName(assignment),
            getDutyName(assignment),
            getDutyTimeRange(assignment),
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

      return Array.from(map.entries()).map(([key, rows]) => ({
            id: key,
            name: getDutyName(rows[0]),
            timeRange: getDutyTimeRange(rows[0]),
            count: rows.length,
            openCount: rows.filter(isOpenAssignment).length,
            completedCount: rows.filter(
                  (assignment: any) => normalizeDutyStatus(assignment.status) === 'completed'
            ).length,
      }));
}

const weekLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export function DutyMonthView({
      selectedDate,
      assignments,
      onSelectDate,
}: DutyMonthViewProps) {
      const calendarDates = getMonthCalendarDates(selectedDate);
      const hasAssignments = assignments.length > 0;

      return (
            <SectionCard>
                  <div className="grid grid-cols-7 gap-2">
                        {weekLabels.map((label) => (
                              <div
                                    key={label}
                                    className="px-2 py-1 text-center text-xs font-bold uppercase tracking-wide text-slate-400"
                              >
                                    {label}
                              </div>
                        ))}

                        {calendarDates.map((date) => {
                              const dayAssignments = assignments.filter(
                                    (assignment: any) => getAssignmentDate(assignment) === date
                              );
                              const dutyGroups = buildDutyGroups(dayAssignments, date);
                              const openCount = dutyGroups.reduce(
                                    (total, group) => total + group.openCount,
                                    0
                              );
                              const completedCount = dutyGroups.reduce(
                                    (total, group) => total + group.completedCount,
                                    0
                              );
                              const isCurrentMonth = isSameMonth(date, selectedDate);
                              const isSelected = date === selectedDate;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'min-h-[112px] rounded-[22px] border p-2.5 text-left transition hover:-translate-y-0.5',
                                                isSelected
                                                      ? 'border-amber-200 bg-amber-50/75 shadow-sm shadow-slate-900/5'
                                                      : isCurrentMonth
                                                            ? 'border-amber-100/70 bg-white/78 hover:bg-amber-50/40'
                                                            : 'border-slate-100 bg-slate-50/70 text-slate-400',
                                          ].join(' ')}
                                    >
                                          <div className="flex items-start justify-between gap-2">
                                                <span
                                                      className={[
                                                            'flex h-7 w-7 items-center justify-center rounded-xl text-sm font-bold',
                                                            isSelected
                                                                  ? 'bg-amber-100 text-amber-900'
                                                                  : 'bg-white/80 text-slate-700',
                                                      ].join(' ')}
                                                >
                                                      {getDayNumber(date)}
                                                </span>

                                                {dutyGroups.length > 0 && (
                                                      <Badge className="border-amber-100 bg-white/82 text-amber-800">
                                                            {dutyGroups.length}
                                                      </Badge>
                                                )}
                                          </div>

                                          {dutyGroups.length > 0 && (
                                                <div className="mt-2 space-y-1.5">
                                                      {openCount > 0 && (
                                                            <p className="truncate rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                                                  {openCount} mở
                                                            </p>
                                                      )}
                                                      {completedCount > 0 && (
                                                            <p className="truncate rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                                                  {completedCount} xong
                                                            </p>
                                                      )}
                                                      {dutyGroups.slice(0, 2).map((group) => (
                                                            <p
                                                                  key={group.id}
                                                                  className="truncate rounded-lg bg-white/82 px-2 py-1 text-[11px] font-semibold text-slate-600"
                                                            >
                                                                  {group.name} · {group.count}
                                                            </p>
                                                      ))}
                                                </div>
                                          )}
                                    </button>
                              );
                        })}
                  </div>

                  {!hasAssignments && (
                        <div className="mt-4">
                              <EmptyState
                                    title="Chưa có công tác trong tháng"
                                    description="Khi có phân công, lịch tháng sẽ gom theo công tác trong từng ngày."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyMonthView;
