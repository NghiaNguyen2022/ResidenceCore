'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      formatDateOnly,
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
                  description="Tổng quan công tác theo tháng. Bấm vào một ngày để xem chi tiết ngày đó."
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

                              const currentMonth = isSameMonth(date, selectedDate);
                              const isSelected = date === selectedDate;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'min-h-[112px] rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                                                isSelected
                                                      ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-100'
                                                      : currentMonth
                                                            ? 'border-slate-200 bg-white'
                                                            : 'border-slate-100 bg-slate-50 opacity-60',
                                          ].join(' ')}
                                    >
                                          <div className="flex items-center justify-between gap-2">
                                                <span
                                                      className={[
                                                            'text-sm font-bold',
                                                            currentMonth
                                                                  ? 'text-slate-950'
                                                                  : 'text-slate-400',
                                                      ].join(' ')}
                                                >
                                                      {getDayNumber(date)}
                                                </span>

                                                {isSelected && (
                                                      <Badge className="border-blue-100 bg-white text-blue-700">
                                                            Đang xem
                                                      </Badge>
                                                )}
                                          </div>

                                          {dayAssignments.length > 0 ? (
                                                <div className="mt-3 space-y-1">
                                                      <p className="text-xs font-semibold text-slate-700">
                                                            {dayAssignments.length} công tác
                                                      </p>

                                                      <div className="flex flex-wrap gap-1">
                                                            {openCount > 0 && (
                                                                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                                                                        {openCount} chưa xong
                                                                  </span>
                                                            )}
                                                            {completedCount > 0 && (
                                                                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                                                        {completedCount} xong
                                                                  </span>
                                                            )}
                                                            {overdueCount > 0 && (
                                                                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                                                        {overdueCount} quá giờ
                                                                  </span>
                                                            )}
                                                      </div>

                                                      <div className="mt-2 space-y-1">
                                                            {dayAssignments.slice(0, 2).map((assignment: any) => (
                                                                  <p
                                                                        key={assignment.id}
                                                                        className="truncate rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-100"
                                                                  >
                                                                        {assignment.dutyName ||
                                                                              assignment.dutyConfig?.dutyName ||
                                                                              `Công tác #${assignment.id}`}
                                                                  </p>
                                                            ))}

                                                            {dayAssignments.length > 2 && (
                                                                  <p className="text-[11px] font-semibold text-slate-500">
                                                                        +{dayAssignments.length - 2} công tác khác
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>
                                          ) : (
                                                <p className="mt-3 text-xs text-slate-300">
                                                      Không có công tác
                                                </p>
                                          )}
                                    </button>
                              );
                        })}
                  </div>

                  {!hasAssignments && (
                        <div className="mt-4">
                              <EmptyState
                                    title="Tháng này chưa có công tác"
                                    description="Tạo phân công hoặc dùng gán nguyên tuần để hiển thị dữ liệu."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyMonthView;
