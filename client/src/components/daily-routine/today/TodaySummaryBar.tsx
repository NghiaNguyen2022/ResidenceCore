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
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-xl font-bold text-slate-950">
                                    Hôm nay
                              </h2>
                              <p className="mt-1 text-sm text-slate-500">
                                    Xem nhanh lịch sinh hoạt và các công tác cần theo dõi trong ngày.
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
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    Thêm phân công
                              </button>
                        </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                              {routineCount} khung giờ sinh hoạt
                        </Badge>
                        <Badge className="border-orange-100 bg-orange-50 text-orange-700">
                              {assignments.length} công tác
                        </Badge>
                        <Badge className="border-green-100 bg-green-50 text-green-700">
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
