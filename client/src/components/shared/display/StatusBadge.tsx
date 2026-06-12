import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusTone =
      | "default"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "muted"
      | "purple";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
      children: React.ReactNode;
      tone?: StatusTone;
}

const toneClassMap: Record<StatusTone, string> = {
      default: "bg-slate-100 text-slate-700 border-slate-200",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-sky-50 text-sky-700 border-sky-200",
      muted: "bg-slate-50 text-slate-500 border-slate-200",
      purple: "bg-violet-50 text-violet-700 border-violet-200",
};

export function StatusBadge({
      children,
      tone = "default",
      className,
      ...props
}: StatusBadgeProps) {
      return (
            <Badge
                  variant="outline"
                  className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        toneClassMap[tone],
                        className
                  )}
                  {...props}
            >
                  {children}
            </Badge>
      );
}