import { useMemo, useState } from "react";
import {
      ArrowDownRight,
      ArrowUpRight,
      Building2,
      CreditCard,
      HandCoins,
      PiggyBank,
      ReceiptText,
      Search,
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
}: {
      transactions?: any[];
      onCreateExpense: (source?: string) => void;
}) {
      const expenseTransactions = useMemo(
            () => transactions.filter((item: any) => getTransactionDirectionForSource(item.source, item.direction) === "out"),
            [transactions],
      );
      const periodExpenses = useMemo(
            () => expenseTransactions.filter((item: any) => isPeriodExpense(item)),
            [expenseTransactions],
      );
      const oneTimeExpenses = useMemo(
            () => expenseTransactions.filter((item: any) => !isPeriodExpense(item)),
            [expenseTransactions],
      );
      const totalExpense = useMemo(
            () => expenseTransactions.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [expenseTransactions],
      );
      const totalPeriodExpense = useMemo(
            () => periodExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [periodExpenses],
      );
      const totalOneTimeExpense = useMemo(
            () => oneTimeExpenses.reduce((sum: number, item: any) => sum + toMoneyNumber(item.amount), 0),
            [oneTimeExpenses],
      );
      const recentExpenses = expenseTransactions.slice(0, 6);

      return (
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,201,92,0.16),transparent_36%)]" />
                  <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Khoản chi</p>
                              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#101a2f]">Quản lý chi phí vận hành</h2>
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Ghi nhận chi phí điện nước, sửa chữa, mua sắm, sinh hoạt và các khoản phát sinh. Tất cả khoản chi sẽ tự đi vào sổ thu chi.
                              </p>
                        </div>
                        <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-2xl border border-[#d8b45d]/70 bg-[linear-gradient(135deg,#fff7dc_0%,#efcf7a_100%)] px-5 py-3 text-sm font-semibold text-[#4a2b00] shadow-[0_12px_26px_rgba(180,122,20,0.18),inset_0_1px_0_rgba(255,255,255,0.88)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(180,122,20,0.24)]"
                              onClick={() => onCreateExpense("expense")}
                        >
                              <CreditCard className="mr-2 h-4 w-4" /> Ghi nhận khoản chi
                        </button>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-4">
                        <ExpenseMetricCard label="Tổng chi" value={formatMoney(totalExpense)} tone="amber" />
                        <ExpenseMetricCard label="Theo kỳ" value={formatMoney(totalPeriodExpense)} tone="blue" />
                        <ExpenseMetricCard label="Một lần" value={formatMoney(totalOneTimeExpense)} tone="slate" />
                        <ExpenseMetricCard label="Gần nhất" value={recentExpenses[0] ? formatDate(recentExpenses[0].transactionDate) : "Chưa có"} tone="emerald" />
                  </div>

                  <div className="relative mt-5 grid gap-3 lg:grid-cols-3">
                        <ExpenseCategoryCard
                              icon={Building2}
                              title="Chi theo kỳ"
                              description="Điện, nước, internet, vệ sinh, bảo trì định kỳ theo tháng."
                              action="Ghi chi theo kỳ"
                              onClick={() => onCreateExpense("expense")}
                        />
                        <ExpenseCategoryCard
                              icon={Wrench}
                              title="Chi một lần"
                              description="Vật dụng, thiết bị, sửa chữa phòng ở hoặc phát sinh không lặp lại."
                              action="Ghi chi một lần"
                              onClick={() => onCreateExpense("expense")}
                        />
                        <ExpenseCategoryCard
                              icon={HandCoins}
                              title="Sinh hoạt / hỗ trợ"
                              description="Hoạt động chung, hỗ trợ học viên, y tế hoặc các khoản hỗ trợ riêng."
                              action="Ghi chi hỗ trợ"
                              onClick={() => onCreateExpense("expense")}
                        />
                  </div>

                  <div className="relative mt-5 rounded-[26px] border border-[#ead9ad]/70 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                    <p className="text-sm font-semibold text-slate-900">Khoản chi gần đây</p>
                                    <p className="text-xs text-slate-500">Hiển thị các nghiệp vụ chi mới nhất từ sổ thu chi.</p>
                              </div>
                              <InlineBadge className="border-amber-100 bg-amber-50 text-amber-800">{recentExpenses.length} dòng</InlineBadge>
                        </div>
                        <div className="space-y-2">
                              {recentExpenses.length ? (
                                    recentExpenses.map((transaction: any) => (
                                          <CashbookLine key={transaction.id} transaction={transaction} compact />
                                    ))
                              ) : (
                                    <EmptyFinanceBox text="Chưa có khoản chi nào. Bấm “Ghi nhận khoản chi” để thêm nghiệp vụ đầu tiên." />
                              )}
                        </div>
                  </div>
            </section>
      );
}

