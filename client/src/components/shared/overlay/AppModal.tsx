import * as React from "react";
import { cn } from "@/lib/utils";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@/components/ui/dialog";

type AppModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface AppModalProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      title?: React.ReactNode;
      description?: React.ReactNode;
      children: React.ReactNode;
      footer?: React.ReactNode;
      size?: AppModalSize;
      className?: string;
      contentClassName?: string;
}

const sizeClassMap: Record<AppModalSize, string> = {
      sm: "sm:max-w-md",
      md: "sm:max-w-lg",
      lg: "sm:max-w-2xl",
      xl: "sm:max-w-4xl",
      full: "sm:max-w-[96vw]",
};

export function AppModal({
      open,
      onOpenChange,
      title,
      description,
      children,
      footer,
      size = "md",
      className,
      contentClassName,
}: AppModalProps) {
      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className={cn(sizeClassMap[size], className)}>
                        {(title || description) && (
                              <DialogHeader>
                                    {title && (
                                          <DialogTitle className="text-lg font-semibold text-slate-900">
                                                {title}
                                          </DialogTitle>
                                    )}
                                    {description && (
                                          <DialogDescription className="text-sm text-slate-500">
                                                {description}
                                          </DialogDescription>
                                    )}
                              </DialogHeader>
                        )}

                        <div className={cn("py-2", contentClassName)}>{children}</div>

                        {footer && <DialogFooter>{footer}</DialogFooter>}
                  </DialogContent>
            </Dialog>
      );
}