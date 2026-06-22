'use client';

import { formatTime } from './dailyRoutineUtils';

type TimeBoxProps = {
      startTime?: string | Date | null;
      endTime?: string | Date | null;
      className?: string;
};

export function TimeBox({ startTime, endTime, className = '' }: TimeBoxProps) {
      return (
            <div
                  className={[
                        'min-w-[88px] rounded-xl border border-amber-100/80 bg-white/88 px-3 py-2 text-center shadow-[0_4px_12px_rgba(120,53,15,0.03)]',
                        className,
                  ].join(' ')}
            >
                  <p className="text-sm font-bold text-slate-800">
                        {formatTime(startTime)}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-700">đến</p>
                  <p className="text-sm font-bold text-slate-800">
                        {formatTime(endTime)}
                  </p>
            </div>
      );
}

export default TimeBox;
