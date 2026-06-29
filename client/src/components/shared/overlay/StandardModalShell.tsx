import type { ReactNode } from "react";
import { X } from "lucide-react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";

export function StandardModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={residenceMediumStyle.standardModalOverlay}>
      <div className={residenceMediumStyle.standardModalShell}>
        <div className={residenceMediumStyle.standardModalHeader}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
