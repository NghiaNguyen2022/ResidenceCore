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
                        'rounded-[26px] border border-amber-100/80 bg-white/90 p-5 shadow-[0_16px_36px_rgba(120,53,15,0.06)]',
                        className,
                  ].join(' ')}
            >
                  {(title || description || action) && (
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                    {title && (
                                          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                                {title}
                                          </h3>
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
