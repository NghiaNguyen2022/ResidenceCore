'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CreditCard, Plus, Search, WalletCards, X } from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { trpc } from '@/lib/trpc';

type FinanceTab = 'periods' | 'charges' | 'cashbook';
type ChargeStatus = 'all' | 'open' | 'partial' | 'paid' | 'cancelled';

type PeriodFormState = {
      periodName: string;
      year: string;
      fromMonth: string;
      toMonth: string;
      lodgingAmount: string;
      mealLivingAmount: string;
      otherAmount: string;
      description: string;
};

type EditChargeState = {
      id: string;
      feeTypeId: string;
      amount: string;
      dueDate: string;
      billingMonth: string;
      periodStartDate: string;
      periodEndDate: string;
      periodChargeMode: string;
      status: string;
      targetName: string;
      description: string;
};

const moneyFormatter = new Intl.NumberFormat('vi-VN');
const monthNames = [
      'Tháng 01',
      'Tháng 02',
      'Tháng 03',
      'Tháng 04',
      'Tháng 05',
      'Tháng 06',
      'Tháng 07',
      'Tháng 08',
      'Tháng 09',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
];

function normalizeStoredMoneyValue(value?: string | number | null) {
      if (typeof value === 'number') return Number.isFinite(value) ? String(Math.round(value)) : '';
      const raw = String(value ?? '').trim();
      if (!raw) return '';
      if (/^-?\d+\.\d{1,2}$/.test(raw)) return String(Math.round(Number(raw)));
      return raw.replace(/[^0-9]/g, '');
}

function toMoneyNumber(value?: string | number | null) {
      const normalized = normalizeStoredMoneyValue(value);
      return normalized ? Number(normalized) : 0;
}

function formatMoney(value?: number | string | null) {
      return `${moneyFormatter.format(toMoneyNumber(value))}đ`;
}

function formatMoneyInput(value?: string | number | null) {
      const normalized = normalizeStoredMoneyValue(value);
      return normalized ? moneyFormatter.format(Number(normalized)) : '';
}

function formatDate(value?: string | Date | null) {
      if (!value) return 'Chưa có ngày';
      return String(value).slice(0, 10);
}

function getMonthStart(monthValue?: string) {
      return monthValue ? `${monthValue}-01` : '';
}

function getMonthEnd(monthValue?: string) {
      if (!monthValue) return '';
      const [yearText, monthText] = monthValue.split('-');
      const year = Number(yearText);
      const month = Number(monthText);
      if (!year || !month) return '';
      return new Date(year, month, 0).toISOString().slice(0, 10);
}

function getBillingMonthLabel(value?: string | null) {
      if (!value) return 'Chưa chọn kỳ';
      const [yearText, monthText] = value.split('-');
      const monthIndex = Number(monthText) - 1;
      if (!yearText || monthIndex < 0 || monthIndex > 11) return value;
      return `${monthNames[monthIndex]} / ${yearText}`;
}

