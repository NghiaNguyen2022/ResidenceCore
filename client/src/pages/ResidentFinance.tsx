import { useEffect, useMemo, useRef, useState } from "react";
import {
      AlertCircle,
      CheckCircle2,
      Coins,
      History,
      Landmark,
      PencilLine,
      ReceiptText,
      WalletCards,
      ChevronDown,
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

function getCurrentVietnamBillingMonth() {
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
      }).formatToParts(new Date());
      const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
      return `${value("year")}-${value("month")}`;
}

function normalizeBillingMonth(value?: string | null) {
      const raw = String(value || "").slice(0, 7);
      return /^\d{4}-\d{2}$/.test(raw) ? raw : "Chưa có kỳ";
}

function getBillingMonthLabel(value?: string | null) {
      const month = normalizeBillingMonth(value);
      if (month === "Chưa có kỳ") return month;
      const [year, monthNumber] = month.split("-");
      return `Tháng ${monthNumber} / ${year}`;
}

function sortMonthKeysAscending(a: string, b: string) {
      if (a === "Chưa có kỳ") return 1;
      if (b === "Chưa có kỳ") return -1;
      return a.localeCompare(b);
}

function groupChargesByMonth(charges: any[]) {
      const map = new Map<string, any[]>();
      charges.forEach((charge) => {
            const key = normalizeBillingMonth(charge?.billingMonth);
            const current = map.get(key) || [];
            current.push(charge);
            map.set(key, current);
      });

      return Array.from(map.entries())
            .sort(([a], [b]) => sortMonthKeysAscending(a, b))
            .map(([month, items]) => {
                  const sortedItems = [...items].sort((a, b) => {
                        const aName = String(a?.periodItemName || a?.feeName || "");
                        const bName = String(b?.periodItemName || b?.feeName || "");
                        return aName.localeCompare(bName, "vi");
                  });
                  const total = sortedItems.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
                  const paid = sortedItems.reduce((sum, item) => sum + Number(item?.paidAmount || 0), 0);
                  const remaining = sortedItems.reduce((sum, item) => sum + Number(item?.remainingAmount || 0), 0);
                  return { month, items: sortedItems, total, paid, remaining };
            });
}

function sortMonthKeysDescending(a: string, b: string) {
      if (a === "Chưa có kỳ") return 1;
      if (b === "Chưa có kỳ") return -1;
      return b.localeCompare(a);
}

function getMonthKeyFromDate(value?: string | null) {
      const raw = String(value || "").slice(0, 7);
      return /^\d{4}-\d{2}$/.test(raw) ? raw : "Chưa có kỳ";
}

function groupPaymentsByMonth(payments: any[]) {
      const map = new Map<string, any[]>();
      payments.forEach((payment) => {
            const key = normalizeBillingMonth(payment?.billingMonth) !== "Chưa có kỳ"
                  ? normalizeBillingMonth(payment?.billingMonth)
                  : getMonthKeyFromDate(payment?.paymentDate || payment?.createdAt);
            const current = map.get(key) || [];
            current.push(payment);
            map.set(key, current);
      });

      return Array.from(map.entries())
            .sort(([a], [b]) => sortMonthKeysDescending(a, b))
            .map(([month, items]) => ({
                  month,
                  items: [...items].sort((a, b) => String(b?.paymentDate || b?.createdAt || "").localeCompare(String(a?.paymentDate || a?.createdAt || ""))),
                  total: items.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
            }));
}

