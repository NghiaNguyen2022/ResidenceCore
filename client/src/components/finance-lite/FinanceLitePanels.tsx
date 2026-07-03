import { useMemo, useState } from "react";
import {
      ArrowDownRight,
      ArrowUpRight,
      Building2,
      CreditCard,
      HandCoins,
      PiggyBank,
      Plus,
      Printer,
      ReceiptText,
      Search,
      Trash2,
      WalletCards,
      Wrench,
} from "lucide-react";

import { InlineBadge } from "@/components/shared/display/InlineBadge";
import { FinanceVoucherPreviewModal } from "./FinanceVoucherPreviewModal";
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
      onCreateExpense,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions?: any[];
      onCreateExpense: (source?: string) => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const [voucherTransaction, setVoucherTransaction] = useState<any | null>(null);

      const actualExpenseTransactions = useMemo(
            () =>
                  transactions.filter(
                        (item: any) =>
                              isTransactionAffectingCashFlow(item.source) &&
                              getTransactionDirectionForSource(item.source, item.direction) === "out" &&
                              !isPlannedPeriodExpense(item),
                  ),
            [transactions],
      );
      const manualIncomeTransactions = useMemo(
            () =>
                  transactions.filter((item: any) => {
                        if (item.source === "student_fee_payment") return false;
                        if (!isTransactionAffectingCashFlow(item.source)) return false;
                        if (isPlannedPeriodExpense(item)) return false;
                        return getTransactionDirectionForSource(item.source, item.direction) === "in";
                  }),
            [transactions],
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
                  transactions
                        .filter((item: any) => isAdvanceActualSpending(item.source))
                        .reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [transactions],
      );
      const recentManualOperations = useMemo(
            () =>
                  transactions
                        .filter(
                              (item: any) =>
                                    item.source !== "student_fee_payment" &&
                                    isTransactionAffectingCashFlow(item.source) &&
                                    !isPlannedPeriodExpense(item) &&
                                    !isAdvanceExpense(item) &&
                                    !isAdvanceActualSpending(item.source),
                        )
                        .slice(0, 6),
            [transactions],
      );

      return (
            <>
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,201,92,0.15),transparent_36%)]" />

                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Thu chi khác</p>
                              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#101a2f]">Ghi nhận và theo dõi</h2>
                        </div>
                        <button
                              type="button"
                              onClick={() => onCreateExpense("other_income")}
                              className="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#111827_0%,#92400e_62%,#f59e0b_145%)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(146,64,14,0.20)] transition hover:-translate-y-0.5"
                        >
                              <Plus className="mr-2 h-4 w-4" />
                              Ghi nhận nghiệp vụ
                        </button>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                        <ExpenseMetricCard label="Thu ngoài học viên" value={formatMoney(totalManualIncome)} tone="blue" />
                        <ExpenseMetricCard label="Chi một lần" value={formatMoney(totalOneTimeExpense)} tone="amber" />
                        <ExpenseMetricCard label="Tạm ứng còn giữ" value={formatMoney(Math.max(0, totalAdvanceExpense - totalAdvanceActualSpending))} tone="emerald" />
                  </div>

                  <div className="relative mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                          <p className="text-sm font-semibold text-slate-900">Tạm ứng đang theo dõi</p>
                                          <p className="text-xs text-slate-500">Tiền đã xuất, còn cần cập nhật thực chi.</p>
                                    </div>
                                    <InlineBadge className="border-emerald-100 bg-emerald-50 text-emerald-700">{advanceExpenses.length} dòng</InlineBadge>
                              </div>
                              <div className="space-y-2">
                                    {advanceExpenses.length ? (
                                          advanceExpenses.slice(0, 5).map((transaction: any) => (
                                                <AdvanceTrackingLine
                                                      key={transaction.id}
                                                      transaction={transaction}
                                                      transactions={transactions}
                                                      onPrint={setVoucherTransaction}
                                                      onDelete={onDeleteTransaction}
                                                      isDeleting={isDeletingTransaction}
                                                />
                                          ))
                                    ) : (
                                          <EmptyFinanceBox text="Chưa có khoản tạm ứng cần theo dõi." />
                                    )}
                              </div>
                        </div>

                        <div className="rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                          <p className="text-sm font-semibold text-slate-900">Thu chi gần đây</p>
                                          <p className="text-xs text-slate-500">Thu khác và chi một lần.</p>
                                    </div>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{recentManualOperations.length} dòng</InlineBadge>
                              </div>
                              <div className="space-y-2">
                                    {recentManualOperations.length ? (
                                          recentManualOperations.map((transaction: any) => (
                                                <CompactTransactionLine
                                                      key={transaction.id}
                                                      transaction={transaction}
                                                      onPrint={setVoucherTransaction}
                                                      onDelete={onDeleteTransaction}
                                                      isDeleting={isDeletingTransaction}
                                                />
                                          ))
                                    ) : (
                                          <EmptyFinanceBox text="Chưa có thu chi khác. Chọn một thao tác nhanh bên trên để bắt đầu." />
                                    )}
                              </div>
                        </div>
                  </div>
            </section>
            {voucherTransaction ? (
                  <FinanceVoucherPreviewModal
                        transaction={voucherTransaction}
                        onClose={() => setVoucherTransaction(null)}
                  />
            ) : null}
            </>
      );
}

