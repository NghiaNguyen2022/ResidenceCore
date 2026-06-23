'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      formatDateValue,
      getAssignmentDate,
      getDutyVisualState,
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

function getMonthTitle(selectedDate: string) {
      const [year, month] = selectedDate.split('-');

      return `Công tác tháng ${month}/${year}`;
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
            <SectionCard
                  title={getMonthTitle(selectedDate)}
                  description="Xem tháng dạng lịch. Ngày có việc sẽ hiện số lượng và trạng thái nổi bật."
            >
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

                              const completedCount = dayAssignments.filter(
                                    (assignment: any) => assignment.status === 'completed'
                              ).length;

                              const overdueCount = dayAssignments.filter(
                                    (assignment: any) =>
                                          getDutyVisualState(assignment, date) === 'overdue'
                              ).length;

                              const openCount = dayAssignments.filter(
                                    (assignment: any) =>
                                          assignment.status !== 'completed' &&
                                          assignment.status !== 'cancelled'
                              ).length;

                              const isCurrentMonth = isSameMonth(date, selectedDate);
                              const isSelected = date === selectedDate;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'min-h-[104px] rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5',
                                                isSelected
                                                      ? 'border-amber-200 bg-amber-50/75 shadow-[0_8px_18px_rgba(120,53,15,0.055)]'
                                                      : isCurrentMonth
                                                            ? 'border-amber-100 bg-white/82 shadow-[0_4px_12px_rgba(120,53,15,0.03)] hover:bg-amber-50/45'
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

                                                {dayAssignments.length > 0 && (
                                                      <Badge className="border-amber-100 bg-white text-amber-800">
                                                            {dayAssignments.length}
                                                      </Badge>
                                                )}
                                          </div>

                                          {dayAssignments.length > 0 && (
                                                <div className="mt-2 space-y-1.5">
                                                      {openCount > 0 && (
                                                            <p className="truncate rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                                                                  {openCount} chưa xong
                                                            </p>
                                                      )}
                                                      {completedCount > 0 && (
                                                            <p className="truncate rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                                                  {completedCount} hoàn thành
                                                            </p>
                                                      )}
                                                      {overdueCount > 0 && (
                                                            <p className="truncate rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                                                                  {overdueCount} quá giờ
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
                                    description="Khi có phân công, lịch tháng sẽ hiển thị ngày có công tác."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyMonthView;
