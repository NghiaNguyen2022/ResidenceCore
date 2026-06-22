'use client';

type EmptyStateProps = {
      title: string;
      description?: string;
      action?: React.ReactNode;
      className?: string;
};

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
      return (
            <div
                  className={[
                        'rounded-2xl border border-dashed border-amber-200/80 bg-white/70 p-5 text-center',
                        className,
                  ].join(' ')}
            >
                  <p className="font-semibold text-slate-800">{title}</p>

                  {description && (
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                              {description}
                        </p>
                  )}

                  {action && <div className="mt-4">{action}</div>}
            </div>
      );
}

export default EmptyState;
