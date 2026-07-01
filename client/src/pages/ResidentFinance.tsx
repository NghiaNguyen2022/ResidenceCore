import { useMemo, useState } from "react";
import {
      AlertCircle,
      BadgeDollarSign,
      CalendarDays,
      CheckCircle2,
      Coins,
      History,
      Landmark,
      PencilLine,
      ReceiptText,
      WalletCards,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { trpc } from "@/lib/trpc";

function formatMoney(value: unknown) {
      const numberValue = Number(value || 0);
      return `${new Intl.NumberFormat("vi-VN").format(Number.isFinite(numberValue) ? numberValue : 0)}đ`;
}

function getVietnamDateInputValue() {
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(new Date());
      const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
      return `${value("year")}-${value("month")}-${value("day")}`;
}

function getStatusLabel(status?: string | null) {
      switch (status) {
            case "paid":
                  return "Đã đóng";
            case "partial":
                  return "Đóng một phần";
            case "overdue":
                  return "Quá hạn";
            case "holding":
                  return "Đang giữ tiền";
            case "partial_spent":
                  return "Đã chi một phần";
            case "settled":
                  return "Đã quyết toán";
            case "over_spent":
                  return "Vượt chi";
            default:
                  return "Chưa đóng";
      }
}

function getAdvanceTitle(item: any) {
      const category = String(item?.category || "advance");
      if (category.includes("market")) return "Tạm ứng tiền chợ";
      if (category.includes("flowers") || category.includes("lights")) return "Tạm ứng hoa nến";
      if (category.includes("stationery")) return "Tạm ứng văn phòng phẩm";
      if (category.includes("supplies")) return "Tạm ứng vật dụng";
      return item?.targetName || "Khoản tạm ứng";
}

function getAdvancePeriodText(item: any) {
      const start = item?.periodStart;
      const end = item?.periodEnd;
      if (start && end && start !== end) return `${start} → ${end}`;
      if (start) return start;
      return "Theo kỳ";
}

function SummaryCard({
      title,
      value,
      description,
      icon: Icon,
      tone = "amber",
}: {
      title: string;
      value: string;
      description: string;
      icon: any;
      tone?: "amber" | "emerald" | "blue" | "slate";
}) {
      const toneClass =
            tone === "emerald"
                  ? "border-emerald-100 bg-emerald-50/70 text-emerald-800"
                  : tone === "blue"
                        ? "border-sky-100 bg-sky-50/70 text-sky-800"
                        : tone === "slate"
                              ? "border-slate-200 bg-slate-50 text-slate-700"
                              : "border-[#ead9ad] bg-[#fff6dd] text-[#805006]";

      return (
            <article className="rounded-[28px] border border-[#eadfca] bg-white/85 p-5 shadow-[0_16px_38px_rgba(91,68,28,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <div className="flex items-start justify-between gap-4">
                        <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
                              <p className="mt-2 text-2xl font-bold tracking-tight text-[#101a2f]">{value}</p>
                              <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
                        </div>
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
                              <Icon className="h-5 w-5" />
                        </div>
                  </div>
            </article>
      );
}

function ChargeCard({ charge }: { charge: any }) {
      const remaining = Number(charge.remainingAmount || 0);
      const isPaid = String(charge.status || "") === "paid" || remaining <= 0;

      return (
            <article className="rounded-[24px] border border-[#eadfca] bg-white/90 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-semibold text-[#18243c]">
                                          {charge.periodItemName || charge.feeName || "Khoản phí học viên"}
                                    </h3>
                                    <span
                                          className={
                                                isPaid
                                                      ? "rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                                      : "rounded-full border border-[#f0d48a] bg-[#fff7df] px-2.5 py-1 text-xs font-semibold text-[#9a5f08]"
                                          }
                                    >
                                          {isPaid ? "Đã đóng" : getStatusLabel(charge.status)}
                                    </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-500">
                                    {charge.billingMonth || charge.periodName || "Kỳ hiện tại"}
                                    {charge.dueDate ? ` · Hạn ${charge.dueDate}` : ""}
                              </p>
                        </div>

                        <div className="grid min-w-[260px] grid-cols-3 gap-2 rounded-2xl border border-[#efe4cb] bg-[#fffaf0] px-3 py-2 text-right">
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tổng</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatMoney(charge.amount)}</p>
                              </div>
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Đã thu</p>
                                    <p className="mt-1 text-sm font-semibold text-emerald-700">{formatMoney(charge.paidAmount)}</p>
                              </div>
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Còn</p>
                                    <p className="mt-1 text-sm font-bold text-[#a05a12]">{formatMoney(charge.remainingAmount)}</p>
                              </div>
                        </div>
                  </div>
            </article>
      );
}

function AdvanceCard({
      advance,
      onUpdate,
      scopeLabel,
}: {
      advance: any;
      onUpdate: (advance: any) => void;
      scopeLabel: string;
}) {
      const balance = Number(advance.balanceAmount || 0);
      return (
            <article className="rounded-[26px] border border-[#eadfca] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7e6_100%)] p-4 shadow-[0_12px_26px_rgba(91,68,28,0.08)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-bold text-[#18243c]">{getAdvanceTitle(advance)}</h3>
                                    <span className="rounded-full border border-[#f0d48a] bg-[#fff7df] px-2.5 py-1 text-xs font-semibold text-[#9a5f08]">
                                          {scopeLabel}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                          {getStatusLabel(advance.status)}
                                    </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-500">
                                    {advance.targetName || "Đối tượng nhận"} · {getAdvancePeriodText(advance)}
                              </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#efe4cb] bg-white/80 px-3 py-2 text-right">
                                    <div>
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tạm ứng</p>
                                          <p className="mt-1 text-sm font-semibold text-slate-700">{formatMoney(advance.advanceAmount)}</p>
                                    </div>
                                    <div>
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Đã chi</p>
                                          <p className="mt-1 text-sm font-semibold text-slate-700">{formatMoney(advance.actualAmount)}</p>
                                    </div>
                                    <div>
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Còn giữ</p>
                                          <p className={balance < 0 ? "mt-1 text-sm font-bold text-rose-600" : "mt-1 text-sm font-bold text-[#a05a12]"}>
                                                {formatMoney(balance)}
                                          </p>
                                    </div>
                              </div>

                              <button
                                    type="button"
                                    onClick={() => onUpdate(advance)}
                                    className="inline-flex items-center justify-center rounded-2xl border border-[#e5c06a] bg-[linear-gradient(135deg,#fff8dc_0%,#f2d28a_100%)] px-4 py-3 text-sm font-semibold text-[#513a10] shadow-[0_10px_20px_rgba(201,155,44,0.18)] transition hover:-translate-y-0.5"
                              >
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    Cập nhật chi
                              </button>
                        </div>
                  </div>
            </article>
      );
}

function AdvanceEntryModal({
      advance,
      amount,
      description,
      transactionDate,
      isSaving,
      error,
      onAmountChange,
      onDescriptionChange,
      onDateChange,
      onClose,
      onSubmit,
}: {
      advance: any;
      amount: string;
      description: string;
      transactionDate: string;
      isSaving: boolean;
      error?: string | null;
      onAmountChange: (value: string) => void;
      onDescriptionChange: (value: string) => void;
      onDateChange: (value: string) => void;
      onClose: () => void;
      onSubmit: () => void;
}) {
      if (!advance) return null;

      return (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#ead9ad] bg-[#fffdf8] shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
                        <div className="border-b border-[#efe4cb] bg-[linear-gradient(135deg,#fffdf8_0%,#fff0c7_100%)] px-6 py-5">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cập nhật chi thực tế</p>
                              <h2 className="mt-2 text-2xl font-bold text-[#101a2f]">{getAdvanceTitle(advance)}</h2>
                              <p className="mt-1 text-sm text-slate-600">Khoản này chỉ cấn trừ vào số tiền tạm ứng đang giữ, không tạo dòng tiền ra lần hai.</p>
                        </div>

                        <div className="space-y-4 p-6">
                              <div className="grid gap-3 sm:grid-cols-3">
                                    <SummaryPill label="Tạm ứng" value={formatMoney(advance.advanceAmount)} />
                                    <SummaryPill label="Đã chi" value={formatMoney(advance.actualAmount)} />
                                    <SummaryPill label="Còn giữ" value={formatMoney(advance.balanceAmount)} />
                              </div>

                              {error ? (
                                    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                          {error}
                                    </div>
                              ) : null}

                              <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block">
                                          <span className="text-sm font-semibold text-slate-700">Số tiền thực chi</span>
                                          <input
                                                value={amount}
                                                onChange={(event) => onAmountChange(event.target.value)}
                                                inputMode="numeric"
                                                className="mt-2 w-full rounded-2xl border border-[#e4d8bf] bg-white px-4 py-3 text-right text-base font-semibold text-slate-900 outline-none focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100"
                                                placeholder="0"
                                          />
                                    </label>
                                    <label className="block">
                                          <span className="text-sm font-semibold text-slate-700">Ngày chi</span>
                                          <input
                                                type="date"
                                                value={transactionDate}
                                                onChange={(event) => onDateChange(event.target.value)}
                                                className="mt-2 w-full rounded-2xl border border-[#e4d8bf] bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100"
                                          />
                                    </label>
                              </div>

                              <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">Nội dung chi</span>
                                    <textarea
                                          value={description}
                                          onChange={(event) => onDescriptionChange(event.target.value)}
                                          rows={3}
                                          className="mt-2 w-full rounded-2xl border border-[#e4d8bf] bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100"
                                          placeholder="Ví dụ: Đi chợ ngày 01/07, mua thực phẩm bữa trưa..."
                                    />
                              </label>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#efe4cb] bg-white/80 px-6 py-4">
                              <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
                                    Đóng
                              </button>
                              <button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={isSaving}
                                    className="rounded-2xl bg-[#101a2f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                    {isSaving ? "Đang lưu..." : "Lưu thực chi"}
                              </button>
                        </div>
                  </div>
            </div>
      );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
      return (
            <div className="rounded-2xl border border-[#efe4cb] bg-white/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className="mt-1 text-base font-bold text-[#101a2f]">{value}</p>
            </div>
      );
}

export default function ResidentFinance() {
      const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
      const [entryAmount, setEntryAmount] = useState("");
      const [entryDescription, setEntryDescription] = useState("");
      const [entryDate, setEntryDate] = useState(getVietnamDateInputValue());
      const [entryError, setEntryError] = useState<string | null>(null);

      const financeQuery = trpc.residentPortal.getMyFinanceOverview.useQuery(undefined, {
            retry: false,
            refetchOnWindowFocus: false,
      });

      const createEntryMutation = trpc.residentPortal.createMyAdvanceExpenseEntry.useMutation({
            onSuccess: async () => {
                  setSelectedAdvance(null);
                  setEntryAmount("");
                  setEntryDescription("");
                  setEntryError(null);
                  await financeQuery.refetch();
            },
            onError: (error: any) => {
                  setEntryError(error?.message || "Không thể cập nhật khoản chi thực tế.");
            },
      });

      const data: any = financeQuery.data || {};
      const summary = data.summary || {};
      const openCharges = Array.isArray(data.openCharges) ? data.openCharges : [];
      const paidCharges = Array.isArray(data.paidCharges) ? data.paidCharges : [];
      const payments = Array.isArray(data.payments) ? data.payments : [];
      const personalAdvances = Array.isArray(data.personalAdvances) ? data.personalAdvances : [];
      const unitAdvances = Array.isArray(data.unitAdvances) ? data.unitAdvances : [];

      const recentPayments = useMemo(() => payments.slice(0, 5), [payments]);

      function openAdvanceEntryModal(advance: any) {
            setSelectedAdvance(advance);
            setEntryAmount("");
            setEntryDescription("");
            setEntryDate(getVietnamDateInputValue());
            setEntryError(null);
      }

      function submitAdvanceEntry() {
            if (!selectedAdvance) return;
            const amount = Number(String(entryAmount || "").replace(/[^0-9.-]/g, ""));
            if (!amount || amount <= 0) {
                  setEntryError("Vui lòng nhập số tiền thực chi hợp lệ.");
                  return;
            }
            if (!entryDescription.trim()) {
                  setEntryError("Vui lòng nhập nội dung chi thực tế.");
                  return;
            }
            createEntryMutation.mutate({
                  advanceId: Number(selectedAdvance.id),
                  amount,
                  transactionDate: entryDate,
                  description: entryDescription.trim(),
            });
      }

      return (
            <ResidenceCareLayout>
                  <div className="mx-auto max-w-7xl space-y-5">
                        <section className="overflow-hidden rounded-[34px] border border-[#ead9ad] bg-[radial-gradient(circle_at_top_left,rgba(246,201,92,0.16),transparent_34%),linear-gradient(180deg,#fffdf8_0%,#fbf4e4_100%)] p-6 shadow-[0_24px_70px_rgba(91,68,28,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a12]">Tài chính cá nhân</p>
                              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="max-w-3xl">
                                          <h1 className="text-4xl font-bold tracking-tight text-[#101a2f]">Tài chính của tôi</h1>
                                          <p className="mt-3 text-sm leading-6 text-slate-600">
                                                Theo dõi khoản cần đóng, lịch sử đã thanh toán và các khoản tạm ứng được giao cho cá nhân hoặc đơn vị đang phụ trách.
                                          </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#ead9ad] bg-white/75 px-4 py-3 text-sm text-slate-600 shadow-sm">
                                          Dữ liệu hiển thị theo giờ Việt Nam
                                    </div>
                              </div>
                        </section>

                        {financeQuery.isLoading ? (
                              <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="h-6 w-64 animate-pulse rounded bg-slate-100" />
                                    <div className="mt-5 grid gap-4 md:grid-cols-4">
                                          {[0, 1, 2, 3].map((item) => (
                                                <div key={item} className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                                          ))}
                                    </div>
                              </section>
                        ) : financeQuery.error ? (
                              <section className="rounded-[30px] border border-rose-100 bg-rose-50 p-6 text-rose-700">
                                    <div className="flex items-start gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5" />
                                          <div>
                                                <h2 className="font-semibold">Không thể tải tài chính</h2>
                                                <p className="mt-1 text-sm">{financeQuery.error.message}</p>
                                          </div>
                                    </div>
                              </section>
                        ) : (
                              <>
                                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                          <SummaryCard
                                                title="Cần thanh toán"
                                                value={formatMoney(summary.totalDue)}
                                                description={`${summary.openChargeCount || 0} khoản còn phải đóng`}
                                                icon={WalletCards}
                                          />
                                          <SummaryCard
                                                title="Đã thanh toán"
                                                value={formatMoney(summary.totalPaid)}
                                                description={`${summary.paidChargeCount || 0} khoản đã đóng đủ`}
                                                icon={CheckCircle2}
                                                tone="emerald"
                                          />
                                          <SummaryCard
                                                title="Tạm ứng cá nhân"
                                                value={formatMoney(summary.personalAdvanceBalance)}
                                                description={`${summary.personalAdvanceCount || 0} khoản đang theo dõi`}
                                                icon={Coins}
                                                tone="blue"
                                          />
                                          <SummaryCard
                                                title="Tạm ứng đơn vị"
                                                value={formatMoney(summary.unitAdvanceBalance)}
                                                description={`${summary.unitAdvanceCount || 0} khoản theo Tổ/Ban phụ trách`}
                                                icon={Landmark}
                                                tone="slate"
                                          />
                                    </section>

                                    <section className="rounded-[32px] border border-[#eadfca] bg-white/90 p-5 shadow-[0_18px_48px_rgba(91,68,28,0.08)]">
                                          <div className="mb-4 flex items-center justify-between gap-3">
                                                <div>
                                                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Khoản cần thanh toán</p>
                                                      <h2 className="mt-1 text-2xl font-bold text-[#101a2f]">Công nợ học viên</h2>
                                                </div>
                                                <span className="rounded-full border border-[#f0d48a] bg-[#fff7df] px-3 py-1.5 text-sm font-semibold text-[#9a5f08]">
                                                      {openCharges.length} khoản
                                                </span>
                                          </div>

                                          {openCharges.length ? (
                                                <div className="space-y-3">
                                                      {openCharges.map((charge: any) => (
                                                            <ChargeCard key={charge.id} charge={charge} />
                                                      ))}
                                                </div>
                                          ) : (
                                                <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-8 text-center text-emerald-700">
                                                      <CheckCircle2 className="mx-auto h-8 w-8" />
                                                      <p className="mt-3 font-semibold">Không có khoản cần thanh toán.</p>
                                                      <p className="mt-1 text-sm">Các khoản đã đóng sẽ nằm ở lịch sử bên dưới.</p>
                                                </div>
                                          )}
                                    </section>

                                    {(personalAdvances.length > 0 || unitAdvances.length > 0) && (
                                          <section className="rounded-[32px] border border-[#eadfca] bg-[#fffdf8] p-5 shadow-[0_18px_48px_rgba(91,68,28,0.08)]">
                                                <div className="mb-4">
                                                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tạm ứng được giao</p>
                                                      <h2 className="mt-1 text-2xl font-bold text-[#101a2f]">Cập nhật chi thực tế theo kỳ</h2>
                                                      <p className="mt-1 text-sm text-slate-500">Thực chi từ tạm ứng chỉ làm giảm số tiền đang giữ, không tạo dòng tiền ra khỏi quỹ lần hai.</p>
                                                </div>

                                                <div className="space-y-3">
                                                      {personalAdvances.map((advance: any) => (
                                                            <AdvanceCard key={`personal-${advance.id}`} advance={advance} scopeLabel="Cá nhân" onUpdate={openAdvanceEntryModal} />
                                                      ))}
                                                      {unitAdvances.map((advance: any) => (
                                                            <AdvanceCard key={`unit-${advance.id}`} advance={advance} scopeLabel="Tổ/Ban" onUpdate={openAdvanceEntryModal} />
                                                      ))}
                                                </div>
                                          </section>
                                    )}

                                    <section className="grid gap-4 lg:grid-cols-2">
                                          <article className="rounded-[32px] border border-[#eadfca] bg-white/90 p-5 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                                            <History className="h-5 w-5" />
                                                      </div>
                                                      <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lịch sử thanh toán</p>
                                                            <h2 className="text-xl font-bold text-[#101a2f]">Phiếu thu gần đây</h2>
                                                      </div>
                                                </div>

                                                {recentPayments.length ? (
                                                      <div className="mt-4 space-y-2">
                                                            {recentPayments.map((payment: any) => (
                                                                  <div key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                                                        <div>
                                                                              <p className="font-semibold text-slate-800">{payment.periodItemName || payment.feeName || "Khoản học viên"}</p>
                                                                              <p className="mt-0.5 text-xs text-slate-500">{payment.paymentDate || payment.createdAt}</p>
                                                                        </div>
                                                                        <div className="font-bold text-emerald-700">{formatMoney(payment.amount)}</div>
                                                                  </div>
                                                            ))}
                                                      </div>
                                                ) : (
                                                      <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Chưa có phiếu thu nào.</p>
                                                )}
                                          </article>

                                          <article className="rounded-[32px] border border-[#eadfca] bg-white/90 p-5 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7df] text-[#9a5f08]">
                                                            <ReceiptText className="h-5 w-5" />
                                                      </div>
                                                      <div>
                                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lịch sử khoản phí</p>
                                                            <h2 className="text-xl font-bold text-[#101a2f]">Đã đóng đủ</h2>
                                                      </div>
                                                </div>
                                                {paidCharges.length ? (
                                                      <div className="mt-4 space-y-2">
                                                            {paidCharges.slice(0, 5).map((charge: any) => (
                                                                  <ChargeCard key={charge.id} charge={charge} />
                                                            ))}
                                                      </div>
                                                ) : (
                                                      <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Chưa có khoản phí đã đóng đủ.</p>
                                                )}
                                          </article>
                                    </section>
                              </>
                        )}
                  </div>

                  <AdvanceEntryModal
                        advance={selectedAdvance}
                        amount={entryAmount}
                        description={entryDescription}
                        transactionDate={entryDate}
                        isSaving={createEntryMutation.isPending}
                        error={entryError}
                        onAmountChange={setEntryAmount}
                        onDescriptionChange={setEntryDescription}
                        onDateChange={setEntryDate}
                        onClose={() => setSelectedAdvance(null)}
                        onSubmit={submitAdvanceEntry}
                  />
            </ResidenceCareLayout>
      );
}
