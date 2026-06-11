'use client';

import { getDutyStatusClass, getDutyStatusLabel } from './dailyRoutineUtils';

type StatusBadgeProps = {
      children?: React.ReactNode;
      status?: string | null;
      className?: string;
};

export function Badge({ children, className = '' }: StatusBadgeProps) {
      return (
            <span
                  className={[
                        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                        className,
                  ].join(' ')}
            >
                  {children}
            </span>
      );
}

export function DutyStatusBadge({ status, className = '' }: StatusBadgeProps) {
      return (
            <Badge className={[getDutyStatusClass(status), className].join(' ')}>
                  {getDutyStatusLabel(status)}
            </Badge>
      );
}

export default Badge;
