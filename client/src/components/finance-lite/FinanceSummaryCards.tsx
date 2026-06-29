import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type FinanceSummaryCard = {
  label: string;
  value: string;
  hint: string;
  subhint: string;
  icon: ComponentType<LucideProps>;
  iconTone: string;
  iconWrap: string;
};

export function FinanceSummaryCards({
  cards,
}: {
  cards: FinanceSummaryCard[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-[26px] border border-white/85 bg-gradient-to-br from-[#fff8e5] via-white/96 to-[#f2c76b]/80 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] ring-1 ring-amber-100/70"
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_36%),linear-gradient(135deg,rgba(245,158,11,0.08),transparent_46%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-4 text-[2rem] font-semibold leading-none tracking-tight text-slate-800">
                  {card.value}
                </p>
                <p className="mt-4 truncate text-sm font-medium text-slate-600">
                  {card.hint}
                </p>
                <p className="mt-1 text-xs text-slate-500/90">
                  {card.subhint}
                </p>
              </div>
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${card.iconWrap}`}
              >
                <Icon className={`h-6 w-6 ${card.iconTone}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
