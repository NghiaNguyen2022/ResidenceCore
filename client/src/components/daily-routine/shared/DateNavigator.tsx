'use client';

import { CalendarDays } from 'lucide-react';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
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
                              className="rounded-xl border border-amber-100 bg-white/90 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-[0_4px_12px_rgba(120,53,15,0.03)] transition hover:bg-amber-50"
                        >
                              Hôm nay
                        </button>
                  )}

                  <label className="flex items-center gap-2 rounded-xl border border-amber-100 bg-white/90 px-3 py-1.5 shadow-[0_4px_12px_rgba(120,53,15,0.03)]">
                        <CalendarDays className="h-4 w-4 text-amber-700" />
                        <DatePickerInput
                              value={value}
                              onChange={(event) => onChange(event.target.value)}
                              className="h-8 border-0 bg-transparent p-0 text-sm font-semibold text-slate-700 shadow-none focus-visible:ring-0"
                        />
                  </label>
            </div>
      );
}

export default DateNavigator;
