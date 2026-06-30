"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { CheckCircle2, Pencil, Plus, Search } from "lucide-react";

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
      return (
            <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
                  <section className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/85 bg-gradient-to-b from-white/95 via-[#fffaf0] to-[#fff2d1] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] ring-1 ring-amber-100/70 xl:sticky xl:top-4 xl:h-[calc(100vh-5.5rem)] xl:max-h-none">
                        <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                    <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
                                          Chọn tháng
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                          {selectedPeriod?.periodName || "Kỳ thu học viên"}
                                    </p>
                              </div>
                              <button
                                    type="button"
                                    className="inline-flex items-center rounded-2xl border border-amber-200 bg-white/88 px-3.5 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
                                    onClick={() => setPeriodFormOpen(true)}
                              >
                                    <Plus className="mr-1.5 h-4 w-4" /> Kỳ
                              </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                              {periods.length ? (
                                    <>
                                          <div className="sticky top-0 z-10 -mx-1 mb-3 rounded-2xl bg-[linear-gradient(180deg,rgba(255,250,240,0.97),rgba(255,250,240,0.9))] px-1 pb-3 pt-1 backdrop-blur-sm">
                                                <div className="flex items-center justify-between gap-2">
                                                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                            Danh sách tháng
                                                      </p>
                                                      <button
                                                            type="button"
                                                            className="inline-flex items-center rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
                                                            onClick={() => {
                                                                  const periodWithCurrentMonth = periods.find((period: any) =>
                                                                        periodContainsBillingMonth(period, currentBillingMonth),
                                                                  );
                                                                  if (!periodWithCurrentMonth) return;
                                                                  selectPeriodMonth(periodWithCurrentMonth, currentBillingMonth);
                                                            }}
                                                      >
                                                            Tháng hiện tại
                                                      </button>
                                                </div>
                                          </div>
                                          <div className="space-y-3">
                                                {selectedPeriodMonths.map((month: any) => {
                                                      const stats = getMonthChargeStats(selectedPeriod, month.value);
                                                      const selectedMonth = selectedBillingMonth === month.value;
                                                      const isCurrentMonth = currentBillingMonth === month.value;
                                                      const hasMonthCharges =
                                                            Number(stats.residentCount || 0) > 0 ||
                                                            toMoneyNumber(stats.paidAmount || 0) > 0 ||
                                                            toMoneyNumber(stats.remainingAmount || 0) > 0;

                                                      const monthCardClass = selectedMonth
                                                            ? "border-amber-300 bg-gradient-to-br from-[#fff6de] via-white to-[#f3cf82]/75 text-amber-950 shadow-[0_12px_30px_rgba(217,119,6,0.12)] ring-1 ring-amber-100"
                                                            : isCurrentMonth
                                                                  ? "border-amber-200 bg-gradient-to-br from-[#fffaf0] via-white to-[#f6de9e]/65 text-slate-700 shadow-sm hover:border-amber-300"
                                                                  : hasMonthCharges
                                                                        ? "border-amber-100/80 bg-white/88 text-slate-700 shadow-sm hover:border-amber-200 hover:bg-[#fffaf0]"
                                                                        : "border-slate-200/90 bg-slate-100/95 text-slate-600 hover:border-slate-300";

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
                                                                  className={`w-full rounded-[24px] border px-4 py-3 text-left transition ${monthCardClass}`}
                                                            >
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <span className="text-[15px] font-semibold tracking-tight">
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
                                                                  <div className={`mt-3 grid gap-1 text-[12px] ${metaTextClass}`}>
                                                                        <span>Đã thu: {formatMoney(stats.paidAmount)}</span>
                                                                        <span>Còn lại: {formatMoney(stats.remainingAmount)}</span>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    </>
                              ) : (
                                    <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                          Chưa có kỳ thu. Bấm “Tạo kỳ thu” để bắt đầu.
                                    </p>
                              )}
                        </div>
                  </section>

                  <div className="space-y-4">
                        <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                          <h2 className="text-[22px] font-semibold leading-tight text-slate-950">
                                                Phải thu {getBillingMonthLabel(selectedBillingMonth)}
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Công nợ học viên của tháng đang chọn, gom theo từng học viên để dễ thu và đối chiếu.
                                                </p>
                                          <div className="mt-3 grid gap-2 sm:grid-cols-4">
                                                <SummaryStat label="Tháng" value={getBillingMonthLabel(selectedBillingMonth).replace("Tháng ", "T")} />
                                                <SummaryStat label="Học viên" value={String(groupedCharges.length)} />
                                                <SummaryStat
                                                      label="Đã thu"
                                                      value={formatMoney(groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.paidAmount || 0), 0))}
                                                />
                                                <SummaryStat
                                                      label="Còn lại"
                                                      value={formatMoney(groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.remainingAmount || 0), 0))}
                                                />
                                          </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                          <button
                                                type="button"
                                                className={residenceMediumStyle.buttonCardPrimary}
                                                onClick={openGroupedPayment}
                                          >
                                                Thu theo học viên
                                          </button>
                                          <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                      value={searchTerm}
                                                      onChange={(event) => setSearchTerm(event.target.value)}
                                                      placeholder="Tìm học viên..."
                                                      className="w-52 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
                                                />
                                          </div>
                                          <select
                                                value={statusFilter}
                                                onChange={(event) => setStatusFilter(event.target.value as ChargeStatus)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                title="Số dòng mỗi trang"
                                          >
                                                <option value={5}>5 dòng</option>
                                                <option value={7}>7 dòng</option>
                                                <option value={10}>10 dòng</option>
                                          </select>
                                    </div>
                              </div>

                              <div className="mt-4 overflow-hidden rounded-[26px] border border-white/85 bg-white/92 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                                    <table className="w-full table-fixed divide-y divide-slate-100 text-sm">
                                          <thead className="bg-gradient-to-r from-[#fff8e8] via-white to-[#f7e3ab]/65 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                                <tr>
                                                      <th className="w-[22%] px-3 py-3 text-left">Học viên</th>
                                                      <th className="w-[44%] px-3 py-3 text-left">Khoản phí</th>
                                                      <th className="w-[11%] px-3 py-3 text-right">Tổng</th>
                                                      <th className="w-[11%] px-3 py-3 text-right">Đã thu</th>
                                                      <th className="w-[11%] px-3 py-3 text-right">Còn lại</th>
                                                      <th className="w-[10%] px-3 py-3 text-right">Tác vụ</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 bg-white/95">
                                                {paginatedGroupedCharges.map((group: any) => {
                                                      const canCollect =
                                                            Boolean(group.residentId) &&
                                                            group.charges.some((charge: any) =>
                                                                  ["open", "partial"].includes(String(charge.status || "open")) && toMoneyNumber(charge.remainingAmount || 0) > 0,
                                                            );

                                                      return (
                                                            <tr key={group.key} className="align-top">
                                                                  <td className="px-3 py-4">
                                                                        <p className="font-semibold text-slate-900">{group.residentName}</p>
                                                                        <p className="text-xs text-slate-500">{group.residentCode || "-"}</p>
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                              {getBillingMonthLabel(group.billingMonth)} · {group.periodName || "Khoản riêng"}
                                                                        </p>
                                                                  </td>
                                                                  <td className="px-3 py-4">
                                                                        <div className="space-y-2">
                                                                              {group.charges.map((charge: any) => {
                                                                                    const chargeTitle =
                                                                                          charge.periodItemName || charge.feeTypeName || charge.feeName || "Khoản thu";
                                                                                    const status = String(charge.status || "open");
                                                                                    const isPaid = status === "paid";
                                                                                    const canEdit = String(charge.status || "") !== "cancelled";
                                                                                    const canCancel =
                                                                                          toMoneyNumber(charge.paidAmount || 0) <= 0 &&
                                                                                          String(charge.status || "") !== "cancelled";

                                                                                    return (
                                                                                          <div
                                                                                                key={charge.id}
                                                                                                className="rounded-2xl border border-amber-100/80 bg-gradient-to-r from-[#fffaf0] via-white to-[#fff3d6] px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                                                                                          >
                                                                                                <div className="flex items-start justify-between gap-3">
                                                                                                      <div className="min-w-0 flex-1">
                                                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                                                  <p className="text-[15px] font-semibold leading-5 text-slate-800">{chargeTitle}</p>
                                                                                                                  {isPaid ? (
                                                                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                                                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                                              Đã thu
                                                                                                                        </span>
                                                                                                                  ) : (
                                                                                                                        <InlineBadge className={getStatusClass(charge.status)}>
                                                                                                                              {getStatusLabel(charge.status)}
                                                                                                                        </InlineBadge>
                                                                                                                  )}
                                                                                                            </div>
                                                                                                            <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                                                                                                  {formatMoney(charge.amount)} · thu {formatMoney(charge.paidAmount)} · còn {formatMoney(charge.remainingAmount)}
                                                                                                            </p>
                                                                                                      </div>
                                                                                                      <div className="flex shrink-0 items-center gap-1.5">
                                                                                                            {canEdit ? (
                                                                                                                  <button
                                                                                                                        type="button"
                                                                                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 transition hover:border-amber-200 hover:text-amber-700"
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
                                                                                                                        className="rounded-xl border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                                                                                                                        onClick={() => onCancelCharge(charge)}
                                                                                                                  >
                                                                                                                        Hủy
                                                                                                                  </button>
                                                                                                            ) : null}
                                                                                                      </div>
                                                                                                </div>
                                                                                          </div>
                                                                                    );
                                                                              })}
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-3 py-4 text-right font-semibold text-slate-900">{formatMoney(group.amount)}</td>
                                                                  <td className="px-3 py-4 text-right text-slate-600">{formatMoney(group.paidAmount)}</td>
                                                                  <td className="px-3 py-4 text-right font-semibold text-slate-800">{formatMoney(group.remainingAmount)}</td>
                                                                  <td className="px-3 py-4 text-right">
                                                                        {canCollect ? (
                                                                              <button
                                                                                    type="button"
                                                                                    className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                                                                                    onClick={() => openGroupPaymentForChargeGroup(group)}
                                                                              >
                                                                                    Thu
                                                                              </button>
                                                                        ) : (
                                                                              <span className="text-xs text-slate-400">-</span>
                                                                        )}
                                                                  </td>
                                                            </tr>
                                                      );
                                                })}
                                                {!groupedCharges.length ? (
                                                      <tr>
                                                            <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                                                                  Chưa có khoản phải thu phù hợp.
                                                            </td>
                                                      </tr>
                                                ) : null}
                                          </tbody>
                                    </table>
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

                        <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                              {detail ? (
                                    <>
                                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                      <h2 className="text-base font-semibold text-slate-900">Áp dụng khoản thu</h2>
                                                      <p className="text-sm text-slate-500">
                                                            Chỉ mở khi cần tạo thêm khoản phí cho tháng đang chọn.
                                                      </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                      <button
                                                            type="button"
                                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                                                            onClick={() => setApplyPanelOpen((value) => !value)}
                                                      >
                                                            {applyPanelOpen ? "Thu gọn" : "Mở áp dụng"}
                                                      </button>
                                                      {applyPanelOpen ? (
                                                            <>
                                                                  <button
                                                                        type="button"
                                                                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                                                                        onClick={() => togglePeriodItemForAllEligible(0, true, 0)}
                                                                  >
                                                                        Apply all đủ điều kiện
                                                                  </button>
                                                                  <button
                                                                        type="button"
                                                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                                                                        onClick={() => togglePeriodItemForAllEligible(0, false, 0)}
                                                                  >
                                                                        Bỏ chọn tất cả
                                                                  </button>
                                                            </>
                                                      ) : null}
                                                </div>
                                          </div>

                                          {!applyPanelOpen ? (
                                                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-slate-600">
                                                      Đang có <span className="font-semibold text-slate-900">{groupedCharges.length}</span> học viên trong danh sách phải thu tháng này. Mở phần áp dụng khi cần tạo thêm khoản phí.
                                                </div>
                                          ) : (
                                                <>
                                                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                            {periodItems.map((item: any) => {
                                                                  const itemId = Number(item.id);
                                                                  const allSelected = isPeriodItemSelectedForAllEligible(itemId);
                                                                  const selectedCount = getPeriodItemSelectedCount(itemId);

                                                                  return (
                                                                        <button
                                                                              key={item.id}
                                                                              type="button"
                                                                              onClick={() => togglePeriodItemForAllEligible(itemId, !allSelected, item.amount)}
                                                                              className={`rounded-2xl border p-3 text-left transition ${allSelected ? "border-amber-300 bg-amber-50/80 shadow-sm" : "border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/40"}`}
                                                                        >
                                                                              <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                          <p className="text-sm font-semibold text-slate-900">{item.feeTypeName}</p>
                                                                                          <p className="mt-1 text-sm text-slate-500">
                                                                                                {formatMoney(item.amount)} · {Number(item.isDefaultChecked) === 1 ? "Mặc định chọn" : "Không mặc định"}
                                                                                          </p>
                                                                                          <p className="mt-2 text-xs text-slate-500">
                                                                                                Đã chọn {selectedCount}/{getPeriodItemEligibleResidents(itemId).length || 0} học viên
                                                                                          </p>
                                                                                    </div>
                                                                                    <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs ${allSelected ? "border-amber-400 bg-amber-500 text-white" : "border-slate-300 bg-white text-transparent"}`}>
                                                                                          ✓
                                                                                    </span>
                                                                              </div>
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>

                                                      {selectionMessage ? (
                                                            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                                  {selectionMessage}
                                                            </div>
                                                      ) : null}

                                                      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                  <div>
                                                                        <p className="text-sm font-semibold text-slate-900">Dự kiến áp dụng</p>
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                              Tính theo các ô đang được chọn, chưa tạo khoản phải thu thật.
                                                                        </p>
                                                                  </div>
                                                                  <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
                                                                        <MiniSummary label="Học viên" value={String(projectedApplySummary.residentCount)} />
                                                                        <MiniSummary label="Khoản phí" value={String(projectedApplySummary.totalItems)} />
                                                                        <MiniSummary label="Tổng tiền" value={formatMoney(projectedApplySummary.totalAmount)} />
                                                                  </div>
                                                            </div>
                                                            <div className="mt-3 grid gap-2 md:grid-cols-3">
                                                                  {projectedApplySummary.items.map((item: any) => (
                                                                        <div key={item.id} className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                                                                              <p className="truncate text-xs font-semibold text-slate-700">{item.name}</p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {item.count} khoản · {formatMoney(item.amount)}
                                                                              </p>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      </div>

                                                      <div className="mt-4 overflow-hidden rounded-[26px] border border-white/85 bg-white/92 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                                                            <table className="w-full table-fixed divide-y divide-slate-100 text-sm">
                                                                  <colgroup>
                                                                        <col className="w-[24%]" />
                                                                        {periodItems.map((item: any) => (
                                                                              <col key={item.id} className="w-[25.33%]" />
                                                                        ))}
                                                                  </colgroup>
                                                                  <thead className="bg-gradient-to-r from-[#fff8e8] via-white to-[#f7e3ab]/65 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                                                        <tr>
                                                                              <th className="px-3 py-3 text-left">Học viên</th>
                                                                              {periodItems.map((item: any) => (
                                                                                    <th key={item.id} className="px-2 py-3 text-left">{item.feeTypeName}</th>
                                                                              ))}
                                                                        </tr>
                                                                  </thead>
                                                                  <tbody className="divide-y divide-slate-100 bg-white/95">
                                                                        {!previewResidents.length ? (
                                                                              <tr>
                                                                                    <td colSpan={periodItems.length + 1} className="px-4 py-8 text-center text-sm text-slate-500">
                                                                                          {"Chưa có học viên trong danh sách áp dụng cho tháng này."}
                                                                                    </td>
                                                                              </tr>
                                                                        ) : null}
                                                                        {previewResidents.map((resident: any) => (
                                                                              <tr key={resident.id} className={!resident.eligible ? "bg-slate-50 text-slate-400" : ""}>
                                                                                    <td className="px-3 py-3">
                                                                                          <p className="font-medium text-slate-900">{resident.fullName}</p>
                                                                                          <p className="text-xs text-slate-500">{resident.residentCode || "Chưa có mã"}</p>
                                                                                          {!resident.eligible ? (
                                                                                                <p className="mt-1 text-[11px] text-amber-700">{resident.reason || "Không đủ điều kiện"}</p>
                                                                                          ) : null}
                                                                                    </td>
                                                                                    {periodItems.map((item: any) => {
                                                                                          const selected = residentSelections[String(resident.id)]?.[String(item.id)];
                                                                                          const alreadyApplied = isResidentItemAlreadyApplied(resident, item);
                                                                                          const selectable = isResidentItemSelectable(resident, item);
                                                                                          return (
                                                                                                <td key={item.id} className={`px-1.5 py-3 ${alreadyApplied ? "bg-slate-50 text-slate-400" : ""}`}>
                                                                                                      <label className="grid min-w-0 grid-cols-[18px_minmax(132px,1fr)] items-center gap-1.5">
                                                                                                            <input
                                                                                                                  type="checkbox"
                                                                                                                  className="h-3.5 w-3.5 justify-self-center"
                                                                                                                  disabled={!selectable}
                                                                                                                  checked={Boolean(alreadyApplied || (selected?.selected && selectable))}
                                                                                                                  onChange={(event) =>
                                                                                                                        toggleResidentItem(Number(resident.id), Number(item.id), event.target.checked)
                                                                                                                  }
                                                                                                            />
                                                                                                            <input
                                                                                                                  type="text"
                                                                                                                  inputMode="numeric"
                                                                                                                  disabled={!selectable || !selected?.selected}
                                                                                                                  value={selected?.amount || formatMoneyInput(item.amount)}
                                                                                                                  onChange={(event) =>
                                                                                                                        updateResidentItemAmount(Number(resident.id), Number(item.id), event.target.value)
                                                                                                                  }
                                                                                                                  className="w-full min-w-[132px] rounded-lg border border-slate-200 px-2 py-2 text-right text-[12px] font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                                                                                                            />
                                                                                                      </label>
                                                                                                </td>
                                                                                          );
                                                                                    })}
                                                                              </tr>
                                                                        ))}
                                                                  </tbody>
                                                            </table>
                                                      </div>

                                                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <p className="text-xs text-slate-500">
                                                                  {hasSelectedApplicableItems
                                                                        ? `Sẽ tạo ${projectedApplySummary.totalItems} khoản cho ${projectedApplySummary.residentCount} học viên, tổng ${formatMoney(projectedApplySummary.totalAmount)}.`
                                                                        : "Chưa có khoản nào được chọn để tạo."}
                                                            </p>
                                                            <button
                                                                  type="button"
                                                                  className={`${residenceMediumStyle.buttonCardPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
                                                                  onClick={submitApplyPeriod}
                                                                  disabled={applyPeriodMutationPending || !hasSelectedApplicableItems}
                                                            >
                                                                  {applyPeriodMutationPending ? "Đang áp dụng..." : "Lưu áp dụng khoản thu"}
                                                            </button>
                                                      </div>
                                                </>
                                          )}
                                    </>
                              ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                                          Chọn một kỳ thu để xem chi tiết.
                                    </div>
                              )}
                        </section>
                  </div>
            </div>
      );
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
            <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
      );
}
