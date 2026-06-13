import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
      message?: string;
      onRetry?: () => void;
      className?: string;
}

export function ErrorState({
      message = "Đã xảy ra lỗi. Vui lòng thử lại.",
      onRetry,
      className,
}: ErrorStateProps) {
      return (
            <div className={cn("flex flex-col items-center justify-center gap-3 py-8 text-center", className)}>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="text-sm text-slate-600">{message}</p>
                  {onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry}>
                              Thử lại
                        </Button>
                  )}
            </div>
      );
}
