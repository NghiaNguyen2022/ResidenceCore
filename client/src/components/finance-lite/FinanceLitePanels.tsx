import { useMemo, useState } from "react";
import {
      ArrowDownRight,
      ArrowUpRight,
      Building2,
      CreditCard,
      HandCoins,
      PiggyBank,
      ReceiptText,
      Printer,
      Search,
      Trash2,
      WalletCards,
      Wrench,
} from "lucide-react";

import { InlineBadge } from "@/components/shared/display/InlineBadge";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import {
      formatDate,
      formatMoney,
      getTransactionDirectionForSource,
      getTransactionSourceMeta,
      isAdvanceActualSpending,
      isTransactionAffectingCashFlow,
      toMoneyNumber,
} from "./financeLiteUtils";

export function FinancePeriodSelector({
      periods,
      selectedPeriodId,
      selectedPeriod,
      currentBillingMonth,
      getPeriodMonthsFromPeriod,
      onSelectPeriodMonth,
}: {
      periods: any[];
      selectedPeriodId: number | null;
      selectedPeriod: any;
      currentBillingMonth: string;
      getPeriodMonthsFromPeriod: (period: any) => Array<{ value: string; label: string }>;
      onSelectPeriodMonth: (period: any, billingMonth?: string) => void;
}) {
      if (!periods.length) return null;

      return (
            <section className="relative overflow-hidden rounded-[30px] border border-white/85 bg-gradient-to-r from-[#fff7e0] via-white/95 to-[#efd08a]/75 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-amber-100/70 md:p-5">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.88),transparent_33%),linear-gradient(120deg,rgba(245,158,11,0.08),transparent_45%)]" />
                  <div className="relative grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_290px] lg:items-center">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Kỳ thu đang xem
                              </p>
                        </div>
                        <select
                              value={selectedPeriodId || ""}
                              onChange={(event) => {
                                    const nextPeriod = periods.find(
                                          (period: any) => Number(period.id) === Number(event.target.value),
                                    );
                                    if (!nextPeriod) return;
                                    const months = getPeriodMonthsFromPeriod(nextPeriod);
                                    const defaultMonth =
                                          months.find((month: any) => month.value === currentBillingMonth)
                                                ?.value ||
                                          months[0]?.value ||
                                          "";
                                    onSelectPeriodMonth(nextPeriod, defaultMonth);
                              }}
                              className="w-full rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3 text-base font-semibold text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                        >
                              {periods.map((period: any) => (
                                    <option key={period.id} value={period.id}>
                                          {period.periodName} · Tháng{" "}
                                          {String(period.fromMonth).padStart(2, "0")}-
                                          {String(period.toMonth).padStart(2, "0")} / {period.year}
                                    </option>
                              ))}
                        </select>
                        <div className="inline-flex items-center justify-start rounded-2xl border border-amber-200/80 bg-white/82 px-5 py-3 text-base text-slate-600 shadow-sm lg:justify-center">
                              <span className="font-semibold text-slate-900">
                                    {selectedPeriod?.chargeCount || 0} khoản
                              </span>
                              <span className="mx-2 text-slate-300">·</span>
                              <span>Còn lại {formatMoney(selectedPeriod?.openAmount || 0)}</span>
                        </div>
                  </div>
            </section>
      );
}

