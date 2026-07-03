"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { CheckCircle2, Pencil, Plus, Printer, Search } from "lucide-react";

import { InlineBadge } from "@/components/shared/display/InlineBadge";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import type { ChargeStatus } from "./financeLiteTypes";
import {
      formatMoney,
      formatMoneyInput,
      getBillingMonthLabel,
      getStatusClass,
      getStatusLabel,
      periodContainsBillingMonth,
      toMoneyNumber,
} from "./financeLiteUtils";

type FinanceLiteStudentLedgerProps = {
      periods: any[];
      selectedPeriod: any;
      selectedPeriodMonths: any[];
      selectedBillingMonth: string;
      currentBillingMonth: string;
      monthCardRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
      selectPeriodMonth: (period: any, billingMonth?: string) => void;
      setPeriodFormOpen: (value: boolean) => void;
      groupedCharges: any[];
      paginatedGroupedCharges: any[];
      studentLedgerPageSize: number;
      setStudentLedgerPageSize: (value: number) => void;
      setStudentLedgerPage: Dispatch<SetStateAction<number>>;
      studentLedgerStartIndex: number;
      studentLedgerEndIndex: number;
      studentLedgerTotalPages: number;
      safeStudentLedgerPage: number;
      searchTerm: string;
      setSearchTerm: (value: string) => void;
      statusFilter: ChargeStatus;
      setStatusFilter: (value: ChargeStatus) => void;
      openGroupedPayment: () => void;
      openGroupPaymentForChargeGroup: (group: any) => void;
      openEditCharge: (charge: any) => void;
      onCancelCharge: (charge: any) => void;
      applyPanelOpen: boolean;
      setApplyPanelOpen: Dispatch<SetStateAction<boolean>>;
      selectionMessage: string;
      projectedApplySummary: any;
      hasSelectedApplicableItems: boolean;
      applyPeriodMutationPending: boolean;
      submitApplyPeriod: () => void;
      periodItems: any[];
      previewResidents: any[];
      previewQuery: any;
      residentSelections: Record<string, Record<string, { selected: boolean; amount: string }>>;
      detail: any;
      getPeriodMonthsFromPeriod: (period: any) => Array<{ value: string; label: string }>;
      getMonthChargeStats: (period: any, billingMonth: string) => {
            chargeCount: number;
            residentCount: number;
            paidAmount: number;
            remainingAmount: number;
      };
      getPeriodItemSelectedCount: (itemId: number) => number;
      isPeriodItemSelectedForAllEligible: (itemId: number) => boolean;
      getPeriodItemEligibleResidents: (itemId: number) => any[];
      togglePeriodItemForAllEligible: (
            itemId: number,
            checked: boolean,
            amount: string | number,
      ) => void;
      applyDefaultForAllEligible: () => void;
      clearAllSelections: () => void;
      isResidentItemAlreadyApplied: (resident: any, item: any) => boolean;
      isResidentItemSelectable: (resident: any, item: any) => boolean;
      toggleResidentItem: (residentId: number, itemId: number, checked: boolean) => void;
      updateResidentItemAmount: (
            residentId: number,
            itemId: number,
            amount: string,
      ) => void;
};