function groupPaidChargesByMonth(charges: any[]) {
      const map = new Map<string, any[]>();
      charges.forEach((charge) => {
            const key = normalizeBillingMonth(charge?.billingMonth);
            const current = map.get(key) || [];
            current.push(charge);
            map.set(key, current);
      });

      return Array.from(map.entries())
            .sort(([a], [b]) => sortMonthKeysDescending(a, b))
            .map(([month, items]) => {
                  const sortedItems = [...items].sort((a, b) => {
                        const aName = String(a?.periodItemName || a?.feeName || "");
                        const bName = String(b?.periodItemName || b?.feeName || "");
                        return aName.localeCompare(bName, "vi");
                  });
                  return {
                        month,
                        items: sortedItems,
                        total: sortedItems.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
                        paid: sortedItems.reduce((sum, item) => sum + Number(item?.paidAmount || item?.amount || 0), 0),
                        remaining: sortedItems.reduce((sum, item) => sum + Number(item?.remainingAmount || 0), 0),
                  };
            });
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

function ChargeStatusBadge({ charge }: { charge: any }) {
      const remaining = Number(charge.remainingAmount || 0);
      const isPaid = String(charge.status || "") === "paid" || remaining <= 0;

      return (
            <span
                  className={
                        isPaid
                              ? "rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                              : "rounded-full border border-[#f0d48a] bg-[#fff7df] px-2.5 py-1 text-[11px] font-semibold text-[#9a5f08]"
                  }
            >
                  {isPaid ? "Đã đóng" : getStatusLabel(charge.status)}
            </span>
      );
}

function MonthStatusChip({
      group,
      selected,
      isCurrentMonth,
      onClick,
}: {
      group: any;
      selected: boolean;
      isCurrentMonth: boolean;
      onClick: () => void;
}) {
      const fullyPaid = Number(group.remaining || 0) <= 0;
      const monthText = group.month === "Chưa có kỳ" ? "Khác" : `T${String(group.month).slice(5, 7)}`;
      return (
            <button
                  type="button"
                  onClick={onClick}
                  className={
                        selected
                              ? "min-w-[104px] rounded-[22px] border border-[#d7a63b] bg-[linear-gradient(135deg,#fff7df_0%,#f3d175_100%)] px-3 py-2.5 text-left shadow-[0_12px_26px_rgba(180,122,20,0.20),inset_0_1px_0_rgba(255,255,255,0.9)]"
                              : fullyPaid
                                    ? "min-w-[104px] rounded-[22px] border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200"
                                    : "min-w-[104px] rounded-[22px] border border-[#eadfca] bg-white/90 px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#e0c37a]"
                  }
            >
                  <div className="flex items-center justify-between gap-2">
                        <span className={selected ? "text-base font-extrabold text-[#513a10]" : "text-base font-bold text-[#18243c]"}>{monthText}</span>
                        {isCurrentMonth ? <span className="h-2 w-2 rounded-full bg-[#d6a63d]" /> : null}
                  </div>
                  <p className={fullyPaid ? "mt-1 text-xs font-semibold text-emerald-700" : "mt-1 text-xs font-semibold text-[#a05a12]"}>
                        {fullyPaid ? "Đã đóng" : `Còn ${formatMoney(group.remaining)}`}
                  </p>
            </button>
      );
}

function ChargeFeeRow({ charge }: { charge: any }) {
      const remaining = Number(charge.remainingAmount || 0);
      const isPaid = String(charge.status || "") === "paid" || remaining <= 0;
      return (
            <div className="flex items-center justify-between gap-3 border-t border-[#f1e7d3] px-4 py-3 first:border-t-0">
                  <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#18243c]">{charge.periodItemName || charge.feeName || "Khoản phí"}</p>
                              <ChargeStatusBadge charge={charge} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                              Đã thu {formatMoney(charge.paidAmount)} / {formatMoney(charge.amount)}
                        </p>
                  </div>
                  <div className="shrink-0 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{isPaid ? "Hoàn tất" : "Còn"}</p>
                        <p className={isPaid ? "mt-0.5 text-sm font-bold text-emerald-700" : "mt-0.5 text-base font-extrabold text-[#a05a12]"}>
                              {formatMoney(charge.remainingAmount)}
                        </p>
                  </div>
            </div>
      );
}

function ChargeMonthGroupCard({
      group,
      isCurrentMonth,
      isExpanded,
      cardRef,
      onToggle,
}: {
      group: any;
      isCurrentMonth: boolean;
      isExpanded: boolean;
      cardRef?: (node: HTMLElement | null) => void;
      onToggle: () => void;
}) {
      const fullyPaid = Number(group.remaining || 0) <= 0;
      const progress = Number(group.total || 0) > 0 ? Math.min(100, Math.max(0, (Number(group.paid || 0) / Number(group.total || 0)) * 100)) : 0;

      return (
            <article
                  ref={cardRef}
                  className={
                        isExpanded
                              ? "scroll-mt-24 overflow-hidden rounded-[28px] border border-[#d8a735] bg-[linear-gradient(180deg,#fffdf8_0%,#fff4d4_100%)] shadow-[0_18px_46px_rgba(163,111,22,0.16),inset_0_1px_0_rgba(255,255,255,0.94)]"
                              : "scroll-mt-24 overflow-hidden rounded-[28px] border border-[#eadfca] bg-white/92 shadow-[0_10px_26px_rgba(91,68,28,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  }
            >
                  <button type="button" onClick={onToggle} className="w-full px-4 py-4 text-left">
                        <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <h3 className="text-xl font-extrabold tracking-tight text-[#101a2f]">{getBillingMonthLabel(group.month)}</h3>
                                          {isCurrentMonth ? (
                                                <span className="rounded-full border border-[#e1b75a] bg-[#fff7df] px-2.5 py-1 text-[11px] font-semibold text-[#8a5305]">
                                                      Hiện tại
                                                </span>
                                          ) : null}
                                          <span
                                                className={
                                                      fullyPaid
                                                            ? "rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                                                            : "rounded-full border border-[#f0d48a] bg-[#fff7df] px-2.5 py-1 text-[11px] font-semibold text-[#9a5f08]"
                                                }
                                          >
                                                {fullyPaid ? "Đã đóng đủ" : `Còn ${formatMoney(group.remaining)}`}
                                          </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">{group.items.length} khoản phí trong tháng</p>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                    <div className="hidden min-w-[180px] rounded-2xl border border-[#efe4cb] bg-[#fffaf0] px-3 py-2 text-right sm:block">
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tổng tháng</p>
                                          <p className="mt-0.5 text-base font-extrabold text-[#18243c]">{formatMoney(group.total)}</p>
                                          <div className="mt-1 flex items-center justify-end gap-3 text-[11px] font-medium text-slate-500">
                                                <span>Đã thu {formatMoney(group.paid)}</span>
                                                <span>Còn {formatMoney(group.remaining)}</span>
                                          </div>
                                    </div>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#eadfca] bg-white/85 text-slate-500 shadow-sm">
                                          <ChevronDown className={isExpanded ? "h-4 w-4 rotate-180 transition" : "h-4 w-4 transition"} />
                                    </span>
                              </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf2f7] shadow-inner">
                              <div className={fullyPaid ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-[linear-gradient(90deg,#32a873_0%,#f0c96d_100%)]"} style={{ width: `${progress}%` }} />
                        </div>
                  </button>

                  {isExpanded ? (
                        <div className="border-t border-[#efe4cb] bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,rgba(255,250,240,0.86)_100%)]">
                              <div className="grid grid-cols-3 gap-2 px-4 py-3 sm:hidden">
                                    <SummaryPill label="Tổng" value={formatMoney(group.total)} />
                                    <SummaryPill label="Đã thu" value={formatMoney(group.paid)} />
                                    <SummaryPill label="Còn" value={formatMoney(group.remaining)} />
                              </div>
                              {group.items.map((charge: any) => (
                                    <ChargeFeeRow key={charge.id} charge={charge} />
                              ))}
                        </div>
                  ) : null}
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
                                    {getBillingMonthLabel(charge.billingMonth) || charge.periodName || "Kỳ hiện tại"}
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
      const historyEntries = Array.isArray(advance?.actualEntries) ? advance.actualEntries : [];
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

                  <div className="mt-4 rounded-2xl border border-[#efe4cb] bg-white/75 p-3">
                        <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lịch sử chi thực tế</p>
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                    {historyEntries.length} lần cập nhật
                              </span>
                        </div>

                        {historyEntries.length ? (
                              <div className="mt-3 space-y-2">
                                    {historyEntries.slice(0, 5).map((entry: any) => (
                                          <div key={entry.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                                                <div className="min-w-0">
                                                      <p className="truncate text-sm font-semibold text-[#18243c]">{entry.description || "Chi thực tế"}</p>
                                                      <p className="mt-0.5 text-xs text-slate-500">{entry.transactionDate || entry.createdAt}</p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                      <p className="text-sm font-bold text-[#18243c]">{formatMoney(entry.amount)}</p>
                                                </div>
                                          </div>
                                    ))}
                                    {historyEntries.length > 5 ? (
                                          <p className="px-1 text-xs text-slate-500">+ {historyEntries.length - 5} lần cập nhật trước đó</p>
                                    ) : null}
                              </div>
                        ) : (
                              <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                                    Chưa có khoản chi thực tế nào được ghi nhận cho tạm ứng này.
                              </p>
                        )}
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

function PaymentHistoryMonthCard({ group }: { group: any }) {
      return (
            <article className="rounded-[24px] border border-[#eadfca] bg-white/92 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h3 className="text-lg font-bold text-[#18243c]">{getBillingMonthLabel(group.month)}</h3>
                              <p className="mt-1 text-sm text-slate-500">{group.items.length} phiếu thu · Tổng {formatMoney(group.total)}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">Đã thu trong tháng</p>
                              <p className="mt-1 text-base font-bold text-emerald-700">{formatMoney(group.total)}</p>
                        </div>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-[#f1e7d3] pt-3">
                        {group.items.map((payment: any) => (
                              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                                    <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-[#18243c]">{payment.periodItemName || payment.feeName || "Khoản học viên"}</p>
                                          <p className="mt-0.5 text-xs text-slate-500">{payment.paymentDate || payment.createdAt}</p>
                                    </div>
                                    <div className="shrink-0 text-sm font-bold text-emerald-700">{formatMoney(payment.amount)}</div>
                              </div>
                        ))}
                  </div>
            </article>
      );
}

function PaidChargeMonthCard({ group }: { group: any }) {
      return (
            <article className="rounded-[24px] border border-[#eadfca] bg-white/92 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h3 className="text-lg font-bold text-[#18243c]">{getBillingMonthLabel(group.month)}</h3>
                              <p className="mt-1 text-sm text-slate-500">{group.items.length} khoản phí đã hoàn tất</p>
                        </div>
                        <div className="grid min-w-[240px] grid-cols-3 gap-2 rounded-2xl border border-[#efe4cb] bg-[#fffaf0] px-3 py-2 text-right">
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tổng</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatMoney(group.total)}</p>
                              </div>
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Đã thu</p>
                                    <p className="mt-1 text-sm font-semibold text-emerald-700">{formatMoney(group.paid)}</p>
                              </div>
                              <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Còn</p>
                                    <p className="mt-1 text-sm font-bold text-slate-700">{formatMoney(group.remaining)}</p>
                              </div>
                        </div>
                  </div>
                  <div className="mt-3 space-y-2 border-t border-[#f1e7d3] pt-3">
                        {group.items.map((charge: any) => (
                              <div key={charge.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                                    <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-[#18243c]">{charge.periodItemName || charge.feeName || "Khoản phí"}</p>
                                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Đã đóng</span>
                                          </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                          <p className="text-sm font-bold text-[#18243c]">{formatMoney(charge.amount)}</p>
                                    </div>
                              </div>
                        ))}
                  </div>
            </article>
      );
}

export default function ResidentFinance() {
      const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
      const [entryAmount, setEntryAmount] = useState("");
      const [entryDescription, setEntryDescription] = useState("");
      const [entryDate, setEntryDate] = useState(getVietnamDateInputValue());
      const [entryError, setEntryError] = useState<string | null>(null);
      const currentMonthRef = useRef<HTMLElement | null>(null);
      const monthCardRefs = useRef<Record<string, HTMLElement | null>>({});
      const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

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

      const currentBillingMonth = useMemo(() => getCurrentVietnamBillingMonth(), []);
      const openChargeMonthGroups = useMemo(() => groupChargesByMonth(openCharges), [openCharges]);
      const paymentMonthGroups = useMemo(() => groupPaymentsByMonth(payments), [payments]);
      const paidChargeMonthGroups = useMemo(() => groupPaidChargesByMonth(paidCharges), [paidCharges]);

      useEffect(() => {
            if (financeQuery.isLoading || !openChargeMonthGroups.length) return;
            if (expandedMonth && openChargeMonthGroups.some((group: any) => group.month === expandedMonth)) return;
            const currentGroup = openChargeMonthGroups.find((group: any) => group.month === currentBillingMonth);
            const firstUnpaidGroup = openChargeMonthGroups.find((group: any) => Number(group.remaining || 0) > 0);
            setExpandedMonth((currentGroup || firstUnpaidGroup || openChargeMonthGroups[0])?.month || null);
      }, [financeQuery.isLoading, openChargeMonthGroups, currentBillingMonth, expandedMonth]);

      useEffect(() => {
            if (!financeQuery.isLoading && expandedMonth && monthCardRefs.current[expandedMonth]) {
                  window.setTimeout(() => {
                        monthCardRefs.current[expandedMonth]?.scrollIntoView({ block: "center", behavior: "smooth" });
                  }, 180);
            }
      }, [financeQuery.isLoading, expandedMonth]);

      function focusMonth(month: string) {
            setExpandedMonth(month);
      }

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

                                    <section className="rounded-[32px] border border-[#eadfca] bg-white/90 p-4 shadow-[0_18px_48px_rgba(91,68,28,0.08)] sm:p-5">
                                          <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a12]">Khoản cần thanh toán</p>
                                                      <h2 className="mt-1 text-2xl font-bold text-[#101a2f]">Theo dõi theo tháng</h2>
                                                      <p className="mt-1 text-sm text-slate-500">Mỗi tháng là một dòng chính. Bấm vào tháng để xem chi tiết khoản phí.</p>
                                                </div>
                                                <span className="shrink-0 rounded-full border border-[#f0d48a] bg-[#fff7df] px-3 py-1.5 text-sm font-semibold text-[#9a5f08]">
                                                      {openChargeMonthGroups.length} tháng
                                                </span>
                                          </div>

                                          {openChargeMonthGroups.length ? (
                                                <>
                                                      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                            {openChargeMonthGroups.map((group: any) => (
                                                                  <MonthStatusChip
                                                                        key={group.month}
                                                                        group={group}
                                                                        selected={expandedMonth === group.month}
                                                                        isCurrentMonth={group.month === currentBillingMonth}
                                                                        onClick={() => focusMonth(group.month)}
                                                                  />
                                                            ))}
                                                      </div>
                                                      <div className="space-y-3">
                                                            {openChargeMonthGroups.map((group: any) => (
                                                                  <ChargeMonthGroupCard
                                                                        key={group.month}
                                                                        group={group}
                                                                        isCurrentMonth={group.month === currentBillingMonth}
                                                                        isExpanded={expandedMonth === group.month}
                                                                        onToggle={() => setExpandedMonth(expandedMonth === group.month ? null : group.month)}
                                                                        cardRef={(node) => {
                                                                              monthCardRefs.current[group.month] = node;
                                                                              if (group.month === currentBillingMonth) currentMonthRef.current = node;
                                                                        }}
                                                                  />
                                                            ))}
                                                      </div>
                                                </>
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
                                                            <h2 className="text-xl font-bold text-[#101a2f]">Phiếu thu theo tháng</h2>
                                                      </div>
                                                </div>

                                                {paymentMonthGroups.length ? (
                                                      <div className="mt-4 space-y-3">
                                                            {paymentMonthGroups.map((group: any) => (
                                                                  <PaymentHistoryMonthCard key={group.month} group={group} />
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
                                                            <h2 className="text-xl font-bold text-[#101a2f]">Đã đóng đủ theo tháng</h2>
                                                      </div>
                                                </div>
                                                {paidChargeMonthGroups.length ? (
                                                      <div className="mt-4 space-y-3">
                                                            {paidChargeMonthGroups.map((group: any) => (
                                                                  <PaidChargeMonthCard key={group.month} group={group} />
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
