import { CreditCard, WalletCards } from "lucide-react";

import { InlineBadge } from "@/components/shared/display/InlineBadge";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { formatDate, formatMoney } from "./financeLiteUtils";

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
      onCreateExpense,
}: {
      onCreateExpense: () => void;
}) {
      return (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                              <h2 className="text-base font-semibold text-slate-900">Khoản chi</h2>
                              <p className="text-sm text-slate-500">
                                    Quản lý khoản chi theo kỳ như điện, nước, internet và các khoản chi
                                    phát sinh không theo kỳ.
                              </p>
                        </div>
                        <button
                              type="button"
                              className={residenceMediumStyle.buttonCardPrimary}
                              onClick={onCreateExpense}
                        >
                              Ghi nhận khoản chi
                        </button>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <ExpenseInfoCard
                              title="Chi theo kỳ"
                              description="Dùng cho các khoản vận hành lặp lại theo tháng/kỳ."
                              badge="Theo tháng"
                              badgeClassName="border-amber-200 bg-white text-amber-700"
                              tone="amber"
                              lines={[
                                    "Điện, nước, internet, vệ sinh, bảo trì định kỳ",
                                    "Có thể gắn với kỳ/tháng đang xem để lên báo cáo vận hành",
                              ]}
                        />
                        <ExpenseInfoCard
                              title="Chi không theo kỳ"
                              description="Dùng cho sự kiện, sửa chữa, mua sắm, hỗ trợ học viên hoặc khoản phát sinh."
                              badge="Phát sinh"
                              badgeClassName="border-slate-200 bg-slate-50 text-slate-600"
                              tone="slate"
                              lines={[
                                    "Ghi nhận trực tiếp vào sổ thu chi, không cần chọn kỳ",
                                    "Bắt buộc có mục đích/người nhận hoặc ghi chú rõ ràng",
                              ]}
                        />
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-500">
                        Bước này đang tổ chức lại sổ sách. Trước mắt, các khoản chi được ghi
                        nhận vào{" "}
                        <span className="font-semibold text-slate-700">Sổ thu chi</span>. Sau
                        đó có thể mở rộng thêm mẫu chi định kỳ điện, nước, internet theo từng
                        tháng.
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
      return (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                              <h2 className="text-base font-semibold text-slate-900">Sổ thu chi</h2>
                              <p className="text-sm text-slate-500">
                                    Ghi nhận thu khác, chi phí và dòng tiền phát sinh.
                              </p>
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

      return (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                              {isOut ? (
                                    <CreditCard className="h-4 w-4" />
                              ) : (
                                    <WalletCards className="h-4 w-4" />
                              )}
                        </div>
                        <div>
                              <p className="font-medium text-slate-900">
                                    {transaction.targetName ||
                                          transaction.description ||
                                          "Nghiệp vụ thu chi"}
                              </p>
                              <p className="text-xs text-slate-500">
                                    {formatDate(transaction.transactionDate)} · {transaction.source}
                              </p>
                        </div>
                  </div>
                  <p className={`font-semibold ${isOut ? "text-rose-700" : "text-emerald-700"}`}>
                        {isOut ? "-" : "+"}
                        {formatMoney(transaction.amount)}
                  </p>
            </div>
      );
}
