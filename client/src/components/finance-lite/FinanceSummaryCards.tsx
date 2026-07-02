import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";

export type FinanceSummaryCard = {
  label: string;
  value: string;
  hint: string;
  subhint: string;
  icon: ComponentType<LucideProps>;
  iconTone: string;
  iconWrap: string;
};

export function FinanceSummaryCards({ cards }: { cards: FinanceSummaryCard[] }) {
  return (
    <div className="mt-12 grid gap-3 md:grid-cols-3">
      {cards.slice(0, 3).map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`${residenceMediumStyle.orgPersonCard} min-h-[132px] p-4`}
          >
            <span className={residenceMediumStyle.orgPersonCardGlow} />
            <span className={residenceMediumStyle.orgPersonCardGlass} />
            <span className={residenceMediumStyle.orgPersonCardGoldBeam} />
            <span className={residenceMediumStyle.orgPersonCardGloss} />
            <span className={residenceMediumStyle.orgPersonCardGlossThin} />
            <span className={residenceMediumStyle.orgPersonCardShine} />

            <div className="relative flex h-full items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-950">
                  {card.value}
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-slate-700">
                  {card.hint}
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-2.5 text-amber-800 shadow-[0_10px_24px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.80)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
