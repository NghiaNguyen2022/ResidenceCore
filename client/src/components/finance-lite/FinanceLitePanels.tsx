import { CreditCard, WalletCards } from "lucide-react";

import { InlineBadge } from "@/components/shared/display/InlineBadge";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { formatDate, formatMoney, getTransactionSourceMeta } from "./financeLiteUtils";

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
      transactions,
      onCreateExpense,
}: {
      transactions: any[];
      onCreateExpense: () => void;
}) {
      const expenseTransactions = transactions.filter(
            (transaction: any) =>
                  transaction.direction === "out" || transaction.source === "expense",
      );
      const totalExpense = expenseTransactions.reduce(
            (sum: number, transaction: any) => sum + Number(transaction.amount || 0),
            0,
      );

      return (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                              <h2 className="text-base font-semibold text-slate-900">Khoản chi</h2>
                              <p className="text-sm text-slate-500">
                                    Ghi nhận điện nước, sửa chữa, mua vật dụng và các khoản chi phát sinh.
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3">
                                          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                                                Tổng chi
                                          </p>
                                          <p className="mt-1 text-lg font-semibold text-rose-700">
                                                {formatMoney(totalExpense)}
                                          </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                Số nghiệp vụ
                                          </p>
                                          <p className="mt-1 text-lg font-semibold text-slate-900">
                                                {expenseTransactions.length}
                                          </p>
                                    </div>
                              </div>
                        </div>
                        <button
                              type="button"
                              className={residenceMediumStyle.buttonCardPrimary}
                              onClick={onCreateExpense}
                        >
                              Ghi nhận khoản chi
                        </button>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        <ExpenseInfoCard
                              title="Vận hành định kỳ"
                              description="Điện, nước, internet, vệ sinh, bảo trì theo tháng."
                              badge="Theo tháng"
                              badgeClassName="border-amber-200 bg-white text-amber-700"
                              tone="amber"
                              lines={["Gắn tháng khi cần đối chiếu", "Nên ghi rõ kỳ/tháng chi"]}
                        />
                        <ExpenseInfoCard
                              title="Sửa chữa / mua sắm"
                              description="Khoản phát sinh cho phòng ở, vật dụng, cơ sở vật chất."
                              badge="Phát sinh"
                              badgeClassName="border-slate-200 bg-slate-50 text-slate-600"
                              tone="slate"
                              lines={["Ghi rõ người nhận/đơn vị nhận", "Nên có mục đích chi cụ thể"]}
                        />
                        <ExpenseInfoCard
                              title="Sinh hoạt / hỗ trợ"
                              description="Chi cho hoạt động, học tập, hỗ trợ học viên hoặc việc chung."
                              badge="Nội bộ"
                              badgeClassName="border-emerald-100 bg-emerald-50 text-emerald-700"
                              tone="slate"
                              lines={["Theo dõi trong sổ thu chi", "Có thể mở rộng phân quyền sau"]}
                        />
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[26px] border border-white/85 bg-white/92 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-[#fff8e8] via-white to-[#f7e3ab]/65 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Khoản chi gần đây
                              </p>
                        </div>
                        <div className="divide-y divide-slate-100">
                              {expenseTransactions.slice(0, 10).map((transaction: any) => (
                                    <CashbookLine key={transaction.id} transaction={transaction} />
                              ))}
                              {!expenseTransactions.length ? (
                                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                                          Chưa có khoản chi nào. Bấm “Ghi nhận khoản chi” để thêm nghiệp vụ.
                                    </div>
                              ) : null}
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
      onCreateTransaction: () => void;
}) {
      const totalIn = transactions
            .filter((transaction: any) => transaction.direction === "in")
            .reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0);
      const totalOut = transactions
            .filter((transaction: any) => transaction.direction === "out")
            .reduce((sum: number, transaction: any) => sum + Number(transaction.amount || 0), 0);

      return (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                              <h2 className="text-base font-semibold text-slate-900">Sổ thu chi</h2>
                              <p className="text-sm text-slate-500">
                                    Ghi nhận thu khác, tài trợ/ủng hộ, chi phí và dòng tiền phát sinh.
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                    <MiniCashStat label="Thu vào" value={formatMoney(totalIn)} tone="in" />
                                    <MiniCashStat label="Chi ra" value={formatMoney(totalOut)} tone="out" />
                                    <MiniCashStat label="Cân đối" value={formatMoney(totalIn - totalOut)} tone="neutral" />
                              </div>
                        </div>
                        <button
                              type="button"
                              className={residenceMediumStyle.buttonCardPrimary}
                              onClick={onCreateTransaction}
                        >
                              Thêm thu / chi
                        </button>
                  </div>
                  <div className="space-y-2">
                        {transactions.map((transaction: any) => (
                              <CashbookLine key={transaction.id} transaction={transaction} />
                        ))}
                        {!transactions.length ? (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                                    Chưa có nghiệp vụ thu chi nào.
                              </div>
                        ) : null}
                  </div>
            </section>
      );
}

