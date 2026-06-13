import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FormDateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
      className?: string;
}

export const FormDateInput = React.forwardRef<HTMLInputElement, FormDateInputProps>(
      ({ className, ...props }, ref) => {
            return (
                  <Input
                        ref={ref}
                        type="date"
                        className={cn("w-full", className)}
                        {...props}
                  />
            );
      }
);

FormDateInput.displayName = "FormDateInput";
