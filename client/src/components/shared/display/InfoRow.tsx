import * as React from "react";
import { cn } from "@/lib/utils";

interface InfoRowProps extends React.HTMLAttributes<HTMLDivElement> {
      label: React.ReactNode;
      value?: React.ReactNode;
      emptyText?: React.ReactNode;
      vertical?: boolean;
}

export function InfoRow({
      label,
      value,
      emptyText = "Chưa có thông tin",
      vertical = false,
      className,
      ...props
}: InfoRowProps) {
      return (
            <div
                  className={cn(
                        vertical ? "space-y-1" : "grid grid-cols-3 gap-3",
                        "text-sm",
                        className
                  )}
                  {...props}
            >
                  <div className="font-medium text-slate-500">{label}</div>
                  <div className={cn(vertical ? "" : "col-span-2", "text-slate-900")}>
                        {value || <span className="text-slate-400">{emptyText}</span>}
                  </div>
            </div>
      );
}