export function FinanceCashbookPanel({
      transactions,
      onCreateTransaction,
}: {
      transactions: any[];
      onCreateTransaction: (source?: string) => void;
}) {
      const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">("all");
      const [searchText, setSearchText] = useState("");

      const normalizedTransactions = useMemo(
            () =>
                  transactions.map((transaction: any) => ({
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

      return (
            <section className="relative overflow-hidden rounded-[34px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-5 shadow-[0_22px_60px_rgba(106,76,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,201,92,0.14),transparent_34%)]" />
                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Sổ thu chi</p>
                              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#101a2f]">Dòng tiền phát sinh</h2>
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Theo dõi thu khác, tài trợ, khoản chi và nghiệp vụ kinh doanh trong một sổ đơn giản, dễ đối chiếu.
                              </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                              <button type="button" className={cashbookActionClass("income")} onClick={() => onCreateTransaction("other_income")}>
                                    <WalletCards className="mr-2 h-4 w-4" /> Thu khác
                              </button>
                              <button type="button" className={cashbookActionClass("donation")} onClick={() => onCreateTransaction("donation")}>
                                    <PiggyBank className="mr-2 h-4 w-4" /> Tài trợ
                              </button>
                              <button type="button" className={cashbookActionClass("expense")} onClick={() => onCreateTransaction("expense")}>
                                    <CreditCard className="mr-2 h-4 w-4" /> Khoản chi
                              </button>
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
                              {filteredTransactions.length ? (
                                    filteredTransactions.map((transaction: any) => (
                                          <CashbookLine key={transaction.id} transaction={transaction} />
                                    ))
                              ) : (
                                    <EmptyFinanceBox text="Chưa có nghiệp vụ phù hợp với bộ lọc hiện tại." />
                              )}
                        </div>
                  </div>
            </section>
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

function CashbookLine({ transaction, compact = false }: { transaction: any; compact?: boolean }) {
      const direction = getTransactionDirectionForSource(transaction.source, transaction.direction);
      const isOut = direction === "out";
      const meta = getTransactionSourceMeta(transaction.source);
      const lineClass = compact ? "px-3 py-2.5" : "px-4 py-3";
      const amountClass = isOut ? "text-[#9a5f08]" : "text-emerald-700";

      return (
            <div className={`grid gap-3 rounded-[20px] border border-slate-100 bg-white/92 ${lineClass} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:grid-cols-[1fr_auto] md:items-center`}>
                  <div className="flex min-w-0 items-start gap-3">
                        <div className={`shrink-0 rounded-2xl p-2 ${isOut ? "bg-[#fff5d7] text-[#9a5f08]" : "bg-emerald-50 text-emerald-700"}`}>
                              {isOut ? <CreditCard className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">
                                          {transaction.targetName || transaction.description || "Nghiệp vụ thu chi"}
                                    </p>
                                    <InlineBadge className={isOut ? "border-amber-100 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-700"}>
                                          {meta.shortLabel}
                                    </InlineBadge>
                                    {transaction.source === "expense" ? (
                                          <InlineBadge className={isPeriodExpense(transaction) ? "border-blue-100 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                                                {getExpenseScopeLabel(transaction)}
                                          </InlineBadge>
                                    ) : null}
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                    {formatDate(transaction.transactionDate)}{transaction.description ? ` · ${transaction.description}` : ""}
                              </p>
                        </div>
                  </div>
                  <p className={`text-right text-base font-semibold ${amountClass}`}>
                        {isOut ? "-" : "+"}{formatMoney(transaction.amount)}
                  </p>
            </div>
      );
}

function isPeriodExpense(transaction: any) {
      return String(transaction?.targetType || "").startsWith("expense_period");
}

function getExpenseScopeLabel(transaction: any) {
      const targetType = String(transaction?.targetType || "");
      if (targetType.startsWith("expense_period:")) {
            const month = targetType.split(":")[1] || "";
            return month ? `Theo kỳ ${month.slice(5, 7)}/${month.slice(0, 4)}` : "Theo kỳ";
      }
      return "Một lần";
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
