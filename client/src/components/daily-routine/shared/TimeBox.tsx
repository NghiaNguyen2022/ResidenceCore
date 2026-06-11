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
                        'min-w-[98px] rounded-2xl bg-white px-3 py-2 text-center ring-1 ring-slate-200',
                        className,
                  ].join(' ')}
            >
                  <p className="text-sm font-bold text-slate-950">
                        {formatTime(startTime)}
                  </p>
                  <p className="text-xs text-slate-400">đến</p>
                  <p className="text-sm font-bold text-slate-950">
                        {formatTime(endTime)}
                  </p>
            </div>
      );
}

export default TimeBox;
