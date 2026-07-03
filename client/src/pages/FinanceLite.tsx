"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Pencil, Plus, Search, Users, WalletCards, CreditCard } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { InlineBadge } from "@/components/shared/display/InlineBadge";
import {
      FinanceCreatePeriodModal,
      FinanceEditChargeModal,
      FinanceGroupPaymentModal,
      FinancePaymentModal,
      FinanceTransactionModal,
} from "@/components/finance-lite/FinanceLiteModals";
import { FinanceSummaryCards } from "@/components/finance-lite/FinanceSummaryCards";
import { FinanceTabRail } from "@/components/finance-lite/FinanceTabRail";
import {
      FinanceCashbookPanel,
      FinanceExpensePlansPanel,
      FinanceExpensesPanel,
      FinancePeriodSelector,
} from "@/components/finance-lite/FinanceLitePanels";
import { FinanceLiteStudentLedger } from "@/components/finance-lite/FinanceLiteStudentLedger";
import { FinanceVoucherPreviewModal } from "@/components/finance-lite/FinanceVoucherPreviewModal";
import type {
      ChargeStatus,
      EditChargeState,
      FinanceTab,
      PeriodFormState,
} from "@/components/finance-lite/financeLiteTypes";
import {
      emptyPeriodForm,
      formatMoney,
      formatMoneyInput,
      getBillingMonthLabel,
      getCurrentBillingMonth,
      getVietnamDateInputValue,
      getStatusClass,
      getStatusLabel,
      getTransactionDirectionForSource,
      monthNames,
      periodContainsBillingMonth,
      toMoneyNumber,
} from "@/components/finance-lite/financeLiteUtils";
import { trpc } from "@/lib/trpc";