export function FinanceExpensesPanel({
      transactions = [],
      selectedPeriod,
      selectedPeriodMonths = [],
      selectedBillingMonth,
      onCreateExpense,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions?: any[];
      selectedPeriod?: any;
      selectedPeriodMonths?: Array<{ value: string; label?: string }>;
      selectedBillingMonth?: string;
      onCreateExpense: (source?: string) => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const visibleTransactions = useMemo(
            () => filterTransactionsByViewingPeriod(transactions, selectedPeriodMonths),
            [transactions, selectedPeriodMonths],
      );
      const viewingLabel = getViewingPeriodLabel(selectedPeriod, selectedPeriodMonths, selectedBillingMonth);
      const actualExpenseTransactions = useMemo(
            () =>
                  visibleTransactions.filter(
                        (item: any) =>
                              isTransactionAffectingCashFlow(item.source) &&
                              getTransactionDirectionForSource(item.source, item.direction) === "out" &&
                              !isPlannedPeriodExpense(item),
                  ),
            [visibleTransactions],
      );
      const manualIncomeTransactions = useMemo(
            () =>
                  visibleTransactions.filter((item: any) => {
                        if (isStudentFeeTransaction(item)) return false;
                        if (!isTransactionAffectingCashFlow(item.source)) return false;
                        if (isPlannedPeriodExpense(item)) return false;
                        return getTransactionDirectionForSource(item.source, item.direction) === "in";
                  }),
            [visibleTransactions],
      );
      const advanceExpenses = useMemo(
            () => actualExpenseTransactions.filter((item: any) => isAdvanceExpense(item)),
            [actualExpenseTransactions],
      );
      const oneTimeExpenses = useMemo(
            () =>
                  actualExpenseTransactions.filter(
                        (item: any) => !isAdvanceExpense(item),
                  ),
            [actualExpenseTransactions],
      );
      const totalManualIncome = useMemo(
            () => manualIncomeTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [manualIncomeTransactions],
      );
      const totalOneTimeExpense = useMemo(
            () => oneTimeExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [oneTimeExpenses],
      );
      const totalAdvanceExpense = useMemo(
            () => advanceExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [advanceExpenses],
      );
      const totalAdvanceActualSpending = useMemo(
            () =>
                  visibleTransactions
                        .filter((item: any) => isAdvanceActualSpending(item.source))
                        .reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [visibleTransactions],
      );
      const recentManualOperations = useMemo(
            () =>
                  visibleTransactions
                        .filter(
                              (item: any) =>
                                    !isStudentFeeTransaction(item) &&
                                    !isAdvanceExpense(item) &&
                                    !isAdvanceActualSpending(item.source) &&
                                    isTransactionAffectingCashFlow(item.source) &&
                                    !isPlannedPeriodExpense(item),
                        )
                        .slice(0, 6),
            [visibleTransactions],
      );

      return (
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/70 bg-[linear-gradient(135deg,#fffdf8_0%,#ffffff_48%,#fff3cf_145%)] p-4 shadow-[0_18px_50px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.94)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,201,92,0.15),transparent_36%)]" />

                  <div className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Thu chi khác</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <h2 className="text-[25px] font-semibold tracking-tight text-[#101a2f]">Thu chi ngoài học viên</h2>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{viewingLabel}</InlineBadge>
                              </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                              <button type="button" className={cashbookActionClass("income")} onClick={() => onCreateExpense("other_income")}>
                                    <WalletCards className="mr-2 h-4 w-4" /> Thu vào
                              </button>
                              <button type="button" className={cashbookActionClass("expense")} onClick={() => onCreateExpense("expense_once")}>
                                    <CreditCard className="mr-2 h-4 w-4" /> Chi ra
                              </button>
                              <button type="button" className="inline-flex items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200" onClick={() => onCreateExpense("expense_advance")}>
                                    <HandCoins className="mr-2 h-4 w-4" /> Tạm ứng
                              </button>
                        </div>
                  </div>

                  <div className="relative mt-4 grid gap-3 md:grid-cols-3">
                        <ExpenseMetricCard label="Thu ngoài học viên" value={formatMoney(totalManualIncome)} tone="blue" />
                        <ExpenseMetricCard label="Chi một lần" value={formatMoney(totalOneTimeExpense)} tone="amber" />
                        <ExpenseMetricCard label="Tạm ứng còn giữ" value={formatMoney(Math.max(0, totalAdvanceExpense - totalAdvanceActualSpending))} tone="emerald" />
                  </div>

                  <div className="relative mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                          <p className="text-sm font-semibold text-slate-900">Tạm ứng đang theo dõi</p>
                                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Theo dõi tạm ứng</p>
                                    </div>
                                    <InlineBadge className="border-emerald-100 bg-emerald-50 text-emerald-700">{advanceExpenses.length} dòng</InlineBadge>
                              </div>
                              <div className="space-y-2">
                                    {advanceExpenses.length ? (
                                          advanceExpenses.slice(0, 5).map((transaction: any) => (
                                                <CashbookLine
                                                      key={transaction.id}
                                                      transaction={transaction}
                                                      compact
                                                      onDelete={onDeleteTransaction}
                                                      isDeleting={isDeletingTransaction}
                                                />
                                          ))
                                    ) : (
                                          <EmptyFinanceBox text="Chưa có tạm ứng." />
                                    )}
                              </div>
                        </div>

                        <div className="rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                          <p className="text-sm font-semibold text-slate-900">Thu chi gần đây</p>
                                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Dòng tiền ngoài học viên</p>
                                    </div>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{recentManualOperations.length} dòng</InlineBadge>
                              </div>
                              <div className="space-y-2">
                                    {recentManualOperations.length ? (
                                          recentManualOperations.map((transaction: any) => (
                                                <CashbookLine
                                                      key={transaction.id}
                                                      transaction={transaction}
                                                      compact
                                                      onDelete={onDeleteTransaction}
                                                      isDeleting={isDeletingTransaction}
                                                />
                                          ))
                                    ) : (
                                          <EmptyFinanceBox text="Chưa có thu chi khác." />
                                    )}
                              </div>
                        </div>
                  </div>
            </section>
      );
}

export function FinanceExpensePlansPanel({
      transactions = [],
      selectedPeriod,
      selectedPeriodMonths = [],
      selectedBillingMonth,
      onCreatePlan,
      onCreateActualExpense,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions?: any[];
      selectedPeriod?: any;
      selectedPeriodMonths?: Array<{ value: string; label?: string }>;
      selectedBillingMonth?: string;
      onCreatePlan: () => void;
      onCreateActualExpense: () => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const visibleTransactions = useMemo(
            () => filterTransactionsByViewingPeriod(transactions, selectedPeriodMonths),
            [transactions, selectedPeriodMonths],
      );
      const viewingLabel = getViewingPeriodLabel(selectedPeriod, selectedPeriodMonths, selectedBillingMonth);
      const plannedPeriodExpenses = useMemo(
            () => visibleTransactions.filter((item: any) => isPlannedPeriodExpense(item)),
            [visibleTransactions],
      );
      const totalPlanned = useMemo(
            () => plannedPeriodExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [plannedPeriodExpenses],
      );
      const upcomingPlans = useMemo(() => plannedPeriodExpenses.slice(0, 8), [plannedPeriodExpenses]);

      return (
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.10),transparent_35%),radial-gradient(circle_at_top_left,rgba(246,201,92,0.16),transparent_36%)]" />
                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Theo dõi</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl font-semibold tracking-tight text-[#101a2f]">Dự chi sắp tới</h2>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{viewingLabel}</InlineBadge>
                              </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={onCreatePlan} className={cashbookActionClass("expense")}>
                                    <ReceiptText className="mr-2 h-4 w-4" /> Tạo dự chi
                              </button>
                              <button type="button" onClick={onCreateActualExpense} className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200">
                                    <CreditCard className="mr-2 h-4 w-4" /> Ghi nhận chi thật
                              </button>
                        </div>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                        <ExpenseMetricCard label="Tổng dự chi" value={formatMoney(totalPlanned)} tone="blue" />
                        <ExpenseMetricCard label="Khoản đang theo dõi" value={`${plannedPeriodExpenses.length} khoản`} tone="slate" />
                        <ExpenseMetricCard label="Tác động tiền mặt" value="Chưa phát sinh" tone="emerald" />
                  </div>

                  <div className="relative mt-5 rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                    <p className="text-sm font-semibold text-slate-900">Danh sách khoản đề xuất</p>
                              </div>
                              <InlineBadge className="border-blue-100 bg-blue-50 text-blue-700">{upcomingPlans.length} dòng</InlineBadge>
                        </div>
                        <div className="space-y-2">
                              {upcomingPlans.length ? (
                                    upcomingPlans.map((transaction: any) => (
                                          <CashbookLine
                                                key={transaction.id}
                                                transaction={transaction}
                                                onDelete={onDeleteTransaction}
                                                isDeleting={isDeletingTransaction}
                                          />
                                    ))
                              ) : (
                                    <EmptyFinanceBox text="Chưa có khoản đề xuất." />
                              )}
                        </div>
                  </div>
            </section>
      );
}

export function FinanceCashbookPanel({
      transactions,
      charges = [],
      selectedPeriod,
      selectedPeriodMonths = [],
      selectedBillingMonth,
      onCreateTransaction,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions: any[];
      charges?: any[];
      selectedPeriod?: any;
      selectedPeriodMonths?: Array<{ value: string; label?: string }>;
      selectedBillingMonth?: string;
      onCreateTransaction: (source?: string) => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">("all");
      const [searchText, setSearchText] = useState("");
      const viewingLabel = getViewingPeriodLabel(selectedPeriod, selectedPeriodMonths, selectedBillingMonth);
      const visibleTransactions = useMemo(
            () => filterTransactionsByViewingPeriod(transactions, selectedPeriodMonths),
            [transactions, selectedPeriodMonths],
      );

      const normalizedTransactions = useMemo(
            () =>
                  visibleTransactions
                        .filter((transaction: any) => isTransactionAffectingCashFlow(transaction.source))
                        .filter((transaction: any) => !isPlannedPeriodExpense(transaction))
                        .map((transaction: any) => ({
                              ...transaction,
                              normalizedDirection: getTransactionDirectionForSource(transaction.source, transaction.direction),
                        })),
            [visibleTransactions],
      );

      const totalIn = useMemo(
            () =>
                  normalizedTransactions
                        .filter((item: any) => item.normalizedDirection === "in")
                        .reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [normalizedTransactions],
      );
      const totalOut = useMemo(
            () =>
                  normalizedTransactions
                        .filter((item: any) => item.normalizedDirection === "out")
                        .reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [normalizedTransactions],
      );
      const balance = totalIn - totalOut;

      const filteredTransactions = useMemo(() => {
            const keyword = searchText.trim().toLowerCase();
            return normalizedTransactions.filter((transaction: any) => {
                  if (directionFilter !== "all" && transaction.normalizedDirection !== directionFilter) return false;
                  if (!keyword) return true;
                  const meta = getTransactionSourceMeta(transaction.source);
                  return [
                        transaction.targetName,
                        transaction.description,
                        transaction.source,
                        meta.label,
                        transaction.transactionDate,
                  ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase()
                        .includes(keyword);
            });
      }, [directionFilter, normalizedTransactions, searchText]);

      const [expandedSummaryKey, setExpandedSummaryKey] = useState<string | null>(null);

      const cashbookRows = useMemo(() => groupCashbookTransactions(filteredTransactions), [filteredTransactions]);
      const periodSummary = useMemo(
            () => buildCashbookPeriodSummary({
                  charges,
                  transactions: visibleTransactions,
                  months: selectedPeriodMonths,
            }),
            [charges, visibleTransactions, selectedPeriodMonths],
      );

      return (
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,201,92,0.14),transparent_34%)]" />
                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Sổ dòng tiền</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl font-semibold tracking-tight text-[#101a2f]">Dòng tiền phát sinh</h2>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{viewingLabel}</InlineBadge>
                              </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                              <button type="button" className={cashbookActionClass("income")} onClick={() => onCreateTransaction("other_income")}>
                                    <WalletCards className="mr-2 h-4 w-4" /> Thu khác / tài trợ
                              </button>
                              <button type="button" className={cashbookActionClass("expense")} onClick={() => onCreateTransaction("expense")}>
                                    <CreditCard className="mr-2 h-4 w-4" /> Chi một lần
                              </button>
                        </div>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                        <CashbookMetricCard label="Thu vào" value={formatMoney(totalIn)} icon={ArrowUpRight} tone="emerald" />
                        <CashbookMetricCard label="Chi ra" value={formatMoney(totalOut)} icon={ArrowDownRight} tone="amber" />
                        <CashbookMetricCard label="Cân đối" value={`${balance >= 0 ? "+" : "-"}${formatMoney(Math.abs(balance))}`} icon={ReceiptText} tone={balance >= 0 ? "blue" : "rose"} />
                  </div>

                  <CashbookPeriodSummary
                        summary={periodSummary}
                        expandedKey={expandedSummaryKey}
                        onToggle={(key) => setExpandedSummaryKey((current) => (current === key ? null : key))}
                  />

                  <div className="relative mt-5 rounded-[26px] border border-[#ead9ad]/70 bg-white/86 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                              <label className="relative block">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                          value={searchText}
                                          onChange={(event) => setSearchText(event.target.value)}
                                          placeholder="Tìm theo đối tượng, nội dung, loại nghiệp vụ..."
                                          className="w-full rounded-2xl border border-slate-200/90 bg-white px-10 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                                    />
                              </label>
                              <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                    {[
                                          ["all", "Tất cả"],
                                          ["in", "Thu"],
                                          ["out", "Chi"],
                                    ].map(([value, label]) => (
                                          <button
                                                key={value}
                                                type="button"
                                                onClick={() => setDirectionFilter(value as "all" | "in" | "out")}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${directionFilter === value ? "bg-white text-[#7c4a03] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                          >
                                                {label}
                                          </button>
                                    ))}
                              </div>
                        </div>

                        <div className="space-y-2">
                              {cashbookRows.length ? (
                                    cashbookRows.map((transaction: any) => (
                                          <CashbookLine
                                                key={transaction.id}
                                                transaction={transaction}
                                                onDelete={onDeleteTransaction}
                                                isDeleting={isDeletingTransaction}
                                          />
                                    ))
                              ) : (
                                    <EmptyFinanceBox text="Chưa có nghiệp vụ phù hợp với bộ lọc hiện tại." />
                              )}
                        </div>
                  </div>
            </section>
      );
}



function CashbookPeriodSummary({
      summary,
      expandedKey,
      onToggle,
}: {
      summary: CashbookPeriodSummaryData;
      expandedKey: string | null;
      onToggle: (key: string) => void;
}) {
      const visibleMonths = summary.monthRows;
      const studentDetailOpen = expandedKey === "student-breakdown";
      const advanceDetailOpen = expandedKey === "advance-holders";
      const advanceRemaining = summary.advance.holders.reduce((sum, holder) => sum + holder.balance, 0);

      return (
            <div className="relative mt-5 rounded-[30px] border border-[#ead9ad]/70 bg-white/84 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Tổng hợp kỳ</p>
                              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Nhìn nhanh thu, chi và tạm ứng</h3>
                        </div>
                        <InlineBadge className="w-fit border-amber-100 bg-amber-50 text-amber-800">
                              {summary.monthRows.length} tháng
                        </InlineBadge>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
                        <section className="rounded-[24px] border border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#fffaf0_100%)] p-3">
                              <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Theo tháng</p>
                                    <p className="text-xs font-semibold text-slate-400">Thu / còn</p>
                              </div>
                              <div className="mt-3 max-h-[390px] space-y-2 overflow-y-auto pr-1">
                                    {visibleMonths.length ? (
                                          visibleMonths.map((month) => {
                                                const key = `month:${month.month}`;
                                                const expanded = expandedKey === key;
                                                return (
                                                      <div key={month.month} className="rounded-2xl border border-slate-100 bg-white/86 px-3 py-2">
                                                            <div className="grid gap-2 sm:grid-cols-[74px_1fr_auto_auto] sm:items-center">
                                                                  <p className="font-semibold text-slate-900">{formatMonthShort(month.month)}</p>
                                                                  <p className="text-xs text-slate-500">
                                                                        Thu {formatMoney(month.paidAmount)} / {formatMoney(month.receivableAmount)}
                                                                  </p>
                                                                  <p className={`text-right text-sm font-semibold ${month.remainingAmount > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                                                                        Còn {formatMoney(month.remainingAmount)}
                                                                  </p>
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => onToggle(key)}
                                                                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-200 hover:text-amber-700"
                                                                  >
                                                                        {expanded ? "Ẩn" : "Xem"}
                                                                  </button>
                                                            </div>
                                                            {expanded ? (
                                                                  <div className="mt-2 border-t border-slate-100 pt-2">
                                                                        {month.details.length ? (
                                                                              <div className="space-y-1.5">
                                                                                    {month.details.map((item) => (
                                                                                          <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2">
                                                                                                <div className="min-w-0">
                                                                                                      <p className="truncate text-xs font-semibold text-slate-700">{item.name}</p>
                                                                                                      <p className="text-[11px] text-slate-500">
                                                                                                            {item.count} khoản · đã thu {formatMoney(item.paid)}
                                                                                                      </p>
                                                                                                </div>
                                                                                                <p className={item.remaining > 0 ? "shrink-0 text-xs font-semibold text-rose-600" : "shrink-0 text-xs font-semibold text-emerald-700"}>
                                                                                                      Còn {formatMoney(item.remaining)}
                                                                                                </p>
                                                                                          </div>
                                                                                    ))}
                                                                              </div>
                                                                        ) : (
                                                                              <p className="text-xs text-slate-400">Chưa có khoản thu.</p>
                                                                        )}
                                                                  </div>
                                                            ) : null}
                                                      </div>
                                                );
                                          })
                                    ) : (
                                          <EmptyFinanceBox text="Chưa có dữ liệu tháng." />
                                    )}
                              </div>
                        </section>

                        <section className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 p-3">
                              <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Thu học viên</p>
                                    <InlineBadge className="border-emerald-100 bg-white text-emerald-700">{summary.studentTotal.count} khoản</InlineBadge>
                              </div>
                              <p className="mt-4 text-2xl font-semibold text-slate-950">{formatMoney(summary.studentTotal.amount)}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                    <SimpleSummaryRow label="Đã thu" value={summary.studentTotal.paid} tone="emerald" />
                                    <SimpleSummaryRow label="Còn lại" value={summary.studentTotal.remaining} tone={summary.studentTotal.remaining > 0 ? "rose" : "emerald"} />
                              </div>
                              <button
                                    type="button"
                                    onClick={() => onToggle("student-breakdown")}
                                    className="mt-3 w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5"
                              >
                                    {studentDetailOpen ? "Thu gọn chi tiết" : "Xem chi tiết khoản thu"}
                              </button>
                              {studentDetailOpen ? (
                                    <div className="mt-3 space-y-2">
                                          {summary.studentBreakdown.map((item) => (
                                                <div key={item.name} className="rounded-2xl border border-emerald-100/80 bg-white/86 px-3 py-2">
                                                      <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                  <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
                                                                  <p className="text-xs text-slate-500">{item.count} khoản · thu {formatMoney(item.paid)}</p>
                                                            </div>
                                                            <p className="shrink-0 text-sm font-semibold text-slate-900">{formatMoney(item.amount)}</p>
                                                      </div>
                                                </div>
                                          ))}
                                          {!summary.studentBreakdown.length ? <EmptyFinanceBox text="Chưa có khoản thu học viên." /> : null}
                                    </div>
                              ) : null}

                              <div className="mt-4 rounded-[22px] border border-blue-100 bg-blue-50/45 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Thu khác</p>
                                                <p className="mt-1 text-xs text-slate-500">{summary.otherIncome.count} dòng ngoài học viên</p>
                                          </div>
                                          <p className="text-lg font-semibold text-slate-950">{formatMoney(summary.otherIncome.amount)}</p>
                                    </div>
                                    <button
                                          type="button"
                                          onClick={() => onToggle("other-income-breakdown")}
                                          className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5"
                                    >
                                          {expandedKey === "other-income-breakdown" ? "Thu gọn thu khác" : "Xem chi tiết thu khác"}
                                    </button>
                                    {expandedKey === "other-income-breakdown" ? (
                                          <div className="mt-3 space-y-2">
                                                {summary.otherIncome.breakdown.map((item) => (
                                                      <div key={item.name} className="rounded-2xl border border-blue-100/80 bg-white/86 px-3 py-2">
                                                            <div className="flex items-center justify-between gap-3">
                                                                  <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-slate-700">{item.name}</p>
                                                                        <p className="text-xs text-slate-500">{item.count} dòng</p>
                                                                  </div>
                                                                  <p className="shrink-0 text-sm font-semibold text-slate-900">{formatMoney(item.amount)}</p>
                                                            </div>
                                                      </div>
                                                ))}
                                                {!summary.otherIncome.breakdown.length ? <EmptyFinanceBox text="Chưa có khoản thu khác." /> : null}
                                          </div>
                                    ) : null}
                              </div>
                        </section>

                        <section className="rounded-[24px] border border-amber-100 bg-amber-50/38 p-3">
                              <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Chi & tạm ứng</p>
                                    <InlineBadge className="border-amber-100 bg-white text-amber-800">{summary.expense.actualCount + summary.advance.count} dòng</InlineBadge>
                              </div>
                              <div className="mt-3 grid gap-2">
                                    <SimpleSummaryRow label="Chi thật" value={summary.expense.actualAmount} sub={`${summary.expense.actualCount} dòng`} tone="amber" />
                                    <SimpleSummaryRow label="Dự chi" value={summary.expense.plannedAmount} sub={`${summary.expense.plannedCount} dòng`} tone="blue" />
                                    <SimpleSummaryRow label="Tạm ứng còn giữ" value={advanceRemaining} sub={`${summary.advance.holders.length} đối tượng`} tone="emerald" />
                              </div>
                              <button
                                    type="button"
                                    onClick={() => onToggle("advance-holders")}
                                    className="mt-3 w-full rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-0.5"
                              >
                                    {advanceDetailOpen ? "Thu gọn tạm ứng" : "Xem đối tượng tạm ứng"}
                              </button>
                              {advanceDetailOpen ? (
                                    <div className="mt-3 space-y-2">
                                          {summary.advance.holders.map((holder) => (
                                                <div key={holder.name} className="rounded-2xl border border-slate-100 bg-white/86 px-3 py-2">
                                                      <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate text-sm font-semibold text-slate-700">{holder.name}</p>
                                                            <p className="text-sm font-semibold text-slate-900">{formatMoney(holder.balance)}</p>
                                                      </div>
                                                      <p className="mt-1 text-xs text-slate-500">
                                                            Giữ {formatMoney(holder.amount)} · đã chi {formatMoney(holder.spent)}
                                                      </p>
                                                </div>
                                          ))}
                                          {!summary.advance.holders.length ? <EmptyFinanceBox text="Chưa có tạm ứng." /> : null}
                                    </div>
                              ) : null}
                        </section>
                  </div>
            </div>
      );
}

function SimpleSummaryRow({
      label,
      value,
      sub,
      tone,
}: {
      label: string;
      value: number;
      sub?: string;
      tone: "amber" | "blue" | "emerald" | "rose";
}) {
      const toneClass =
            tone === "amber"
                  ? "border-amber-100 bg-white/82 text-amber-900"
                  : tone === "blue"
                        ? "border-blue-100 bg-blue-50/70 text-blue-900"
                        : tone === "rose"
                              ? "border-rose-100 bg-rose-50/70 text-rose-900"
                              : "border-emerald-100 bg-white/82 text-emerald-900";
      return (
            <div className={`rounded-2xl border px-3 py-2 ${toneClass}`}>
                  <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-sm font-semibold">{formatMoney(value)}</p>
                  </div>
                  {sub ? <p className="mt-0.5 text-xs opacity-70">{sub}</p> : null}
            </div>
      );
}



type CashbookPeriodSummaryData = {
      monthRows: Array<{
            month: string;
            receivableCount: number;
            receivableAmount: number;
            paidCount: number;
            paidAmount: number;
            remainingAmount: number;
            details: Array<{
                  name: string;
                  count: number;
                  amount: number;
                  paid: number;
                  remaining: number;
            }>;
      }>;
      studentTotal: {
            count: number;
            amount: number;
            paid: number;
            remaining: number;
      };
      studentBreakdown: Array<{
            name: string;
            count: number;
            amount: number;
            paid: number;
            remaining: number;
      }>;
      otherIncome: {
            count: number;
            amount: number;
            breakdown: Array<{
                  name: string;
                  count: number;
                  amount: number;
            }>;
      };
      expense: {
            actualCount: number;
            actualAmount: number;
            plannedCount: number;
            plannedAmount: number;
      };
      advance: {
            count: number;
            amount: number;
            spentCount: number;
            spentAmount: number;
            holders: Array<{
                  name: string;
                  count: number;
                  amount: number;
                  spent: number;
                  balance: number;
            }>;
      };
};

function buildCashbookPeriodSummary({
      charges = [],
      transactions = [],
      months = [],
}: {
      charges?: any[];
      transactions?: any[];
      months?: Array<{ value: string; label?: string }>;
}): CashbookPeriodSummaryData {
      const periodMonths = getPeriodMonthValues(months);
      const monthSet = new Set(periodMonths);
      const relevantCharges = (charges || []).filter((charge: any) => {
            const month = String(charge?.billingMonth || "").slice(0, 7);
            const inMonth = !monthSet.size || !month || monthSet.has(month);
            const isCancelled = String(charge?.status || "") === "cancelled";
            return inMonth && !isCancelled;
      });
      const relevantTransactions = filterTransactionsByViewingPeriod(transactions || [], months || []);
      const otherIncomeTransactions = relevantTransactions.filter(
            (transaction: any) =>
                  !isStudentFeeTransaction(transaction) &&
                  !isPlannedPeriodExpense(transaction) &&
                  !isAdvanceExpense(transaction) &&
                  !isAdvanceActualSpending(transaction.source) &&
                  isTransactionAffectingCashFlow(transaction.source) &&
                  getTransactionDirectionForSource(transaction.source, transaction.direction) === "in",
      );
      const otherIncomeBreakdownMap = new Map<string, { name: string; count: number; amount: number }>();
      otherIncomeTransactions.forEach((transaction: any) => {
            const meta = getTransactionSourceMeta(transaction.source);
            const name = meta.shortLabel || meta.label || "Thu khác";
            const current = otherIncomeBreakdownMap.get(name) || { name, count: 0, amount: 0 };
            current.count += 1;
            current.amount += toMoneyNumber(transaction?.amount || 0);
            otherIncomeBreakdownMap.set(name, current);
      });

      const monthMap = new Map<string, CashbookPeriodSummaryData["monthRows"][number]>();
      const monthBreakdownMap = new Map<string, Map<string, CashbookPeriodSummaryData["monthRows"][number]["details"][number]>>();
      const ensureMonth = (month: string) => {
            const normalized = /^\d{4}-\d{2}$/.test(month) ? month : "no-month";
            const current = monthMap.get(normalized) || {
                  month: normalized,
                  receivableCount: 0,
                  receivableAmount: 0,
                  paidCount: 0,
                  paidAmount: 0,
                  remainingAmount: 0,
                  details: [],
            };
            monthMap.set(normalized, current);
            return current;
      };

      periodMonths.forEach((month) => ensureMonth(month));
      const studentBreakdownMap = new Map<string, CashbookPeriodSummaryData["studentBreakdown"][number]>();
      let studentCount = 0;
      let studentAmount = 0;
      let studentPaid = 0;
      let studentRemaining = 0;

      relevantCharges.forEach((charge: any) => {
            const amount = toMoneyNumber(charge?.amount || 0);
            const paid = toMoneyNumber(charge?.paidAmount || 0);
            const remaining = toMoneyNumber(charge?.remainingAmount || Math.max(0, amount - paid));
            const month = String(charge?.billingMonth || charge?.transactionDate || "").slice(0, 7);
            const monthRow = ensureMonth(month);
            monthRow.receivableCount += 1;
            monthRow.receivableAmount += amount;
            monthRow.paidAmount += paid;
            monthRow.remainingAmount += remaining;
            if (paid > 0) monthRow.paidCount += 1;

            const name = getChargeDisplayName(charge);
            const monthKey = /^\d{4}-\d{2}$/.test(month) ? month : "no-month";
            const monthBreakdown = monthBreakdownMap.get(monthKey) || new Map<string, CashbookPeriodSummaryData["monthRows"][number]["details"][number]>();
            const monthDetail = monthBreakdown.get(name) || { name, count: 0, amount: 0, paid: 0, remaining: 0 };
            monthDetail.count += 1;
            monthDetail.amount += amount;
            monthDetail.paid += paid;
            monthDetail.remaining += remaining;
            monthBreakdown.set(name, monthDetail);
            monthBreakdownMap.set(monthKey, monthBreakdown);

            const current = studentBreakdownMap.get(name) || { name, count: 0, amount: 0, paid: 0, remaining: 0 };
            current.count += 1;
            current.amount += amount;
            current.paid += paid;
            current.remaining += remaining;
            studentBreakdownMap.set(name, current);

            studentCount += 1;
            studentAmount += amount;
            studentPaid += paid;
            studentRemaining += remaining;
      });

      const actualExpenseTransactions = relevantTransactions.filter(
            (transaction: any) =>
                  getTransactionDirectionForSource(transaction.source, transaction.direction) === "out" &&
                  isTransactionAffectingCashFlow(transaction.source) &&
                  !isPlannedPeriodExpense(transaction) &&
                  !isAdvanceExpense(transaction) &&
                  !isAdvanceActualSpending(transaction.source),
      );
      const plannedExpenseTransactions = relevantTransactions.filter((transaction: any) => isPlannedPeriodExpense(transaction));
      const advanceTransactions = relevantTransactions.filter((transaction: any) => isAdvanceExpense(transaction));
      const advanceActualTransactions = relevantTransactions.filter((transaction: any) => isAdvanceActualSpending(transaction.source));

      const holderMap = new Map<string, CashbookPeriodSummaryData["advance"]["holders"][number]>();
      advanceTransactions.forEach((transaction: any) => {
            const holderName = transaction?.targetName || "Đối tượng tạm ứng";
            const current = holderMap.get(holderName) || { name: holderName, count: 0, amount: 0, spent: 0, balance: 0 };
            current.count += 1;
            current.amount += toMoneyNumber(transaction?.amount || 0);
            holderMap.set(holderName, current);
      });
      advanceActualTransactions.forEach((transaction: any) => {
            const holderName = transaction?.targetName || extractAdvanceActualHolderName(transaction) || "Đối tượng tạm ứng";
            const current = holderMap.get(holderName) || { name: holderName, count: 0, amount: 0, spent: 0, balance: 0 };
            current.spent += toMoneyNumber(transaction?.amount || 0);
            holderMap.set(holderName, current);
      });
      const holders = Array.from(holderMap.values()).map((holder) => ({
            ...holder,
            balance: holder.amount - holder.spent,
      }));

      return {
            monthRows: Array.from(monthMap.values())
                  .map((row) => ({
                        ...row,
                        details: Array.from((monthBreakdownMap.get(row.month) || new Map()).values()).sort((a, b) => b.amount - a.amount),
                  }))
                  .filter((row) => row.month !== "no-month" || row.receivableAmount || row.paidAmount)
                  .sort((a, b) => a.month.localeCompare(b.month)),
            studentTotal: {
                  count: studentCount,
                  amount: studentAmount,
                  paid: studentPaid,
                  remaining: studentRemaining,
            },
            studentBreakdown: Array.from(studentBreakdownMap.values()).sort((a, b) => b.amount - a.amount),
            otherIncome: {
                  count: otherIncomeTransactions.length,
                  amount: otherIncomeTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount || 0), 0),
                  breakdown: Array.from(otherIncomeBreakdownMap.values()).sort((a, b) => b.amount - a.amount),
            },
            expense: {
                  actualCount: actualExpenseTransactions.length,
                  actualAmount: actualExpenseTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount || 0), 0),
                  plannedCount: plannedExpenseTransactions.length,
                  plannedAmount: plannedExpenseTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount || 0), 0),
            },
            advance: {
                  count: advanceTransactions.length,
                  amount: advanceTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount || 0), 0),
                  spentCount: advanceActualTransactions.length,
                  spentAmount: advanceActualTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount || 0), 0),
                  holders: holders.sort((a, b) => b.balance - a.balance),
            },
      };
}

function formatMonthShort(month: string) {
      if (!/^\d{4}-\d{2}$/.test(month)) return "Khác";
      return `T${month.slice(5, 7)}/${month.slice(0, 4)}`;
}

function getChargeDisplayName(charge: any) {
      return (
            charge?.periodItemName ||
            charge?.feeTypeName ||
            charge?.feeName ||
            charge?.title ||
            charge?.description ||
            "Khoản thu học viên"
      );
}

function extractAdvanceActualHolderName(transaction: any) {
      const description = String(transaction?.description || "");
      const match = description.match(/Đối tượng nhận:\s*([^·]+)/i);
      return match?.[1]?.trim() || "";
}


function getPeriodMonthValues(months?: Array<{ value: string; label?: string }>) {
      return (months || [])
            .map((month: any) => String(month?.value || "").slice(0, 7))
            .filter((value: string) => /^\d{4}-\d{2}$/.test(value));
}

function getViewingPeriodLabel(selectedPeriod?: any, months?: Array<{ value: string; label?: string }>, selectedBillingMonth?: string) {
      const monthValues = getPeriodMonthValues(months);
      if (selectedPeriod?.periodName && monthValues.length) {
            return `${selectedPeriod.periodName} · ${monthValues[0].slice(5, 7)}-${monthValues[monthValues.length - 1].slice(5, 7)}/${monthValues[0].slice(0, 4)}`;
      }
      if (selectedBillingMonth) return `Tháng ${String(selectedBillingMonth).slice(5, 7)}/${String(selectedBillingMonth).slice(0, 4)}`;
      return "Tất cả kỳ";
}

function filterTransactionsByViewingPeriod(transactions: any[], months?: Array<{ value: string; label?: string }>) {
      const periodMonths = new Set(getPeriodMonthValues(months));
      if (!periodMonths.size) return transactions || [];
      return (transactions || []).filter((transaction: any) => {
            const transactionMonths = extractTransactionMonths(transaction);
            if (!transactionMonths.length) return true;
            return transactionMonths.some((month) => periodMonths.has(month));
      });
}

function extractTransactionMonths(transaction: any) {
      const values = [
            transaction?.transactionDate,
            transaction?.createdAt,
            transaction?.billingMonth,
            transaction?.periodMonth,
            transaction?.targetType,
            transaction?.targetName,
            transaction?.description,
      ]
            .filter(Boolean)
            .map((value: any) => String(value));

      const months = new Set<string>();
      values.forEach((value) => {
            const directMonth = value.match(/\b(20\d{2})-(0[1-9]|1[0-2])\b/g) || [];
            directMonth.forEach((month) => months.add(month.slice(0, 7)));
      });
      return Array.from(months);
}

function isStudentFeeTransaction(transaction: any) {
      const source = String(transaction?.source || "");
      const targetType = String(transaction?.targetType || "");
      if (source === "student_fee_payment") return true;
      if (targetType === "student_fee_payment" || targetType === "student_fee" || targetType === "resident_fee") return true;
      return false;
}


function OperationQuickCard({
      icon: Icon,
      eyebrow,
      title,
      description,
      action,
      tone,
      onClick,
}: {
      icon: any;
      eyebrow: string;
      title: string;
      description: string;
      action: string;
      tone: "blue" | "emerald" | "amber";
      onClick: () => void;
}) {
      const toneClass =
            tone === "emerald"
                  ? "border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)] text-emerald-700"
                  : tone === "blue"
                        ? "border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] text-blue-700"
                        : "border-[#e6c675] bg-[linear-gradient(180deg,#fff7dc_0%,#ffffff_100%)] text-[#8a5305]";

      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={`group rounded-[28px] border p-4 text-left shadow-[0_14px_34px_rgba(91,67,22,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(91,67,22,0.12)] ${toneClass}`}
            >
                  <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="rounded-2xl bg-white/78 p-3 shadow-sm">
                              <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-current/10 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                              {eyebrow}
                        </span>
                  </div>
                  <p className="text-lg font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-600">{description}</p>
                  <p className="mt-4 text-sm font-semibold text-current group-hover:underline">{action}</p>
            </button>
      );
}

function ExpenseMetricCard({ label, value, tone }: { label: string; value: string; tone: "amber" | "slate" | "emerald" | "blue" }) {
      const toneClass =
            tone === "amber"
                  ? "border-[#e6c675] bg-[linear-gradient(135deg,#fffaf0_0%,#fff2c0_100%)] text-[#7c4a03]"
                  : tone === "emerald"
                        ? "border-emerald-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] text-emerald-700"
                        : tone === "blue"
                              ? "border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] text-blue-700"
                              : "border-slate-200 bg-white text-slate-700";
      return (
            <div className={`rounded-[24px] border px-4 py-3 shadow-[0_10px_26px_rgba(91,67,22,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] ${toneClass}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-65">{label}</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
            </div>
      );
}

function ExpenseCategoryCard({
      icon: Icon,
      title,
      description,
      action,
      onClick,
}: {
      icon: any;
      title: string;
      description: string;
      action: string;
      onClick: () => void;
}) {
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className="group rounded-[26px] border border-[#ead9ad]/70 bg-white/82 p-4 text-left shadow-[0_12px_30px_rgba(91,67,22,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5 hover:border-[#d6af55] hover:shadow-[0_18px_38px_rgba(91,67,22,0.12)]"
            >
                  <div className="mb-4 inline-flex rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-700">
                        <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-500">{description}</p>
                  <p className="mt-4 text-sm font-semibold text-[#8a5305] group-hover:text-[#5f3904]">{action}</p>
            </button>
      );
}

function CashbookMetricCard({
      label,
      value,
      icon: Icon,
      tone,
}: {
      label: string;
      value: string;
      icon: any;
      tone: "emerald" | "amber" | "blue" | "rose";
}) {
      const toneClass =
            tone === "emerald"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : tone === "amber"
                        ? "border-[#e6c675] bg-[#fff5d7] text-[#8a5305]"
                        : tone === "rose"
                              ? "border-rose-100 bg-rose-50 text-rose-700"
                              : "border-blue-100 bg-blue-50 text-blue-700";
      return (
            <div className={`rounded-[24px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${toneClass}`}>
                  <div className="flex items-center justify-between gap-3">
                        <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
                              <p className="mt-1 text-xl font-semibold">{value}</p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-2 shadow-sm">
                              <Icon className="h-5 w-5" />
                        </div>
                  </div>
            </div>
      );
}

function CashbookLine({
      transaction,
      compact = false,
      onDelete,
      isDeleting = false,
}: {
      transaction: any;
      compact?: boolean;
      onDelete?: (transaction: any) => void;
      isDeleting?: boolean;
}) {
      const [expanded, setExpanded] = useState(false);
      const direction = getTransactionDirectionForSource(transaction.source, transaction.direction);
      const isOut = direction === "out";
      const isMemo = isAdvanceActualSpending(transaction.source) || direction === "memo";
      const meta = getTransactionSourceMeta(transaction.source);
      const canDelete = Boolean(onDelete) && transaction.source !== "student_fee_payment";
      const amountClass = isMemo ? "text-slate-600" : isOut ? "text-[#9a5f08]" : "text-emerald-700";
      const shellClass = compact ? "px-3 py-2.5" : "px-4 py-3";
      const description = getCompactTransactionDescription(transaction);
      const details = getTransactionDetailRows(transaction);

      return (
            <div className={`rounded-[22px] border border-[#ead9ad]/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,251,235,0.82)_100%)] ${shellClass} shadow-[0_10px_26px_rgba(91,67,22,0.05),inset_0_1px_0_rgba(255,255,255,0.94)]`}>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="flex min-w-0 items-start gap-3">
                              <div
                                    className={`mt-0.5 shrink-0 rounded-2xl p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${
                                          isMemo
                                                ? "bg-slate-100 text-slate-600"
                                                : isOut
                                                      ? "bg-[#fff2c6] text-[#9a5f08]"
                                                      : "bg-emerald-50 text-emerald-700"
                                    }`}
                              >
                                    {isMemo ? <ReceiptText className="h-4 w-4" /> : isOut ? <CreditCard className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <p className="truncate text-[15px] font-semibold text-slate-900">
                                                {transaction.targetName || transaction.description || "Nghiệp vụ thu chi"}
                                          </p>
                                          <InlineBadge className={isOut ? "border-amber-100 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-700"}>
                                                {meta.shortLabel}
                                          </InlineBadge>
                                          {isFinanceScopedTransaction(transaction) ? (
                                                <InlineBadge className={isPlannedPeriodExpense(transaction) ? "border-blue-100 bg-blue-50 text-blue-700" : isAdvanceExpense(transaction) ? "border-emerald-100 bg-emerald-50 text-emerald-700" : isPeriodExpense(transaction) ? "border-blue-100 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                                                      {getExpenseScopeLabel(transaction)}
                                                </InlineBadge>
                                          ) : null}
                                    </div>
                                    <p className="mt-1 truncate text-xs text-slate-500">
                                          {formatDate(transaction.transactionDate)}{description ? ` · ${description}` : ""}
                                    </p>
                              </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                              <p className={`text-right text-base font-semibold ${amountClass}`}>
                                    {isMemo ? "Theo dõi " : isOut ? "-" : "+"}{formatMoney(transaction.amount)}
                              </p>
                              <button
                                    type="button"
                                    onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          openFinanceVoucherPrint(transaction);
                                    }}
                                    title="In phiếu"
                                    aria-label="In phiếu"
                                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 px-3 text-xs font-semibold text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100"
                              >
                                    <Printer className="mr-1.5 h-4 w-4" />
                                    In
                              </button>
                              {details.length ? (
                                    <button
                                          type="button"
                                          onClick={() => setExpanded((value) => !value)}
                                          className="rounded-2xl border border-slate-200 bg-white/82 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50"
                                    >
                                          {expanded ? "Thu gọn" : "Chi tiết"}
                                    </button>
                              ) : null}
                              {canDelete ? (
                                    <button
                                          type="button"
                                          disabled={isDeleting}
                                          onClick={() => onDelete?.(transaction)}
                                          title="Xóa khoản này"
                                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              ) : null}
                        </div>
                  </div>

                  {expanded ? (
                        <div className="mt-3 rounded-[18px] border border-amber-100/70 bg-white/72 px-3 py-2 text-xs leading-5 text-slate-600">
                              <div className="grid gap-1 sm:grid-cols-2">
                                    {details.map((row) => (
                                          <div key={row.label} className="min-w-0">
                                                <span className="font-semibold text-slate-500">{row.label}: </span>
                                                <span className="break-words text-slate-700">{row.value}</span>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  ) : null}
            </div>
      );
}

function openFinanceVoucherPrint(transaction: any) {
      if (typeof window === "undefined") return;
      window.dispatchEvent(new CustomEvent("finance-voucher-print", { detail: transaction }));
}

function isFinanceScopedTransaction(transaction: any) {
      return transaction.source === "expense" || transaction.source === "expense_plan" || transaction.source === "advance_out" || String(transaction.targetType || "").startsWith("expense_");
}

function getCompactTransactionDescription(transaction: any) {
      const description = String(transaction.description || "");
      if (!description) return "";
      return description.split("·")[0]?.trim() || description;
}

function getTransactionDetailRows(transaction: any) {
      const rows: Array<{ label: string; value: string }> = [];
      const targetType = String(transaction.targetType || "");
      const description = String(transaction.description || "").trim();
      if (description) rows.push({ label: "Nội dung", value: description });
      if (targetType) rows.push({ label: "Phân loại", value: getExpenseScopeLabel(transaction) });
      if (transaction.createdAt) rows.push({ label: "Ngày tạo", value: formatDate(transaction.createdAt) });
      return rows;
}

function isPlannedPeriodExpense(transaction: any) {
      return transaction?.source === "expense_plan" || String(transaction?.targetType || "").startsWith("expense_plan_period");
}

function isPeriodExpense(transaction: any) {
      return String(transaction?.targetType || "").startsWith("expense_period");
}

function isAdvanceExpense(transaction: any) {
      return transaction?.source === "advance_out" || String(transaction?.targetType || "").startsWith("expense_advance:");
}

function getExpenseScopeLabel(transaction: any) {
      const targetType = String(transaction?.targetType || "");
      if (targetType.startsWith("expense_advance:")) {
            const parts = targetType.split(":");
            const category = parts[1] || "other";
            const mode = parts[2] || "week";
            const dateRange = parts[3] || "";
            const categoryLabels: Record<string, string> = {
                  market: "Tạm ứng tiền chợ",
                  flowers_lights: "Tạm ứng hoa nến",
                  stationery: "Tạm ứng VPP",
                  supplies: "Tạm ứng vật dụng",
                  other: "Tạm ứng",
            };
            const modeLabel = mode === "month" ? "tháng" : mode === "custom" ? "khoảng ngày" : "tuần";
            const [startDate, endDate] = dateRange.split("_");
            const rangeLabel = startDate ? ` · ${startDate}${endDate && endDate !== startDate ? `-${endDate}` : ""}` : "";
            return `${categoryLabels[category] || "Tạm ứng"} · ${modeLabel}${rangeLabel}`;
      }
      if (targetType.startsWith("expense_plan_periods:")) {
            const months = (targetType.split(":")[1] || "").split(",").filter(Boolean);
            if (months.length > 1) {
                  const first = months[0];
                  const last = months[months.length - 1];
                  return `Dự chi ${first.slice(5, 7)}/${first.slice(0, 4)}-${last.slice(5, 7)}/${last.slice(0, 4)}`;
            }
            if (months[0]) return `Dự chi ${months[0].slice(5, 7)}/${months[0].slice(0, 4)}`;
            return "Dự chi nhiều kỳ";
      }
      if (targetType.startsWith("expense_plan_period:")) {
            const month = targetType.split(":")[1] || "";
            return month ? `Dự chi ${month.slice(5, 7)}/${month.slice(0, 4)}` : "Dự chi theo kỳ";
      }
      if (targetType.startsWith("expense_periods:")) {
            const months = (targetType.split(":")[1] || "").split(",").filter(Boolean);
            if (months.length > 1) {
                  const first = months[0];
                  const last = months[months.length - 1];
                  return `Theo kỳ ${first.slice(5, 7)}/${first.slice(0, 4)}-${last.slice(5, 7)}/${last.slice(0, 4)}`;
            }
            if (months[0]) return `Theo kỳ ${months[0].slice(5, 7)}/${months[0].slice(0, 4)}`;
            return "Theo nhiều kỳ";
      }
      if (targetType.startsWith("expense_period:")) {
            const month = targetType.split(":")[1] || "";
            return month ? `Theo kỳ ${month.slice(5, 7)}/${month.slice(0, 4)}` : "Theo kỳ";
      }
      if (targetType.startsWith("expense_daily:")) {
            const key = targetType.split(":")[1] || "other";
            const labels: Record<string, string> = {
                  market: "Tiền đi chợ",
                  stationery: "Văn phòng phẩm",
                  flowers_lights: "Hoa đèn",
                  supplies: "Vật dụng",
                  repair: "Sửa chữa",
                  support: "Hỗ trợ",
                  other: "Theo ngày",
            };
            return labels[key] || "Theo ngày";
      }
      return "Một lần";
}


function getStudentFeeSummary(transaction: any) {
      const description = String(transaction?.description || "");
      const monthMatch = description.match(/Tháng\s+(\d{2})\s*\/\s*(\d{4})/i) || description.match(/(20\d{2})-(0[1-9]|1[0-2])/);
      if (monthMatch) {
            if (monthMatch[1]?.length === 2) return `Tháng ${monthMatch[1]}/${monthMatch[2]}`;
            return `Tháng ${monthMatch[2]}/${monthMatch[1]}`;
      }
      return "Thu học viên";
}

function getStudentFeeGroupKey(transaction: any) {
      return [
            transaction.targetName || "",
            transaction.transactionDate || "",
            getStudentFeeSummary(transaction),
      ].join("|");
}

function groupCashbookTransactions(transactions: any[]) {
      const grouped = new Map<string, any>();
      const result: any[] = [];

      transactions.forEach((transaction: any) => {
            if (!isStudentFeeTransaction(transaction)) {
                  result.push(transaction);
                  return;
            }

            const key = getStudentFeeGroupKey(transaction);
            const existing = grouped.get(key);
            if (existing) {
                  existing.amount = toMoneyNumber(existing.amount) + toMoneyNumber(transaction.amount);
                  existing.groupCount += 1;
                  existing.summaryDescription = `${getStudentFeeSummary(transaction)} · ${existing.groupCount} khoản`;
            } else {
                  const row = {
                        ...transaction,
                        id: `student-fee-${key}`,
                        amount: toMoneyNumber(transaction.amount),
                        groupCount: 1,
                        summaryDescription: `${getStudentFeeSummary(transaction)} · 1 khoản`,
                  };
                  grouped.set(key, row);
                  result.push(row);
            }
      });

      return result;
}


function EmptyFinanceBox({ text }: { text: string }) {
      return (
            <div className="rounded-[22px] border border-dashed border-[#e4d3aa] bg-white/65 p-5 text-sm text-slate-500">
                  {text}
            </div>
      );
}

function cashbookActionClass(tone: "income" | "donation" | "expense") {
      if (tone === "expense") {
            return "inline-flex items-center rounded-2xl border border-[#d8b45d]/70 bg-[linear-gradient(135deg,#fff7dc_0%,#efcf7a_100%)] px-4 py-2.5 text-sm font-semibold text-[#4a2b00] shadow-[0_10px_22px_rgba(180,122,20,0.16)] transition hover:-translate-y-0.5";
      }
      if (tone === "donation") {
            return "inline-flex items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5";
      }
      return "inline-flex items-center rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5";
}
