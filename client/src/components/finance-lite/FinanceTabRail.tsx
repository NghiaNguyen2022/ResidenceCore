import type { FinanceTab } from "./financeLiteTypes";

const financeTabs: Array<[FinanceTab, string]> = [
  ["studentLedger", "Thu học viên"],
  ["expenses", "Thu chi khác"],
  ["plans", "Theo dõi"],
  ["cashbook", "Sổ dòng tiền"],
];

export function FinanceTabRail({
  activeTab,
  onTabChange,
}: {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
}) {
  return (
    <div className="rounded-[26px] border border-amber-100/80 bg-white/70 p-2 shadow-[0_14px_34px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.76)]">
      <div className="flex flex-wrap gap-2">
        {financeTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={[
              "rounded-2xl border px-4 py-2.5 text-sm font-bold transition",
              activeTab === key
                ? key === "cashbook"
                  ? "border-slate-900 bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]"
                  : "border-amber-200/90 bg-[linear-gradient(135deg,#111827_0%,#92400e_62%,#f59e0b_145%)] text-white shadow-[0_14px_30px_rgba(146,64,14,0.20)]"
                : "border-amber-100/80 bg-white/76 text-slate-700 hover:border-amber-200 hover:bg-amber-50/70",
            ].join(" ")}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
