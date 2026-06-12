import * as React from "react";
import { cn } from "@/lib/utils";
import {
      Card,
      CardContent,
      CardDescription,
      CardFooter,
      CardHeader,
      CardTitle,
} from "@/components/ui/card";

type AppCardVariant = "default" | "soft" | "bordered" | "warning" | "danger" | "success";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
      title?: React.ReactNode;
      description?: React.ReactNode;
      action?: React.ReactNode;
      footer?: React.ReactNode;
      variant?: AppCardVariant;
      contentClassName?: string;
      headerClassName?: string;
      compact?: boolean;
}

const variantClassMap: Record<AppCardVariant, string> = {
      default: "bg-white border-slate-200",
      soft: "bg-slate-50 border-slate-200",
      bordered: "bg-white border-slate-300",
      warning: "bg-amber-50 border-amber-200",
      danger: "bg-red-50 border-red-200",
      success: "bg-emerald-50 border-emerald-200",
};

export function AppCard({
      title,
      description,
      action,
      footer,
      variant = "default",
      compact = false,
      className,
      contentClassName,
      headerClassName,
      children,
      ...props
}: AppCardProps) {
      const hasHeader = title || description || action;

      return (
            <Card
                  className={cn(
                        "shadow-sm transition-colors",
                        variantClassMap[variant],
                        className
                  )}
                  {...props}
            >
                  {hasHeader && (
                        <CardHeader
                              className={cn(
                                    compact ? "px-4 py-3" : "px-5 py-4",
                                    "flex flex-row items-start justify-between gap-3 space-y-0",
                                    headerClassName
                              )}
                        >
                              <div className="min-w-0 space-y-1">
                                    {title && (
                                          <CardTitle className="text-base font-semibold text-slate-900">
                                                {title}
                                          </CardTitle>
                                    )}
                                    {description && (
                                          <CardDescription className="text-sm text-slate-500">
                                                {description}
                                          </CardDescription>
                                    )}
                              </div>

                              {action && <div className="shrink-0">{action}</div>}
                        </CardHeader>
                  )}

                  <CardContent className={cn(compact ? "px-4 py-3" : "px-5 py-4", contentClassName)}>
                        {children}
                  </CardContent>

                  {footer && (
                        <CardFooter className={cn(compact ? "px-4 py-3" : "px-5 py-4")}>
                              {footer}
                        </CardFooter>
                  )}
            </Card>
      );
}