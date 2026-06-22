'use client';

type SectionCardProps = {
      title?: string;
      description?: string;
      action?: React.ReactNode;
      children: React.ReactNode;
      className?: string;
};

export function SectionCard({
      title,
      description,
      action,
      children,
      className = '',
}: SectionCardProps) {
      return (
            <section
                  className={[
                        'relative overflow-hidden rounded-2xl border border-amber-100/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,251,235,0.55)_100%)] p-4 shadow-[0_10px_26px_rgba(120,53,15,0.05)]',
                        className,
                  ].join(' ')}
            >
                  {(title || description || action) && (
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                    {title && (
                                          <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                                {title}
                                          </h2>
                                    )}
                                    {description && (
                                          <p className="mt-1 text-sm leading-6 text-slate-500">
                                                {description}
                                          </p>
                                    )}
                              </div>

                              {action && <div className="shrink-0">{action}</div>}
                        </div>
                  )}

                  {children}
            </section>
      );
}

export default SectionCard;