export default function FinanceLite() {
      const financeApi = (trpc as any).finance;
      const [activeTab, setActiveTab] = useState<FinanceTab>("studentLedger");
      const [searchTerm, setSearchTerm] = useState("");
      const [statusFilter, setStatusFilter] = useState<ChargeStatus>("all");
      const [studentLedgerPage, setStudentLedgerPage] = useState(1);
      const [studentLedgerPageSize, setStudentLedgerPageSize] = useState(7);
      const [periodFormOpen, setPeriodFormOpen] = useState(false);
      const [periodFormMessage, setPeriodFormMessage] = useState("");
      const [periodForm, setPeriodForm] = useState<PeriodFormState>(() =>
            emptyPeriodForm(),
      );
      const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
      const [selectedBillingMonth, setSelectedBillingMonth] = useState("");
      const [voucherTransaction, setVoucherTransaction] = useState<any | null>(null);
      const monthCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

      useEffect(() => {
            const handleVoucherPrint = (event: Event) => {
                  const detail = (event as CustomEvent<any>).detail;
                  if (detail) setVoucherTransaction(detail);
            };
            window.addEventListener("finance-voucher-print", handleVoucherPrint as EventListener);
            return () => {
                  window.removeEventListener("finance-voucher-print", handleVoucherPrint as EventListener);
            };
      }, []);
      const [selectionMessage, setSelectionMessage] = useState("");
      const [selectionKey, setSelectionKey] = useState("");
      const [applyPanelOpen, setApplyPanelOpen] = useState(false);
      const [residentSelections, setResidentSelections] = useState<
            Record<string, Record<string, { selected: boolean; amount: string }>>
      >({});
      const [paymentFormOpen, setPaymentFormOpen] = useState(false);
      const [paymentFormMessage, setPaymentFormMessage] = useState("");
      const [paymentForm, setPaymentForm] = useState({
            chargeId: "",
            residentId: "",
            amount: "",
            paymentDate: "",
            method: "cash",
            note: "",
      });
      const [groupPaymentOpen, setGroupPaymentOpen] = useState(false);
      const [groupPaymentMessage, setGroupPaymentMessage] = useState("");
      const [groupPaymentForm, setGroupPaymentForm] = useState({
            periodId: "",
            billingMonth: "",
            residentId: "",
            amount: "",
            paymentDate: "",
            method: "cash",
            note: "",
      });
      const [groupPaymentSelectedChargeIds, setGroupPaymentSelectedChargeIds] =
            useState<Record<string, boolean>>({});
      const [groupPaymentLineAmounts, setGroupPaymentLineAmounts] = useState<
            Record<string, string>
      >({});
      const [editChargeOpen, setEditChargeOpen] = useState(false);
      const [editChargeMessage, setEditChargeMessage] = useState("");
      const [editChargeForm, setEditChargeForm] = useState<EditChargeState>({
            id: "",
            feeTypeId: "",
            amount: "",
            dueDate: "",
            billingMonth: "",
            periodStartDate: "",
            periodEndDate: "",
            periodChargeMode: "full_month",
            status: "open",
            targetName: "",
            description: "",
      });
      const [transactionFormOpen, setTransactionFormOpen] = useState(false);
      const [transactionFormMessage, setTransactionFormMessage] = useState("");
      const [transactionForm, setTransactionForm] = useState({
            source: "other_income",
            direction: "in",
            amount: "",
            transactionDate: getVietnamDateInputValue(),
            targetName: "",
            description: "",
            expenseKind: "one_time",
            expenseBillingMonth: selectedBillingMonth || getCurrentBillingMonth(),
            expenseFromMonth: selectedBillingMonth || getCurrentBillingMonth(),
            expenseToMonth: selectedBillingMonth || getCurrentBillingMonth(),
            expensePreset: "",
            expensePresetLabel: "",
            advancePeriodMode: "week",
            advanceStartDate: getVietnamDateInputValue(),
            advanceEndDate: getVietnamDateInputValue(),
            advanceReceiverType: "committee",
            advanceReceiverId: "",
            incomeKind: "other",
            planDueMode: "first_day",
            planFixedDay: "01",
      });
      const [deleteTransactionTarget, setDeleteTransactionTarget] = useState<any | null>(null);
      const [deleteTransactionMessage, setDeleteTransactionMessage] = useState("");

      function openTransactionForm(source = "other_income") {
            const requestedSource = source || "other_income";
            const baseSource = requestedSource.startsWith("expense_") ? "expense" : requestedSource;
            const defaultExpenseKind =
                  requestedSource === "expense_plan"
                        ? "period"
                        : requestedSource === "expense_advance"
                              ? "advance"
                              : requestedSource === "expense_once" || baseSource === "expense"
                                    ? "one_time"
                                    : "one_time";
            const defaultIncomeKind = requestedSource === "donation" ? "donation" : "other";
            const defaultPreset =
                  defaultExpenseKind === "period"
                        ? { key: "electricity", label: "Điện", targetName: "EVN", description: "Dự chi tiền điện theo kỳ" }
                        : defaultExpenseKind === "advance"
                              ? { key: "market", label: "Tạm ứng tiền chợ", targetName: "Ban Hậu cần", description: "Tạm ứng tiền chợ theo kỳ" }
                              : defaultExpenseKind === "one_time" && baseSource === "expense"
                                    ? { key: "repair", label: "Sửa chữa", targetName: "", description: "Chi phí phát sinh" }
                                    : { key: "", label: "", targetName: "", description: "" };

            setTransactionFormMessage("");
            setTransactionForm({
                  source: baseSource,
                  direction: getTransactionDirectionForSource(
                        requestedSource === "expense_plan" ? "expense_plan" : baseSource,
                        transactionForm.direction,
                  ),
                  amount: "",
                  transactionDate: getVietnamDateInputValue(),
                  targetName: defaultPreset.targetName,
                  description: defaultPreset.description,
                  expenseKind: defaultExpenseKind,
                  expenseBillingMonth: selectedBillingMonth || getCurrentBillingMonth(),
                  expenseFromMonth: selectedBillingMonth || getCurrentBillingMonth(),
                  expenseToMonth: selectedBillingMonth || getCurrentBillingMonth(),
                  expensePreset: defaultPreset.key,
                  expensePresetLabel: defaultPreset.label,
                  advancePeriodMode: "week",
                  advanceStartDate: getVietnamDateInputValue(),
                  advanceEndDate: getVietnamDateInputValue(),
                  advanceReceiverType: "committee",
                  advanceReceiverId: "",
                  incomeKind: defaultIncomeKind,
                  planDueMode: "first_day",
                  planFixedDay: "01",
            });
            setTransactionFormOpen(true);
      }

      const summaryQuery = financeApi?.summary?.useQuery?.();
      const feeTypesQuery = financeApi?.listFeeTypes?.useQuery?.({
            isActive: true,
      });
      const periodsQuery = financeApi?.listChargePeriods?.useQuery?.();
      const periodDetailQuery = financeApi?.getChargePeriodDetail?.useQuery?.(
            { periodId: selectedPeriodId || 0 },
            { enabled: Boolean(selectedPeriodId) },
      );
      const previewQuery = financeApi?.previewChargePeriodResidents?.useQuery?.(
            {
                  periodId: selectedPeriodId || 0,
                  billingMonth: selectedBillingMonth || "1900-01",
            },
            { enabled: Boolean(selectedPeriodId && selectedBillingMonth) },
      );
      const chargesQuery = financeApi?.listCharges?.useQuery?.({
            search: searchTerm || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            limit: 300,
      });
      const transactionsQuery = financeApi?.listTransactions?.useQuery?.({
            search: searchTerm || undefined,
            limit: 200,
      });
      const activeResidentsQuery = (trpc as any).members?.list?.useQuery?.(
            { page: 1, pageSize: 500, status: "active" },
            { enabled: transactionFormOpen },
      );
      const organizationUnitsQuery = (trpc as any).organization?.listUnits?.useQuery?.(
            { isActive: true },
            { enabled: transactionFormOpen },
      );

      const rawPeriods = periodsQuery?.data || [];
      const currentBillingMonth = useMemo(() => getCurrentBillingMonth(), []);
      const periods = useMemo(() => {
            return [...rawPeriods].sort((left: any, right: any) => {
                  const yearDiff = Number(right?.year || 0) - Number(left?.year || 0);
                  if (yearDiff !== 0) return yearDiff;
                  const fromDiff =
                        Number(right?.fromMonth || 0) - Number(left?.fromMonth || 0);
                  if (fromDiff !== 0) return fromDiff;
                  return Number(right?.id || 0) - Number(left?.id || 0);
            });
      }, [rawPeriods]);
      const selectedPeriod = useMemo(
            () =>
                  periods.find(
                        (period: any) => Number(period.id) === Number(selectedPeriodId || 0),
                  ) || null,
            [periods, selectedPeriodId],
      );
      const selectedPeriodMonths = useMemo(
            () => (selectedPeriod ? getPeriodMonthsFromPeriod(selectedPeriod) : []),
            [selectedPeriod],
      );
      const detail = periodDetailQuery?.data || null;
      const periodItems = detail?.items || [];
      const periodMonths = detail?.months || [];
      const previewResidents = previewQuery?.data || [];
      const charges = chargesQuery?.data || [];
      const transactions = transactionsQuery?.data || [];
      const feeTypes = feeTypesQuery?.data || [];
      const advanceReceiverOptions = useMemo(
            () => buildFinanceAdvanceReceiverOptions(activeResidentsQuery?.data, organizationUnitsQuery?.data),
            [activeResidentsQuery?.data, organizationUnitsQuery?.data],
      );
      const summary = summaryQuery?.data || {
            totalOpenAmount: 0,
            totalPaidAmount: 0,
            totalCashIn: 0,
            totalCashOut: 0,
            openChargeCount: 0,
            paidChargeCount: 0,
      };

      useEffect(() => {
            if (selectedPeriodId || periods.length === 0) return;
            const defaultPeriod =
                  periods.find((period: any) =>
                        periodContainsBillingMonth(period, currentBillingMonth),
                  ) || periods[0];
            const months = getPeriodMonthsFromPeriod(defaultPeriod);
            const defaultMonth =
                  months.find((month: any) => month.value === currentBillingMonth)?.value ||
                  months[0]?.value ||
                  "";
            setSelectedPeriodId(Number(defaultPeriod.id));
            setSelectedBillingMonth(defaultMonth);
      }, [periods, selectedPeriodId, currentBillingMonth]);

      useEffect(() => {
            if (
                  selectedPeriodMonths.length > 0 &&
                  !selectedPeriodMonths.some(
                        (month: any) => month.value === selectedBillingMonth,
                  )
            ) {
                  const defaultMonth =
                        selectedPeriodMonths.find(
                              (month: any) => month.value === currentBillingMonth,
                        )?.value || selectedPeriodMonths[0].value;
                  setSelectedBillingMonth(defaultMonth);
            }
      }, [selectedPeriodMonths, selectedBillingMonth, currentBillingMonth]);

      useEffect(() => {
            if (!selectedBillingMonth) return;
            const node = monthCardRefs.current[selectedBillingMonth];
            if (!node) return;
            requestAnimationFrame(() => {
                  node.scrollIntoView({ block: "nearest", behavior: "smooth" });
            });
      }, [selectedBillingMonth, selectedPeriodId]);

      useEffect(() => {
            const residentApplySignature = previewResidents
                  .map(
                        (resident: any) =>
                              `${resident.id}:${Array.isArray(resident?.existingPeriodItemIds) ? resident.existingPeriodItemIds.join("|") : ""}:${resident?.eligible ? "1" : "0"}`,
                  )
                  .join(",");
            const nextKey = `${selectedPeriodId || ""}:${selectedBillingMonth}:${residentApplySignature}:${periodItems.map((item: any) => item.id).join(",")}`;
            if (
                  !selectedPeriodId ||
                  !selectedBillingMonth ||
                  !previewResidents.length ||
                  !periodItems.length ||
                  selectionKey === nextKey
            )
                  return;

            const nextSelections: Record<
                  string,
                  Record<string, { selected: boolean; amount: string }>
            > = {};
            for (const resident of previewResidents) {
                  nextSelections[String(resident.id)] = {};
                  for (const item of periodItems) {
                        nextSelections[String(resident.id)][String(item.id)] = {
                              selected: Boolean(
                                    isResidentItemSelectable(resident, item) &&
                                    Number(item.isDefaultChecked || 0) === 1,
                              ),
                              amount: formatMoneyInput(item.amount),
                        };
                  }
            }
            setResidentSelections(nextSelections);
            setSelectionKey(nextKey);
      }, [
            selectedPeriodId,
            selectedBillingMonth,
            previewResidents,
            periodItems,
            selectionKey,
      ]);

      const createPeriodMutation = financeApi?.createChargePeriod?.useMutation?.({
            onSuccess: (result: any) => {
                  setPeriodFormMessage(
                        "Đã tạo kỳ thu. Có thể vào chi tiết để áp dụng cho học viên.",
                  );
                  setPeriodFormOpen(false);
                  setPeriodForm(emptyPeriodForm());
                  periodsQuery?.refetch?.();
                  if (result?.periodId) setSelectedPeriodId(Number(result.periodId));
            },
            onError: (error: any) =>
                  setPeriodFormMessage(error?.message || "Không thể tạo kỳ thu."),
      });

      const applyPeriodMutation = financeApi?.applyChargePeriod?.useMutation?.({
            onSuccess: (result: any) => {
                  const skippedText = result?.skippedCount
                        ? ` Bỏ qua ${result.skippedCount} khoản đã tồn tại.`
                        : "";
                  setSelectionMessage(
                        `Đã tạo ${result?.createdCount || 0} khoản phải thu.${skippedText}`,
                  );
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  previewQuery?.refetch?.();
                  periodDetailQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) =>
                  setSelectionMessage(error?.message || "Không thể áp dụng kỳ thu."),
      });

      const updateChargeMutation = financeApi?.updateCharge?.useMutation?.({
            onSuccess: () => {
                  setEditChargeMessage("Đã cập nhật khoản phải thu.");
                  setEditChargeOpen(false);
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) =>
                  setEditChargeMessage(
                        error?.message || "Không thể cập nhật khoản phải thu.",
                  ),
      });

      const recordPaymentMutation = financeApi?.recordPayment?.useMutation?.({
            onSuccess: () => {
                  setPaymentFormMessage("");
                  setPaymentFormOpen(false);
                  setPaymentForm({
                        chargeId: "",
                        residentId: "",
                        amount: "",
                        paymentDate: "",
                        method: "cash",
                        note: "",
                  });
                  chargesQuery?.refetch?.();
                  transactionsQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) =>
                  setPaymentFormMessage(error?.message || "Không thể ghi nhận thanh toán."),
      });

      const recordGroupedPaymentMutation = financeApi?.recordPayment?.useMutation?.(
            {
                  onSuccess: () => {
                        chargesQuery?.refetch?.();
                        transactionsQuery?.refetch?.();
                        periodsQuery?.refetch?.();
                        summaryQuery?.refetch?.();
                  },
                  onError: (error: any) =>
                        setGroupPaymentMessage(
                              error?.message || "Không thể ghi nhận thanh toán theo học viên.",
                        ),
            },
      );

      const cancelChargeMutation = financeApi?.cancelCharge?.useMutation?.({
            onSuccess: () => {
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) =>
                  alert(error?.message || "Không thể hủy khoản phải thu."),
      });

      const createTransactionMutation =
            financeApi?.createTransaction?.useMutation?.({
                  onSuccess: () => {
                        setTransactionFormOpen(false);
                        setTransactionFormMessage("");
                        setTransactionForm({
                              source: "other_income",
                              direction: "in",
                              amount: "",
                              transactionDate: "",
                              targetName: "",
                              description: "",
                              expenseKind: "one_time",
                              expenseBillingMonth: selectedBillingMonth || getCurrentBillingMonth(),
                              expenseFromMonth: selectedBillingMonth || getCurrentBillingMonth(),
                              expenseToMonth: selectedBillingMonth || getCurrentBillingMonth(),
                              expensePreset: "",
                              expensePresetLabel: "",
                              advancePeriodMode: "week",
                              advanceStartDate: getVietnamDateInputValue(),
                              advanceEndDate: getVietnamDateInputValue(),
                              advanceReceiverType: "committee",
                              advanceReceiverId: "",
                              incomeKind: "other",
                        });
                        transactionsQuery?.refetch?.();
                        summaryQuery?.refetch?.();
                  },
                  onError: (error: any) =>
                        setTransactionFormMessage(
                              error?.message || "Không thể lưu nghiệp vụ thu chi.",
                        ),
            });

      const deleteTransactionMutation =
            financeApi?.deleteTransaction?.useMutation?.({
                  onSuccess: () => {
                        setDeleteTransactionTarget(null);
                        setDeleteTransactionMessage("");
                        transactionsQuery?.refetch?.();
                        summaryQuery?.refetch?.();
                  },
                  onError: (error: any) =>
                        setDeleteTransactionMessage(error?.message || "Không thể xóa khoản thu chi này."),
            });

      const deleteTransaction = (transaction: any) => {
            if (!transaction?.id) return;
            setDeleteTransactionMessage("");
            if (transaction.source === "student_fee_payment") {
                  setDeleteTransactionTarget({
                        ...transaction,
                        lockedMessage: "Khoản thu học viên đã liên kết thanh toán, không xóa trực tiếp ở Sổ thu chi.",
                  });
                  return;
            }
            setDeleteTransactionTarget(transaction);
      };

      const confirmDeleteTransaction = () => {
            if (!deleteTransactionTarget?.id || deleteTransactionTarget?.lockedMessage) return;
            deleteTransactionMutation?.mutate?.({ id: Number(deleteTransactionTarget.id) });
      };

      const selectedPeriodScopedCharges = useMemo(() => {
            let scoped = charges;
            if (selectedPeriodId) {
                  scoped = scoped.filter(
                        (charge: any) =>
                              Number(charge?.periodId || 0) === Number(selectedPeriodId),
                  );
            }
            if (selectedBillingMonth) {
                  scoped = scoped.filter(
                        (charge: any) =>
                              !charge?.billingMonth ||
                              String(charge.billingMonth) === String(selectedBillingMonth),
                  );
            }
            return scoped;
      }, [charges, selectedPeriodId, selectedBillingMonth]);
      const openCharges = useMemo(
            () =>
                  selectedPeriodScopedCharges.filter((charge: any) =>
                        ["open", "partial"].includes(String(charge.status || "open")),
                  ),
            [selectedPeriodScopedCharges],
      );
      const selectedCharge = useMemo(
            () =>
                  charges.find(
                        (charge: any) =>
                              Number(charge.id) === Number(paymentForm.chargeId || 0),
                  ),
            [charges, paymentForm.chargeId],
      );
      const groupedCharges = useMemo(() => {
            const groupMap = new Map<string, any>();
            for (const charge of selectedPeriodScopedCharges) {
                  const residentKey = charge?.residentId
                        ? `resident-${charge.residentId}`
                        : `target-${charge?.targetType || "other"}-${charge?.targetName || charge?.id}`;
                  const periodKey = charge?.periodId
                        ? `period-${charge.periodId}`
                        : `period-name-${charge?.periodName || "other"}`;
                  const monthKey = String(charge?.billingMonth || "no-month");
                  const key = `${residentKey}|${periodKey}|${monthKey}`;
                  const current = groupMap.get(key) || {
                        key,
                        residentId: charge?.residentId || null,
                        residentName:
                              charge?.residentName || charge?.targetName || "Học viên / đối tượng",
                        residentCode: charge?.residentCode || charge?.targetType || "",
                        periodId: charge?.periodId || null,
                        periodName: charge?.periodName || "",
                        billingMonth: charge?.billingMonth || "",
                        charges: [],
                        amount: 0,
                        paidAmount: 0,
                        remainingAmount: 0,
                  };
                  current.charges.push(charge);
                  current.amount += toMoneyNumber(charge?.amount || 0);
                  current.paidAmount += toMoneyNumber(charge?.paidAmount || 0);
                  current.remainingAmount += toMoneyNumber(charge?.remainingAmount || 0);
                  groupMap.set(key, current);
            }
            return Array.from(groupMap.values()).map((group: any) => {
                  const activeCharges = group.charges.filter(
                        (charge: any) => String(charge?.status || "") !== "cancelled",
                  );
                  const hasOpen = activeCharges.some(
                        (charge: any) => String(charge?.status || "open") === "open",
                  );
                  const hasPartial = activeCharges.some(
                        (charge: any) => String(charge?.status || "") === "partial",
                  );
                  const hasPaid = activeCharges.some(
                        (charge: any) =>
                              String(charge?.status || "") === "paid" ||
                              toMoneyNumber(charge?.paidAmount || 0) > 0,
                  );
                  const allCancelled =
                        group.charges.length > 0 &&
                        group.charges.every(
                              (charge: any) => String(charge?.status || "") === "cancelled",
                        );
                  const status = allCancelled
                        ? "cancelled"
                        : group.remainingAmount <= 0 && activeCharges.length
                              ? "paid"
                              : hasPartial || (hasPaid && group.remainingAmount > 0)
                                    ? "partial"
                                    : hasOpen
                                          ? "open"
                                          : String(group.charges[0]?.status || "open");
                  return { ...group, status, chargeCount: group.charges.length };
            });
      }, [selectedPeriodScopedCharges]);

      useEffect(() => {
            setStudentLedgerPage(1);
      }, [selectedPeriodId, selectedBillingMonth, searchTerm, statusFilter, studentLedgerPageSize]);

      const studentLedgerTotalPages = Math.max(
            1,
            Math.ceil(groupedCharges.length / studentLedgerPageSize),
      );

      const safeStudentLedgerPage = Math.min(
            studentLedgerPage,
            studentLedgerTotalPages,
      );

      const paginatedGroupedCharges = useMemo(() => {
            const startIndex = (safeStudentLedgerPage - 1) * studentLedgerPageSize;
            return groupedCharges.slice(startIndex, startIndex + studentLedgerPageSize);
      }, [groupedCharges, safeStudentLedgerPage, studentLedgerPageSize]);

      const studentLedgerStartIndex = groupedCharges.length
            ? (safeStudentLedgerPage - 1) * studentLedgerPageSize + 1
            : 0;
      const studentLedgerEndIndex = groupedCharges.length
            ? Math.min(safeStudentLedgerPage * studentLedgerPageSize, groupedCharges.length)
            : 0;

      const groupSelectedPeriod = useMemo(
            () =>
                  periods.find(
                        (period: any) =>
                              Number(period.id) === Number(groupPaymentForm.periodId || 0),
                  ) || null,
            [periods, groupPaymentForm.periodId],
      );
      const groupPaymentMonths = useMemo(
            () =>
                  groupSelectedPeriod ? getPeriodMonthsFromPeriod(groupSelectedPeriod) : [],
            [groupSelectedPeriod],
      );
      const groupPaymentCandidateCharges = useMemo(() => {
            return charges.filter((charge: any) => {
                  if (
                        groupPaymentForm.periodId &&
                        Number(charge?.periodId || 0) !== Number(groupPaymentForm.periodId)
                  )
                        return false;
                  if (
                        groupPaymentForm.billingMonth &&
                        String(charge?.billingMonth || "") !==
                        String(groupPaymentForm.billingMonth)
                  )
                        return false;
                  return Boolean(
                        charge?.residentId && toMoneyNumber(charge?.remainingAmount || 0) > 0,
                  );
            });
      }, [charges, groupPaymentForm.periodId, groupPaymentForm.billingMonth]);
      const groupPaymentResidents = useMemo(() => {
            const residentMap = new Map<
                  number,
                  {
                        id: number;
                        name: string;
                        code: string;
                        totalRemaining: number;
                        chargeCount: number;
                  }
            >();
            for (const charge of groupPaymentCandidateCharges) {
                  const residentId = Number(charge?.residentId || 0);
                  if (!residentId) continue;
                  const current = residentMap.get(residentId) || {
                        id: residentId,
                        name: String(charge?.residentName || charge?.targetName || "Học viên"),
                        code: String(charge?.residentCode || ""),
                        totalRemaining: 0,
                        chargeCount: 0,
                  };
                  current.totalRemaining += toMoneyNumber(charge?.remainingAmount || 0);
                  current.chargeCount += 1;
                  residentMap.set(residentId, current);
            }
            return Array.from(residentMap.values()).sort((left, right) =>
                  left.name.localeCompare(right.name, "vi"),
            );
      }, [groupPaymentCandidateCharges]);
      const groupPaymentResidentCharges = useMemo(() => {
            return groupPaymentCandidateCharges
                  .filter(
                        (charge: any) =>
                              Number(charge?.residentId || 0) ===
                              Number(groupPaymentForm.residentId || 0),
                  )
                  .sort(
                        (left: any, right: any) =>
                              Number(left?.periodItemId || left?.feeTypeId || left?.id || 0) -
                              Number(right?.periodItemId || right?.feeTypeId || right?.id || 0),
                  );
      }, [groupPaymentCandidateCharges, groupPaymentForm.residentId]);
      const groupPaymentSelectedCharges = useMemo(() => {
            return groupPaymentResidentCharges.filter((charge: any) =>
                  Boolean(groupPaymentSelectedChargeIds[String(charge.id)]),
            );
      }, [groupPaymentResidentCharges, groupPaymentSelectedChargeIds]);
      const groupPaymentSelectedRemainingTotal = useMemo(() => {
            return groupPaymentSelectedCharges.reduce(
                  (total: number, charge: any) =>
                        total + toMoneyNumber(charge?.remainingAmount || 0),
                  0,
            );
      }, [groupPaymentSelectedCharges]);
      const groupPaymentInputTotal = useMemo(() => {
            return groupPaymentSelectedCharges.reduce((total: number, charge: any) => {
                  const rawAmount = groupPaymentLineAmounts[String(charge.id)];
                  return total + toMoneyNumber(rawAmount || 0);
            }, 0);
      }, [groupPaymentSelectedCharges, groupPaymentLineAmounts]);
      const groupPaymentAfterRemainingTotal = Math.max(
            groupPaymentSelectedRemainingTotal - groupPaymentInputTotal,
            0,
      );
      const groupPaymentAllSelected =
            groupPaymentResidentCharges.length > 0 &&
            groupPaymentResidentCharges.every((charge: any) =>
                  Boolean(groupPaymentSelectedChargeIds[String(charge.id)]),
            );
      const groupPaymentHasInvalidLineAmount = useMemo(() => {
            return groupPaymentSelectedCharges.some((charge: any) => {
                  const payAmount = toMoneyNumber(
                        groupPaymentLineAmounts[String(charge.id)] || 0,
                  );
                  const remaining = toMoneyNumber(charge?.remainingAmount || 0);
                  return payAmount < 0 || payAmount > remaining;
            });
      }, [groupPaymentSelectedCharges, groupPaymentLineAmounts]);

      useEffect(() => {
            if (!groupPaymentOpen) return;
            if (!groupPaymentForm.periodId && selectedPeriodId) {
                  const months = selectedPeriodMonths.length
                        ? selectedPeriodMonths
                        : selectedPeriod
                              ? getPeriodMonthsFromPeriod(selectedPeriod)
                              : [];
                  const defaultMonth =
                        selectedBillingMonth ||
                        months.find((month: any) => month.value === currentBillingMonth)
                              ?.value ||
                        months[0]?.value ||
                        "";
                  setGroupPaymentForm((current) => ({
                        ...current,
                        periodId: String(selectedPeriodId),
                        billingMonth: defaultMonth,
                        paymentDate:
                              current.paymentDate || getVietnamDateInputValue(),
                  }));
            }
      }, [
            groupPaymentOpen,
            groupPaymentForm.periodId,
            selectedPeriodId,
            selectedPeriod,
            selectedPeriodMonths,
            selectedBillingMonth,
            currentBillingMonth,
      ]);

      useEffect(() => {
            if (!groupPaymentOpen) return;
            const currentResidentStillAvailable = groupPaymentResidents.some(
                  (resident) =>
                        Number(resident.id) === Number(groupPaymentForm.residentId || 0),
            );
            if (currentResidentStillAvailable) return;
            const firstResident = groupPaymentResidents[0];
            setGroupPaymentForm((current) => ({
                  ...current,
                  residentId: firstResident ? String(firstResident.id) : "",
                  amount: firstResident
                        ? formatMoneyInput(firstResident.totalRemaining)
                        : "",
            }));
      }, [groupPaymentOpen, groupPaymentResidents, groupPaymentForm.residentId]);

      useEffect(() => {
            if (!groupPaymentOpen) return;
            const nextSelected: Record<string, boolean> = {};
            const nextAmounts: Record<string, string> = {};
            let totalRemaining = 0;
            for (const charge of groupPaymentResidentCharges) {
                  const remaining = toMoneyNumber(charge?.remainingAmount || 0);
                  if (remaining <= 0) continue;
                  nextSelected[String(charge.id)] = true;
                  nextAmounts[String(charge.id)] = formatMoneyInput(remaining);
                  totalRemaining += remaining;
            }
            setGroupPaymentSelectedChargeIds(nextSelected);
            setGroupPaymentLineAmounts(nextAmounts);
            setGroupPaymentForm((current) => ({
                  ...current,
                  amount:
                        totalRemaining > 0 ? formatMoneyInput(totalRemaining) : current.amount,
            }));
      }, [
            groupPaymentOpen,
            groupPaymentForm.residentId,
            groupPaymentResidentCharges,
      ]);

      function getPeriodMonthsFromPeriod(period: any) {
            const year = Number(period?.year || new Date().getFullYear());
            const fromMonth = Math.max(1, Number(period?.fromMonth || 1));
            const toMonth = Math.min(12, Number(period?.toMonth || 12));
            const months = [];
            for (let month = fromMonth; month <= toMonth; month += 1) {
                  const value = `${year}-${String(month).padStart(2, "0")}`;
                  months.push({ value, label: `${monthNames[month - 1]} / ${year}` });
            }
            return months;
      }

      function getMonthChargeStats(period: any, billingMonth: string) {
            const periodId = Number(period?.id || 0);
            const relatedCharges = charges.filter((charge: any) => {
                  const samePeriod = Number(charge?.periodId || 0) === periodId;
                  const sameMonth =
                        String(charge?.billingMonth || "") === String(billingMonth || "");
                  const notCancelled = String(charge?.status || "") !== "cancelled";
                  return samePeriod && sameMonth && notCancelled;
            });
            const residentIds = new Set<number>();
            let paidAmount = 0;
            let remainingAmount = 0;
            for (const charge of relatedCharges) {
                  if (charge?.residentId) residentIds.add(Number(charge.residentId));
                  paidAmount += toMoneyNumber(charge?.paidAmount || 0);
                  remainingAmount += toMoneyNumber(charge?.remainingAmount || 0);
            }
            return {
                  chargeCount: relatedCharges.length,
                  residentCount: residentIds.size,
                  paidAmount,
                  remainingAmount,
            };
      }

      function selectPeriodMonth(period: any, billingMonth?: string) {
            const months = getPeriodMonthsFromPeriod(period);
            setSelectedPeriodId(Number(period.id));
            setSelectedBillingMonth(billingMonth || months[0]?.value || "");
            setSelectionMessage("");
      }

      function submitCreatePeriod() {
            setPeriodFormMessage("");
            if (!periodForm.periodName.trim()) {
                  setPeriodFormMessage("Vui lòng nhập tên kỳ thu.");
                  return;
            }
            const year = Number(periodForm.year);
            const fromMonth = Number(periodForm.fromMonth);
            const toMonth = Number(periodForm.toMonth);
            if (!year || !fromMonth || !toMonth || fromMonth > toMonth) {
                  setPeriodFormMessage("Năm hoặc khoảng tháng áp dụng chưa hợp lệ.");
                  return;
            }
            createPeriodMutation?.mutate?.({
                  periodName: periodForm.periodName.trim(),
                  year,
                  fromMonth,
                  toMonth,
                  lodgingAmount: toMoneyNumber(periodForm.lodgingAmount),
                  mealLivingAmount: toMoneyNumber(periodForm.mealLivingAmount),
                  otherAmount: toMoneyNumber(periodForm.otherAmount),
                  description: periodForm.description || null,
            });
      }

      function toggleResidentItem(
            residentId: number,
            itemId: number,
            checked: boolean,
      ) {
            setResidentSelections((current) => ({
                  ...current,
                  [residentId]: {
                        ...(current[String(residentId)] || {}),
                        [itemId]: {
                              ...(current[String(residentId)]?.[String(itemId)] || { amount: "" }),
                              selected: checked,
                        },
                  },
            }));
      }

      function updateResidentItemAmount(
            residentId: number,
            itemId: number,
            amount: string,
      ) {
            setResidentSelections((current) => ({
                  ...current,
                  [residentId]: {
                        ...(current[String(residentId)] || {}),
                        [itemId]: {
                              ...(current[String(residentId)]?.[String(itemId)] || {
                                    selected: false,
                              }),
                              amount: formatMoneyInput(amount),
                        },
                  },
            }));
      }

      function isResidentItemAlreadyApplied(resident: any, item: any) {
            const existingIds = Array.isArray(resident?.existingPeriodItemIds)
                  ? resident.existingPeriodItemIds.map((value: any) => Number(value))
                  : [];
            return existingIds.includes(Number(item?.id));
      }

      function isResidentItemSelectable(resident: any, item: any) {
            return Boolean(
                  resident?.eligible && !isResidentItemAlreadyApplied(resident, item),
            );
      }

      function getSelectableResidentsForItem(itemId: number) {
            const item = periodItems.find(
                  (periodItem: any) => Number(periodItem.id) === Number(itemId),
            );
            return previewResidents.filter((resident: any) =>
                  isResidentItemSelectable(resident, item),
            );
      }

      const hasSelectedApplicableItems = previewResidents.some((resident: any) =>
            periodItems.some((item: any) => {
                  if (!isResidentItemSelectable(resident, item)) return false;
                  const selectedItem =
                        residentSelections[String(resident.id)]?.[String(item.id)];
                  return Boolean(
                        selectedItem?.selected &&
                        toMoneyNumber(selectedItem?.amount ?? item.amount) > 0,
                  );
            }),
      );

      const projectedApplySummary = useMemo(() => {
            const itemMap = new Map<
                  number,
                  { id: number; name: string; count: number; amount: number }
            >();
            const residentIds = new Set<number>();
            let totalAmount = 0;
            let totalItems = 0;

            for (const item of periodItems) {
                  itemMap.set(Number(item.id), {
                        id: Number(item.id),
                        name: String(item.feeTypeName || item.feeName || "Khoản phí"),
                        count: 0,
                        amount: 0,
                  });
            }

            for (const resident of previewResidents) {
                  for (const item of periodItems) {
                        if (!isResidentItemSelectable(resident, item)) continue;
                        const selectedItem =
                              residentSelections[String(resident.id)]?.[String(item.id)];
                        const amount = toMoneyNumber(selectedItem?.amount ?? item.amount);
                        if (!selectedItem?.selected || amount <= 0) continue;

                        const itemSummary = itemMap.get(Number(item.id));
                        if (itemSummary) {
                              itemSummary.count += 1;
                              itemSummary.amount += amount;
                        }
                        residentIds.add(Number(resident.id));
                        totalAmount += amount;
                        totalItems += 1;
                  }
            }

            return {
                  totalAmount,
                  totalItems,
                  residentCount: residentIds.size,
                  items: Array.from(itemMap.values()),
            };
      }, [previewResidents, periodItems, residentSelections]);

      function applyDefaultForAllEligible() {
            const nextSelections: Record<
                  string,
                  Record<string, { selected: boolean; amount: string }>
            > = {};
            for (const resident of previewResidents) {
                  nextSelections[String(resident.id)] = {};
                  for (const item of periodItems) {
                        nextSelections[String(resident.id)][String(item.id)] = {
                              selected: Boolean(
                                    isResidentItemSelectable(resident, item) &&
                                    Number(item.isDefaultChecked || 0) === 1,
                              ),
                              amount: formatMoneyInput(item.amount),
                        };
                  }
            }
            setResidentSelections(nextSelections);
            setSelectionMessage("Đã chọn mặc định cho toàn bộ học viên đủ điều kiện.");
      }

      function clearAllSelections() {
            setResidentSelections((current) => {
                  const next: typeof current = {};
                  for (const residentId of Object.keys(current)) {
                        next[residentId] = {};
                        for (const itemId of Object.keys(current[residentId])) {
                              next[residentId][itemId] = {
                                    ...current[residentId][itemId],
                                    selected: false,
                              };
                        }
                  }
                  return next;
            });
      }

      function getPeriodItemEligibleResidents(itemId: number) {
            return previewResidents.filter((resident: any) =>
                  Boolean(resident?.eligible),
            );
      }

      function getPeriodItemSelectedCount(itemId: number) {
            const item = periodItems.find(
                  (periodItem: any) => Number(periodItem.id) === Number(itemId),
            );
            return getPeriodItemEligibleResidents(itemId).filter((resident: any) => {
                  if (isResidentItemAlreadyApplied(resident, item)) return true;
                  if (!isResidentItemSelectable(resident, item)) return false;
                  return Boolean(
                        residentSelections[String(resident.id)]?.[String(itemId)]?.selected,
                  );
            }).length;
      }

      function isPeriodItemSelectedForAllEligible(itemId: number) {
            const eligibleResidents = getPeriodItemEligibleResidents(itemId);
            if (!eligibleResidents.length) return false;
            const item = periodItems.find(
                  (periodItem: any) => Number(periodItem.id) === Number(itemId),
            );
            return eligibleResidents.every((resident: any) => {
                  if (isResidentItemAlreadyApplied(resident, item)) return true;
                  return Boolean(
                        isResidentItemSelectable(resident, item) &&
                        residentSelections[String(resident.id)]?.[String(itemId)]?.selected,
                  );
            });
      }

      function togglePeriodItemForAllEligible(
            itemId: number,
            checked: boolean,
            amount: string | number,
      ) {
            setResidentSelections((current) => {
                  const next: typeof current = { ...current };
                  for (const resident of previewResidents) {
                        const residentKey = String(resident.id);
                        next[residentKey] = { ...(next[residentKey] || {}) };
                        const itemKey = String(itemId);
                        const currentItem = next[residentKey][itemKey] || {
                              selected: false,
                              amount: formatMoneyInput(amount),
                        };
                        next[residentKey][itemKey] = {
                              ...currentItem,
                              selected: Boolean(
                                    isResidentItemSelectable(resident, { id: itemId }) && checked,
                              ),
                              amount: currentItem.amount || formatMoneyInput(amount),
                        };
                  }
                  return next;
            });
            setSelectionMessage(
                  checked
                        ? "Đã chọn khoản phí này cho toàn bộ học viên đủ điều kiện."
                        : "Đã bỏ chọn khoản phí này cho toàn bộ học viên.",
            );
      }

      function submitApplyPeriod() {
            setSelectionMessage("");
            if (!selectedPeriodId || !selectedBillingMonth) {
                  setSelectionMessage("Vui lòng chọn kỳ thu và tháng áp dụng.");
                  return;
            }

            const lines = previewResidents
                  .filter((resident: any) => resident.eligible)
                  .map((resident: any) => ({
                        residentId: Number(resident.id),
                        items: periodItems.map((item: any) => {
                              const selectedItem =
                                    residentSelections[String(resident.id)]?.[String(item.id)];
                              return {
                                    periodItemId: Number(item.id),
                                    selected: Boolean(
                                          isResidentItemSelectable(resident, item) &&
                                          selectedItem?.selected,
                                    ),
                                    amount: toMoneyNumber(selectedItem?.amount ?? item.amount),
                              };
                        }),
                  }))
                  .filter((line: any) =>
                        line.items.some((item: any) => item.selected && item.amount > 0),
                  );

            if (!lines.length) {
                  setSelectionMessage("Chưa chọn khoản phí nào để áp dụng.");
                  return;
            }

            applyPeriodMutation?.mutate?.({
                  periodId: selectedPeriodId,
                  billingMonth: selectedBillingMonth,
                  lines,
            });
      }

      function openPayment(charge: any) {
            setPaymentFormMessage("");
            setPaymentForm({
                  chargeId: String(charge.id),
                  residentId: String(charge.residentId || ""),
                  amount: formatMoneyInput(charge.remainingAmount || charge.amount),
                  paymentDate: getVietnamDateInputValue(),
                  method: "cash",
                  note: "",
            });
            setPaymentFormOpen(true);
      }

      function submitPayment() {
            setPaymentFormMessage("");
            const amount = toMoneyNumber(paymentForm.amount);
            if (!paymentForm.chargeId || amount <= 0) {
                  setPaymentFormMessage(
                        "Vui lòng chọn khoản phải thu và nhập số tiền thu.",
                  );
                  return;
            }
            recordPaymentMutation?.mutate?.({
                  chargeId: Number(paymentForm.chargeId),
                  residentId:
                        Number(paymentForm.residentId || selectedCharge?.residentId || 0) ||
                        undefined,
                  amount,
                  paymentDate: paymentForm.paymentDate || null,
                  method: paymentForm.method || "cash",
                  note: paymentForm.note || null,
            });
      }

      function openGroupedPayment() {
            const defaultPeriod =
                  selectedPeriod ||
                  periods.find((period: any) =>
                        periodContainsBillingMonth(period, currentBillingMonth),
                  ) ||
                  periods[0];
            const defaultMonths = defaultPeriod
                  ? getPeriodMonthsFromPeriod(defaultPeriod)
                  : [];
            const defaultMonth =
                  defaultPeriod &&
                        periodContainsBillingMonth(defaultPeriod, selectedBillingMonth)
                        ? selectedBillingMonth
                        : defaultMonths.find(
                              (month: any) => month.value === currentBillingMonth,
                        )?.value ||
                        defaultMonths[0]?.value ||
                        "";
            setGroupPaymentMessage("");
            setGroupPaymentSelectedChargeIds({});
            setGroupPaymentForm({
                  periodId: defaultPeriod ? String(defaultPeriod.id) : "",
                  billingMonth: defaultMonth,
                  residentId: "",
                  amount: "",
                  paymentDate: getVietnamDateInputValue(),
                  method: "cash",
                  note: "",
            });
            setGroupPaymentOpen(true);
      }

      function handleGroupPaymentPeriodChange(periodId: string) {
            const nextPeriod = periods.find(
                  (period: any) => Number(period.id) === Number(periodId),
            );
            const months = nextPeriod ? getPeriodMonthsFromPeriod(nextPeriod) : [];
            const nextMonth =
                  months.find((month: any) => month.value === currentBillingMonth)?.value ||
                  months[0]?.value ||
                  "";
            setGroupPaymentMessage("");
            setGroupPaymentSelectedChargeIds({});
            setGroupPaymentLineAmounts({});
            setGroupPaymentForm((current) => ({
                  ...current,
                  periodId,
                  billingMonth: nextMonth,
                  residentId: "",
                  amount: "",
            }));
      }

      function handleGroupPaymentMonthChange(billingMonth: string) {
            setGroupPaymentMessage("");
            setGroupPaymentSelectedChargeIds({});
            setGroupPaymentLineAmounts({});
            setGroupPaymentForm((current) => ({
                  ...current,
                  billingMonth,
                  residentId: "",
                  amount: "",
            }));
      }

      function handleGroupPaymentResidentChange(residentId: string) {
            setGroupPaymentMessage("");
            setGroupPaymentSelectedChargeIds({});
            setGroupPaymentLineAmounts({});
            const resident = groupPaymentResidents.find(
                  (item) => Number(item.id) === Number(residentId),
            );
            setGroupPaymentForm((current) => ({
                  ...current,
                  residentId,
                  amount: resident ? formatMoneyInput(resident.totalRemaining) : "",
            }));
      }

      function openGroupPaymentForChargeGroup(group: any) {
            if (!group?.residentId) {
                  setGroupPaymentMessage(
                        "Chỉ hỗ trợ thu gộp cho khoản phải thu gắn với học viên.",
                  );
                  setGroupPaymentOpen(true);
                  return;
            }
            const selected: Record<string, boolean> = {};
            const lineAmounts: Record<string, string> = {};
            let totalRemaining = 0;
            for (const charge of group.charges || []) {
                  const remaining = toMoneyNumber(charge?.remainingAmount || 0);
                  if (
                        ["open", "partial"].includes(String(charge?.status || "open")) &&
                        remaining > 0
                  ) {
                        selected[String(charge.id)] = true;
                        lineAmounts[String(charge.id)] = formatMoneyInput(remaining);
                        totalRemaining += remaining;
                  }
            }
            setGroupPaymentSelectedChargeIds(selected);
            setGroupPaymentLineAmounts(lineAmounts);
            setGroupPaymentForm({
                  periodId: group?.periodId ? String(group.periodId) : "",
                  billingMonth: String(group?.billingMonth || ""),
                  residentId: String(group?.residentId || ""),
                  amount: totalRemaining > 0 ? formatMoneyInput(totalRemaining) : "",
                  paymentDate: getVietnamDateInputValue(),
                  method: "cash",
                  note: `Thu ${group?.residentName || "học viên"} - ${getBillingMonthLabel(group?.billingMonth)}`,
            });
            setGroupPaymentMessage(
                  totalRemaining > 0
                        ? ""
                        : "Học viên này không còn khoản nào có thể thu trong tháng đã chọn.",
            );
            setGroupPaymentOpen(true);
      }

      function toggleGroupPaymentCharge(chargeId: number, checked: boolean) {
            const charge = groupPaymentResidentCharges.find(
                  (item: any) => Number(item.id) === Number(chargeId),
            );
            setGroupPaymentSelectedChargeIds((current) => ({
                  ...current,
                  [String(chargeId)]: checked,
            }));
            if (checked && charge && !groupPaymentLineAmounts[String(chargeId)]) {
                  setGroupPaymentLineAmounts((current) => ({
                        ...current,
                        [String(chargeId)]: formatMoneyInput(charge?.remainingAmount || 0),
                  }));
            }
      }

      function updateGroupPaymentLineAmount(chargeId: number, value: string) {
            setGroupPaymentLineAmounts((current) => ({
                  ...current,
                  [String(chargeId)]: formatMoneyInput(value),
            }));
      }

      function setAllGroupPaymentCharges(checked: boolean) {
            const nextSelected: Record<string, boolean> = {};
            const nextAmounts: Record<string, string> = { ...groupPaymentLineAmounts };
            for (const charge of groupPaymentResidentCharges) {
                  const chargeId = String(charge.id);
                  nextSelected[chargeId] = checked;
                  if (checked) {
                        nextAmounts[chargeId] =
                              nextAmounts[chargeId] ||
                              formatMoneyInput(charge?.remainingAmount || 0);
                  } else {
                        nextAmounts[chargeId] = "";
                  }
            }
            setGroupPaymentSelectedChargeIds(nextSelected);
            setGroupPaymentLineAmounts(nextAmounts);
      }

      function syncGroupPaymentAmountToSelected() {
            const nextAmounts: Record<string, string> = { ...groupPaymentLineAmounts };
            for (const charge of groupPaymentSelectedCharges) {
                  nextAmounts[String(charge.id)] = formatMoneyInput(
                        charge?.remainingAmount || 0,
                  );
            }
            setGroupPaymentLineAmounts(nextAmounts);
            setGroupPaymentForm((current) => ({
                  ...current,
                  amount: formatMoneyInput(groupPaymentSelectedRemainingTotal),
            }));
      }

      function clearGroupPaymentLineAmounts() {
            const nextAmounts: Record<string, string> = { ...groupPaymentLineAmounts };
            for (const charge of groupPaymentSelectedCharges) {
                  nextAmounts[String(charge.id)] = "";
            }
            setGroupPaymentLineAmounts(nextAmounts);
            setGroupPaymentForm((current) => ({ ...current, amount: "" }));
      }

      async function submitGroupedPayment() {
            setGroupPaymentMessage("");
            const amount = groupPaymentInputTotal;
            if (
                  !groupPaymentForm.periodId ||
                  !groupPaymentForm.billingMonth ||
                  !groupPaymentForm.residentId
            ) {
                  setGroupPaymentMessage("Vui lòng chọn kỳ thu, tháng và học viên.");
                  return;
            }
            if (!groupPaymentSelectedCharges.length) {
                  setGroupPaymentMessage("Vui lòng chọn ít nhất một khoản còn phải thu.");
                  return;
            }
            if (amount <= 0) {
                  setGroupPaymentMessage(
                        "Vui lòng nhập số tiền thu hợp lệ cho ít nhất một khoản.",
                  );
                  return;
            }
            if (groupPaymentHasInvalidLineAmount) {
                  setGroupPaymentMessage(
                        "Số tiền thu từng khoản không được lớn hơn số còn lại của khoản đó.",
                  );
                  return;
            }
            if (!recordGroupedPaymentMutation?.mutateAsync) {
                  setGroupPaymentMessage("API ghi nhận thanh toán chưa sẵn sàng.");
                  return;
            }

            try {
                  for (const charge of groupPaymentSelectedCharges) {
                        const chargeRemaining = toMoneyNumber(charge?.remainingAmount || 0);
                        const payAmount = toMoneyNumber(
                              groupPaymentLineAmounts[String(charge.id)] || 0,
                        );
                        if (chargeRemaining <= 0 || payAmount <= 0) continue;
                        if (payAmount > chargeRemaining) {
                              setGroupPaymentMessage(
                                    "Số tiền thu từng khoản không được lớn hơn số còn lại của khoản đó.",
                              );
                              return;
                        }
                        await recordGroupedPaymentMutation.mutateAsync({
                              chargeId: Number(charge.id),
                              residentId: Number(groupPaymentForm.residentId),
                              amount: payAmount,
                              paymentDate: groupPaymentForm.paymentDate || null,
                              method: groupPaymentForm.method || "cash",
                              note:
                                    groupPaymentForm.note ||
                                    `Thu theo học viên - ${getBillingMonthLabel(groupPaymentForm.billingMonth)}`,
                        });
                  }
                  setGroupPaymentMessage("Đã ghi nhận thanh toán theo học viên.");
                  setGroupPaymentOpen(false);
                  setGroupPaymentForm({
                        periodId: "",
                        billingMonth: "",
                        residentId: "",
                        amount: "",
                        paymentDate: "",
                        method: "cash",
                        note: "",
                  });
                  setGroupPaymentSelectedChargeIds({});
                  setGroupPaymentLineAmounts({});
                  chargesQuery?.refetch?.();
                  transactionsQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            } catch (error: any) {
                  setGroupPaymentMessage(
                        error?.message || "Không thể ghi nhận thanh toán theo học viên.",
                  );
            }
      }

      function openEditCharge(charge: any) {
            setEditChargeMessage("");
            setEditChargeForm({
                  id: String(charge.id),
                  feeTypeId: String(charge.feeTypeId || ""),
                  amount: formatMoneyInput(charge.amount),
                  dueDate: String(charge.dueDate || "").slice(0, 10),
                  billingMonth: String(charge.billingMonth || ""),
                  periodStartDate: String(charge.periodStartDate || "").slice(0, 10),
                  periodEndDate: String(charge.periodEndDate || "").slice(0, 10),
                  periodChargeMode: String(charge.periodChargeMode || "full_month"),
                  status: String(charge.status || "open"),
                  targetName: String(charge.targetName || charge.residentName || ""),
                  description: String(charge.description || ""),
            });
            setEditChargeOpen(true);
      }

      function onCancelCharge(charge: any) {
            if (!window.confirm("Hủy khoản thu này?")) return;
            cancelChargeMutation?.mutate?.({
                  id: Number(charge.id),
                  reason: "Hủy từ màn tài chính",
            });
      }

      function submitEditCharge() {
            setEditChargeMessage("");
            const amount = toMoneyNumber(editChargeForm.amount);
            if (!editChargeForm.id || amount <= 0) {
                  setEditChargeMessage("Vui lòng nhập số tiền hợp lệ.");
                  return;
            }
            updateChargeMutation?.mutate?.({
                  id: Number(editChargeForm.id),
                  feeTypeId: Number(editChargeForm.feeTypeId || 0) || null,
                  amount,
                  dueDate: editChargeForm.dueDate || null,
                  billingMonth: editChargeForm.billingMonth || null,
                  periodStartDate: editChargeForm.periodStartDate || null,
                  periodEndDate: editChargeForm.periodEndDate || null,
                  periodChargeMode: editChargeForm.periodChargeMode || null,
                  periodMultiplier: 1,
                  status: editChargeForm.status || "open",
                  targetName: editChargeForm.targetName || null,
                  description: editChargeForm.description || null,
            });
      }

      function submitTransaction() {
            setTransactionFormMessage("");
            const amount = toMoneyNumber(transactionForm.amount);
            if (amount <= 0) {
                  setTransactionFormMessage("Vui lòng nhập số tiền hợp lệ.");
                  return;
            }
            if (!String(transactionForm.targetName || "").trim()) {
                  setTransactionFormMessage("Vui lòng nhập đối tượng/người nhận hoặc nguồn thu.");
                  return;
            }
            if (!String(transactionForm.description || "").trim()) {
                  setTransactionFormMessage("Vui lòng nhập mục đích hoặc ghi chú nghiệp vụ.");
                  return;
            }
            const effectiveSource =
                  (transactionForm.source === "other_income" || transactionForm.source === "donation") && transactionForm.incomeKind === "donation"
                        ? "donation"
                        : transactionForm.source === "donation"
                              ? "donation"
                              : transactionForm.source;
            const expenseMonths =
                  effectiveSource === "expense" && transactionForm.expenseKind === "period"
                        ? getExpenseMonthRange(
                                transactionForm.expenseFromMonth || transactionForm.expenseBillingMonth,
                                transactionForm.expenseToMonth || transactionForm.expenseFromMonth || transactionForm.expenseBillingMonth,
                          )
                        : [];
            if (effectiveSource === "expense" && transactionForm.expenseKind === "period" && !expenseMonths.length) {
                  setTransactionFormMessage("Vui lòng chọn kỳ bắt đầu và kỳ kết thúc hợp lệ.");
                  return;
            }
            const normalizedDirection = getTransactionDirectionForSource(
                  effectiveSource,
                  transactionForm.direction,
            );
            const expenseKind = transactionForm.expenseKind || "one_time";
            if (effectiveSource === "expense" && expenseKind === "advance") {
                  const startDate = String(transactionForm.advanceStartDate || "").slice(0, 10);
                  const endDate = String(transactionForm.advanceEndDate || startDate).slice(0, 10);
                  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate) {
                        setTransactionFormMessage("Vui lòng chọn khoảng ngày tạm ứng hợp lệ.");
                        return;
                  }
            }
            const submitSource =
                  effectiveSource === "expense" && expenseKind === "period"
                        ? "expense_plan"
                        : effectiveSource === "expense" && expenseKind === "advance"
                              ? "advance_out"
                              : effectiveSource;
            const planStartCompact = expenseMonths[0] ? expenseMonths[0].replace("-", "") : "";
            const planEndCompact = expenseMonths[expenseMonths.length - 1] ? expenseMonths[expenseMonths.length - 1].replace("-", "") : planStartCompact;
            const planDueModeCompact =
                  transactionForm.planDueMode === "last_day"
                        ? "last"
                        : transactionForm.planDueMode === "fixed_day"
                              ? "day"
                              : "first";
            const targetType =
                  effectiveSource === "expense"
                        ? expenseKind === "period"
                              ? `plan:${planStartCompact}${planEndCompact && planEndCompact !== planStartCompact ? `-${planEndCompact}` : ""}:${planDueModeCompact}:${transactionForm.planFixedDay || "01"}`
                              : expenseKind === "advance"
                                    ? `expense_advance:${transactionForm.expensePreset || "other"}:${transactionForm.advancePeriodMode || "week"}:${transactionForm.advanceStartDate || ""}_${transactionForm.advanceEndDate || transactionForm.advanceStartDate || ""}:${transactionForm.advanceReceiverType || "committee"}`
                                    : `expense_daily:${transactionForm.expensePreset || "other"}`
                        : effectiveSource;
            const submitAmount =
                  effectiveSource === "expense" && expenseKind === "period"
                        ? amount * Math.max(1, expenseMonths.length)
                        : amount;
            const descriptionParts = [transactionForm.description];
            if (effectiveSource === "expense") {
                  if (transactionForm.expensePresetLabel) {
                        descriptionParts.push(`Nhóm chi: ${transactionForm.expensePresetLabel}`);
                  }
                  if (expenseKind === "period") {
                        descriptionParts.push(`Áp dụng kỳ: ${expenseMonths.join(", ")}`);
                        descriptionParts.push(`Số tiền mỗi kỳ: ${amount}`);
                        descriptionParts.push(`Ngày dự chi: ${transactionForm.planDueMode === "fixed_day" ? `ngày ${transactionForm.planFixedDay || "01"} mỗi kỳ` : transactionForm.planDueMode === "last_day" ? "cuối kỳ" : "đầu kỳ"}`);
                  } else if (expenseKind === "advance") {
                        descriptionParts.push("Loại chi: Tạm ứng theo kỳ");
                        descriptionParts.push(`Thời gian: ${transactionForm.advanceStartDate || ""} → ${transactionForm.advanceEndDate || transactionForm.advanceStartDate || ""}`);
                        descriptionParts.push(`Đối tượng nhận: ${transactionForm.advanceReceiverType || "committee"}`);
                        if (transactionForm.targetName) {
                              descriptionParts.push(`Đơn vị/cá nhân nhận: ${transactionForm.targetName}`);
                        }
                        descriptionParts.push("Ghi chú: cần cập nhật chi thực tế hằng ngày và quyết toán cuối kỳ");
                  } else {
                        descriptionParts.push("Loại chi: Chi theo ngày / một lần");
                  }
            }
            createTransactionMutation?.mutate?.({
                  source: submitSource,
                  direction: getTransactionDirectionForSource(submitSource, normalizedDirection) as "in" | "out",
                  amount: submitAmount,
                  transactionDate: transactionForm.transactionDate || null,
                  targetType,
                  targetName: transactionForm.targetName || null,
                  description: descriptionParts.filter(Boolean).join(" · ") || null,
            });
      }

      function getExpenseMonthRange(fromMonth?: string, toMonth?: string) {
            const from = String(fromMonth || "").slice(0, 7);
            const to = String(toMonth || from || "").slice(0, 7);
            if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) return [];
            const [fromYear, fromMonthNumber] = from.split("-").map(Number);
            const [toYear, toMonthNumber] = to.split("-").map(Number);
            const fromIndex = fromYear * 12 + fromMonthNumber;
            const toIndex = toYear * 12 + toMonthNumber;
            if (toIndex < fromIndex || toIndex - fromIndex > 24) return [];
            const months: string[] = [];
            for (let index = fromIndex; index <= toIndex; index += 1) {
                  const year = Math.floor((index - 1) / 12);
                  const month = ((index - 1) % 12) + 1;
                  months.push(`${year}-${String(month).padStart(2, "0")}`);
            }
            return months;
      }

      const topSummaryIsPeriodScoped = Boolean(selectedPeriod);
      const selectedPeriodCharges = selectedPeriod
            ? charges.filter(
                  (charge: any) =>
                        Number(charge?.periodId || 0) === Number(selectedPeriod.id) &&
                        String(charge?.status || "") !== "cancelled",
            )
            : [];
      const selectedPeriodChargeCount = selectedPeriodCharges.length;
      const selectedPeriodPaidAmount = selectedPeriodCharges.reduce(
            (total: number, charge: any) =>
                  total + toMoneyNumber(charge?.paidAmount || 0),
            0,
      );
      const selectedPeriodOpenAmount = selectedPeriodCharges.reduce(
            (total: number, charge: any) =>
                  total + toMoneyNumber(charge?.remainingAmount || 0),
            0,
      );
      const selectedPeriodTotalAmount = selectedPeriodCharges.reduce(
            (total: number, charge: any) => total + toMoneyNumber(charge?.amount || 0),
            0,
      );
      const scopedOpenAmount = selectedPeriod
            ? Object.prototype.hasOwnProperty.call(selectedPeriod, "openAmount")
                  ? toMoneyNumber(selectedPeriod.openAmount)
                  : selectedPeriodOpenAmount
            : 0;
      const scopedPaidAmount = selectedPeriod
            ? Object.prototype.hasOwnProperty.call(selectedPeriod, "paidAmount")
                  ? toMoneyNumber(selectedPeriod.paidAmount)
                  : selectedPeriodPaidAmount
            : 0;
      const scopedTotalAmount = selectedPeriod
            ? Object.prototype.hasOwnProperty.call(selectedPeriod, "totalAmount")
                  ? toMoneyNumber(selectedPeriod.totalAmount)
                  : selectedPeriodTotalAmount
            : 0;
      const scopedChargeCount = selectedPeriod
            ? Number(selectedPeriod.chargeCount ?? selectedPeriodChargeCount ?? 0)
            : 0;
      const topSummaryCards = topSummaryIsPeriodScoped
            ? [
                  {
                        label: "Còn phải thu kỳ",
                        value: formatMoney(scopedOpenAmount),
                        hint: selectedPeriod?.periodName || "",
                        subhint: "Giá trị còn cần thu trong kỳ đang xem",
                        icon: WalletCards,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Đã thu trong kỳ",
                        value: formatMoney(scopedPaidAmount),
                        hint: selectedPeriod?.periodName || "",
                        subhint: "Các khoản đã ghi nhận thanh toán",
                        icon: CreditCard,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Tổng phải thu kỳ",
                        value: formatMoney(
                              scopedTotalAmount || scopedOpenAmount + scopedPaidAmount,
                        ),
                        hint: selectedPeriod?.periodName || "",
                        subhint: "Tổng công nợ phát sinh của kỳ này",
                        icon: CalendarDays,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Khoản trong kỳ",
                        value: String(scopedChargeCount || 0),
                        hint: selectedPeriod?.periodName || "",
                        subhint: "Số dòng công nợ đang được theo dõi",
                        icon: Users,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
            ]
            : [
                  {
                        label: "Còn phải thu",
                        value: formatMoney(summary.totalOpenAmount),
                        hint: "Toàn hệ thống",
                        subhint: "Số dư công nợ học viên chưa thu",
                        icon: WalletCards,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Đã thu học viên",
                        value: formatMoney(summary.totalPaidAmount),
                        hint: "Toàn hệ thống",
                        subhint: "Tổng thu từ các khoản phí học viên",
                        icon: CreditCard,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Thu khác",
                        value: formatMoney(summary.totalCashIn),
                        hint: "Toàn hệ thống",
                        subhint: "Các khoản thu khác, tài trợ và ủng hộ",
                        icon: CalendarDays,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
                  {
                        label: "Khoản đang mở",
                        value: String(summary.openChargeCount || 0),
                        hint: "Toàn hệ thống",
                        subhint: "Tổng số khoản chưa hoàn tất",
                        icon: Users,
                        iconTone: "text-amber-700",
                        iconWrap: "bg-white/90 border-amber-200/80",
                  },
            ];

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <span className={residenceMediumStyle.pageAura} />
                        <div className={residenceMediumStyle.standardPageContent}>
                              <div className={residenceMediumStyle.standardHeader}>
                                    <div className={residenceMediumStyle.standardHeaderAura} />
                                    <div className={residenceMediumStyle.standardHeaderInner}>
                                          <div className={residenceMediumStyle.standardHeaderTextWrap}>
                                                <h1 className={residenceMediumStyle.standardHeaderTitle}>
                                                      Tài chính lưu xá
                                                </h1>
                                                <p className={residenceMediumStyle.standardHeaderSubtitle}>
                                                      Quản lý kỳ thu học viên, thu chi ngoài học viên và dòng tiền phát sinh.
                                                </p>
                                          </div>
                                          <div className={residenceMediumStyle.standardHeaderActions}>
                                                <button
                                                      type="button"
                                                      className={residenceMediumStyle.buttonCard}
                                                      onClick={() => openTransactionForm("other_income")}
                                                >
                                                      Thu chi khác
                                                </button>
                                                <button
                                                      type="button"
                                                      className={residenceMediumStyle.buttonCardPrimary}
                                                      onClick={() => setPeriodFormOpen(true)}
                                                >
                                                      Tạo kỳ thu
                                                </button>
                                          </div>
                                    </div>
                              </div>

                              <FinanceSummaryCards cards={topSummaryCards} />

                              <FinancePeriodSelector
                                    periods={periods}
                                    selectedPeriodId={selectedPeriodId}
                                    selectedPeriod={selectedPeriod}
                                    currentBillingMonth={currentBillingMonth}
                                    getPeriodMonthsFromPeriod={getPeriodMonthsFromPeriod}
                                    onSelectPeriodMonth={selectPeriodMonth}
                              />
                              <FinanceTabRail activeTab={activeTab} onTabChange={setActiveTab} />

                              {activeTab === "studentLedger" ? (
                                    <FinanceLiteStudentLedger
                                          periods={periods}
                                          selectedPeriod={selectedPeriod}
                                          selectedPeriodMonths={selectedPeriodMonths}
                                          selectedBillingMonth={selectedBillingMonth}
                                          currentBillingMonth={currentBillingMonth}
                                          monthCardRefs={monthCardRefs}
                                          selectPeriodMonth={selectPeriodMonth}
                                          setPeriodFormOpen={setPeriodFormOpen}
                                          groupedCharges={groupedCharges}
                                          paginatedGroupedCharges={paginatedGroupedCharges}
                                          studentLedgerPageSize={studentLedgerPageSize}
                                          setStudentLedgerPageSize={setStudentLedgerPageSize}
                                          setStudentLedgerPage={setStudentLedgerPage}
                                          studentLedgerStartIndex={studentLedgerStartIndex}
                                          studentLedgerEndIndex={studentLedgerEndIndex}
                                          studentLedgerTotalPages={studentLedgerTotalPages}
                                          safeStudentLedgerPage={safeStudentLedgerPage}
                                          searchTerm={searchTerm}
                                          setSearchTerm={setSearchTerm}
                                          statusFilter={statusFilter}
                                          setStatusFilter={setStatusFilter}
                                          openGroupedPayment={openGroupedPayment}
                                          openGroupPaymentForChargeGroup={openGroupPaymentForChargeGroup}
                                          openEditCharge={openEditCharge}
                                          onCancelCharge={onCancelCharge}
                                          applyPanelOpen={applyPanelOpen}
                                          setApplyPanelOpen={setApplyPanelOpen}
                                          selectionMessage={selectionMessage}
                                          projectedApplySummary={projectedApplySummary}
                                          hasSelectedApplicableItems={hasSelectedApplicableItems}
                                          applyPeriodMutationPending={applyPeriodMutation?.isPending ?? false}
                                          submitApplyPeriod={submitApplyPeriod}
                                          periodItems={periodItems}
                                          previewResidents={previewResidents}
                                          previewQuery={previewQuery}
                                          residentSelections={residentSelections}
                                          detail={detail}
                                          getPeriodMonthsFromPeriod={getPeriodMonthsFromPeriod}
                                          getMonthChargeStats={getMonthChargeStats}
                                          getPeriodItemSelectedCount={getPeriodItemSelectedCount}
                                          isPeriodItemSelectedForAllEligible={isPeriodItemSelectedForAllEligible}
                                          getPeriodItemEligibleResidents={getPeriodItemEligibleResidents}
                                          togglePeriodItemForAllEligible={togglePeriodItemForAllEligible}
                                          applyDefaultForAllEligible={applyDefaultForAllEligible}
                                          clearAllSelections={clearAllSelections}
                                          isResidentItemAlreadyApplied={isResidentItemAlreadyApplied}
                                          isResidentItemSelectable={isResidentItemSelectable}
                                          toggleResidentItem={toggleResidentItem}
                                          updateResidentItemAmount={updateResidentItemAmount}
                                    />
                              ) : null}

{
      activeTab === "expenses" ? (
            <FinanceExpensesPanel
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                  selectedPeriodMonths={selectedPeriodMonths}
                  selectedBillingMonth={selectedBillingMonth}
                  onCreateExpense={(source = "other_income") => openTransactionForm(source)}
                  onDeleteTransaction={deleteTransaction}
                  isDeletingTransaction={deleteTransactionMutation?.isPending ?? false}
            />
      ) : null
}
{
      activeTab === "plans" ? (
            <FinanceExpensePlansPanel
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                  selectedPeriodMonths={selectedPeriodMonths}
                  selectedBillingMonth={selectedBillingMonth}
                  onCreatePlan={() => openTransactionForm("expense_plan")}
                  onCreateActualExpense={() => openTransactionForm("expense_once")}
                  onDeleteTransaction={deleteTransaction}
                  isDeletingTransaction={deleteTransactionMutation?.isPending ?? false}
            />
      ) : null
}
{
      activeTab === "cashbook" ? (
            <FinanceCashbookPanel
                  transactions={transactions}
                  charges={charges}
                  selectedPeriod={selectedPeriod}
                  selectedPeriodMonths={selectedPeriodMonths}
                  selectedBillingMonth={selectedBillingMonth}
                  onCreateTransaction={(source = "other_income") => openTransactionForm(source === "expense" ? "expense_once" : source)}
                  onDeleteTransaction={deleteTransaction}
                  isDeletingTransaction={deleteTransactionMutation?.isPending ?? false}
            />
      ) : null
}
        </div >
      </div >

      {
            periodFormOpen?(
        <FinanceCreatePeriodModal
          message = { periodFormMessage }
          form = { periodForm }
          setForm = { setPeriodForm }
          isSubmitting = { createPeriodMutation?.isPending }
          onClose = {() => setPeriodFormOpen(false)}
onSubmit = { submitCreatePeriod }
      />
      ) : null}
{
      paymentFormOpen ? (
            <FinancePaymentModal
                  message={paymentFormMessage}
                  form={paymentForm}
                  setForm={setPaymentForm}
                  charges={charges}
                  openCharges={openCharges}
                  isSubmitting={recordPaymentMutation?.isPending}
                  onClose={() => setPaymentFormOpen(false)}
                  onSubmit={submitPayment}
            />
      ) : null
}
{
      groupPaymentOpen ? (
            <FinanceGroupPaymentModal
                  message={groupPaymentMessage}
                  form={groupPaymentForm}
                  setForm={setGroupPaymentForm}
                  periods={periods}
                  months={groupPaymentMonths}
                  residents={groupPaymentResidents}
                  residentCharges={groupPaymentResidentCharges}
                  selectedChargeIds={groupPaymentSelectedChargeIds}
                  lineAmounts={groupPaymentLineAmounts}
                  selectedCharges={groupPaymentSelectedCharges}
                  allSelected={groupPaymentAllSelected}
                  selectedRemainingTotal={groupPaymentSelectedRemainingTotal}
                  inputTotal={groupPaymentInputTotal}
                  afterRemainingTotal={groupPaymentAfterRemainingTotal}
                  hasInvalidLineAmount={groupPaymentHasInvalidLineAmount}
                  isSubmitting={recordGroupedPaymentMutation?.isPending}
                  onPeriodChange={handleGroupPaymentPeriodChange}
                  onMonthChange={handleGroupPaymentMonthChange}
                  onResidentChange={handleGroupPaymentResidentChange}
                  onToggleCharge={toggleGroupPaymentCharge}
                  onUpdateLineAmount={updateGroupPaymentLineAmount}
                  onToggleAllCharges={setAllGroupPaymentCharges}
                  onSyncSelectedAmounts={syncGroupPaymentAmountToSelected}
                  onClearLineAmounts={clearGroupPaymentLineAmounts}
                  onClose={() => setGroupPaymentOpen(false)}
                  onSubmit={submitGroupedPayment}
            />
      ) : null
}
{
      editChargeOpen ? (
            <FinanceEditChargeModal
                  message={editChargeMessage}
                  form={editChargeForm}
                  setForm={setEditChargeForm}
                  feeTypes={feeTypes}
                  isSubmitting={updateChargeMutation?.isPending}
                  onClose={() => setEditChargeOpen(false)}
                  onSubmit={submitEditCharge}
            />
      ) : null
}
{
      transactionFormOpen ? (
            <FinanceTransactionModal
                  message={transactionFormMessage}
                  form={transactionForm}
                  setForm={setTransactionForm}
                  isSubmitting={createTransactionMutation?.isPending}
                  advanceReceiverOptions={advanceReceiverOptions}
                  onClose={() => setTransactionFormOpen(false)}
                  onSubmit={submitTransaction}
            />
      ) : null
}

{voucherTransaction ? (
      <FinanceVoucherPreviewModal
            transaction={voucherTransaction}
            onClose={() => setVoucherTransaction(null)}
      />
) : null}

{deleteTransactionTarget ? (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fff7df_100%)] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Xác nhận xóa</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Xóa {deleteTransactionTarget.targetName || deleteTransactionTarget.description || "khoản thu chi này"}?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                        {deleteTransactionTarget.lockedMessage || "Khoản này sẽ được gỡ khỏi Khoản thu chi/Sổ dòng tiền. Dự chi hoặc tạm ứng nhầm có thể xóa tại đây; khoản đã quyết toán nên kiểm tra trước khi xóa."}
                  </p>
                  {deleteTransactionMessage ? (
                        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteTransactionMessage}</div>
                  ) : null}
                  <div className="mt-5 flex justify-end gap-2">
                        <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => { setDeleteTransactionTarget(null); setDeleteTransactionMessage(""); }}>Đóng</button>
                        {!deleteTransactionTarget.lockedMessage ? (
                              <button type="button" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={deleteTransactionMutation?.isPending} onClick={confirmDeleteTransaction}>
                                    {deleteTransactionMutation?.isPending ? "Đang xóa..." : "Xóa khoản này"}
                              </button>
                        ) : null}
                  </div>
            </div>
      </div>
) : null}
    </ResidenceCareLayout >
  );
}