function getCurrentBillingMonth() {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function periodContainsBillingMonth(period: any, billingMonth: string) {
      if (!period || !billingMonth) return false;
      const [yearText, monthText] = billingMonth.split('-');
      const year = Number(yearText);
      const month = Number(monthText);
      const periodYear = Number(period?.year || 0);
      const fromMonth = Number(period?.fromMonth || 1);
      const toMonth = Number(period?.toMonth || 12);
      return periodYear === year && month >= fromMonth && month <= toMonth;
}

function getStatusLabel(status?: string | null) {
      if (status === 'paid') return 'Đã thu';
      if (status === 'partial') return 'Thu một phần';
      if (status === 'cancelled') return 'Đã hủy';
      return 'Chưa thu';
}

function getStatusClass(status?: string | null) {
      if (status === 'paid') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
      if (status === 'partial') return 'border-amber-100 bg-amber-50 text-amber-800';
      if (status === 'cancelled') return 'border-slate-200 bg-slate-100 text-slate-500';
      return 'border-rose-100 bg-rose-50 text-rose-700';
}

function emptyPeriodForm(): PeriodFormState {
      const year = String(new Date().getFullYear());
      return {
            periodName: `Phí lưu xá năm ${year}`,
            year,
            fromMonth: '1',
            toMonth: '12',
            lodgingAmount: '1.200.000',
            mealLivingAmount: '1.800.000',
            otherAmount: '500.000',
            description: '',
      };
}

function SmallBadge({ children, className = '' }: { children: ReactNode; className?: string }) {
      return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

function ModalShell({
      title,
      subtitle,
      children,
      onClose,
}: {
      title: string;
      subtitle?: string;
      children: ReactNode;
      onClose: () => void;
}) {
      return (
            <div className={residenceMediumStyle.standardModalOverlay}>
                  <div className={residenceMediumStyle.standardModalShell}>
                        <div className={residenceMediumStyle.standardModalHeader}>
                              <div>
                                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                                    {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                              </div>
                              <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900">
                                    <X className="h-4 w-4" />
                              </button>
                        </div>
                        {children}
                  </div>
            </div>
      );
}

export default function FinanceLite() {
      const financeApi = (trpc as any).finance;
      const [activeTab, setActiveTab] = useState<FinanceTab>('periods');
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<ChargeStatus>('all');
      const [periodFormOpen, setPeriodFormOpen] = useState(false);
      const [periodFormMessage, setPeriodFormMessage] = useState('');
      const [periodForm, setPeriodForm] = useState<PeriodFormState>(() => emptyPeriodForm());
      const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
      const [selectedBillingMonth, setSelectedBillingMonth] = useState('');
      const [selectionMessage, setSelectionMessage] = useState('');
      const [selectionKey, setSelectionKey] = useState('');
      const [residentSelections, setResidentSelections] = useState<Record<string, Record<string, { selected: boolean; amount: string }>>>({});
      const [paymentFormOpen, setPaymentFormOpen] = useState(false);
      const [paymentFormMessage, setPaymentFormMessage] = useState('');
      const [paymentForm, setPaymentForm] = useState({ chargeId: '', residentId: '', amount: '', paymentDate: '', method: 'cash', note: '' });
      const [editChargeOpen, setEditChargeOpen] = useState(false);
      const [editChargeMessage, setEditChargeMessage] = useState('');
      const [editChargeForm, setEditChargeForm] = useState<EditChargeState>({
            id: '',
            feeTypeId: '',
            amount: '',
            dueDate: '',
            billingMonth: '',
            periodStartDate: '',
            periodEndDate: '',
            periodChargeMode: 'full_month',
            status: 'open',
            targetName: '',
            description: '',
      });
      const [transactionFormOpen, setTransactionFormOpen] = useState(false);
      const [transactionFormMessage, setTransactionFormMessage] = useState('');
      const [transactionForm, setTransactionForm] = useState({ source: 'other_income', direction: 'in', amount: '', transactionDate: '', targetName: '', description: '' });

      const summaryQuery = financeApi?.summary?.useQuery?.();
      const feeTypesQuery = financeApi?.listFeeTypes?.useQuery?.({ isActive: true });
      const periodsQuery = financeApi?.listChargePeriods?.useQuery?.();
      const periodDetailQuery = financeApi?.getChargePeriodDetail?.useQuery?.(
            { periodId: selectedPeriodId || 0 },
            { enabled: Boolean(selectedPeriodId) }
      );
      const previewQuery = financeApi?.previewChargePeriodResidents?.useQuery?.(
            { periodId: selectedPeriodId || 0, billingMonth: selectedBillingMonth || '1900-01' },
            { enabled: Boolean(selectedPeriodId && selectedBillingMonth) }
      );
      const chargesQuery = financeApi?.listCharges?.useQuery?.({
            search: searchTerm || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 300,
      });
      const transactionsQuery = financeApi?.listTransactions?.useQuery?.({ search: searchTerm || undefined, limit: 200 });

      const rawPeriods = periodsQuery?.data || [];
      const currentBillingMonth = useMemo(() => getCurrentBillingMonth(), []);
      const periods = useMemo(() => {
            return [...rawPeriods].sort((left: any, right: any) => {
                  const yearDiff = Number(right?.year || 0) - Number(left?.year || 0);
                  if (yearDiff !== 0) return yearDiff;
                  const fromDiff = Number(right?.fromMonth || 0) - Number(left?.fromMonth || 0);
                  if (fromDiff !== 0) return fromDiff;
                  return Number(right?.id || 0) - Number(left?.id || 0);
            });
      }, [rawPeriods]);
      const selectedPeriod = useMemo(() => periods.find((period: any) => Number(period.id) === Number(selectedPeriodId || 0)) || null, [periods, selectedPeriodId]);
      const selectedPeriodMonths = useMemo(() => selectedPeriod ? getPeriodMonthsFromPeriod(selectedPeriod) : [], [selectedPeriod]);
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
            const defaultPeriod = periods.find((period: any) => periodContainsBillingMonth(period, currentBillingMonth)) || periods[0];
            const months = getPeriodMonthsFromPeriod(defaultPeriod);
            const defaultMonth = months.find((month: any) => month.value === currentBillingMonth)?.value || months[0]?.value || '';
            setSelectedPeriodId(Number(defaultPeriod.id));
            setSelectedBillingMonth(defaultMonth);
      }, [periods, selectedPeriodId, currentBillingMonth]);

      useEffect(() => {
            if (selectedPeriodMonths.length > 0 && !selectedPeriodMonths.some((month: any) => month.value === selectedBillingMonth)) {
                  const defaultMonth = selectedPeriodMonths.find((month: any) => month.value === currentBillingMonth)?.value || selectedPeriodMonths[0].value;
                  setSelectedBillingMonth(defaultMonth);
            }
      }, [selectedPeriodMonths, selectedBillingMonth, currentBillingMonth]);

      useEffect(() => {
            const residentApplySignature = previewResidents
                  .map((resident: any) => `${resident.id}:${Array.isArray(resident?.existingPeriodItemIds) ? resident.existingPeriodItemIds.join('|') : ''}:${resident?.eligible ? '1' : '0'}`)
                  .join(',');
            const nextKey = `${selectedPeriodId || ''}:${selectedBillingMonth}:${residentApplySignature}:${periodItems.map((item: any) => item.id).join(',')}`;
            if (!selectedPeriodId || !selectedBillingMonth || !previewResidents.length || !periodItems.length || selectionKey === nextKey) return;

            const nextSelections: Record<string, Record<string, { selected: boolean; amount: string }>> = {};
            for (const resident of previewResidents) {
                  nextSelections[String(resident.id)] = {};
                  for (const item of periodItems) {
                        nextSelections[String(resident.id)][String(item.id)] = {
                              selected: Boolean(isResidentItemSelectable(resident, item) && Number(item.isDefaultChecked || 0) === 1),
                              amount: formatMoneyInput(item.amount),
                        };
                  }
            }
            setResidentSelections(nextSelections);
            setSelectionKey(nextKey);
      }, [selectedPeriodId, selectedBillingMonth, previewResidents, periodItems, selectionKey]);

      const createPeriodMutation = financeApi?.createChargePeriod?.useMutation?.({
            onSuccess: (result: any) => {
                  setPeriodFormMessage('Đã tạo kỳ thu. Có thể vào chi tiết để áp dụng cho học viên.');
                  setPeriodFormOpen(false);
                  setPeriodForm(emptyPeriodForm());
                  periodsQuery?.refetch?.();
                  if (result?.periodId) setSelectedPeriodId(Number(result.periodId));
            },
            onError: (error: any) => setPeriodFormMessage(error?.message || 'Không thể tạo kỳ thu.'),
      });

      const applyPeriodMutation = financeApi?.applyChargePeriod?.useMutation?.({
            onSuccess: (result: any) => {
                  const skippedText = result?.skippedCount ? ` Bỏ qua ${result.skippedCount} khoản đã tồn tại.` : '';
                  setSelectionMessage(`Đã tạo ${result?.createdCount || 0} khoản phải thu.${skippedText}`);
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  previewQuery?.refetch?.();
                  periodDetailQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) => setSelectionMessage(error?.message || 'Không thể áp dụng kỳ thu.'),
      });

      const updateChargeMutation = financeApi?.updateCharge?.useMutation?.({
            onSuccess: () => {
                  setEditChargeMessage('Đã cập nhật khoản phải thu.');
                  setEditChargeOpen(false);
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) => setEditChargeMessage(error?.message || 'Không thể cập nhật khoản phải thu.'),
      });

      const recordPaymentMutation = financeApi?.recordPayment?.useMutation?.({
            onSuccess: () => {
                  setPaymentFormMessage('');
                  setPaymentFormOpen(false);
                  setPaymentForm({ chargeId: '', residentId: '', amount: '', paymentDate: '', method: 'cash', note: '' });
                  chargesQuery?.refetch?.();
                  transactionsQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) => setPaymentFormMessage(error?.message || 'Không thể ghi nhận thanh toán.'),
      });

      const cancelChargeMutation = financeApi?.cancelCharge?.useMutation?.({
            onSuccess: () => {
                  chargesQuery?.refetch?.();
                  periodsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) => alert(error?.message || 'Không thể hủy khoản phải thu.'),
      });

      const createTransactionMutation = financeApi?.createTransaction?.useMutation?.({
            onSuccess: () => {
                  setTransactionFormOpen(false);
                  setTransactionFormMessage('');
                  setTransactionForm({ source: 'other_income', direction: 'in', amount: '', transactionDate: '', targetName: '', description: '' });
                  transactionsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
            onError: (error: any) => setTransactionFormMessage(error?.message || 'Không thể lưu nghiệp vụ thu chi.'),
      });

      const openCharges = useMemo(() => charges.filter((charge: any) => ['open', 'partial'].includes(String(charge.status || 'open'))), [charges]);
      const selectedCharge = useMemo(() => charges.find((charge: any) => Number(charge.id) === Number(paymentForm.chargeId || 0)), [charges, paymentForm.chargeId]);


      function getPeriodMonthsFromPeriod(period: any) {
            const year = Number(period?.year || new Date().getFullYear());
            const fromMonth = Math.max(1, Number(period?.fromMonth || 1));
            const toMonth = Math.min(12, Number(period?.toMonth || 12));
            const months = [];
            for (let month = fromMonth; month <= toMonth; month += 1) {
                  const value = `${year}-${String(month).padStart(2, '0')}`;
                  months.push({ value, label: `${monthNames[month - 1]} / ${year}` });
            }
            return months;
      }

      function getMonthChargeStats(period: any, billingMonth: string) {
            const periodId = Number(period?.id || 0);
            const relatedCharges = charges.filter((charge: any) => {
                  const samePeriod = Number(charge?.periodId || 0) === periodId;
                  const sameMonth = String(charge?.billingMonth || '') === String(billingMonth || '');
                  const notCancelled = String(charge?.status || '') !== 'cancelled';
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
            setSelectedBillingMonth(billingMonth || months[0]?.value || '');
            setSelectionMessage('');
      }

      function submitCreatePeriod() {
            setPeriodFormMessage('');
            if (!periodForm.periodName.trim()) {
                  setPeriodFormMessage('Vui lòng nhập tên kỳ thu.');
                  return;
            }
            const year = Number(periodForm.year);
            const fromMonth = Number(periodForm.fromMonth);
            const toMonth = Number(periodForm.toMonth);
            if (!year || !fromMonth || !toMonth || fromMonth > toMonth) {
                  setPeriodFormMessage('Năm hoặc khoảng tháng áp dụng chưa hợp lệ.');
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

      function toggleResidentItem(residentId: number, itemId: number, checked: boolean) {
            setResidentSelections((current) => ({
                  ...current,
                  [residentId]: {
                        ...(current[String(residentId)] || {}),
                        [itemId]: {
                              ...(current[String(residentId)]?.[String(itemId)] || { amount: '' }),
                              selected: checked,
                        },
                  },
            }));
      }

      function updateResidentItemAmount(residentId: number, itemId: number, amount: string) {
            setResidentSelections((current) => ({
                  ...current,
                  [residentId]: {
                        ...(current[String(residentId)] || {}),
                        [itemId]: {
                              ...(current[String(residentId)]?.[String(itemId)] || { selected: false }),
                              amount: formatMoneyInput(amount),
                        },
                  },
            }));
      }

      function isResidentItemAlreadyApplied(resident: any, item: any) {
            const existingIds = Array.isArray(resident?.existingPeriodItemIds) ? resident.existingPeriodItemIds.map((value: any) => Number(value)) : [];
            return existingIds.includes(Number(item?.id));
      }

      function isResidentItemSelectable(resident: any, item: any) {
            return Boolean(resident?.eligible && !isResidentItemAlreadyApplied(resident, item));
      }

      function getSelectableResidentsForItem(itemId: number) {
            const item = periodItems.find((periodItem: any) => Number(periodItem.id) === Number(itemId));
            return previewResidents.filter((resident: any) => isResidentItemSelectable(resident, item));
      }

      const hasSelectedApplicableItems = previewResidents.some((resident: any) =>
            periodItems.some((item: any) => {
                  if (!isResidentItemSelectable(resident, item)) return false;
                  const selectedItem = residentSelections[String(resident.id)]?.[String(item.id)];
                  return Boolean(selectedItem?.selected && toMoneyNumber(selectedItem?.amount ?? item.amount) > 0);
            })
      );

      const projectedApplySummary = useMemo(() => {
            const itemMap = new Map<number, { id: number; name: string; count: number; amount: number }>();
            const residentIds = new Set<number>();
            let totalAmount = 0;
            let totalItems = 0;

            for (const item of periodItems) {
                  itemMap.set(Number(item.id), {
                        id: Number(item.id),
                        name: String(item.feeTypeName || item.feeName || 'Khoản phí'),
                        count: 0,
                        amount: 0,
                  });
            }

            for (const resident of previewResidents) {
                  for (const item of periodItems) {
                        if (!isResidentItemSelectable(resident, item)) continue;
                        const selectedItem = residentSelections[String(resident.id)]?.[String(item.id)];
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
            const nextSelections: Record<string, Record<string, { selected: boolean; amount: string }>> = {};
            for (const resident of previewResidents) {
                  nextSelections[String(resident.id)] = {};
                  for (const item of periodItems) {
                        nextSelections[String(resident.id)][String(item.id)] = {
                              selected: Boolean(isResidentItemSelectable(resident, item) && Number(item.isDefaultChecked || 0) === 1),
                              amount: formatMoneyInput(item.amount),
                        };
                  }
            }
            setResidentSelections(nextSelections);
            setSelectionMessage('Đã chọn mặc định cho toàn bộ học viên đủ điều kiện.');
      }

      function clearAllSelections() {
            setResidentSelections((current) => {
                  const next: typeof current = {};
                  for (const residentId of Object.keys(current)) {
                        next[residentId] = {};
                        for (const itemId of Object.keys(current[residentId])) {
                              next[residentId][itemId] = { ...current[residentId][itemId], selected: false };
                        }
                  }
                  return next;
            });
      }

      function getPeriodItemEligibleResidents(itemId: number) {
            return previewResidents.filter((resident: any) => Boolean(resident?.eligible));
      }

      function getPeriodItemSelectedCount(itemId: number) {
            const item = periodItems.find((periodItem: any) => Number(periodItem.id) === Number(itemId));
            return getPeriodItemEligibleResidents(itemId).filter((resident: any) => {
                  if (isResidentItemAlreadyApplied(resident, item)) return true;
                  if (!isResidentItemSelectable(resident, item)) return false;
                  return Boolean(residentSelections[String(resident.id)]?.[String(itemId)]?.selected);
            }).length;
      }

      function isPeriodItemSelectedForAllEligible(itemId: number) {
            const eligibleResidents = getPeriodItemEligibleResidents(itemId);
            if (!eligibleResidents.length) return false;
            const item = periodItems.find((periodItem: any) => Number(periodItem.id) === Number(itemId));
            return eligibleResidents.every((resident: any) => {
                  if (isResidentItemAlreadyApplied(resident, item)) return true;
                  return Boolean(isResidentItemSelectable(resident, item) && residentSelections[String(resident.id)]?.[String(itemId)]?.selected);
            });
      }

      function togglePeriodItemForAllEligible(itemId: number, checked: boolean, amount: string | number) {
            setResidentSelections((current) => {
                  const next: typeof current = { ...current };
                  for (const resident of previewResidents) {
                        const residentKey = String(resident.id);
                        next[residentKey] = { ...(next[residentKey] || {}) };
                        const itemKey = String(itemId);
                        const currentItem = next[residentKey][itemKey] || { selected: false, amount: formatMoneyInput(amount) };
                        next[residentKey][itemKey] = {
                              ...currentItem,
                              selected: Boolean(isResidentItemSelectable(resident, { id: itemId }) && checked),
                              amount: currentItem.amount || formatMoneyInput(amount),
                        };
                  }
                  return next;
            });
            setSelectionMessage(checked ? 'Đã chọn khoản phí này cho toàn bộ học viên đủ điều kiện.' : 'Đã bỏ chọn khoản phí này cho toàn bộ học viên.');
      }

      function submitApplyPeriod() {
            setSelectionMessage('');
            if (!selectedPeriodId || !selectedBillingMonth) {
                  setSelectionMessage('Vui lòng chọn kỳ thu và tháng áp dụng.');
                  return;
            }

            const lines = previewResidents
                  .filter((resident: any) => resident.eligible)
                  .map((resident: any) => ({
                        residentId: Number(resident.id),
                        items: periodItems.map((item: any) => {
                              const selectedItem = residentSelections[String(resident.id)]?.[String(item.id)];
                              return {
                                    periodItemId: Number(item.id),
                                    selected: Boolean(isResidentItemSelectable(resident, item) && selectedItem?.selected),
                                    amount: toMoneyNumber(selectedItem?.amount ?? item.amount),
                              };
                        }),
                  }))
                  .filter((line: any) => line.items.some((item: any) => item.selected && item.amount > 0));

            if (!lines.length) {
                  setSelectionMessage('Chưa chọn khoản phí nào để áp dụng.');
                  return;
            }

            applyPeriodMutation?.mutate?.({ periodId: selectedPeriodId, billingMonth: selectedBillingMonth, lines });
      }

      function openPayment(charge: any) {
            setPaymentFormMessage('');
            setPaymentForm({
                  chargeId: String(charge.id),
                  residentId: String(charge.residentId || ''),
                  amount: formatMoneyInput(charge.remainingAmount || charge.amount),
                  paymentDate: new Date().toISOString().slice(0, 10),
                  method: 'cash',
                  note: '',
            });
            setPaymentFormOpen(true);
      }

      function submitPayment() {
            setPaymentFormMessage('');
            const amount = toMoneyNumber(paymentForm.amount);
            if (!paymentForm.chargeId || amount <= 0) {
                  setPaymentFormMessage('Vui lòng chọn khoản phải thu và nhập số tiền thu.');
                  return;
            }
            recordPaymentMutation?.mutate?.({
                  chargeId: Number(paymentForm.chargeId),
                  residentId: Number(paymentForm.residentId || selectedCharge?.residentId || 0) || undefined,
                  amount,
                  paymentDate: paymentForm.paymentDate || null,
                  method: paymentForm.method || 'cash',
                  note: paymentForm.note || null,
            });
      }

      function openEditCharge(charge: any) {
            setEditChargeMessage('');
            setEditChargeForm({
                  id: String(charge.id),
                  feeTypeId: String(charge.feeTypeId || ''),
                  amount: formatMoneyInput(charge.amount),
                  dueDate: String(charge.dueDate || '').slice(0, 10),
                  billingMonth: String(charge.billingMonth || ''),
                  periodStartDate: String(charge.periodStartDate || '').slice(0, 10),
                  periodEndDate: String(charge.periodEndDate || '').slice(0, 10),
                  periodChargeMode: String(charge.periodChargeMode || 'full_month'),
                  status: String(charge.status || 'open'),
                  targetName: String(charge.targetName || charge.residentName || ''),
                  description: String(charge.description || ''),
            });
            setEditChargeOpen(true);
      }

      function submitEditCharge() {
            setEditChargeMessage('');
            const amount = toMoneyNumber(editChargeForm.amount);
            if (!editChargeForm.id || amount <= 0) {
                  setEditChargeMessage('Vui lòng nhập số tiền hợp lệ.');
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
                  status: editChargeForm.status || 'open',
                  targetName: editChargeForm.targetName || null,
                  description: editChargeForm.description || null,
            });
      }

      function submitTransaction() {
            setTransactionFormMessage('');
            const amount = toMoneyNumber(transactionForm.amount);
            if (amount <= 0) {
                  setTransactionFormMessage('Vui lòng nhập số tiền hợp lệ.');
                  return;
            }
            createTransactionMutation?.mutate?.({
                  source: transactionForm.source,
                  direction: transactionForm.direction as 'in' | 'out',
                  amount,
                  transactionDate: transactionForm.transactionDate || null,
                  targetType: transactionForm.source,
                  targetName: transactionForm.targetName || null,
                  description: transactionForm.description || null,
            });
      }


      const topSummaryIsPeriodScoped = activeTab === 'periods' && Boolean(selectedPeriod);
      const selectedPeriodCharges = selectedPeriod
            ? charges.filter((charge: any) => Number(charge?.periodId || 0) === Number(selectedPeriod.id) && String(charge?.status || '') !== 'cancelled')
            : [];
      const selectedPeriodChargeCount = selectedPeriodCharges.length;
      const selectedPeriodPaidAmount = selectedPeriodCharges.reduce((total: number, charge: any) => total + toMoneyNumber(charge?.paidAmount || 0), 0);
      const selectedPeriodOpenAmount = selectedPeriodCharges.reduce((total: number, charge: any) => total + toMoneyNumber(charge?.remainingAmount || 0), 0);
      const selectedPeriodTotalAmount = selectedPeriodCharges.reduce((total: number, charge: any) => total + toMoneyNumber(charge?.amount || 0), 0);
      const scopedOpenAmount = selectedPeriod
            ? (Object.prototype.hasOwnProperty.call(selectedPeriod, 'openAmount') ? toMoneyNumber(selectedPeriod.openAmount) : selectedPeriodOpenAmount)
            : 0;
      const scopedPaidAmount = selectedPeriod
            ? (Object.prototype.hasOwnProperty.call(selectedPeriod, 'paidAmount') ? toMoneyNumber(selectedPeriod.paidAmount) : selectedPeriodPaidAmount)
            : 0;
      const scopedTotalAmount = selectedPeriod
            ? (Object.prototype.hasOwnProperty.call(selectedPeriod, 'totalAmount') ? toMoneyNumber(selectedPeriod.totalAmount) : selectedPeriodTotalAmount)
            : 0;
      const scopedChargeCount = selectedPeriod
            ? Number(selectedPeriod.chargeCount ?? selectedPeriodChargeCount ?? 0)
            : 0;
      const topSummaryCards = topSummaryIsPeriodScoped
            ? [
                  { label: 'Còn phải thu kỳ', value: formatMoney(scopedOpenAmount), hint: selectedPeriod?.periodName || '' },
                  { label: 'Đã thu trong kỳ', value: formatMoney(scopedPaidAmount), hint: selectedPeriod?.periodName || '' },
                  { label: 'Tổng phải thu kỳ', value: formatMoney(scopedTotalAmount || scopedOpenAmount + scopedPaidAmount), hint: selectedPeriod?.periodName || '' },
                  { label: 'Khoản trong kỳ', value: String(scopedChargeCount || 0), hint: selectedPeriod?.periodName || '' },
            ]
            : [
                  { label: 'Còn phải thu', value: formatMoney(summary.totalOpenAmount), hint: 'Toàn hệ thống' },
                  { label: 'Đã thu học viên', value: formatMoney(summary.totalPaidAmount), hint: 'Toàn hệ thống' },
                  { label: 'Thu khác', value: formatMoney(summary.totalCashIn), hint: 'Toàn hệ thống' },
                  { label: 'Khoản đang mở', value: String(summary.openChargeCount || 0), hint: 'Toàn hệ thống' },
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
                                                <h1 className={residenceMediumStyle.standardHeaderTitle}>Tài chính lưu xá</h1>
                                                <p className={residenceMediumStyle.standardHeaderSubtitle}>Tạo kỳ thu chung, áp dụng cho từng học viên theo tháng và ghi nhận thanh toán.</p>
                                          </div>
                                          <div className={residenceMediumStyle.standardHeaderActions}>
                                                <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => setTransactionFormOpen(true)}>
                                                      Thu / chi khác
                                                </button>
                                                <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={() => setPeriodFormOpen(true)}>
                                                      Tạo kỳ thu
                                                </button>
                                          </div>
                                    </div>
                              </div>

                              <div className="grid gap-3 md:grid-cols-4">
                                    {topSummaryCards.map((card) => (
                                          <div key={card.label} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                                                <p className="text-xs text-slate-500">{card.label}</p>
                                                <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
                                                <p className="mt-1 truncate text-[11px] text-slate-400">{card.hint}</p>
                                          </div>
                                    ))}
                              </div>

                              <div className={residenceMediumStyle.standardTabRail}>
                                    <div className={residenceMediumStyle.standardTabGrid}>
                                          {[
                                                ['periods', 'Kỳ thu'],
                                                ['charges', 'Khoản phải thu'],
                                                ['cashbook', 'Sổ thu chi'],
                                          ].map(([key, label]) => (
                                                <button
                                                      key={key}
                                                      type="button"
                                                      className={`${residenceMediumStyle.standardTabButton} ${activeTab === key ? residenceMediumStyle.standardTabButtonActive : residenceMediumStyle.standardTabButtonIdle}`}
                                                      onClick={() => setActiveTab(key as FinanceTab)}
                                                >
                                                      {label}
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              {activeTab === 'periods' ? (
                                    <div className="grid gap-4 xl:h-[calc(100vh-250px)] xl:min-h-[620px] xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
                                          <section className="flex min-h-0 flex-col rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm xl:h-full">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                      <div>
                                                            <h2 className="text-base font-semibold text-slate-900">Danh sách kỳ thu</h2>
                                                            <p className="text-sm text-slate-500">Tạo một kỳ chung, sau đó vào chi tiết để áp dụng.</p>
                                                      </div>
                                                      <button type="button" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800" onClick={() => setPeriodFormOpen(true)}>
                                                            <Plus className="mr-1 inline h-3.5 w-3.5" /> Tạo
                                                      </button>
                                                </div>
                                                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                                                      {periods.length ? (
                                                            <>
                                                                  <div>
                                                                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chọn kỳ thu</label>
                                                                        <select
                                                                              value={selectedPeriodId || ''}
                                                                              onChange={(event) => {
                                                                                    const nextPeriod = periods.find((period: any) => Number(period.id) === Number(event.target.value));
                                                                                    if (!nextPeriod) return;
                                                                                    const months = getPeriodMonthsFromPeriod(nextPeriod);
                                                                                    const defaultMonth = months.find((month: any) => month.value === currentBillingMonth)?.value || months[0]?.value || '';
                                                                                    selectPeriodMonth(nextPeriod, defaultMonth);
                                                                              }}
                                                                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                                                                        >
                                                                              {periods.map((period: any) => (
                                                                                    <option key={period.id} value={period.id}>
                                                                                          {period.periodName} · Tháng {String(period.fromMonth).padStart(2, '0')}-{String(period.toMonth).padStart(2, '0')} / {period.year}
                                                                                    </option>
                                                                              ))}
                                                                        </select>
                                                                  </div>

                                                                  {selectedPeriod ? (
                                                                        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
                                                                              <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                          <p className="text-sm font-semibold text-slate-900">{selectedPeriod.periodName}</p>
                                                                                          <p className="mt-1 text-xs text-slate-500">Tháng {String(selectedPeriod.fromMonth).padStart(2, '0')} - {String(selectedPeriod.toMonth).padStart(2, '0')} / {selectedPeriod.year}</p>
                                                                                    </div>
                                                                                    <SmallBadge className="border-slate-200 bg-white text-slate-600">{selectedPeriod.chargeCount || 0} khoản</SmallBadge>
                                                                              </div>
                                                                              <p className="mt-2 text-xs text-slate-500">Còn phải thu: {formatMoney(selectedPeriod.openAmount)}</p>
                                                                        </div>
                                                                  ) : null}

                                                                  <div>
                                                                        <div className="mb-2 flex items-center justify-between gap-2">
                                                                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tháng trong kỳ</p>
                                                                              {periodContainsBillingMonth(selectedPeriod, currentBillingMonth) ? <SmallBadge className="border-amber-200 bg-amber-50 text-amber-700">Tháng hiện tại</SmallBadge> : null}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                              {selectedPeriodMonths.map((month: any) => {
                                                                                    const stats = getMonthChargeStats(selectedPeriod, month.value);
                                                                                    const selectedMonth = selectedBillingMonth === month.value;
                                                                                    const isCurrentMonth = currentBillingMonth === month.value;

                                                                                    return (
                                                                                          <button
                                                                                                key={month.value}
                                                                                                type="button"
                                                                                                onClick={() => selectPeriodMonth(selectedPeriod, month.value)}
                                                                                                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${selectedMonth ? 'border-amber-300 bg-white text-amber-900 shadow-sm' : 'border-slate-100 bg-white/70 text-slate-600 hover:border-amber-200 hover:bg-white'}`}
                                                                                          >
                                                                                                <div className="flex items-center justify-between gap-2">
                                                                                                      <span className="text-sm font-semibold">{month.label}</span>
                                                                                                      <div className="flex items-center gap-1.5">
                                                                                                            {isCurrentMonth ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Hiện tại</span> : null}
                                                                                                            <span className="text-[11px] text-slate-500">{stats.residentCount} người</span>
                                                                                                      </div>
                                                                                                </div>
                                                                                                <div className="mt-2 grid gap-1 text-[11px] text-slate-500">
                                                                                                      <span>Đã thu: {formatMoney(stats.paidAmount)}</span>
                                                                                                      <span>Còn lại: {formatMoney(stats.remainingAmount)}</span>
                                                                                                </div>
                                                                                          </button>
                                                                                    );
                                                                              })}
                                                                        </div>
                                                                  </div>
                                                            </>
                                                      ) : (
                                                            <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa có kỳ thu. Bấm “Tạo kỳ thu” để bắt đầu.</p>
                                                      )}
                                                </div>
                                          </section>

                                          <section className="min-h-0 overflow-y-auto rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm xl:h-full">
                                                {detail ? (
                                                      <>
                                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                                  <div>
                                                                        <h2 className="text-lg font-semibold text-slate-900">{detail.period.periodName}</h2>
                                                                        <p className="text-sm text-slate-500">
                                                                              Đang áp dụng cho {getBillingMonthLabel(selectedBillingMonth)}. Chọn kỳ thu và tháng ở panel bên trái.
                                                                        </p>
                                                                  </div>
                                                                  <div className="flex flex-wrap gap-2">
                                                                        <button type="button" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" onClick={applyDefaultForAllEligible}>Apply all đủ điều kiện</button>
                                                                        <button type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600" onClick={clearAllSelections}>Bỏ chọn tất cả</button>
                                                                  </div>
                                                            </div>

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
                                                                                    className={`rounded-2xl border p-3 text-left transition ${allSelected ? 'border-amber-300 bg-amber-50/80 shadow-sm' : 'border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/40'}`}
                                                                              >
                                                                                    <div className="flex items-start justify-between gap-3">
                                                                                          <div>
                                                                                                <p className="text-sm font-semibold text-slate-900">{item.feeTypeName}</p>
                                                                                                <p className="mt-1 text-sm text-slate-500">{formatMoney(item.amount)} · {Number(item.isDefaultChecked) === 1 ? 'Mặc định chọn' : 'Không mặc định'}</p>
                                                                                                <p className="mt-2 text-xs text-slate-500">Đã chọn {selectedCount}/{getPeriodItemEligibleResidents(itemId).length || 0} học viên</p>
                                                                                          </div>
                                                                                          <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs ${allSelected ? 'border-amber-400 bg-amber-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}>✓</span>
                                                                                    </div>
                                                                              </button>
                                                                        );
                                                                  })}
                                                            </div>

                                                            {selectionMessage ? <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">{selectionMessage}</div> : null}

                                                            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                        <div>
                                                                              <p className="text-sm font-semibold text-slate-900">Dự kiến áp dụng</p>
                                                                              <p className="mt-1 text-xs text-slate-500">Tính theo các ô đang được chọn, chưa tạo khoản phải thu thật.</p>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
                                                                              <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                                                                                    <p className="text-[11px] text-slate-500">Học viên</p>
                                                                                    <p className="text-sm font-semibold text-slate-900">{projectedApplySummary.residentCount}</p>
                                                                              </div>
                                                                              <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                                                                                    <p className="text-[11px] text-slate-500">Khoản phí</p>
                                                                                    <p className="text-sm font-semibold text-slate-900">{projectedApplySummary.totalItems}</p>
                                                                              </div>
                                                                              <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                                                                                    <p className="text-[11px] text-slate-500">Tổng tiền</p>
                                                                                    <p className="text-sm font-semibold text-slate-900">{formatMoney(projectedApplySummary.totalAmount)}</p>
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                                                                        {projectedApplySummary.items.map((item) => (
                                                                              <div key={item.id} className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                                                                                    <p className="truncate text-xs font-semibold text-slate-700">{item.name}</p>
                                                                                    <p className="mt-1 text-xs text-slate-500">{item.count} khoản · {formatMoney(item.amount)}</p>
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            </div>

                                                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                                                                  <table className="w-full table-fixed divide-y divide-slate-100 text-sm">
                                                                        <colgroup>
                                                                              <col className="w-[24%]" />
                                                                              {periodItems.map((item: any) => <col key={item.id} className="w-[25.33%]" />)}
                                                                        </colgroup>
                                                                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                                                              <tr>
                                                                                    <th className="px-3 py-3 text-left">Học viên</th>
                                                                                    {periodItems.map((item: any) => <th key={item.id} className="px-2 py-3 text-left">{item.feeTypeName}</th>)}
                                                                              </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                                              {!previewResidents.length ? (
                                                                                    <tr>
                                                                                          <td colSpan={periodItems.length + 1} className="px-4 py-8 text-center text-sm text-slate-500">
                                                                                                {previewQuery?.isError
                                                                                                      ? `Không tải được danh sách học viên: ${(previewQuery.error as any)?.message || 'Vui lòng kiểm tra log server.'}`
                                                                                                      : 'Chưa có học viên trong danh sách áp dụng cho tháng này.'}
                                                                                          </td>
                                                                                    </tr>
                                                                              ) : null}
                                                                              {previewResidents.map((resident: any) => (
                                                                                    <tr key={resident.id} className={!resident.eligible ? 'bg-slate-50 text-slate-400' : ''}>
                                                                                          <td className="px-3 py-3">
                                                                                                <p className="font-medium text-slate-900">{resident.fullName}</p>
                                                                                                <p className="text-xs text-slate-500">{resident.residentCode || 'Chưa có mã'}</p>
                                                                                                {!resident.eligible ? <p className="mt-1 text-[11px] text-amber-700">{resident.reason || 'Không đủ điều kiện'}</p> : null}
                                                                                          </td>
                                                                                          {periodItems.map((item: any) => {
                                                                                                const selected = residentSelections[String(resident.id)]?.[String(item.id)];
                                                                                                const alreadyApplied = isResidentItemAlreadyApplied(resident, item);
                                                                                                const selectable = isResidentItemSelectable(resident, item);
                                                                                                return (
                                                                                                      <td key={item.id} className={`px-1.5 py-3 ${alreadyApplied ? 'bg-slate-50 text-slate-400' : ''}`}>
                                                                                                            <label className="grid min-w-0 grid-cols-[18px_minmax(132px,1fr)] items-center gap-1.5">
                                                                                                                  <input
                                                                                                                        type="checkbox"
                                                                                                                        className="h-3.5 w-3.5 justify-self-center"
                                                                                                                        disabled={!selectable}
                                                                                                                        checked={Boolean(alreadyApplied || (selected?.selected && selectable))}
                                                                                                                        onChange={(event) => toggleResidentItem(Number(resident.id), Number(item.id), event.target.checked)}
                                                                                                                  />
                                                                                                                  <input
                                                                                                                        type="text"
                                                                                                                        inputMode="numeric"
                                                                                                                        disabled={!selectable || !selected?.selected}
                                                                                                                        value={selected?.amount || formatMoneyInput(item.amount)}
                                                                                                                        onChange={(event) => updateResidentItemAmount(Number(resident.id), Number(item.id), event.target.value)}
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
                                                                              : 'Chưa có khoản nào được chọn để tạo.'}
                                                                  </p>
                                                                  <button type="button" className={`${residenceMediumStyle.buttonCardPrimary} disabled:cursor-not-allowed disabled:opacity-50`} onClick={submitApplyPeriod} disabled={applyPeriodMutation?.isPending || !hasSelectedApplicableItems}>
                                                                        {applyPeriodMutation?.isPending ? 'Đang áp dụng...' : 'Lưu áp dụng khoản thu'}
                                                                  </button>
                                                            </div>
                                                      </>
                                                ) : (
                                                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Chọn một kỳ thu để xem chi tiết.</div>
                                                )}
                                          </section>
                                    </div>
                              ) : null}

                              {activeTab === 'charges' ? (
                                    <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                      <h2 className="text-base font-semibold text-slate-900">Khoản phải thu học viên</h2>
                                                      <p className="text-sm text-slate-500">Danh sách được sinh từ kỳ thu hoặc chỉnh riêng từng học viên.</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                      <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm học viên, loại phí..." className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm" />
                                                      </div>
                                                      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ChargeStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                                                            <option value="all">Tất cả</option>
                                                            <option value="open">Chưa thu</option>
                                                            <option value="partial">Thu một phần</option>
                                                            <option value="paid">Đã thu</option>
                                                            <option value="cancelled">Đã hủy</option>
                                                      </select>
                                                </div>
                                          </div>

                                          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                                                <table className="w-full table-fixed divide-y divide-slate-100 text-sm">
                                                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                                            <tr>
                                                                  <th className="px-3 py-3 text-left">Học viên / Đối tượng</th>
                                                                  <th className="px-3 py-3 text-left">Loại khoản</th>
                                                                  <th className="px-3 py-3 text-left">Kỳ</th>
                                                                  <th className="px-3 py-3 text-right">Số tiền</th>
                                                                  <th className="px-3 py-3 text-right">Đã thu</th>
                                                                  <th className="px-3 py-3 text-right">Còn lại</th>
                                                                  <th className="px-3 py-3 text-left">Trạng thái</th>
                                                                  <th className="px-3 py-3 text-right">Tác vụ</th>
                                                            </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-slate-100 bg-white">
                                                            {charges.map((charge: any) => (
                                                                  <tr key={charge.id}>
                                                                        <td className="px-3 py-3">
                                                                              <p className="font-medium text-slate-900">{charge.residentName || charge.targetName || 'Học viên'}</p>
                                                                              <p className="text-xs text-slate-500">{charge.residentCode || charge.targetType || '-'}</p>
                                                                        </td>
                                                                        <td className="px-3 py-3 text-slate-700">{charge.periodItemName || charge.feeTypeName || charge.feeName || 'Khoản thu'}</td>
                                                                        <td className="px-3 py-3 text-slate-600">
                                                                              <p>{getBillingMonthLabel(charge.billingMonth)}</p>
                                                                              <p className="text-xs text-slate-400">{charge.periodName || ''}</p>
                                                                        </td>
                                                                        <td className="px-3 py-3 text-right font-medium text-slate-900">{formatMoney(charge.amount)}</td>
                                                                        <td className="px-3 py-3 text-right text-slate-600">{formatMoney(charge.paidAmount)}</td>
                                                                        <td className="px-3 py-3 text-right text-slate-600">{formatMoney(charge.remainingAmount)}</td>
                                                                        <td className="px-3 py-3"><SmallBadge className={getStatusClass(charge.status)}>{getStatusLabel(charge.status)}</SmallBadge></td>
                                                                        <td className="px-3 py-3 text-right">
                                                                              <div className="flex justify-end gap-2">
                                                                                    {['open', 'partial'].includes(String(charge.status || 'open')) ? (
                                                                                          <button type="button" className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" onClick={() => openPayment(charge)}>
                                                                                                Thu
                                                                                          </button>
                                                                                    ) : null}
                                                                                    <button type="button" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600" onClick={() => openEditCharge(charge)}>
                                                                                          Sửa
                                                                                    </button>
                                                                                    {Number(charge.paidAmount || 0) <= 0 && charge.status !== 'cancelled' ? (
                                                                                          <button type="button" className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" onClick={() => {
                                                                                                if (window.confirm('Hủy khoản thu này?')) cancelChargeMutation?.mutate?.({ id: Number(charge.id), reason: 'Hủy từ màn tài chính' });
                                                                                          }}>
                                                                                                Hủy
                                                                                          </button>
                                                                                    ) : null}
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                      </tbody>
                                                </table>
                                          </div>
                                    </section>
                              ) : null}

                              {activeTab === 'cashbook' ? (
                                    <section className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm">
                                          <div className="mb-4 flex items-center justify-between gap-3">
                                                <div>
                                                      <h2 className="text-base font-semibold text-slate-900">Sổ thu chi</h2>
                                                      <p className="text-sm text-slate-500">Ghi nhận thu khác, chi phí và dòng tiền phát sinh.</p>
                                                </div>
                                                <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={() => setTransactionFormOpen(true)}>Thêm thu / chi</button>
                                          </div>
                                          <div className="space-y-2">
                                                {transactions.map((transaction: any) => (
                                                      <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                                                            <div className="flex items-center gap-3">
                                                                  <div className="rounded-xl bg-amber-50 p-2 text-amber-700">{transaction.direction === 'out' ? <CreditCard className="h-4 w-4" /> : <WalletCards className="h-4 w-4" />}</div>
                                                                  <div>
                                                                        <p className="font-medium text-slate-900">{transaction.targetName || transaction.description || 'Nghiệp vụ thu chi'}</p>
                                                                        <p className="text-xs text-slate-500">{formatDate(transaction.transactionDate)} · {transaction.source}</p>
                                                                  </div>
                                                            </div>
                                                            <p className={`font-semibold ${transaction.direction === 'out' ? 'text-rose-700' : 'text-emerald-700'}`}>{transaction.direction === 'out' ? '-' : '+'}{formatMoney(transaction.amount)}</p>
                                                      </div>
                                                ))}
                                          </div>
                                    </section>
                              ) : null}
                        </div>
                  </div>

                  {periodFormOpen ? (
                        <ModalShell title="Tạo kỳ thu" subtitle="Tạo khoản thu chung, chưa gắn học viên ở bước này." onClose={() => setPeriodFormOpen(false)}>
                              <div className="space-y-4 p-5">
                                    {periodFormMessage ? <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">{periodFormMessage}</div> : null}
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Tên kỳ thu</label>
                                          <input value={periodForm.periodName} onChange={(event) => setPeriodForm({ ...periodForm, periodName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Năm</label>
                                                <input type="number" value={periodForm.year} onChange={(event) => setPeriodForm({ ...periodForm, year: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Từ tháng</label>
                                                <select value={periodForm.fromMonth} onChange={(event) => setPeriodForm({ ...periodForm, fromMonth: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{String(month).padStart(2, '0')}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Đến tháng</label>
                                                <select value={periodForm.toMonth} onChange={(event) => setPeriodForm({ ...periodForm, toMonth: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{String(month).padStart(2, '0')}</option>)}
                                                </select>
                                          </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Phí lưu trú</label>
                                                <input type="text" inputMode="numeric" value={periodForm.lodgingAmount} onChange={(event) => setPeriodForm({ ...periodForm, lodgingAmount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Ăn uống sinh hoạt</label>
                                                <input type="text" inputMode="numeric" value={periodForm.mealLivingAmount} onChange={(event) => setPeriodForm({ ...periodForm, mealLivingAmount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Khoản thu khác</label>
                                                <input type="text" inputMode="numeric" value={periodForm.otherAmount} onChange={(event) => setPeriodForm({ ...periodForm, otherAmount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                                          <textarea value={periodForm.description} onChange={(event) => setPeriodForm({ ...periodForm, description: event.target.value })} className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                          <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => setPeriodFormOpen(false)}>Đóng</button>
                                          <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={submitCreatePeriod} disabled={createPeriodMutation?.isPending}>{createPeriodMutation?.isPending ? 'Đang lưu...' : 'Lưu kỳ thu'}</button>
                                    </div>
                              </div>
                        </ModalShell>
                  ) : null}

                  {paymentFormOpen ? (
                        <ModalShell title="Ghi nhận thanh toán" subtitle="Ghi nhận số tiền học viên đã nộp cho khoản phải thu." onClose={() => setPaymentFormOpen(false)}>
                              <div className="space-y-4 p-5">
                                    {paymentFormMessage ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{paymentFormMessage}</div> : null}
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Khoản phải thu</label>
                                          <select value={paymentForm.chargeId} onChange={(event) => {
                                                const charge = charges.find((item: any) => Number(item.id) === Number(event.target.value));
                                                setPaymentForm({ ...paymentForm, chargeId: event.target.value, residentId: String(charge?.residentId || ''), amount: formatMoneyInput(charge?.remainingAmount || charge?.amount || '') });
                                          }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                <option value="">Chọn khoản phải thu</option>
                                                {openCharges.map((charge: any) => <option key={charge.id} value={charge.id}>{charge.residentName || charge.targetName} - {charge.feeTypeName || charge.periodItemName} - còn {formatMoney(charge.remainingAmount)}</option>)}
                                          </select>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Số tiền thu</label>
                                                <input type="text" inputMode="numeric" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Ngày thu</label>
                                                <input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                                          <textarea value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} className="mt-1 min-h-[70px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                          <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => setPaymentFormOpen(false)}>Đóng</button>
                                          <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={submitPayment} disabled={recordPaymentMutation?.isPending}>{recordPaymentMutation?.isPending ? 'Đang lưu...' : 'Lưu thanh toán'}</button>
                                    </div>
                              </div>
                        </ModalShell>
                  ) : null}

                  {editChargeOpen ? (
                        <ModalShell title="Sửa khoản phải thu" subtitle="Chỉ sửa khoản chưa khóa nghiệp vụ. Khoản đã thu đủ nên hạn chế chỉnh." onClose={() => setEditChargeOpen(false)}>
                              <div className="space-y-4 p-5">
                                    {editChargeMessage ? <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">{editChargeMessage}</div> : null}
                                    <div className="grid gap-3 md:grid-cols-2">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Loại khoản</label>
                                                <select value={editChargeForm.feeTypeId} onChange={(event) => setEditChargeForm({ ...editChargeForm, feeTypeId: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                      <option value="">Không chọn</option>
                                                      {feeTypes.map((fee: any) => <option key={fee.id} value={fee.id}>{fee.feeName || fee.name}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Số tiền</label>
                                                <input type="text" inputMode="numeric" value={editChargeForm.amount} onChange={(event) => setEditChargeForm({ ...editChargeForm, amount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Kỳ thu</label>
                                                <input type="month" value={editChargeForm.billingMonth} onChange={(event) => setEditChargeForm({ ...editChargeForm, billingMonth: event.target.value, periodStartDate: getMonthStart(event.target.value), periodEndDate: getMonthEnd(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Từ ngày</label>
                                                <input type="date" value={editChargeForm.periodStartDate} onChange={(event) => setEditChargeForm({ ...editChargeForm, periodStartDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Đến ngày</label>
                                                <input type="date" value={editChargeForm.periodEndDate} onChange={(event) => setEditChargeForm({ ...editChargeForm, periodEndDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                                          <textarea value={editChargeForm.description} onChange={(event) => setEditChargeForm({ ...editChargeForm, description: event.target.value })} className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                          <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => setEditChargeOpen(false)}>Đóng</button>
                                          <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={submitEditCharge} disabled={updateChargeMutation?.isPending}>{updateChargeMutation?.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                                    </div>
                              </div>
                        </ModalShell>
                  ) : null}

                  {transactionFormOpen ? (
                        <ModalShell title="Thu / chi khác" subtitle="Ghi nhận khoản thu khác, tài trợ, ủng hộ, khoản chi hoặc kinh doanh." onClose={() => setTransactionFormOpen(false)}>
                              <div className="space-y-4 p-5">
                                    {transactionFormMessage ? <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{transactionFormMessage}</div> : null}
                                    <div className="grid gap-3 md:grid-cols-2">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Loại nghiệp vụ</label>
                                                <select value={transactionForm.source} onChange={(event) => setTransactionForm({ ...transactionForm, source: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                      <option value="other_income">Khoản thu khác</option>
                                                      <option value="donation">Tài trợ / ủng hộ</option>
                                                      <option value="expense">Khoản chi</option>
                                                      <option value="business">Thu / chi kinh doanh</option>
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Thu / chi</label>
                                                <select value={transactionForm.direction} onChange={(event) => setTransactionForm({ ...transactionForm, direction: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                                                      <option value="in">Thu</option>
                                                      <option value="out">Chi</option>
                                                </select>
                                          </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Số tiền</label>
                                                <input type="text" inputMode="numeric" value={transactionForm.amount} onChange={(event) => setTransactionForm({ ...transactionForm, amount: formatMoneyInput(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm" />
                                          </div>
                                          <div>
                                                <label className="text-sm font-medium text-slate-700">Ngày</label>
                                                <input type="date" value={transactionForm.transactionDate} onChange={(event) => setTransactionForm({ ...transactionForm, transactionDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Người/đơn vị/mục tiêu</label>
                                          <input value={transactionForm.targetName} onChange={(event) => setTransactionForm({ ...transactionForm, targetName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                          <label className="text-sm font-medium text-slate-700">Mục đích / ghi chú</label>
                                          <textarea value={transactionForm.description} onChange={(event) => setTransactionForm({ ...transactionForm, description: event.target.value })} className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                          <button type="button" className={residenceMediumStyle.buttonCard} onClick={() => setTransactionFormOpen(false)}>Đóng</button>
                                          <button type="button" className={residenceMediumStyle.buttonCardPrimary} onClick={submitTransaction} disabled={createTransactionMutation?.isPending}>{createTransactionMutation?.isPending ? 'Đang lưu...' : 'Lưu nghiệp vụ'}</button>
                                    </div>
                              </div>
                        </ModalShell>
                  ) : null}
            </ResidenceCareLayout>
      );
}
