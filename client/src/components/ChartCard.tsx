import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  children,
  footer,
  className = "",
}: ChartCardProps) {
  return (
    <Card className={`card-elevated p-6 flex flex-col gap-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-heading-md">{title}</h3>
        {description && (
          <p className="text-body-md text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-1 min-h-80">{children}</div>
      {footer && <div className="border-t border-border pt-4">{footer}</div>}
    </Card>
  );
}
