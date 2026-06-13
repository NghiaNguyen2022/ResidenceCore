import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ActionButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ActionButtonSize = "default" | "sm" | "lg" | "icon";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: ActionButtonVariant;
      size?: ActionButtonSize;
      loading?: boolean;
      icon?: React.ReactNode;
      children?: React.ReactNode;
}

export function ActionButton({
      variant = "default",
      size = "default",
      loading = false,
      icon,
      children,
      disabled,
      className,
      ...props
}: ActionButtonProps) {
      return (
            <Button
                  variant={variant}
                  size={size}
                  disabled={disabled || loading}
                  className={cn(className)}
                  {...props}
            >
                  {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                  ) : icon ? (
                        <span className={cn(children ? "mr-2" : "")}>{icon}</span>
                  ) : null}
                  {children}
            </Button>
      );
}
