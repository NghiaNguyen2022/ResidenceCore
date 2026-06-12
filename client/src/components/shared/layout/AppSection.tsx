import * as React from "react";
import { cn } from "@/lib/utils";
import { AppCard } from "./AppCard";

interface AppSectionProps extends React.HTMLAttributes<HTMLDivElement> {
      title?: React.ReactNode;
      description?: React.ReactNode;
      action?: React.ReactNode;
      children: React.ReactNode;
      compact?: boolean;
      noCard?: boolean;
      contentClassName?: string;
}

export function AppSection({
      title,
      description,
      action,
      children,
      compact = false,
      noCard = false,
      className,
      contentClassName,
      ...props
}: AppSectionProps) {
      if (noCard) {
            return (
                  <section className={cn("space-y-3", className)} {...props}>
                        {(title || description || action) && (
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          {title && (
                                                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                                          )}
                                          {description && (
                                                <p className="mt-1 text-sm text-slate-500">{description}</p>
                                          )}
                                    </div>
                                    {action && <div className="shrink-0">{action}</div>}
                              </div>
                        )}

                        <div className={contentClassName}>{children}</div>
                  </section>
            );
      }

      return (
            <AppCard
                  title={title}
                  description={description}
                  action={action}
                  compact={compact}
                  className={className}
                  contentClassName={contentClassName}
                  {...props}
            >
                  {children}
            </AppCard>
      );
}