export function FinanceLiteStudentLedger({
      periods,
      selectedPeriod,
      selectedPeriodMonths,
      selectedBillingMonth,
      currentBillingMonth,
      monthCardRefs,
      selectPeriodMonth,
      setPeriodFormOpen,
      groupedCharges,
      paginatedGroupedCharges,
      studentLedgerPageSize,
      setStudentLedgerPageSize,
      studentLedgerStartIndex,
      studentLedgerEndIndex,
      studentLedgerTotalPages,
      safeStudentLedgerPage,
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      openGroupedPayment,
      openGroupPaymentForChargeGroup,
      openEditCharge,
      onCancelCharge,
      applyPanelOpen,
      setApplyPanelOpen,
      selectionMessage,
      projectedApplySummary,
      hasSelectedApplicableItems,
      applyPeriodMutationPending,
      submitApplyPeriod,
      periodItems,
      previewResidents,
      previewQuery,
      residentSelections,
      detail,
      getPeriodMonthsFromPeriod,
      getMonthChargeStats,
      getPeriodItemSelectedCount,
      isPeriodItemSelectedForAllEligible,
      getPeriodItemEligibleResidents,
      togglePeriodItemForAllEligible,
      applyDefaultForAllEligible,
      clearAllSelections,
      isResidentItemAlreadyApplied,
      isResidentItemSelectable,
      toggleResidentItem,
      updateResidentItemAmount,
      setStudentLedgerPage,
}: FinanceLiteStudentLedgerProps) {
      const ledgerTotalAmount = groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.amount || 0), 0);
      const ledgerPaidAmount = groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.paidAmount || 0), 0);
      const ledgerRemainingAmount = groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.remainingAmount || 0), 0);
      const monthListScrollRef = useRef<HTMLDivElement | null>(null);

      const defaultMonthViewTarget = useMemo(() => {
            if (!selectedPeriodMonths.length) return currentBillingMonth;

            const currentMonthNumber = getMonthNumberFromBillingMonth(currentBillingMonth);
            const julyBillingMonth = getJulyBillingMonth(currentBillingMonth);
            const preferredTarget = currentMonthNumber >= 8 ? julyBillingMonth : currentBillingMonth;
            const preferredExists = selectedPeriodMonths.some((month: any) => month.value === preferredTarget);

            if (preferredExists) return preferredTarget;

            const currentExists = selectedPeriodMonths.some((month: any) => month.value === currentBillingMonth);
            if (currentExists) return currentBillingMonth;

            return selectedPeriodMonths[0]?.value || currentBillingMonth;
      }, [currentBillingMonth, selectedPeriodMonths]);

      useEffect(() => {
            const container = monthListScrollRef.current;
            const target = monthCardRefs.current[defaultMonthViewTarget];
            if (!container || !target) return;

            const frame = window.requestAnimationFrame(() => {
                  container.scrollTop = target.offsetTop;
            });

            return () => window.cancelAnimationFrame(frame);
      }, [defaultMonthViewTarget, selectedPeriod?.id, selectedPeriodMonths.length, monthCardRefs]);

      return (
            <div className="relative grid gap-5 rounded-[34px] bg-[radial-gradient(circle_at_0%_0%,rgba(246,201,92,0.18),transparent_34%),linear-gradient(180deg,#fffdf8_0%,#fbf4e4_48%,#f6ead0_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] xl:grid-cols-[330px_minmax(0,1fr)] xl:items-start">
                  <section className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,236,0.94)_100%)] p-3.5 shadow-[0_22px_55px_rgba(106,76,20,0.12),0_4px_12px_rgba(106,76,20,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/70 xl:sticky xl:top-[5.75rem] xl:h-[calc(100vh-6.75rem)] xl:min-h-[720px] xl:max-h-none">
                        <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                    <h2 className="text-[26px] font-semibold leading-[1.05] tracking-tight text-[#101a2f]">
                                          Chọn tháng
                                    </h2>
                                    <p className="mt-2 inline-flex max-w-[210px] truncate rounded-full border border-amber-100 bg-[#fff8df] px-3 py-1 text-xs font-semibold text-amber-800">
                                          {selectedPeriod?.periodName || "Kỳ thu học viên"}
                                    </p>
                              </div>
                              <button
                                    type="button"
                                    className="inline-flex shrink-0 items-center rounded-2xl border border-[#e5c06a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff2c9_100%)] px-3.5 py-2 text-sm font-semibold text-[#7c4a03] shadow-[0_10px_22px_rgba(180,122,20,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5 hover:border-[#d6a63d] hover:shadow-[0_14px_28px_rgba(180,122,20,0.22)]"
                                    onClick={() => setPeriodFormOpen(true)}
                              >
                                    <Plus className="mr-1.5 h-4 w-4" /> Kỳ
                              </button>
                        </div>
                        <div className="mb-2 shrink-0 rounded-[20px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,247,225,0.94)_100%)] px-3 py-2.5 shadow-[0_8px_18px_rgba(94,70,26,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                              <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                          Danh sách tháng
                                    </p>
                                    <button
                                          type="button"
                                          className="inline-flex items-center rounded-full border border-[#e0b85a]/70 bg-[linear-gradient(135deg,#fffdf6_0%,#ffe9a9_100%)] px-3 py-1.5 text-[11px] font-semibold text-[#8a5305] shadow-[0_6px_14px_rgba(184,127,24,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5"
                                          onClick={() => {
                                                const periodWithCurrentMonth = periods.find((period: any) =>
                                                      periodContainsBillingMonth(period, currentBillingMonth),
                                                );
                                                if (!periodWithCurrentMonth) return;
                                                selectPeriodMonth(periodWithCurrentMonth, currentBillingMonth);
                                          }}
                                    >
                                          Hiện tại
                                    </button>
                              </div>
                        </div>
                        <div ref={monthListScrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
                              {periods.length ? (
                                          <div className="space-y-2">
                                                {selectedPeriodMonths.map((month: any) => {
                                                      const stats = getMonthChargeStats(selectedPeriod, month.value);
                                                      const selectedMonth = selectedBillingMonth === month.value;
                                                      const isCurrentMonth = currentBillingMonth === month.value;
                                                      const hasMonthCharges =
                                                            Number(stats.residentCount || 0) > 0 ||
                                                            toMoneyNumber(stats.paidAmount || 0) > 0 ||
                                                            toMoneyNumber(stats.remainingAmount || 0) > 0;

                                                      const monthCardClass = selectedMonth
                                                            ? "border-[#d8a735] bg-[linear-gradient(135deg,#fffdfa_0%,#fff3cb_48%,#f0c96d_100%)] text-[#402600] shadow-[0_16px_36px_rgba(180,122,20,0.24),0_3px_8px_rgba(180,122,20,0.10),inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-[#f4d88f]"
                                                            : isCurrentMonth
                                                                  ? "border-[#e5c06a]/80 bg-[linear-gradient(135deg,#ffffff_0%,#fff8e4_55%,#f8df9a_100%)] text-slate-800 shadow-[0_10px_24px_rgba(150,108,28,0.12),inset_0_1px_0_rgba(255,255,255,0.88)] hover:border-[#d9a940]"
                                                                  : hasMonthCharges
                                                                        ? "border-[#eee3c9] bg-[linear-gradient(180deg,#fffefa_0%,#fffaf0_100%)] text-slate-700 shadow-[0_8px_18px_rgba(63,48,20,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#e2c67d] hover:bg-[#fff8e8]"
                                                                        : "border-slate-200/90 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-slate-500 opacity-85 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-slate-300";

                                                      const metaTextClass = selectedMonth
                                                            ? "text-slate-600"
                                                            : hasMonthCharges || isCurrentMonth
                                                                  ? "text-slate-500"
                                                                  : "text-slate-500/90";

                                                      return (
                                                            <button
                                                                  key={month.value}
                                                                  ref={(node) => {
                                                                        monthCardRefs.current[month.value] = node;
                                                                  }}
                                                                  type="button"
                                                                  onClick={() => selectPeriodMonth(selectedPeriod, month.value)}
                                                                  className={`group w-full rounded-[20px] border px-3.5 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 ${monthCardClass}`}
                                                            >
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <span className="text-[14px] font-semibold tracking-tight">
                                                                                    {month.label}
                                                                              </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                              {isCurrentMonth ? (
                                                                                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                                          Hiện tại
                                                                                    </span>
                                                                              ) : null}
                                                                              <span className={`text-[12px] font-medium ${metaTextClass}`}>
                                                                                    {stats.residentCount} người
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                                  <div className={`mt-2 flex items-center justify-between gap-2 text-[12px] ${metaTextClass}`}>
                                                                        <span>Thu {formatMoney(stats.paidAmount)}</span>
                                                                        <span
                                                                              className={
                                                                                    toMoneyNumber(stats.remainingAmount) > 0
                                                                                          ? "rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-600"
                                                                                          : hasMonthCharges
                                                                                                ? "rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600"
                                                                                                : "rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-500"
                                                                              }
                                                                        >
                                                                              {toMoneyNumber(stats.remainingAmount) > 0
                                                                                    ? `Còn ${formatMoney(stats.remainingAmount)}`
                                                                                    : hasMonthCharges
                                                                                          ? "Đã thu đủ"
                                                                                          : "Chưa có khoản"}
                                                                        </span>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                              ) : (
                                    <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                          Chưa có kỳ thu. Bấm “Tạo kỳ thu” để bắt đầu.
                                    </p>
                              )}
                        </div>
                  </section>

                  <div className="space-y-4">
                        <section className="rounded-[30px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                              <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                          <div className="min-w-0 flex-1">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fff8df] px-3 py-1 text-xs font-semibold text-amber-800">
                                                      <span>{getBillingMonthLabel(selectedBillingMonth)}</span>
                                                      <span className="h-1 w-1 rounded-full bg-amber-400" />
                                                      <span>{groupedCharges.length} học viên</span>
                                                </div>
                                                <h2 className="mt-2 text-[25px] font-semibold leading-tight tracking-tight text-slate-950">
                                                      Sổ phải thu học viên
                                                </h2>
                                          </div>
                                          <div className="grid w-full gap-2 sm:grid-cols-3 xl:w-[520px]">
                                                <FocusSummary label="Còn phải thu" value={formatMoney(ledgerRemainingAmount)} tone="danger" />
                                                <FocusSummary label="Đã thu" value={formatMoney(ledgerPaidAmount)} tone="success" />
                                                <FocusSummary label="Tổng kỳ này" value={formatMoney(ledgerTotalAmount)} />
                                          </div>
                                    </div>

                                    <div className="flex flex-col gap-2 rounded-[22px] border border-slate-100 bg-slate-50/60 p-2 lg:flex-row lg:items-center lg:justify-between">
                                          <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-100"
                                                onClick={openGroupedPayment}
                                          >
                                                Thu theo học viên
                                          </button>
                                          <div className="grid flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px_120px] lg:max-w-3xl">
                                                <div className="relative">
                                                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                      <input
                                                            value={searchTerm}
                                                            onChange={(event) => setSearchTerm(event.target.value)}
                                                            placeholder="Tìm học viên..."
                                                            className="h-10 w-full rounded-2xl border border-transparent bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100/70"
                                                      />
                                                </div>
                                                <select
                                                      value={statusFilter}
                                                      onChange={(event) => setStatusFilter(event.target.value as ChargeStatus)}
                                                      className="h-10 rounded-2xl border border-transparent bg-white px-3 text-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100/70"
                                                >
                                                      <option value="all">Tất cả</option>
                                                      <option value="open">Chưa thu</option>
                                                      <option value="partial">Thu một phần</option>
                                                      <option value="paid">Đã thu</option>
                                                      <option value="cancelled">Đã hủy</option>
                                                </select>
                                                <select
                                                      value={studentLedgerPageSize}
                                                      onChange={(event) => setStudentLedgerPageSize(Number(event.target.value) || 7)}
                                                      className="h-10 rounded-2xl border border-transparent bg-white px-3 text-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100/70"
                                                      title="Số dòng mỗi trang"
                                                >
                                                      <option value={5}>5 dòng</option>
                                                      <option value={7}>7 dòng</option>
                                                      <option value={10}>10 dòng</option>
                                                </select>
                                          </div>
                                    </div>
                              </div>
                              <div className="mt-4 space-y-2.5">
                                    {paginatedGroupedCharges.map((group: any) => {
                                          const groupAmount = toMoneyNumber(group.amount || 0);
                                          const groupPaid = toMoneyNumber(group.paidAmount || 0);
                                          const groupRemaining = toMoneyNumber(group.remainingAmount || 0);
                                          const isGroupPaid = groupAmount > 0 && groupRemaining <= 0;
                                          const progress = groupAmount > 0 ? Math.min(100, Math.max(0, (groupPaid / groupAmount) * 100)) : 0;
                                          const canCollect =
                                                Boolean(group.residentId) &&
                                                group.charges.some((charge: any) =>
                                                      ["open", "partial"].includes(String(charge.status || "open")) && toMoneyNumber(charge.remainingAmount || 0) > 0,
                                                );

                                          return (
                                                <article
                                                      key={group.key}
                                                      className="overflow-hidden rounded-[28px] border border-[#eadfca]/90 bg-[linear-gradient(180deg,#fffefa_0%,#fffaf1_100%)] shadow-[0_18px_46px_rgba(105,75,22,0.10),0_3px_10px_rgba(105,75,22,0.05),inset_0_1px_0_rgba(255,255,255,0.94)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:border-[#e2c57c] hover:shadow-[0_24px_58px_rgba(105,75,22,0.14),0_6px_16px_rgba(105,75,22,0.07)]"
                                                >
                                                      <div className="grid gap-3 px-4 py-3.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                                                            <div className="min-w-0">
                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="truncate text-[18px] font-semibold tracking-tight text-slate-950">{group.residentName}</h3>
                                                                        {isGroupPaid ? (
                                                                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Đã thu đủ
                                                                              </span>
                                                                        ) : null}
                                                                  </div>
                                                                  <p className="mt-1 text-xs text-slate-500">
                                                                        {group.residentCode || "Chưa có mã"} · {getBillingMonthLabel(group.billingMonth)} · {group.periodName || "Khoản riêng"}
                                                                  </p>
                                                            </div>

                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
                                                                  <div className="grid min-w-[310px] grid-cols-3 overflow-hidden rounded-[22px] border border-[#eadfca]/90 bg-[linear-gradient(135deg,#fffefa_0%,#fff5dc_100%)] text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(96,70,21,0.06)]">
                                                                        <MoneyMetric label="Tổng" value={formatMoney(groupAmount)} />
                                                                        <MoneyMetric label="Đã thu" value={formatMoney(groupPaid)} />
                                                                        <MoneyMetric
                                                                              label="Còn"
                                                                              value={formatMoney(groupRemaining)}
                                                                              tone={groupRemaining > 0 ? "danger" : "success"}
                                                                        />
                                                                  </div>
                                                                  {canCollect ? (
                                                                        <button
                                                                              type="button"
                                                                              className="inline-flex min-w-[116px] items-center justify-center rounded-[20px] border border-[#dfbd63]/80 bg-[linear-gradient(135deg,#fff6d8_0%,#f1ce72_100%)] px-4 py-2.5 text-sm font-semibold text-[#593b07] shadow-[0_10px_22px_rgba(190,136,28,0.20),inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:-translate-y-0.5 hover:border-[#c9982f] hover:shadow-[0_14px_28px_rgba(190,136,28,0.26)]"
                                                                              onClick={() => openGroupPaymentForChargeGroup(group)}
                                                                        >
                                                                              Thu tiền
                                                                        </button>
                                                                  ) : (
                                                                        <div className="inline-flex min-w-[116px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-400">
                                                                              Đã xong
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      <div className="px-4 pb-3">
                                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                            </div>
                                                      </div>

                                                      <div className="divide-y divide-[#efe5d1] border-t border-[#efe5d1] bg-[linear-gradient(180deg,rgba(255,250,238,0.55)_0%,rgba(255,255,255,0.52)_100%)]">
                                                            {group.charges.map((charge: any) => {
                                                                  const chargeTitle = charge.periodItemName || charge.feeTypeName || charge.feeName || "Khoản thu";
                                                                  const status = String(charge.status || "open");
                                                                  const isPaid = status === "paid";
                                                                  const canEdit = String(charge.status || "") !== "cancelled";
                                                                  const canCancel =
                                                                        toMoneyNumber(charge.paidAmount || 0) <= 0 &&
                                                                        String(charge.status || "") !== "cancelled";
                                                                  const chargeRemaining = toMoneyNumber(charge.remainingAmount || 0);

                                                                  return (
                                                                        <div
                                                                              key={charge.id}
                                                                              className="grid gap-2 px-4 py-2.5 md:grid-cols-[minmax(0,1fr)_170px_92px] md:items-center"
                                                                        >
                                                                              <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <p className="truncate text-sm font-semibold text-slate-800">{chargeTitle}</p>
                                                                                          {isPaid ? (
                                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                                                                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã thu
                                                                                                </span>
                                                                                          ) : (
                                                                                                <InlineBadge className={getStatusClass(charge.status)}>
                                                                                                      {getStatusLabel(charge.status)}
                                                                                                </InlineBadge>
                                                                                          )}
                                                                                    </div>
                                                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                                                          Phải thu {formatMoney(charge.amount)} · đã thu {formatMoney(charge.paidAmount)}
                                                                                    </p>
                                                                              </div>
                                                                              <div className="flex items-baseline justify-between gap-3 md:block md:text-right">
                                                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Còn lại</span>
                                                                                    <p className={chargeRemaining > 0 ? "text-sm font-semibold text-[#b7791f]" : "text-sm font-semibold text-emerald-600"}>
                                                                                          {formatMoney(charge.remainingAmount)}
                                                                                    </p>
                                                                              </div>
                                                                              <div className="flex items-center gap-1.5 md:justify-end">
                                                                                    {canEdit ? (
                                                                                          <button
                                                                                                type="button"
                                                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#eadfca] bg-white/90 text-slate-500 shadow-sm transition hover:border-[#d9b65a] hover:bg-[#fff7df] hover:text-[#9a5f08]"
                                                                                                onClick={() => openEditCharge(charge)}
                                                                                                title="Sửa khoản thu"
                                                                                                aria-label="Sửa khoản thu"
                                                                                          >
                                                                                                <Pencil className="h-3.5 w-3.5" />
                                                                                          </button>
                                                                                    ) : null}
                                                                                    {canCancel ? (
                                                                                          <button
                                                                                                type="button"
                                                                                                className="rounded-xl border border-rose-100 bg-rose-50/55 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                                                                                onClick={() => onCancelCharge(charge)}
                                                                                          >
                                                                                                Hủy
                                                                                          </button>
                                                                                    ) : null}
                                                                              </div>
                                                                        </div>
                                                                  );
                                                            })}
                                                      </div>
                                                </article>
                                          );
                                    })}

                                    {!groupedCharges.length ? (
                                          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-sm text-slate-500">
                                                Chưa có khoản phải thu phù hợp.
                                          </div>
                                    ) : null}
                              </div>

                              {groupedCharges.length ? (
                                    <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                          <span>
                                                Hiển thị {studentLedgerStartIndex}-{studentLedgerEndIndex} / {groupedCharges.length} học viên
                                          </span>
                                          <div className="flex items-center gap-2">
                                                <button
                                                      type="button"
                                                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                      disabled={safeStudentLedgerPage <= 1}
                                                      onClick={() => setStudentLedgerPage((current) => Math.max(1, current - 1))}
                                                >
                                                      Trước
                                                </button>
                                                <span className="min-w-[72px] text-center text-xs font-semibold text-slate-700">
                                                      Trang {safeStudentLedgerPage}/{studentLedgerTotalPages}
                                                </span>
                                                <button
                                                      type="button"
                                                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                      disabled={safeStudentLedgerPage >= studentLedgerTotalPages}
                                                      onClick={() => setStudentLedgerPage((current) => Math.min(studentLedgerTotalPages, current + 1))}
                                                >
                                                      Sau
                                                </button>
                                          </div>
                                    </div>
                              ) : null}
                        </section>

                        <section className="overflow-hidden rounded-[28px] border border-[#ead9ad]/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,249,232,0.95)_100%)] p-4 shadow-[0_14px_34px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                              {detail ? (
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                          <div className="min-w-0">
                                                <div className="inline-flex rounded-full border border-[#efd89d] bg-[#fff8df] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#96600c]">
                                                      Tạo khoản phải thu
                                                </div>
                                                <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#17213a]">
                                                      Sinh khoản phải thu cho {getBillingMonthLabel(selectedBillingMonth)}
                                                </h2>
                                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                                      Mở form riêng để chọn khoản phí và học viên. Danh sách chính không bị kéo dài, dễ thao tác và tránh cuộn sâu trong trang.
                                                </p>
                                          </div>

                                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2.5 text-sm shadow-sm">
                                                      <span className="text-slate-500">Đang có </span>
                                                      <span className="font-semibold text-[#17213a]">{groupedCharges.length}</span>
                                                      <span className="text-slate-500"> học viên phải thu</span>
                                                </div>
                                                <button
                                                      type="button"
                                                      className="inline-flex items-center justify-center rounded-2xl border border-[#e0b85a] bg-[linear-gradient(135deg,#fff6dc_0%,#f2d27d_100%)] px-5 py-3 text-sm font-semibold text-[#5b3b06] shadow-[0_12px_24px_rgba(184,127,24,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(184,127,24,0.24)]"
                                                      onClick={() => setApplyPanelOpen(true)}
                                                >
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Tạo khoản phải thu
                                                </button>
                                          </div>
                                    </div>
                              ) : (
                                    <div className="rounded-2xl border border-dashed border-[#e4d3aa] bg-white/70 p-8 text-center text-sm text-slate-500">
                                          Chọn một kỳ thu để xem chi tiết.
                                    </div>
                              )}
                        </section>

                        {applyPanelOpen && detail ? (
                              <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm">
                                    <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[34px] border border-[#ead9ad]/90 bg-[linear-gradient(180deg,#fffdf7_0%,#fbf3df_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.96)]">
                                          <div className="border-b border-[#ead9ad]/70 bg-[linear-gradient(135deg,#fffdfa_0%,#fff5d6_100%)] px-5 py-4">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                      <div className="min-w-0">
                                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a640c]">
                                                                  Tạo khoản phải thu học viên
                                                            </p>
                                                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#111b31]">
                                                                  {getBillingMonthLabel(selectedBillingMonth)} · {selectedPeriod?.periodName || "Kỳ thu"}
                                                            </h2>
                                                      </div>
                                                      <button
                                                            type="button"
                                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e2c77c] bg-white/80 text-xl font-semibold text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900"
                                                            onClick={() => setApplyPanelOpen(false)}
                                                            aria-label="Đóng form tạo khoản phải thu"
                                                      >
                                                            ×
                                                      </button>
                                                </div>

                                                {selectedPeriodMonths.length ? (
                                                      <div className="mt-4 rounded-[22px] border border-[#ead9ad]/75 bg-white/72 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                  <div className="flex min-w-0 items-center gap-3">
                                                                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#efd89d] bg-[#fff8df] text-sm font-semibold text-[#96600c]">
                                                                              {selectedPeriodMonths.findIndex((month: any) => month.value === selectedBillingMonth) + 1 || 1}
                                                                        </span>
                                                                        <div className="min-w-0">
                                                                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tháng áp dụng</p>
                                                                              <p className="truncate text-sm font-semibold text-[#17213a]">
                                                                                    Đang chọn {getBillingMonthLabel(selectedBillingMonth)}
                                                                              </p>
                                                                        </div>
                                                                  </div>

                                                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                                        <button
                                                                              type="button"
                                                                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#e0b85a] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-45"
                                                                              disabled={selectedPeriodMonths.findIndex((month: any) => month.value === selectedBillingMonth) <= 0}
                                                                              onClick={() => {
                                                                                    const currentIndex = selectedPeriodMonths.findIndex((month: any) => month.value === selectedBillingMonth);
                                                                                    const previousMonth = selectedPeriodMonths[currentIndex - 1];
                                                                                    if (previousMonth) selectPeriodMonth(selectedPeriod, previousMonth.value);
                                                                              }}
                                                                        >
                                                                              Tháng trước
                                                                        </button>

                                                                        <select
                                                                              value={selectedBillingMonth}
                                                                              onChange={(event) => selectPeriodMonth(selectedPeriod, event.target.value)}
                                                                              className="min-w-[220px] rounded-2xl border border-[#ead9ad] bg-[linear-gradient(180deg,#fffefa_0%,#fff7df_100%)] px-4 py-2.5 text-sm font-semibold text-[#5b3b06] shadow-[0_8px_18px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100"
                                                                        >
                                                                              {selectedPeriodMonths.map((month: any) => {
                                                                                    const monthStats = getMonthChargeStats(selectedPeriod, month.value);
                                                                                    const monthRemaining = toMoneyNumber(monthStats.remainingAmount || 0);
                                                                                    return (
                                                                                          <option key={month.value} value={month.value}>
                                                                                                {month.label} · {monthStats.residentCount} HV · {monthRemaining > 0 ? `Còn ${formatMoney(monthStats.remainingAmount)}` : monthStats.residentCount > 0 || toMoneyNumber(monthStats.paidAmount || 0) > 0 ? "Đã thu đủ" : "Chưa có khoản"}
                                                                                          </option>
                                                                                    );
                                                                              })}
                                                                        </select>

                                                                        <button
                                                                              type="button"
                                                                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#e0b85a] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-45"
                                                                              disabled={
                                                                                    selectedPeriodMonths.findIndex((month: any) => month.value === selectedBillingMonth) >=
                                                                                    selectedPeriodMonths.length - 1
                                                                              }
                                                                              onClick={() => {
                                                                                    const currentIndex = selectedPeriodMonths.findIndex((month: any) => month.value === selectedBillingMonth);
                                                                                    const nextMonth = selectedPeriodMonths[currentIndex + 1];
                                                                                    if (nextMonth) selectPeriodMonth(selectedPeriod, nextMonth.value);
                                                                              }}
                                                                        >
                                                                              Tháng sau
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                ) : null}
                                          </div>

                                          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                                                <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
                                                      <div className="space-y-4">
                                                            <section className="rounded-[28px] border border-[#ead9ad]/80 bg-white/88 p-4 shadow-[0_12px_30px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a640c]">1. Khoản phí</p>
                                                                        </div>
                                                                        <div className="flex shrink-0 gap-2">
                                                                              <button
                                                                                    type="button"
                                                                                    className="rounded-xl border border-[#e0b85a]/70 bg-[#fff8df] px-3 py-2 text-xs font-semibold text-[#8a5608] transition hover:bg-[#ffefbd]"
                                                                                    onClick={applyDefaultForAllEligible}
                                                                              >
                                                                                    Chọn mặc định
                                                                              </button>
                                                                              <button
                                                                                    type="button"
                                                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                                                    onClick={clearAllSelections}
                                                                              >
                                                                                    Bỏ chọn
                                                                              </button>
                                                                        </div>
                                                                  </div>

                                                                  <div className="mt-4 space-y-2.5">
                                                                        {periodItems.map((item: any) => {
                                                                              const itemId = Number(item.id);
                                                                              const allSelected = isPeriodItemSelectedForAllEligible(itemId);
                                                                              const selectedCount = getPeriodItemSelectedCount(itemId);
                                                                              const eligibleCount = getPeriodItemEligibleResidents(itemId).length || 0;

                                                                              return (
                                                                                    <button
                                                                                          key={item.id}
                                                                                          type="button"
                                                                                          onClick={() => togglePeriodItemForAllEligible(itemId, !allSelected, item.amount)}
                                                                                          className={`w-full rounded-[20px] border px-3.5 py-3 text-left transition ${
                                                                                                allSelected
                                                                                                      ? "border-[#d9ad43] bg-[linear-gradient(135deg,#fff8df_0%,#ffe9a3_100%)] shadow-[0_10px_20px_rgba(184,127,24,0.14)]"
                                                                                                      : "border-slate-200 bg-white/80 hover:border-[#e0b85a] hover:bg-[#fffaf0]"
                                                                                          }`}
                                                                                    >
                                                                                          <div className="flex items-start justify-between gap-3">
                                                                                                <div className="min-w-0">
                                                                                                      <p className="truncate text-sm font-semibold text-[#17213a]">{item.feeTypeName}</p>
                                                                                                      <p className="mt-1 text-sm text-slate-500">
                                                                                                            {formatMoney(item.amount)} · {Number(item.isDefaultChecked) === 1 ? "Mặc định chọn" : "Không mặc định"}
                                                                                                      </p>
                                                                                                </div>
                                                                                                <span
                                                                                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                                                                                                            allSelected
                                                                                                                  ? "border-[#b98516] bg-[#c9952a] text-white"
                                                                                                                  : "border-slate-300 bg-white text-transparent"
                                                                                                      }`}
                                                                                                >
                                                                                                      ✓
                                                                                                </span>
                                                                                          </div>
                                                                                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                                                                <span>Đã chọn {selectedCount}/{eligibleCount} học viên</span>
                                                                                                <span>{eligibleCount ? "Đủ điều kiện" : "Không có học viên"}</span>
                                                                                          </div>
                                                                                    </button>
                                                                              );
                                                                        })}

                                                                        {!periodItems.length ? (
                                                                              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                                                                                    Kỳ thu này chưa có khoản phí. Hãy kiểm tra cấu hình kỳ thu.
                                                                              </div>
                                                                        ) : null}
                                                                  </div>
                                                            </section>

                                                            <section className="rounded-[28px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffaf0_0%,#fff4d7_100%)] p-4 shadow-[0_12px_30px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a640c]">2. Dự kiến tạo</p>
                                                                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                                                        <MiniSummary label="Học viên" value={String(projectedApplySummary.residentCount)} />
                                                                        <MiniSummary label="Khoản phí" value={String(projectedApplySummary.totalItems)} />
                                                                        <MiniSummary label="Tổng tiền" value={formatMoney(projectedApplySummary.totalAmount)} />
                                                                  </div>

                                                                  <div className="mt-3 space-y-2">
                                                                        {projectedApplySummary.items.map((item: any) => (
                                                                              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-3 py-2 text-sm">
                                                                                    <span className="truncate font-semibold text-slate-700">{item.name}</span>
                                                                                    <span className="shrink-0 text-xs text-slate-500">
                                                                                          {item.count} khoản · {formatMoney(item.amount)}
                                                                                    </span>
                                                                              </div>
                                                                        ))}
                                                                        {!projectedApplySummary.items.length ? (
                                                                              <p className="rounded-2xl border border-dashed border-[#ead9ad] bg-white/50 px-3 py-3 text-sm text-slate-500">
                                                                                    Chưa có khoản nào được chọn.
                                                                              </p>
                                                                        ) : null}
                                                                  </div>

                                                                  {selectionMessage ? (
                                                                        <div className="mt-3 rounded-2xl border border-[#e8c972]/70 bg-white/70 px-3 py-2 text-sm text-[#8a5608]">
                                                                              {selectionMessage}
                                                                        </div>
                                                                  ) : null}
                                                            </section>
                                                      </div>

                                                      <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#ead9ad]/80 bg-white/92 shadow-[0_12px_30px_rgba(106,76,20,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
                                                            <div className="sticky top-0 z-10 border-b border-[#ead9ad]/60 bg-[linear-gradient(90deg,#fffdfa_0%,#fff7df_100%)] px-4 py-3">
                                                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="min-w-0">
                                                                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a640c]">3. Học viên</p>
                                                                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                                                                    Tick từng khoản phí cần tạo. Khoản đã có sẽ được khóa và tự bỏ qua.
                                                                              </p>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600">
                                                                                    {previewResidents.length} học viên
                                                                              </span>
                                                                              <span className="rounded-full border border-[#efd89d] bg-[#fff8df] px-3 py-1 text-xs font-semibold text-[#96600c]">
                                                                                    {getBillingMonthLabel(selectedBillingMonth)}
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                            </div>

                                                            <div className="max-h-[56vh] space-y-3 overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] p-3.5">
                                                                  {previewQuery?.isLoading ? (
                                                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
                                                                              Đang tải danh sách học viên...
                                                                        </div>
                                                                  ) : null}

                                                                  {!previewQuery?.isLoading && !previewResidents.length ? (
                                                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
                                                                              Chưa có học viên trong danh sách áp dụng cho tháng này.
                                                                        </div>
                                                                  ) : null}

                                                                  {previewResidents.map((resident: any) => {
                                                                        const residentSelectedCount = periodItems.reduce((count: number, item: any) => {
                                                                              const selected = residentSelections[String(resident.id)]?.[String(item.id)];
                                                                              const alreadyApplied = isResidentItemAlreadyApplied(resident, item);
                                                                              return count + (alreadyApplied || selected?.selected ? 1 : 0);
                                                                        }, 0);
                                                                        const residentCanApply = Boolean(resident.eligible);
                                                                        const visibleItems = periodItems.filter((item: any) => {
                                                                              const alreadyApplied = isResidentItemAlreadyApplied(resident, item);
                                                                              const selectable = isResidentItemSelectable(resident, item);
                                                                              return alreadyApplied || selectable;
                                                                        });

                                                                        return (
                                                                              <article
                                                                                    key={resident.id}
                                                                                    className={`overflow-hidden rounded-[22px] border transition ${
                                                                                          residentCanApply
                                                                                                ? "border-[#ead9ad]/75 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.95)] hover:border-[#e0b85a]"
                                                                                                : "border-slate-200 bg-slate-50/95 text-slate-500"
                                                                                    }`}
                                                                              >
                                                                                    <div className="flex flex-col gap-2 border-b border-[#efe6cf] bg-[linear-gradient(180deg,#fffefa_0%,#fffaf0_100%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                                                          <div className="min-w-0">
                                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                                      <p className={`break-words text-base font-semibold ${residentCanApply ? "text-[#17213a]" : "text-slate-500"}`}>
                                                                                                            {resident.fullName}
                                                                                                      </p>
                                                                                                      {!residentCanApply ? (
                                                                                                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                                                                                                  Không áp dụng
                                                                                                            </span>
                                                                                                      ) : null}
                                                                                                </div>
                                                                                                <p className="mt-1 text-xs text-slate-500">{resident.residentCode || "Chưa có mã"}</p>
                                                                                                {!residentCanApply ? (
                                                                                                      <p className="mt-1.5 text-sm font-medium text-amber-700">{resident.reason || "Không đủ điều kiện áp dụng trong tháng này."}</p>
                                                                                                ) : null}
                                                                                          </div>

                                                                                          <span
                                                                                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                                                                                                      residentSelectedCount > 0
                                                                                                            ? "border-[#efd89d] bg-[#fff8df] text-[#96600c]"
                                                                                                            : "border-slate-200 bg-white text-slate-500"
                                                                                                }`}
                                                                                          >
                                                                                                {residentSelectedCount}/{periodItems.length} khoản
                                                                                          </span>
                                                                                    </div>

                                                                                    {!residentCanApply ? (
                                                                                          <div className="px-4 py-4">
                                                                                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                                                                                                      Học viên chưa đủ điều kiện trong tháng này nên các khoản phí được ẩn để tránh nhầm khi tạo công nợ.
                                                                                                </div>
                                                                                          </div>
                                                                                    ) : !visibleItems.length ? (
                                                                                          <div className="px-4 py-4">
                                                                                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                                                                                                      Không có khoản phí nào còn có thể tạo cho học viên này.
                                                                                                </div>
                                                                                          </div>
                                                                                    ) : (
                                                                                          <div className="space-y-2.5 px-4 py-3">
                                                                                                {visibleItems.map((item: any) => {
                                                                                                      const selected = residentSelections[String(resident.id)]?.[String(item.id)];
                                                                                                      const alreadyApplied = isResidentItemAlreadyApplied(resident, item);
                                                                                                      const selectable = isResidentItemSelectable(resident, item);
                                                                                                      const checked = Boolean(alreadyApplied || (selected?.selected && selectable));
                                                                                                      const inputDisabled = !selectable || !selected?.selected;
                                                                                                      const inputId = `finance-apply-${resident.id}-${item.id}`;

                                                                                                      return (
                                                                                                            <div
                                                                                                                  key={item.id}
                                                                                                                  className={`grid grid-cols-[26px_minmax(0,1fr)] gap-3 rounded-2xl border px-3 py-2.5 transition sm:grid-cols-[26px_minmax(0,1fr)_150px] sm:items-center ${
                                                                                                                        alreadyApplied
                                                                                                                              ? "border-slate-200 bg-slate-50/80 text-slate-400"
                                                                                                                              : checked
                                                                                                                                    ? "border-[#ecd28c] bg-[linear-gradient(180deg,#fffdf7_0%,#fff7df_100%)] shadow-[0_8px_18px_rgba(170,120,25,0.08)]"
                                                                                                                                    : "border-[#eadfca] bg-white/90 hover:border-[#e0bf6f]"
                                                                                                                  }`}
                                                                                                            >
                                                                                                                  <div className="flex h-10 items-center justify-center">
                                                                                                                        <input
                                                                                                                              id={inputId}
                                                                                                                              type="checkbox"
                                                                                                                              className="h-4 w-4 shrink-0 rounded border-[#d9c8a2] text-[#c9952a] focus:ring-amber-200 disabled:opacity-45"
                                                                                                                              disabled={!selectable}
                                                                                                                              checked={checked}
                                                                                                                              onChange={(event) =>
                                                                                                                                    toggleResidentItem(Number(resident.id), Number(item.id), event.target.checked)
                                                                                                                              }
                                                                                                                        />
                                                                                                                  </div>

                                                                                                                  <label htmlFor={inputId} className="min-w-0 cursor-pointer">
                                                                                                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                                                                                              <span className={`min-w-0 text-sm font-semibold leading-5 ${alreadyApplied ? "text-slate-400" : "text-[#17213a]"}`}>
                                                                                                                                    {item.feeTypeName}
                                                                                                                              </span>
                                                                                                                              {alreadyApplied ? (
                                                                                                                                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                                                                                                                                          Đã có
                                                                                                                                    </span>
                                                                                                                              ) : checked ? (
                                                                                                                                    <span className="shrink-0 rounded-full border border-[#efd89d] bg-[#fff8df] px-2 py-0.5 text-[10px] font-semibold text-[#96600c]">
                                                                                                                                          Sẽ tạo
                                                                                                                                    </span>
                                                                                                                              ) : (
                                                                                                                                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                                                                                                          Chưa chọn
                                                                                                                                    </span>
                                                                                                                              )}
                                                                                                                        </div>
                                                                                                                        <p className={`mt-0.5 text-xs leading-5 ${alreadyApplied ? "text-slate-400" : "text-slate-500"}`}>
                                                                                                                              {alreadyApplied ? "Khoản này đã có, hệ thống sẽ bỏ qua." : `Mặc định ${formatMoney(item.amount)}`}
                                                                                                                        </p>
                                                                                                                  </label>

                                                                                                                  <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end">
                                                                                                                        <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:hidden">
                                                                                                                              Số tiền
                                                                                                                        </span>
                                                                                                                        <input
                                                                                                                              type="text"
                                                                                                                              inputMode="numeric"
                                                                                                                              disabled={inputDisabled}
                                                                                                                              value={selected?.amount || formatMoneyInput(item.amount)}
                                                                                                                              onChange={(event) =>
                                                                                                                                    updateResidentItemAmount(Number(resident.id), Number(item.id), event.target.value)
                                                                                                                              }
                                                                                                                              className="h-10 w-full rounded-xl border border-[#e4d7bd] bg-white px-3 text-right text-sm font-semibold text-[#17213a] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100 disabled:bg-slate-50 disabled:text-slate-400 sm:w-[136px]"
                                                                                                                        />
                                                                                                                  </div>
                                                                                                            </div>
                                                                                                      );
                                                                                                })}
                                                                                          </div>
                                                                                    )}
                                                                              </article>
                                                                        );
                                                                  })}
                                                            </div>
                                                      </section>
                                                </div>
                                          </div>

                                          <div className="flex flex-col gap-3 border-t border-[#ead9ad]/70 bg-white/82 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-sm text-slate-600">
                                                      {hasSelectedApplicableItems
                                                            ? `Sẽ tạo ${projectedApplySummary.totalItems} khoản cho ${projectedApplySummary.residentCount} học viên, tổng ${formatMoney(projectedApplySummary.totalAmount)}.`
                                                            : "Chưa có khoản nào được chọn để tạo."}
                                                </p>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                      <button
                                                            type="button"
                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                                            onClick={() => setApplyPanelOpen(false)}
                                                      >
                                                            Đóng
                                                      </button>
                                                      <button
                                                            type="button"
                                                            className={`${residenceMediumStyle.buttonCardPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
                                                            onClick={submitApplyPeriod}
                                                            disabled={applyPeriodMutationPending || !hasSelectedApplicableItems}
                                                      >
                                                            {applyPeriodMutationPending ? "Đang tạo..." : "Tạo khoản phải thu"}
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        ) : null}
                  </div>
            </div>
      );
}

function getMonthNumberFromBillingMonth(value: string) {
      const monthNumber = Number(String(value || "").slice(5, 7));
      return Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12 ? monthNumber : 1;
}

function getJulyBillingMonth(value: string) {
      const year = String(value || "").slice(0, 4) || new Date().getFullYear().toString();
      return `${year}-07`;
}


function openStudentFeeVoucherPrint(group: any) {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
            new CustomEvent("finance-voucher-print", {
                  detail: createStudentFeeVoucherTransaction(group),
            }),
      );
}

function createStudentFeeVoucherTransaction(group: any) {
      const paidAmount = toMoneyNumber(group?.paidAmount || 0);
      const amount = paidAmount > 0 ? paidAmount : toMoneyNumber(group?.amount || 0);
      const chargeNames = Array.isArray(group?.charges)
            ? group.charges
                    .map((charge: any) => charge.periodItemName || charge.feeTypeName || charge.feeName)
                    .filter(Boolean)
            : [];
      const uniqueChargeNames = Array.from(new Set(chargeNames));
      const content = uniqueChargeNames.length
            ? `Thu ${uniqueChargeNames.join(", ")} - ${getBillingMonthLabel(group?.billingMonth)}`
            : `Thu phí học viên - ${getBillingMonthLabel(group?.billingMonth)}`;

      return {
            id: group?.paymentId || group?.receiptId || group?.key || `${group?.residentId || "student"}-${group?.billingMonth || "month"}`,
            source: "student_fee_payment",
            direction: "in",
            amount,
            transactionDate: new Date().toISOString().slice(0, 10),
            targetType: "resident",
            targetName: group?.residentName || "Học viên",
            description: content,
            residentName: group?.residentName,
            studentName: group?.residentName,
      };
}

function SummaryStat({ label, value }: { label: string; value: string }) {
      return (
            <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
            </div>
      );
}

function MiniSummary({ label, value }: { label: string; value: string }) {
      return (
            <div className="rounded-2xl border border-[#ead9ad]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,248,225,0.9)_100%)] px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#14213d]">{value}</p>
            </div>
      );
}


function MoneyMetric({
      label,
      value,
      tone = "default",
}: {
      label: string;
      value: string;
      tone?: "default" | "danger" | "success";
}) {
      const valueClass =
            tone === "danger"
                  ? "text-[#b7791f]"
                  : tone === "success"
                        ? "text-emerald-600"
                        : "text-slate-900";
      return (
            <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                  <p className={`mt-0.5 text-sm font-semibold ${valueClass}`}>{value}</p>
            </div>
      );
}

function FocusSummary({
      label,
      value,
      tone = "default",
}: {
      label: string;
      value: string;
      tone?: "default" | "danger" | "success";
}) {
      const valueClass =
            tone === "danger"
                  ? "text-[#b7791f]"
                  : tone === "success"
                        ? "text-emerald-600"
                        : "text-slate-900";
      const frameClass =
            tone === "danger"
                  ? "border-[#efd59d] bg-[#fff6dc]"
                  : tone === "success"
                        ? "border-emerald-100 bg-emerald-50/70"
                        : "border-amber-100 bg-[#fff8df]";
      return (
            <div className={`rounded-2xl border px-3.5 py-3 ${frameClass}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  <p className={`mt-1 text-[17px] font-semibold tracking-tight ${valueClass}`}>{value}</p>
            </div>
      );
}
