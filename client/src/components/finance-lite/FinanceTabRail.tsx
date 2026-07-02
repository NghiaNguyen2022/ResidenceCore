import type { FinanceTab } from "./financeLiteTypes";

const mainFinanceTabs: Array<[FinanceTab, string, string]> = [
  ["studentLedger", "Thu học viên", "Tạo khoản phải thu, thu theo học viên"],
  ["expenses", "Thu chi khác", "Thu khác, chi một lần, tạm ứng"],
  ["plans", "Theo dõi", "Dự chi, nhắc việc, sổ dòng tiền"],
];

const secondaryFinanceTabs: Array<[FinanceTab, string]> = [["cashbook", "Sổ dòng tiền"]];

export function FinanceTabRail({
  activeTab,
  onTabChange,
}: {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
}) {
  return (
    <div className="rounded-[28px] border border-[#ead9ad]/80 bg-white/74 p-2 shadow-[0_16px_34px_rgba(91,67,22,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="grid gap-2 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="grid gap-2 md:grid-cols-3">
          {mainFinanceTabs.map(([key, label, description]) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`rounded-[22px] border px-4 py-3 text-left transition ${
                activeTab === key
                  ? "border-[#d7a63b] bg-[linear-gradient(135deg,#fff7df_0%,#f3d175_100%)] text-[#4a2b00] shadow-[0_10px_22px_rgba(180,122,20,0.18)]"
                  : "border-transparent bg-transparent text-slate-500 hover:border-[#ead9ad] hover:bg-[#fffaf0] hover:text-slate-700"
              }`}
            >
              <span className="block text-sm font-bold">{label}</span>
              <span className="mt-0.5 block text-xs opacity-75">{description}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 xl:justify-end">
          {secondaryFinanceTabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm font-semibold transition xl:w-auto ${
                activeTab === key
                  ? "border-slate-300 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#d7a63b] hover:text-[#7c4a03]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
