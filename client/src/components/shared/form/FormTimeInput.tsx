import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FormTimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
      className?: string;
}

export const FormTimeInput = React.forwardRef<HTMLInputElement, FormTimeInputProps>(
      ({ className, ...props }, ref) => {
            return (
                  <Input
                        ref={ref}
                        type="time"
                        className={cn("w-full", className)}
                        {...props}
                  />
            );
      }
);

FormTimeInput.displayName = "FormTimeInput";
