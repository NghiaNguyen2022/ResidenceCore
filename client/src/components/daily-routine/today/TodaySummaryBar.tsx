'use client';

import { DateNavigator } from '@/components/daily-routine/shared';

type TodaySummaryBarProps = {
      selectedDate: string;
      onDateChange: (value: string) => void;
      routineCount: number;
      assignments?: any[];
      onCreateDuty?: () => void;
};

export function TodaySummaryBar({
      selectedDate,
      onDateChange,
      routineCount,
}: TodaySummaryBarProps) {
      return (
            <div className="flex flex-col gap-3 rounded-[22px] border border-amber-100/70 bg-white/72 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                        <p className="text-sm font-semibold text-slate-900">
                              Lịch sinh hoạt hôm nay
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                              {routineCount} khung giờ sinh hoạt đang áp dụng.
                        </p>
                  </div>

                  <DateNavigator
                        value={selectedDate}
                        onChange={onDateChange}
                  />
            </div>
      );
}

export default TodaySummaryBar;