function normalizeFinanceListData(data: any): any[] {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.rows)) return data.rows;
      return [];
}

function buildFinanceAdvanceReceiverOptions(residentData: any, unitData: any) {
      const residents = normalizeFinanceListData(residentData);
      const units = normalizeFinanceListData(unitData);
      const options: Array<{ type: string; id: string; label: string; subLabel?: string }> = [];

      for (const unit of units) {
            const rawType = String(unit?.unitType || unit?.type || unit?.roleType || "").toLowerCase();
            const type = rawType.includes("committee") || rawType.includes("ban") ? "committee" : rawType.includes("team") || rawType.includes("to") || rawType.includes("tổ") ? "team" : "";
            if (!type) continue;
            const label = String(unit?.unitName || unit?.name || unit?.title || "").trim();
            if (!label) continue;
            options.push({ type, id: String(unit?.id || label), label, subLabel: type === "committee" ? "Ban" : "Tổ" });
      }

      for (const resident of residents) {
            const label = String(resident?.fullName || resident?.name || resident?.residentName || "").trim();
            if (!label) continue;
            options.push({
                  type: "person",
                  id: String(resident?.id || label),
                  label,
                  subLabel: String(resident?.residentCode || resident?.code || resident?.currentRoomName || "").trim() || "Học viên",
            });
      }

      const hasLogistics = options.some((item) => item.type === "committee" && item.label.toLowerCase().includes("hậu cần"));
      if (!hasLogistics) {
            options.unshift({ type: "committee", id: "committee-ban-hau-can", label: "Ban Hậu cần", subLabel: "Mặc định" });
      }
      return options;
}
