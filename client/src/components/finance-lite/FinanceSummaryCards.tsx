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

const toneClassMap = [
  "bg-[linear-gradient(135deg,#fffdfa_0%,#fff7e7_24%,#f6df9c_62%,#efc15c_100%)]",
  "bg-[linear-gradient(135deg,#fffefb_0%,#fff9ec_22%,#f6e0a1_58%,#edc169_100%)]",
  "bg-[linear-gradient(135deg,#fffdfa_0%,#fff6e2_20%,#f5dc96_58%,#ebb853_100%)]",
] as const;

export function FinanceSummaryCards({ cards }: { cards: FinanceSummaryCard[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const tone = toneClassMap[index] || toneClassMap[0];
        return (
          <article
            key={card.label}
            className={`relative min-h-[216px] overflow-hidden rounded-[30px] border border-[#ead8aa]/90 ${tone} px-6 py-6 shadow-[0_18px_40px_rgba(121,89,26,0.10),inset_0_1px_0_rgba(255,255,255,0.96)]`}
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_33%),linear-gradient(125deg,transparent_34%,rgba(255,255,255,0.40)_48%,transparent_62%),radial-gradient(circle_at_bottom_right,rgba(215,157,44,0.14),transparent_34%)]" />
            <div className="relative flex h-full flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-slate-600">
                    {card.label}
                  </p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/85 bg-white/92 text-[#b25f06] shadow-[0_10px_24px_rgba(83,63,23,0.14)]">
                  <Icon className="h-7 w-7" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[2.85rem] font-extrabold leading-none tracking-[-0.04em] text-[#233a59] md:text-[3.1rem]">
                  {card.value}
                </p>
                <p className="mt-8 line-clamp-1 text-[1.05rem] font-bold text-slate-700 md:text-[1.12rem]">
                  {card.hint}
                </p>
                <p className="mt-2 max-w-[28rem] text-[15px] leading-7 text-slate-600">
                  {card.subhint}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
