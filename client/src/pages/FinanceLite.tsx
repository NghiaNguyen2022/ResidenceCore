"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Pencil, Plus, Search, Users, WalletCards } from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { DatePickerInput } from "@/components/shared/form/DatePickerInput";
import { ModalShell, SmallBadge } from "@/components/finance-lite/FinanceLitePrimitives";
import {
  FinanceCreatePeriodModal,
  FinanceEditChargeModal,
  FinancePaymentModal,
  FinanceTransactionModal,
} from "@/components/finance-lite/FinanceLiteModals";
import { FinanceSummaryCards } from "@/components/finance-lite/FinanceSummaryCards";
import { FinanceTabRail } from "@/components/finance-lite/FinanceTabRail";
import type {
  ChargeStatus,
  EditChargeState,
  FinanceTab,
  PeriodFormState,
} from "@/components/finance-lite/financeLiteTypes";
import {
  emptyPeriodForm,
  formatDate,
  formatMoney,
  formatMoneyInput,
  getBillingMonthLabel,
  getCurrentBillingMonth,
  getStatusClass,
  getStatusLabel,
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
  const monthCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
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
    transactionDate: "",
    targetName: "",
    description: "",
  });

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
        });
        transactionsQuery?.refetch?.();
        summaryQuery?.refetch?.();
      },
      onError: (error: any) =>
        setTransactionFormMessage(
          error?.message || "Không thể lưu nghiệp vụ thu chi.",
        ),
    });

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
          current.paymentDate || new Date().toISOString().slice(0, 10),
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
      paymentDate: new Date().toISOString().slice(0, 10),
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
      paymentDate: new Date().toISOString().slice(0, 10),
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
      paymentDate: new Date().toISOString().slice(0, 10),
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
    createTransactionMutation?.mutate?.({
      source: transactionForm.source,
      direction: transactionForm.direction as "in" | "out",
      amount,
      transactionDate: transactionForm.transactionDate || null,
      targetType: transactionForm.source,
      targetName: transactionForm.targetName || null,
      description: transactionForm.description || null,
    });
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
                  Quản lý kỳ thu học viên, khoản chi và sổ thu chi phát sinh.
                </p>
              </div>
              <div className={residenceMediumStyle.standardHeaderActions}>
                <button
                  type="button"
                  className={residenceMediumStyle.buttonCard}
                  onClick={() => setTransactionFormOpen(true)}
                >
                  Thu / chi khác
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

          {periods.length ? (
            <section className="relative overflow-hidden rounded-[30px] border border-white/85 bg-gradient-to-r from-[#fff7e0] via-white/95 to-[#efd08a]/75 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-amber-100/70 md:p-5">
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.88),transparent_33%),linear-gradient(120deg,rgba(245,158,11,0.08),transparent_45%)]" />
              <div className="relative grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_290px] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Kỳ thu đang xem
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-800">
                    Áp dụng cho sổ kỳ thu học viên và các báo cáo theo kỳ.
                  </p>
                </div>
                <select
                  value={selectedPeriodId || ""}
                  onChange={(event) => {
                    const nextPeriod = periods.find(
                      (period: any) =>
                        Number(period.id) === Number(event.target.value),
                    );
                    if (!nextPeriod) return;
                    const months = getPeriodMonthsFromPeriod(nextPeriod);
                    const defaultMonth =
                      months.find(
                        (month: any) => month.value === currentBillingMonth,
                      )?.value ||
                      months[0]?.value ||
                      "";
                    selectPeriodMonth(nextPeriod, defaultMonth);
                  }}
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3 text-base font-semibold text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                >
                  {periods.map((period: any) => (
                    <option key={period.id} value={period.id}>
                      {period.periodName} · Tháng {String(period.fromMonth).padStart(2, "0")}-{String(period.toMonth).padStart(2, "0")} / {period.year}
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
          ) : null}

          <FinanceTabRail activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "studentLedger" ? (
            <>
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
                    className="inline-flex items-center rounded-2xl border border-amber-200/90 bg-white/88 px-3.5 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
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
                          const stats = getMonthChargeStats(
                            selectedPeriod,
                            month.value,
                          );
                          const selectedMonth =
                            selectedBillingMonth === month.value;
                          const isCurrentMonth =
                            currentBillingMonth === month.value;
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
                              onClick={() =>
                                selectPeriodMonth(selectedPeriod, month.value)
                              }
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
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tháng</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{getBillingMonthLabel(selectedBillingMonth).replace("Tháng ", "T")}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Học viên</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{groupedCharges.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Đã thu</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.paidAmount || 0), 0))}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Còn lại</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(groupedCharges.reduce((sum: number, group: any) => sum + toMoneyNumber(group.remainingAmount || 0), 0))}</p>
                    </div>
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
                    onChange={(event) =>
                      setStatusFilter(event.target.value as ChargeStatus)
                    }
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
                    onChange={(event) =>
                      setStudentLedgerPageSize(Number(event.target.value) || 7)
                    }
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
                      <th className="w-[22%] px-3 py-3 text-left">
                        Học viên
                      </th>
                      <th className="w-[44%] px-3 py-3 text-left">
                        Khoản phí
                      </th>
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
                        group.charges.some(
                          (charge: any) =>
                            ["open", "partial"].includes(
                              String(charge.status || "open"),
                            ) && toMoneyNumber(charge.remainingAmount || 0) > 0,
                        );
                      return (
                        <tr key={group.key} className="align-top">
                          <td className="px-3 py-4">
                            <p className="font-semibold text-slate-900">
                              {group.residentName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {group.residentCode || "-"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {getBillingMonthLabel(group.billingMonth)} · {group.periodName || "Khoản riêng"}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <div className="space-y-2">
                              {group.charges.map((charge: any) => {
                                const canEdit =
                                  String(charge.status || "") !== "cancelled";
                                const canCancel =
                                  toMoneyNumber(charge.paidAmount || 0) <= 0 &&
                                  String(charge.status || "") !== "cancelled";
                                const chargeTitle =
                                  charge.periodItemName ||
                                  charge.feeTypeName ||
                                  charge.feeName ||
                                  "Khoản thu";
                                const status = String(charge.status || "open");
                                const isPaid = status === "paid";
                                return (
                                  <div
                                    key={charge.id}
                                    className="rounded-2xl border border-amber-100/80 bg-gradient-to-r from-[#fffaf0] via-white to-[#fff3d6] px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <p className="text-[15px] font-semibold leading-5 text-slate-800">
                                            {chargeTitle}
                                          </p>
                                          {isPaid ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                              Đã thu
                                            </span>
                                          ) : status === "partial" || status === "cancelled" ? (
                                            <SmallBadge
                                              className={getStatusClass(charge.status)}
                                            >
                                              {getStatusLabel(charge.status)}
                                            </SmallBadge>
                                          ) : null}
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
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  "Hủy khoản thu này?",
                                                )
                                              )
                                                cancelChargeMutation?.mutate?.({
                                                  id: Number(charge.id),
                                                  reason:
                                                    "Hủy từ màn tài chính",
                                                });
                                            }}
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
                          <td className="px-3 py-4 text-right font-semibold text-slate-900">
                            {formatMoney(group.amount)}
                          </td>
                          <td className="px-3 py-4 text-right text-slate-600">
                            {formatMoney(group.paidAmount)}
                          </td>
                          <td className="px-3 py-4 text-right font-semibold text-slate-800">
                            {formatMoney(group.remainingAmount)}
                          </td>
                          <td className="px-3 py-4 text-right">
                            {canCollect ? (
                              <button
                                type="button"
                                className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                                onClick={() =>
                                  openGroupPaymentForChargeGroup(group)
                                }
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
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center text-sm text-slate-500"
                        >
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
                      onClick={() =>
                        setStudentLedgerPage((current) => Math.max(1, current - 1))
                      }
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
                      onClick={() =>
                        setStudentLedgerPage((current) =>
                          Math.min(studentLedgerTotalPages, current + 1),
                        )
                      }
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
                        <h2 className="text-base font-semibold text-slate-900">
                          Áp dụng khoản thu
                        </h2>
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
                              onClick={applyDefaultForAllEligible}
                            >
                              Apply all đủ điều kiện
                            </button>
                            <button
                              type="button"
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                              onClick={clearAllSelections}
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
                        const allSelected =
                          isPeriodItemSelectedForAllEligible(itemId);
                        const selectedCount =
                          getPeriodItemSelectedCount(itemId);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              togglePeriodItemForAllEligible(
                                itemId,
                                !allSelected,
                                item.amount,
                              )
                            }
                            className={`rounded-2xl border p-3 text-left transition ${allSelected ? "border-amber-300 bg-amber-50/80 shadow-sm" : "border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/40"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {item.feeTypeName}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {formatMoney(item.amount)} ·{" "}
                                  {Number(item.isDefaultChecked) === 1
                                    ? "Mặc định chọn"
                                    : "Không mặc định"}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                  Đã chọn {selectedCount}/
                                  {getPeriodItemEligibleResidents(itemId)
                                    .length || 0}{" "}
                                  học viên
                                </p>
                              </div>
                              <span
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs ${allSelected ? "border-amber-400 bg-amber-500 text-white" : "border-slate-300 bg-white text-transparent"}`}
                              >
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
                          <p className="text-sm font-semibold text-slate-900">
                            Dự kiến áp dụng
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Tính theo các ô đang được chọn, chưa tạo khoản phải
                            thu thật.
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
                          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                            <p className="text-[11px] text-slate-500">
                              Học viên
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {projectedApplySummary.residentCount}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                            <p className="text-[11px] text-slate-500">
                              Khoản phí
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {projectedApplySummary.totalItems}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                            <p className="text-[11px] text-slate-500">
                              Tổng tiền
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatMoney(projectedApplySummary.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        {projectedApplySummary.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-white/70 bg-white/70 px-3 py-2"
                          >
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {item.name}
                            </p>
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
                              <th key={item.id} className="px-2 py-3 text-left">
                                {item.feeTypeName}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/95">
                          {!previewResidents.length ? (
                            <tr>
                              <td
                                colSpan={periodItems.length + 1}
                                className="px-4 py-8 text-center text-sm text-slate-500"
                              >
                                {previewQuery?.isError
                                  ? `Không tải được danh sách học viên: ${(previewQuery.error as any)?.message || "Vui lòng kiểm tra log server."}`
                                  : "Chưa có học viên trong danh sách áp dụng cho tháng này."}
                              </td>
                            </tr>
                          ) : null}
                          {previewResidents.map((resident: any) => (
                            <tr
                              key={resident.id}
                              className={
                                !resident.eligible
                                  ? "bg-slate-50 text-slate-400"
                                  : ""
                              }
                            >
                              <td className="px-3 py-3">
                                <p className="font-medium text-slate-900">
                                  {resident.fullName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {resident.residentCode || "Chưa có mã"}
                                </p>
                                {!resident.eligible ? (
                                  <p className="mt-1 text-[11px] text-amber-700">
                                    {resident.reason || "Không đủ điều kiện"}
                                  </p>
                                ) : null}
                              </td>
                              {periodItems.map((item: any) => {
                                const selected =
                                  residentSelections[String(resident.id)]?.[
                                    String(item.id)
                                  ];
                                const alreadyApplied =
                                  isResidentItemAlreadyApplied(resident, item);
                                const selectable = isResidentItemSelectable(
                                  resident,
                                  item,
                                );
                                return (
                                  <td
                                    key={item.id}
                                    className={`px-1.5 py-3 ${alreadyApplied ? "bg-slate-50 text-slate-400" : ""}`}
                                  >
                                    <label className="grid min-w-0 grid-cols-[18px_minmax(132px,1fr)] items-center gap-1.5">
                                      <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 justify-self-center"
                                        disabled={!selectable}
                                        checked={Boolean(
                                          alreadyApplied ||
                                          (selected?.selected && selectable),
                                        )}
                                        onChange={(event) =>
                                          toggleResidentItem(
                                            Number(resident.id),
                                            Number(item.id),
                                            event.target.checked,
                                          )
                                        }
                                      />
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        disabled={
                                          !selectable || !selected?.selected
                                        }
                                        value={
                                          selected?.amount ||
                                          formatMoneyInput(item.amount)
                                        }
                                        onChange={(event) =>
                                          updateResidentItemAmount(
                                            Number(resident.id),
                                            Number(item.id),
                                            event.target.value,
                                          )
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
                        disabled={
                          applyPeriodMutation?.isPending ||
                          !hasSelectedApplicableItems
                        }
                      >
                        {applyPeriodMutation?.isPending
                          ? "Đang áp dụng..."
                          : "Lưu áp dụng khoản thu"}
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

            </>
          ) : null}

          {activeTab === "expenses" ? (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Khoản chi
                  </h2>
                  <p className="text-sm text-slate-500">
                    Quản lý khoản chi theo kỳ như điện, nước, internet và các khoản chi phát sinh không theo kỳ.
                  </p>
                </div>
                <button
                  type="button"
                  className={residenceMediumStyle.buttonCardPrimary}
                  onClick={() => {
                    setTransactionForm((prev) => ({
                      ...prev,
                      source: "expense",
                      direction: "out",
                    }));
                    setTransactionFormOpen(true);
                  }}
                >
                  Ghi nhận khoản chi
                </button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Chi theo kỳ
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Dùng cho các khoản vận hành lặp lại theo tháng/kỳ.
                      </p>
                    </div>
                    <SmallBadge className="border-amber-200 bg-white text-amber-700">
                      Theo tháng
                    </SmallBadge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                      Điện, nước, internet, vệ sinh, bảo trì định kỳ
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                      Có thể gắn với kỳ/tháng đang xem để lên báo cáo vận hành
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Chi không theo kỳ
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Dùng cho sự kiện, sửa chữa, mua sắm, hỗ trợ học viên hoặc khoản phát sinh.
                      </p>
                    </div>
                    <SmallBadge className="border-slate-200 bg-slate-50 text-slate-600">
                      Phát sinh
                    </SmallBadge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                      Ghi nhận trực tiếp vào sổ thu chi, không cần chọn kỳ
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                      Bắt buộc có mục đích/người nhận hoặc ghi chú rõ ràng
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-500">
                Bước này đang tổ chức lại sổ sách. Trước mắt, các khoản chi được ghi nhận vào <span className="font-semibold text-slate-700">Sổ thu chi</span>. Sau đó có thể mở rộng thêm mẫu chi định kỳ điện, nước, internet theo từng tháng.
              </div>
            </section>
          ) : null}

          {activeTab === "cashbook" ? (
            <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Sổ thu chi
                  </h2>
                  <p className="text-sm text-slate-500">
                    Ghi nhận thu khác, chi phí và dòng tiền phát sinh.
                  </p>
                </div>
                <button
                  type="button"
                  className={residenceMediumStyle.buttonCardPrimary}
                  onClick={() => setTransactionFormOpen(true)}
                >
                  Thêm thu / chi
                </button>
              </div>
              <div className="space-y-2">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                        {transaction.direction === "out" ? (
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
                          {formatDate(transaction.transactionDate)} ·{" "}
                          {transaction.source}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${transaction.direction === "out" ? "text-rose-700" : "text-emerald-700"}`}
                    >
                      {transaction.direction === "out" ? "-" : "+"}
                      {formatMoney(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {periodFormOpen ? (
        <FinanceCreatePeriodModal
          message={periodFormMessage}
          form={periodForm}
          setForm={setPeriodForm}
          isSubmitting={createPeriodMutation?.isPending}
          onClose={() => setPeriodFormOpen(false)}
          onSubmit={submitCreatePeriod}
        />
      ) : null}
      {paymentFormOpen ? (
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
      ) : null}
      {groupPaymentOpen ? (
        <ModalShell
          title="Thu theo học viên"
          subtitle="Chọn kỳ, tháng và học viên để thu nhiều khoản trong một lần."
          onClose={() => setGroupPaymentOpen(false)}
        >
          <div className="space-y-4 p-5">
            {groupPaymentMessage ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {groupPaymentMessage}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Kỳ thu
                </label>
                <select
                  value={groupPaymentForm.periodId}
                  onChange={(event) =>
                    handleGroupPaymentPeriodChange(event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Chọn kỳ thu</option>
                  {periods.map((period: any) => (
                    <option key={period.id} value={period.id}>
                      {period.periodName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Tháng
                </label>
                <select
                  value={groupPaymentForm.billingMonth}
                  onChange={(event) =>
                    handleGroupPaymentMonthChange(event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Chọn tháng</option>
                  {groupPaymentMonths.map((month: any) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Học viên
                </label>
                <select
                  value={groupPaymentForm.residentId}
                  onChange={(event) =>
                    handleGroupPaymentResidentChange(event.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Chọn học viên</option>
                  {groupPaymentResidents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name}{" "}
                      {resident.code ? `(${resident.code})` : ""} - còn{" "}
                      {formatMoney(resident.totalRemaining)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Chọn khoản và nhập số tiền thu từng khoản
                  </p>
                  <p className="text-xs text-slate-500">
                    Có thể thu đủ, thu một phần hoặc bỏ chọn từng khoản nhỏ.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                    onClick={() =>
                      setAllGroupPaymentCharges(!groupPaymentAllSelected)
                    }
                  >
                    {groupPaymentAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700"
                    onClick={syncGroupPaymentAmountToSelected}
                  >
                    Thu đủ khoản chọn
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                    onClick={clearGroupPaymentLineAmounts}
                  >
                    Xóa số thu
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {groupPaymentResidentCharges.length ? (
                  groupPaymentResidentCharges.map((charge: any) => {
                    const chargeId = String(charge.id);
                    const checked = Boolean(
                      groupPaymentSelectedChargeIds[chargeId],
                    );
                    const remaining = toMoneyNumber(
                      charge?.remainingAmount || 0,
                    );
                    const lineAmount = groupPaymentLineAmounts[chargeId] || "";
                    const lineAmountNumber = toMoneyNumber(lineAmount || 0);
                    const invalidAmount =
                      checked && lineAmountNumber > remaining;
                    return (
                      <div
                        key={charge.id}
                        className={`rounded-2xl border bg-white p-3 ${checked ? "border-amber-100 shadow-sm" : "border-slate-100 opacity-75"}`}
                      >
                        <div className="grid items-center gap-3 lg:grid-cols-[28px_1.3fr_0.9fr_0.9fr_1fr]">
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) =>
                                toggleGroupPaymentCharge(
                                  Number(charge.id),
                                  event.target.checked,
                                )
                              }
                              className="h-4 w-4"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {charge.periodItemName ||
                                charge.feeTypeName ||
                                charge.feeName ||
                                "Khoản thu"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Tổng {formatMoney(charge.amount)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Đã thu
                            </p>
                            <p className="font-semibold text-slate-700">
                              {formatMoney(charge.paidAmount)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Còn lại
                            </p>
                            <p className="font-semibold text-slate-900">
                              {formatMoney(charge.remainingAmount)}
                            </p>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                              Thu lần này
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={lineAmount}
                              disabled={!checked}
                              onChange={(event) =>
                                updateGroupPaymentLineAmount(
                                  Number(charge.id),
                                  event.target.value,
                                )
                              }
                              className={`mt-1 w-full rounded-xl border px-3 py-2 text-right text-sm font-semibold disabled:bg-slate-50 disabled:text-slate-400 ${invalidAmount ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-900"}`}
                            />
                            {invalidAmount ? (
                              <p className="mt-1 text-xs text-rose-600">
                                Không được vượt còn lại
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                    Không có khoản còn phải thu cho học viên trong tháng này.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Tổng còn lại khoản chọn
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatMoney(groupPaymentSelectedRemainingTotal)}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                  Tổng thu lần này
                </p>
                <p className="mt-1 text-lg font-semibold text-amber-900">
                  {formatMoney(groupPaymentInputTotal)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Còn lại sau thu
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatMoney(groupPaymentAfterRemainingTotal)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Ngày thu
                </label>
                <DatePickerInput
                  value={groupPaymentForm.paymentDate}
                  onChange={(event) =>
                    setGroupPaymentForm({
                      ...groupPaymentForm,
                      paymentDate: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Phương thức thu
                </label>
                <select
                  value={groupPaymentForm.method}
                  onChange={(event) =>
                    setGroupPaymentForm({
                      ...groupPaymentForm,
                      method: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Ghi chú
              </label>
              <textarea
                value={groupPaymentForm.note}
                onChange={(event) =>
                  setGroupPaymentForm({
                    ...groupPaymentForm,
                    note: event.target.value,
                  })
                }
                className="mt-1 min-h-[70px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Ví dụ: Thu tiền tháng này, phụ huynh chuyển khoản..."
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                className={residenceMediumStyle.buttonCard}
                onClick={() => setGroupPaymentOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={`${residenceMediumStyle.buttonCardPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
                onClick={submitGroupedPayment}
                disabled={
                  recordGroupedPaymentMutation?.isPending ||
                  !groupPaymentSelectedCharges.length ||
                  groupPaymentInputTotal <= 0 ||
                  groupPaymentHasInvalidLineAmount
                }
              >
                {recordGroupedPaymentMutation?.isPending
                  ? "Đang lưu..."
                  : "Lưu thanh toán"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {editChargeOpen ? (
        <FinanceEditChargeModal
          message={editChargeMessage}
          form={editChargeForm}
          setForm={setEditChargeForm}
          feeTypes={feeTypes}
          isSubmitting={updateChargeMutation?.isPending}
          onClose={() => setEditChargeOpen(false)}
          onSubmit={submitEditCharge}
        />
      ) : null}
      {transactionFormOpen ? (
        <FinanceTransactionModal
          message={transactionFormMessage}
          form={transactionForm}
          setForm={setTransactionForm}
          isSubmitting={createTransactionMutation?.isPending}
          onClose={() => setTransactionFormOpen(false)}
          onSubmit={submitTransaction}
        />
      ) : null}    </ResidenceCareLayout>
  );
}
