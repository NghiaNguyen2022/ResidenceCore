import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
      message?: string;
      className?: string;
      size?: "sm" | "md" | "lg";
}

const sizeMap = {
      sm: { icon: "h-4 w-4", text: "text-sm" },
      md: { icon: "h-6 w-6", text: "text-sm" },
      lg: { icon: "h-8 w-8", text: "text-base" },
};

export function LoadingState({
      message = "Đang tải...",
      className,
      size = "md",
}: LoadingStateProps) {
      const s = sizeMap[size];
      return (
            <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-slate-500", className)}>
                  <Loader2 className={cn("animate-spin text-slate-400", s.icon)} />
                  {message && <p className={cn(s.text)}>{message}</p>}
            </div>
      );
}