export function FinanceExpensePlansPanel({
      transactions = [],
      onCreatePlan,
      onCreateActualExpense,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions?: any[];
      onCreatePlan: () => void;
      onCreateActualExpense: () => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const [voucherTransaction, setVoucherTransaction] = useState<any | null>(null);

      const plannedPeriodExpenses = useMemo(
            () => transactions.filter((item: any) => isPlannedPeriodExpense(item)),
            [transactions],
      );
      const totalPlanned = useMemo(
            () => plannedPeriodExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [plannedPeriodExpenses],
      );
      const upcomingPlans = useMemo(() => plannedPeriodExpenses.slice(0, 8), [plannedPeriodExpenses]);

      return (
            <>
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.10),transparent_35%),radial-gradient(circle_at_top_left,rgba(246,201,92,0.16),transparent_36%)]" />
                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Theo dõi</p>
                              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#101a2f]">Dự chi sắp tới</h2>

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
                        <ExpenseMetricCard label="Cần theo dõi" value={`${plannedPeriodExpenses.length} khoản`} tone="slate" />
                        <ExpenseMetricCard label="Tác động tiền mặt" value="Chưa phát sinh" tone="emerald" />
                  </div>

                  <div className="relative mt-5 rounded-[28px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                              <div>
                                    <p className="text-sm font-semibold text-slate-900">Dự chi theo kỳ</p>
                                    
                              </div>
                              <InlineBadge className="border-blue-100 bg-blue-50 text-blue-700">{upcomingPlans.length} dòng</InlineBadge>
                        </div>
                        <div className="space-y-2">
                              {upcomingPlans.length ? (
                                    upcomingPlans.map((transaction: any) => (
                                          <PlanTrackingLine
                                                key={transaction.id}
                                                transaction={transaction}
                                                onPrint={setVoucherTransaction}
                                                onDelete={onDeleteTransaction}
                                                isDeleting={isDeletingTransaction}
                                          />
                                    ))
                              ) : (
                                    <EmptyFinanceBox text="Chưa có khoản đề xuất. Bấm Tạo dự chi để lập kế hoạch điện, nước, internet hoặc tiện ích theo kỳ." />
                              )}
                        </div>
                  </div>
            </section>
            {voucherTransaction ? (
                  <FinanceVoucherPreviewModal
                        transaction={voucherTransaction}
                        onClose={() => setVoucherTransaction(null)}
                  />
            ) : null}
            </>
      );
}

