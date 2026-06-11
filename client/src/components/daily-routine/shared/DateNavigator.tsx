'use client';

import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { todayValue } from './dailyRoutineUtils';

type DateNavigatorProps = {
      value: string;
      onChange: (value: string) => void;
      showTodayButton?: boolean;
      className?: string;
};

export function DateNavigator({
      value,
      onChange,
      showTodayButton = true,
      className = '',
}: DateNavigatorProps) {
      return (
            <div className={['flex flex-wrap items-center gap-2', className].join(' ')}>
                  {showTodayButton && (
                        <button
                              type="button"
                              onClick={() => onChange(todayValue())}
                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                              Hôm nay
                        </button>
                  )}

                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <Input
                              type="date"
                              value={value}
                              onChange={(event) => onChange(event.target.value)}
                              className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
                        />
                  </label>
            </div>
      );
}

export default DateNavigator;
