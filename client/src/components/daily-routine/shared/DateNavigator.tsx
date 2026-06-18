'use client';

import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
                              className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-amber-50/70"
                        >
                              Hôm nay
                        </button>
                  )}

                  <label className="flex items-center gap-2 rounded-xl border border-amber-100 bg-white/90 px-3 py-2 shadow-[0_8px_18px_rgba(120,53,15,0.045)]">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <DatePickerInput
                              value={value}
                              onChange={(event) => onChange(event.target.value)}
                              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                        />
                  </label>
            </div>
      );
}

export default DateNavigator;
