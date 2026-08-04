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

function getLocalTodayText(date = new Date()) {
      return formatDateValue(date);
}

function extractWallTimeText(timeValue?: string | Date | null) {
      if (!timeValue) return '';

      if (timeValue instanceof Date) {
            // getUTC*, không dùng getHours()/getMinutes(): xem ghi chú trong formatTime (lib/format.ts).
            return `${String(timeValue.getUTCHours()).padStart(2, '0')}:${String(
                  timeValue.getUTCMinutes()
            ).padStart(2, '0')}:${String(timeValue.getUTCSeconds()).padStart(2, '0')}`;
      }

      const text = String(timeValue).trim();
      const timePart = text.includes(' ')
            ? text.split(' ')[1]
            : text.includes('T')
                  ? text.split('T')[1]
                  : text;

      return timePart.length === 5 ? `${timePart}:00` : timePart.slice(0, 8);
}

function getTimeValue(dateText: string, timeValue?: string | Date | null) {
      if (!dateText || !timeValue) return null;

      const timeText = extractWallTimeText(timeValue);
      if (!timeText) return null;

      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(year, month - 1, day, hour, minute, second).getTime();
}

function isOverdueAssignment(assignment: any, dateText: string) {
      const status = normalizeDutyStatus(assignment.status);

      if (['completed', 'cancelled', 'skipped', 'absent'].includes(status)) {
            return false;
      }

      if (dateText !== getLocalTodayText()) return false;

      const endTime =
            assignment.dutyConfig?.endTime ||
            assignment.endTime ||
            assignment.endDateTime ||
            assignment.dutyConfig?.startTime ||
            assignment.startTime ||
            assignment.startDateTime;

      const value = getTimeValue(dateText, endTime);

      return Boolean(value && value < Date.now());
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

      if (value instanceof Date) {
            return `${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}`;
      }

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
            overdueCount: rows.filter((assignment: any) =>
                  isOverdueAssignment(assignment, getAssignmentDate(assignment))
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
                              const openDutyCount = dutyGroups.filter(
                                    (group) => group.openCount > 0
                              ).length;
                              const completedDutyCount = dutyGroups.filter(
                                    (group) => group.completedCount === group.count && group.count > 0
                              ).length;
                              const overdueDutyCount = dutyGroups.filter(
                                    (group) => (group.overdueCount || 0) > 0
                              ).length;
                              const assignedPeopleCount = dutyGroups.reduce(
                                    (total, group) => total + group.count,
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
                                                      {openDutyCount > 0 && (
                                                            <p className="truncate rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                                                  {openDutyCount} công tác mở
                                                            </p>
                                                      )}
                                                      {completedDutyCount > 0 && (
                                                            <p className="truncate rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                                                  {completedDutyCount} công tác xong
                                                            </p>
                                                      )}
                                                      {overdueDutyCount > 0 && (
                                                            <p className="truncate rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                                                                  {overdueDutyCount} công tác quá giờ
                                                            </p>
                                                      )}
                                                      {assignedPeopleCount > 0 && (
                                                            <p className="truncate rounded-lg bg-white/82 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                                                  {assignedPeopleCount} người
                                                            </p>
                                                      )}
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
