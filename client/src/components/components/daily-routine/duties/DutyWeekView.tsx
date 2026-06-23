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

function isOpenAssignment(assignment: any) {
      return assignment.status !== 'completed' && assignment.status !== 'cancelled';
}

function getDutyName(assignment: any) {
      return assignment.dutyName || assignment.dutyConfig?.dutyName || `Công tác #${assignment.id}`;
}

export function DutyWeekView({
      selectedDate,
      assignments,
      onSelectDate,
}: DutyWeekViewProps) {
      const weekDates = getWeekDateValues(selectedDate);

      return (
            <SectionCard
                  title="Công tác theo tuần"
                  description="Xem nhanh từng ngày trong tuần. Ngày nào còn việc mở sẽ được đánh dấu rõ."
            >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        {weekDates.map((date) => {
                              const dayAssignments = assignments.filter(
                                    (assignment: any) => getAssignmentDate(assignment) === date
                              );

                              const completedCount = dayAssignments.filter(
                                    (assignment: any) => assignment.status === 'completed'
                              ).length;

                              const openCount = dayAssignments.filter(isOpenAssignment).length;
                              const isSelected = date === selectedDate;

                              return (
                                    <button
                                          key={date}
                                          type="button"
                                          onClick={() => onSelectDate(date)}
                                          className={[
                                                'min-h-[156px] rounded-2xl border p-3 text-left transition hover:-translate-y-0.5',
                                                isSelected
                                                      ? 'border-amber-200 bg-amber-50/70 shadow-[0_8px_18px_rgba(120,53,15,0.055)]'
                                                      : 'border-amber-100 bg-white/82 shadow-[0_4px_12px_rgba(120,53,15,0.035)] hover:bg-amber-50/40',
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

                                                {isSelected && (
                                                      <Badge className="border-amber-100 bg-white text-amber-800">
                                                            Đang xem
                                                      </Badge>
                                                )}
                                          </div>

                                          {dayAssignments.length === 0 ? (
                                                <p className="mt-4 text-sm text-slate-400">
                                                      Chưa có công tác
                                                </p>
                                          ) : (
                                                <div className="mt-3 space-y-2">
                                                      <div className="flex flex-wrap gap-1.5">
                                                            <Badge className="border-slate-100 bg-white text-slate-600">
                                                                  {dayAssignments.length} việc
                                                            </Badge>
                                                            {openCount > 0 && (
                                                                  <Badge className="border-amber-100 bg-amber-50 text-amber-800">
                                                                        {openCount} mở
                                                                  </Badge>
                                                            )}
                                                            {completedCount > 0 && (
                                                                  <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">
                                                                        {completedCount} xong
                                                                  </Badge>
                                                            )}
                                                      </div>

                                                      <div className="space-y-1.5">
                                                            {dayAssignments.slice(0, 3).map((assignment: any) => (
                                                                  <div
                                                                        key={assignment.id}
                                                                        className="truncate rounded-xl border border-amber-100/70 bg-white/82 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                                                                  >
                                                                        {getDutyName(assignment)}
                                                                  </div>
                                                            ))}

                                                            {dayAssignments.length > 3 && (
                                                                  <p className="text-xs font-semibold text-amber-700">
                                                                        +{dayAssignments.length - 3} việc khác
                                                                  </p>
                                                            )}
                                                      </div>
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
                                    description="Khi có phân công, các ngày trong tuần sẽ hiển thị tại đây."
                              />
                        </div>
                  )}
            </SectionCard>
      );
}

export default DutyWeekView;
