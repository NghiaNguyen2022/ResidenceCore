import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
      label?: React.ReactNode;
      required?: boolean;
      hint?: React.ReactNode;
      error?: React.ReactNode;
      children: React.ReactNode;
}

export function FormField({
      label,
      required = false,
      hint,
      error,
      children,
      className,
      ...props
}: FormFieldProps) {
      return (
            <div className={cn("space-y-1.5", className)} {...props}>
                  {label && (
                        <Label className="text-sm font-medium text-slate-700">
                              {label}
                              {required && <span className="ml-1 text-red-500">*</span>}
                        </Label>
                  )}

                  {children}

                  {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}

                  {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
      );
}