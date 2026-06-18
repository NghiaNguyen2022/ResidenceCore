import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
      icon?: React.ReactNode;
      title?: React.ReactNode;
      description?: React.ReactNode;
      action?: React.ReactNode;
      compact?: boolean;
}

export function EmptyState({
      icon,
      title = "Chưa có dữ liệu",
      description,
      action,
      compact = false,
      className,
      ...props
}: EmptyStateProps) {
      return (
            <div
                  className={cn(
                        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center",
                        compact ? "px-4 py-5" : "px-6 py-8",
                        className
                  )}
                  {...props}
            >
                  {icon && <div className="mb-3 text-slate-400">{icon}</div>}

                  {title && (
                        <div className="text-sm font-medium text-slate-700">{title}</div>
                  )}

                  {description && (
                        <div className="mt-1 max-w-md text-sm text-slate-500">
                              {description}
                        </div>
                  )}

                  {action && <div className="mt-4">{action}</div>}
            </div>
      );
}
