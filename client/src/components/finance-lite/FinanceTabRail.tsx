import { residenceMediumStyle } from "@/components/shared/styleMedium";
import type { FinanceTab } from "./financeLiteTypes";

const financeTabs: Array<[FinanceTab, string]> = [
  ["studentLedger", "Kỳ thu học viên"],
  ["expenses", "Thu chi khác"],
  ["plans", "Khoản đề xuất"],
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
    <div className={residenceMediumStyle.standardTabRail}>
      <div className={residenceMediumStyle.standardTabGrid}>
        {financeTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`${residenceMediumStyle.standardTabButton} ${
              activeTab === key
                ? residenceMediumStyle.standardTabButtonActive
                : residenceMediumStyle.standardTabButtonIdle
            }`}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
