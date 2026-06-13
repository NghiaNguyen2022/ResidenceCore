import * as React from "react";
import { cn } from "@/lib/utils";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
      value: string;
      label: string;
      disabled?: boolean;
}

interface FormSelectProps {
      value?: string;
      onValueChange?: (value: string) => void;
      options: SelectOption[];
      placeholder?: string;
      disabled?: boolean;
      className?: string;
}

export function FormSelect({
      value,
      onValueChange,
      options,
      placeholder = "Chọn...",
      disabled,
      className,
}: FormSelectProps) {
      return (
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                  <SelectTrigger className={cn("w-full", className)}>
                        <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                        {options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                              </SelectItem>
                        ))}
                  </SelectContent>
            </Select>
      );
}
