import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
      className?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
      ({ className, ...props }, ref) => {
            return (
                  <Textarea
                        ref={ref}
                        className={cn("resize-none", className)}
                        {...props}
                  />
            );
      }
);

FormTextarea.displayName = "FormTextarea";
