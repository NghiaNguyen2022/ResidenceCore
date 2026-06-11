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
                        'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm',
                        className,
                  ].join(' ')}
            >
                  {(title || description || action) && (
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                    {title && (
                                          <h2 className="text-xl font-bold text-slate-950">
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
