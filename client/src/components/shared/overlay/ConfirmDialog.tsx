import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmDialogVariant = "default" | "danger" | "warning";

interface ConfirmDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      title: React.ReactNode;
      description?: React.ReactNode;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: ConfirmDialogVariant;
      onConfirm: () => void | Promise<void>;
      loading?: boolean;
}

const confirmVariantClass: Record<ConfirmDialogVariant, string> = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      danger: "bg-red-600 text-white hover:bg-red-700",
      warning: "bg-amber-600 text-white hover:bg-amber-700",
};

export function ConfirmDialog({
      open,
      onOpenChange,
      title,
      description,
      confirmLabel = "Xác nhận",
      cancelLabel = "Hủy",
      variant = "default",
      onConfirm,
      loading = false,
}: ConfirmDialogProps) {
      const [pending, setPending] = React.useState(false);
      const isLoading = loading || pending;

      async function handleConfirm() {
            setPending(true);
            try {
                  await onConfirm();
            } finally {
                  setPending(false);
            }
      }

      return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                  <AlertDialogContent>
                        <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-900">{title}</AlertDialogTitle>
                              {description && (
                                    <AlertDialogDescription className="text-slate-500">
                                          {description}
                                    </AlertDialogDescription>
                              )}
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                              <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                              <AlertDialogAction
                                    onClick={(e) => {
                                          e.preventDefault();
                                          handleConfirm();
                                    }}
                                    disabled={isLoading}
                                    className={cn(confirmVariantClass[variant])}
                              >
                                    {isLoading ? "Đang xử lý..." : confirmLabel}
                              </AlertDialogAction>
                        </AlertDialogFooter>
                  </AlertDialogContent>
            </AlertDialog>
      );
}