function ExpenseInfoCard({
      title,
      description,
      badge,
      badgeClassName,
      tone,
      lines,
}: {
      title: string;
      description: string;
      badge: string;
      badgeClassName: string;
      tone: "amber" | "slate";
      lines: string[];
}) {
      const shellClass =
            tone === "amber"
                  ? "border-amber-100 bg-amber-50/60"
                  : "border-slate-100 bg-white";
      const lineClass =
            tone === "amber"
                  ? "border-white/70 bg-white/80"
                  : "border-slate-100 bg-slate-50/80";

      return (
            <div className={`rounded-2xl border p-4 ${shellClass}`}>
                  <div className="flex items-start justify-between gap-3">
                        <div>
                              <p className="text-sm font-semibold text-slate-900">{title}</p>
                              <p className="mt-1 text-sm text-slate-500">{description}</p>
                        </div>
                        <InlineBadge className={badgeClassName}>{badge}</InlineBadge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        {lines.map((line) => (
                              <div key={line} className={`rounded-xl border px-3 py-2 ${lineClass}`}>
                                    {line}
                              </div>
                        ))}
                  </div>
            </div>
      );
}

function CashbookLine({ transaction }: { transaction: any }) {
      const isOut = transaction.direction === "out";
      const sourceMeta = getTransactionSourceMeta(transaction.source, transaction.direction);

      return (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                  <div className="flex min-w-0 items-center gap-3">
                        <div className={`rounded-xl p-2 ${isOut ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                              {isOut ? (
                                    <CreditCard className="h-4 w-4" />
                              ) : (
                                    <WalletCards className="h-4 w-4" />
                              )}
                        </div>
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-medium text-slate-900">
                                          {transaction.targetName ||
                                                transaction.description ||
                                                "Nghiệp vụ thu chi"}
                                    </p>
                                    <InlineBadge className={sourceMeta.badgeClassName}>
                                          {sourceMeta.label}
                                    </InlineBadge>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">
                                    {formatDate(transaction.transactionDate)}
                                    {transaction.description ? ` · ${transaction.description}` : ""}
                              </p>
                        </div>
                  </div>
                  <p className={`shrink-0 font-semibold ${isOut ? "text-rose-700" : "text-emerald-700"}`}>
                        {isOut ? "-" : "+"}
                        {formatMoney(transaction.amount)}
                  </p>
            </div>
      );
}

function MiniCashStat({
      label,
      value,
      tone,
}: {
      label: string;
      value: string;
      tone: "in" | "out" | "neutral";
}) {
      const toneClass =
            tone === "in"
                  ? "border-emerald-100 bg-emerald-50/70 text-emerald-700"
                  : tone === "out"
                        ? "border-rose-100 bg-rose-50/70 text-rose-700"
                        : "border-slate-100 bg-white/80 text-slate-900";

      return (
            <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75">{label}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
      );
}