export function FinanceCashbookPanel({
      transactions,
      onCreateTransaction,
      onDeleteTransaction,
      isDeletingTransaction = false,
}: {
      transactions: any[];
      onCreateTransaction: (source?: string) => void;
      onDeleteTransaction?: (transaction: any) => void;
      isDeletingTransaction?: boolean;
}) {
      const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">("all");
      const [searchText, setSearchText] = useState("");
      const [voucherTransaction, setVoucherTransaction] = useState<any | null>(null);

      const normalizedTransactions = useMemo(
            () =>
                  transactions
                        .filter((transaction: any) => isTransactionAffectingCashFlow(transaction.source))
                        .filter((transaction: any) => !isPlannedPeriodExpense(transaction))
                        .map((transaction: any) => ({
                              ...transaction,
                              normalizedDirection: getTransactionDirectionForSource(transaction.source, transaction.direction),
                        })),
            [transactions],
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

      const cashbookRows = useMemo(() => groupCashbookTransactions(filteredTransactions), [filteredTransactions]);

      return (
            <>
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,201,92,0.14),transparent_34%)]" />
                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Sổ dòng tiền</p>
                              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#101a2f]">Dòng tiền phát sinh</h2>

                        </div>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                        <CashbookMetricCard label="Thu vào" value={formatMoney(totalIn)} icon={ArrowUpRight} tone="emerald" />
                        <CashbookMetricCard label="Chi ra" value={formatMoney(totalOut)} icon={ArrowDownRight} tone="amber" />
                        <CashbookMetricCard label="Cân đối" value={`${balance >= 0 ? "+" : "-"}${formatMoney(Math.abs(balance))}`} icon={ReceiptText} tone={balance >= 0 ? "blue" : "rose"} />
                  </div>

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
                                                onPrint={setVoucherTransaction}
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
            {voucherTransaction ? (
                  <FinanceVoucherPreviewModal
                        transaction={voucherTransaction}
                        onClose={() => setVoucherTransaction(null)}
                  />
            ) : null}
            </>
      );
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
                  ? "border-[#e6c675] bg-[#fff5d7] text-[#7c4a03]"
                  : tone === "emerald"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : tone === "blue"
                              ? "border-blue-100 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-700";
      return (
            <div className={`rounded-[24px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${toneClass}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
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

function AdvanceTrackingLine({
      transaction,
      transactions,
      onPrint,
      onDelete,
      isDeleting = false,
}: {
      transaction: any;
      transactions: any[];
      onPrint?: (transaction: any) => void;
      onDelete?: (transaction: any) => void;
      isDeleting?: boolean;
}) {
      const advanceAmount = toMoneyNumber(transaction.amount);
      const actualSpent = getActualSpendingForAdvance(transaction, transactions);
      const balance = advanceAmount - actualSpent;
      const canDelete = Boolean(onDelete);

      return (
            <div className="rounded-[20px] border border-slate-100 bg-white/92 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">
                                          {transaction.targetName || "Đối tượng nhận tạm ứng"}
                                    </p>
                                    <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">Tạm ứng</InlineBadge>
                                    <InlineBadge className="border-emerald-100 bg-emerald-50 text-emerald-700">{getExpenseScopeLabel(transaction)}</InlineBadge>
                              </div>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                    <MiniMoney label="Đã xuất" value={advanceAmount} />
                                    <MiniMoney label="Đã chi" value={actualSpent} />
                                    <MiniMoney label="Còn giữ" value={balance} highlight />
                              </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                              {onPrint ? (
                                    <button
                                          type="button"
                                          onClick={() => onPrint(transaction)}
                                          title="In phiếu"
                                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100"
                                    >
                                          <Printer className="h-4 w-4" />
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
            </div>
      );
}

function PlanTrackingLine({
      transaction,
      onPrint,
      onDelete,
      isDeleting = false,
}: {
      transaction: any;
      onPrint?: (transaction: any) => void;
      onDelete?: (transaction: any) => void;
      isDeleting?: boolean;
}) {
      const canDelete = Boolean(onDelete);
      return (
            <div className="grid gap-3 rounded-[20px] border border-slate-100 bg-white/92 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-slate-900">
                                    {transaction.targetName || "Dự chi"}
                              </p>
                              <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">Dự chi</InlineBadge>
                              <InlineBadge className="border-blue-100 bg-blue-50 text-blue-700">{getExpenseScopeLabel(transaction)}</InlineBadge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{getPlanSummary(transaction)}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                        <p className="text-right text-base font-semibold text-[#9a5f08]">-{formatMoney(transaction.amount)}</p>
                              {onPrint ? (
                                    <button
                                          type="button"
                                          onClick={() => onPrint(transaction)}
                                          title="In phiếu"
                                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100"
                                    >
                                          <Printer className="h-4 w-4" />
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
      );
}

function CompactTransactionLine({
      transaction,
      onPrint,
      onDelete,
      isDeleting = false,
}: {
      transaction: any;
      onPrint?: (transaction: any) => void;
      onDelete?: (transaction: any) => void;
      isDeleting?: boolean;
}) {
      const direction = getTransactionDirectionForSource(transaction.source, transaction.direction);
      const isOut = direction === "out";
      const meta = getTransactionSourceMeta(transaction.source);
      const canDelete = Boolean(onDelete) && transaction.source !== "student_fee_payment";
      return (
            <div className="grid gap-3 rounded-[20px] border border-slate-100 bg-white/92 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                        <div className={`shrink-0 rounded-2xl p-2 ${isOut ? "bg-[#fff5d7] text-[#9a5f08]" : "bg-emerald-50 text-emerald-700"}`}>
                              {isOut ? <CreditCard className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">{transaction.targetName || transaction.description || "Nghiệp vụ thu chi"}</p>
                                    <InlineBadge className={isOut ? "border-amber-100 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-700"}>
                                          {meta.shortLabel}
                                    </InlineBadge>
                                    {isOut ? <InlineBadge className="border-slate-200 bg-slate-50 text-slate-600">{getExpenseScopeLabel(transaction)}</InlineBadge> : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.transactionDate)} · {getShortDescription(transaction)}</p>
                        </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                        <p className={`text-right text-base font-semibold ${isOut ? "text-[#9a5f08]" : "text-emerald-700"}`}>
                              {isOut ? "-" : "+"}{formatMoney(transaction.amount)}
                        </p>
                              {onPrint ? (
                                    <button
                                          type="button"
                                          onClick={() => onPrint(transaction)}
                                          title="In phiếu"
                                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100"
                                    >
                                          <Printer className="h-4 w-4" />
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
      );
}

function MiniMoney({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
      return (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className={`mt-1 text-sm font-bold ${highlight ? "text-[#9a5f08]" : "text-slate-700"}`}>{formatMoney(value)}</p>
            </div>
      );
}


function CashbookLine({
      transaction,
      compact = false,
      onPrint,
      onDelete,
      isDeleting = false,
}: {
      transaction: any;
      compact?: boolean;
      onPrint?: (transaction: any) => void;
      onDelete?: (transaction: any) => void;
      isDeleting?: boolean;
}) {
      const direction = getTransactionDirectionForSource(transaction.source, transaction.direction);
      const isOut = direction === "out";
      const isMemo = isAdvanceActualSpending(transaction.source) || direction === "memo";
      const meta = getTransactionSourceMeta(transaction.source);
      const lineClass = compact ? "px-3 py-2.5" : "px-4 py-3";
      const amountClass = isMemo ? "text-slate-600" : isOut ? "text-[#9a5f08]" : "text-emerald-700";
      const canDelete = Boolean(onDelete) && transaction.source !== "student_fee_payment";

      return (
            <div className={`grid gap-3 rounded-[20px] border border-slate-100 bg-white/92 ${lineClass} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:grid-cols-[1fr_auto] md:items-center`}>
                  <div className="flex min-w-0 items-start gap-3">
                        <div
                              className={`shrink-0 rounded-2xl p-2 ${
                                    isMemo
                                          ? "bg-slate-100 text-slate-600"
                                          : isOut
                                                ? "bg-[#fff5d7] text-[#9a5f08]"
                                                : "bg-emerald-50 text-emerald-700"
                              }`}
                        >
                              {isMemo ? <ReceiptText className="h-4 w-4" /> : isOut ? <CreditCard className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">
                                          {transaction.targetName || transaction.description || "Nghiệp vụ thu chi"}
                                    </p>
                                    <InlineBadge className={isOut ? "border-amber-100 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-700"}>
                                          {meta.shortLabel}
                                    </InlineBadge>
                                    {transaction.source === "expense" || transaction.source === "expense_plan" || transaction.source === "advance_out" ? (
                                          <InlineBadge className={isPlannedPeriodExpense(transaction) ? "border-blue-100 bg-blue-50 text-blue-700" : isAdvanceExpense(transaction) ? "border-emerald-100 bg-emerald-50 text-emerald-700" : isPeriodExpense(transaction) ? "border-blue-100 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                                                {getExpenseScopeLabel(transaction)}
                                          </InlineBadge>
                                    ) : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                    {formatDate(transaction.transactionDate)} · {getShortDescription(transaction)}
                              </p>
                        </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                        <p className={`text-right text-base font-semibold ${amountClass}`}>
                              {isMemo ? "Theo dõi " : isOut ? "-" : "+"}{formatMoney(transaction.amount)}
                        </p>
                              {onPrint ? (
                                    <button
                                          type="button"
                                          onClick={() => onPrint(transaction)}
                                          title="In phiếu"
                                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-100"
                                    >
                                          <Printer className="h-4 w-4" />
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
      );
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

function getActualSpendingForAdvance(advance: any, transactions: any[]) {
      const advanceId = Number(advance?.id || 0);
      if (!advanceId) return 0;
      return transactions
            .filter((item: any) => isAdvanceActualSpending(item.source) && String(item.targetType || "") === `advance_entry:${advanceId}`)
            .reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0);
}

function getShortDescription(transaction: any) {
      if (transaction?.summaryDescription) return transaction.summaryDescription;
      if (isAdvanceExpense(transaction)) return getExpenseScopeLabel(transaction);
      if (isPlannedPeriodExpense(transaction)) return getPlanSummary(transaction);
      const source = String(transaction?.source || "");
      if (source === "donation") return "Tài trợ / ủng hộ";
      if (source === "other_income") return "Thu khác";
      if (source === "student_fee_payment") return getStudentFeeSummary(transaction);
      if (source === "expense" || source === "expense_once") return getExpenseScopeLabel(transaction);
      return getTransactionSourceMeta(transaction.source).shortLabel || "Nghiệp vụ";
}

function getPlanSummary(transaction: any) {
      const description = String(transaction?.description || "");
      const perPeriod = description.match(/Số tiền mỗi kỳ:\s*([0-9,.]+)/i)?.[1];
      const dueText = description.match(/Ngày dự chi:\s*([^·]+)/i)?.[1]?.trim();
      const parts = [getExpenseScopeLabel(transaction)];
      if (perPeriod) parts.push(`${perPeriod}đ/kỳ`);
      if (dueText) parts.push(`Dự chi: ${dueText}`);
      return parts.filter(Boolean).join(" · ");
}

function getStudentFeeSummary(transaction: any) {
      const description = String(transaction?.description || "");
      const monthMatch = description.match(/Tháng\s+(\d{2})\s*\/\s*(\d{4})/i) || description.match(/(\d{4})-(\d{2})/);
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
            if (transaction.source !== "student_fee_payment") {
                  result.push(transaction);
                  return;
            }

            const key = getStudentFeeGroupKey(transaction);
            const existing = grouped.get(key);
            if (existing) {
                  existing.amount = toMoneyNumber(existing.amount) + toMoneyNumber(transaction.amount);
                  existing.groupCount += 1;
                  existing.groupIds.push(transaction.id);
                  existing.summaryDescription = `${getStudentFeeSummary(transaction)} · ${existing.groupCount} khoản`;
            } else {
                  const row = {
                        ...transaction,
                        id: `student-fee-${key}`,
                        amount: toMoneyNumber(transaction.amount),
                        groupCount: 1,
                        groupIds: [transaction.id],
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
