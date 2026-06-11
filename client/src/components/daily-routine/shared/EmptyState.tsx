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
                        'rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center',
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
