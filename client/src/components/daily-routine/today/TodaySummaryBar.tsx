'use client';

import { Plus } from 'lucide-react';
import {
      Badge,
      DateNavigator,
      getDutyVisualState,
} from '@/components/daily-routine/shared';

type TodaySummaryBarProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      routineCount: number;
      assignments: any[];
      onCreateDuty: () => void;
};

export function TodaySummaryBar({
      selectedDate,
      onDateChange,
      routineCount,
      assignments,
      onCreateDuty,
}: TodaySummaryBarProps) {
      const completedCount = assignments.filter(
            (assignment: any) => assignment.status === 'completed'
      ).length;

      const overdueCount = assignments.filter(
            (assignment: any) =>
                  getDutyVisualState(assignment, selectedDate) === 'overdue'
      ).length;

      return (
            <div className="rounded-xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff7ed_100%)] p-3 shadow-[0_10px_26px_rgba(120,53,15,0.055)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-xl font-bold text-slate-900">
                                    Hôm nay cần theo dõi
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Một nơi để xem lịch sinh hoạt và các công tác cần hoàn thành trong ngày.
                              </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                              <DateNavigator
                                    value={selectedDate}
                                    onChange={onDateChange}
                              />

                              <button
                                    type="button"
                                    onClick={onCreateDuty}
                                    className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-[0_4px_12px_rgba(120,53,15,0.035)] hover:bg-amber-200"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm công tác
                              </button>
                        </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <Badge className="border-amber-100 bg-amber-50 text-amber-700">
                              {routineCount} khung giờ sinh hoạt
                        </Badge>
                        <Badge className="border-amber-100 bg-white/88 text-slate-700">
                              {assignments.length} công tác
                        </Badge>
                        <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">
                              {completedCount} đã hoàn thành
                        </Badge>
                        <Badge className="border-rose-100 bg-rose-50 text-rose-700">
                              {overdueCount} quá giờ
                        </Badge>
                  </div>
            </div>
      );
}

export default TodaySummaryBar;
