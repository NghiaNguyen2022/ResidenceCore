'use client';

import {
      Badge,
      EmptyState,
      SectionCard,
      formatDateOnly,
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

export function DutyWeekView({
      selectedDate,
      assignments,
      onSelectDate,
}: DutyWeekViewProps) {
      const weekDates = getWeekDateValues(selectedDate);

      return (
            <SectionCard
                  title="Công tác theo tuần"
                  description="Xem nhanh số công tác từng ngày trong tuần. Bấm vào một ngày để chuyển về view ngày."
            >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        {weekDates.map((date) => {
                              const dayAssignments = assignments.filter(
                                    (assignment: any) => getAssignmentDate(assignment) === date
                              );

                              const completedCount = dayAssignments.filter(
                                    (assignment: any) => assignment.status === 'completed'
                              ).length;

                              const openCount = dayAssignments.filter(
                                    (assignment: any) =>
                                          assignment.status !== 'completed' &&
                                          assignment.status !== 'cancelled'
                              ).length;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'rounded-xl border p-3 text-left shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition hover:-translate-y-0.5 hover:shadow-md',
                                                date === selectedDate
                                                      ? 'border-amber-100 bg-amber-50'
                                                      : 'border-amber-100 bg-white/88',
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

                                                {date === selectedDate && (
                                                      <Badge className="border-amber-100 bg-white text-amber-800">
                                                            Đang xem
                                                      </Badge>
                                                )}
                                          </div>

                                          <div className="mt-4 space-y-2 text-sm">
                                                <p className="font-semibold text-slate-800">
                                                      {dayAssignments.length} công tác
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                      {completedCount} hoàn thành · {openCount} cần xử lý
                                                </p>
                                          </div>

                                          {dayAssignments.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                      {dayAssignments.slice(0, 3).map((assignment: any) => (
                                                            <p
                                                                  key={assignment.id}
                                                                  className="truncate rounded-xl bg-white/80 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-100"
                                                            >
                                                                  {assignment.dutyName ||
                                                                        assignment.dutyConfig?.dutyName ||
                                                                        `Công tác #${assignment.id}`}
                                                            </p>
                                                      ))}

                                                      {dayAssignments.length > 3 && (
                                                            <p className="text-xs font-semibold text-slate-500">
                                                                  +{dayAssignments.length - 3} công tác khác
                                                            </p>
                                                      )}
                                                </div>
                                          )}
                                    </button>
                              );
                        })}
                  </div>

                  {assignments.length === 0 && (
                        <div className="mt-4">
                              <EmptyState
                                    title="Tuần này chưa có công tác"
                                    description="Tạo phân công hoặc dùng gán nguyên tuần để hiển thị dữ liệu."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyWeekView;
