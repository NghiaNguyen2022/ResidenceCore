'use client';

import { useMemo, useState } from 'react';
import {
      ArrowDownCircle,
      ArrowUpCircle,
      CreditCard,
      Gift,
      Plus,
      ReceiptText,
      Search,
      Store,
      UserRound,
      WalletCards,
} from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';
import { trpc } from '@/lib/trpc';

type FinanceTab = 'overview' | 'charges' | 'cashbook';
type ChargeStatus = 'all' | 'open' | 'partial' | 'paid' | 'cancelled';
type ChargeSource = 'student_fee' | 'other_income' | 'donation' | 'expense' | 'business';
type StudentFeeMode = 'fixed' | 'common' | 'composite';
type PeriodChargeMode = 'full_month' | 'half_month' | 'custom_amount' | 'prepaid_months';
type TransactionDirection = 'in' | 'out';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

function formatMoney(value?: number | string | null) {
      const numberValue = Number(value || 0);
      return `${moneyFormatter.format(numberValue)}đ`;
}

function formatDate(value?: string | Date | null) {
      if (!value) return 'Chưa có ngày';

      return String(value).slice(0, 10);
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

function getSourceLabel(source?: string | null) {
      if (source === 'student_fee') return 'Phí học viên';
      if (source === 'donation') return 'Tài trợ / ủng hộ';
      if (source === 'expense') return 'Khoản chi';
      if (source === 'business') return 'Kinh doanh';
      if (source === 'other_income') return 'Thu khác';

      return 'Khoản thu';
}

function getSourceClass(source?: string | null) {
      if (source === 'student_fee') return 'border-amber-100 bg-amber-50 text-amber-800';
      if (source === 'donation') return 'border-violet-100 bg-violet-50 text-violet-700';
      if (source === 'expense') return 'border-rose-100 bg-rose-50 text-rose-700';
      if (source === 'business') return 'border-sky-100 bg-sky-50 text-sky-700';

      return 'border-slate-100 bg-white text-slate-600';
}

function toDescription(parts: Array<string | null | undefined | false>) {
      return parts.filter(Boolean).join(' | ');
}

function getMonthStart(monthValue?: string) {
      if (!monthValue) return '';

      return `${monthValue}-01`;
}

function getMonthEnd(monthValue?: string) {
      if (!monthValue) return '';

      const [yearText, monthText] = monthValue.split('-');
      const year = Number(yearText);
      const month = Number(monthText);

      if (!year || !month) return '';

      return new Date(year, month, 0).toISOString().slice(0, 10);
}

function getPeriodLabel(mode: PeriodChargeMode, prepaidMonths?: string) {
      if (mode === 'half_month') return 'Thu 1/2 tháng';
      if (mode === 'custom_amount') return 'Thu theo số tiền tùy chỉnh';
      if (mode === 'prepaid_months') return `Thu trước ${prepaidMonths || 1} tháng`;

      return 'Thu trọn tháng';
}


const VIETNAMESE_MONTHS = [
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

function getBillingMonthOptions(baseMonthValue?: string) {
      const now = baseMonthValue ? new Date(`${baseMonthValue}-01T00:00:00`) : new Date();
      const options: Array<{ value: string; label: string }> = [];

      for (let index = -3; index <= 12; index += 1) {
            const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            options.push({
                  value,
                  label: `${VIETNAMESE_MONTHS[date.getMonth()]} / ${date.getFullYear()}`,
            });
      }

      return options;
}

function getBillingMonthLabel(value?: string) {
      if (!value) return 'Chưa chọn kỳ';

      const [yearText, monthText] = value.split('-');
      const monthIndex = Number(monthText) - 1;

      if (!yearText || monthIndex < 0 || monthIndex > 11) return value;

      return `${VIETNAMESE_MONTHS[monthIndex]} / ${yearText}`;
}


export default function FinanceLite() {
      const financeApi = (trpc as any).finance;
      const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<ChargeStatus>('all');
      const [chargeFormOpen, setChargeFormOpen] = useState(false);
      const [paymentFormOpen, setPaymentFormOpen] = useState(false);

      const [chargeForm, setChargeForm] = useState({
            source: 'student_fee' as ChargeSource,
            studentFeeMode: 'fixed' as StudentFeeMode,
            feeTypeId: '',
            residentIds: [] as number[],
            applyAll: false,
            billingMonth: new Date().toISOString().slice(0, 7),
            periodStartDate: '',
            periodEndDate: '',
            periodChargeMode: 'full_month' as PeriodChargeMode,
            prepaidMonths: '1',
            customAmount: '',
            amount: '',
            dueDate: '',
            targetType: '',
            targetName: '',
            donorName: '',
            expenseCategory: '',
            expenseTarget: '',
            businessDirection: 'in' as TransactionDirection,
            businessCategory: '',
            description: '',
            components: [
                  {
                        name: '',
                        amount: '',
                  },
            ],
      });

      const [paymentForm, setPaymentForm] = useState({
            chargeId: '',
            residentId: '',
            amount: '',
            paymentDate: '',
            method: 'cash',
            note: '',
      });

      const summaryQuery = financeApi?.summary?.useQuery?.();
      const feeTypesQuery = financeApi?.listFeeTypes?.useQuery?.({ isActive: true });
      const chargesQuery = financeApi?.listCharges?.useQuery?.({
            search: searchTerm || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 200,
      });
      const transactionsQuery = financeApi?.listTransactions?.useQuery?.({
            search: searchTerm || undefined,
            limit: 200,
      });
      const residentsQuery = (trpc as any).members?.list?.useQuery?.({
            status: 'active',
            limit: 500,
      });

      const createChargeBatchMutation = financeApi?.createChargeBatch?.useMutation?.({
            onSuccess: () => {
                  setChargeFormOpen(false);
                  resetChargeForm();
                  chargesQuery?.refetch?.();
                  transactionsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
      });

      const createTransactionMutation = financeApi?.createTransaction?.useMutation?.({
            onSuccess: () => {
                  setChargeFormOpen(false);
                  resetChargeForm();
                  transactionsQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
      });

      const recordPaymentMutation = financeApi?.recordPayment?.useMutation?.({
            onSuccess: () => {
                  setPaymentFormOpen(false);
                  setPaymentForm({
                        chargeId: '',
                        residentId: '',
                        amount: '',
                        paymentDate: '',
                        method: 'cash',
                        note: '',
                  });
                  chargesQuery?.refetch?.();
                  summaryQuery?.refetch?.();
            },
      });

      const charges = chargesQuery?.data || [];
      const transactions = transactionsQuery?.data || [];
      const feeTypes = feeTypesQuery?.data || [];
      const residents = residentsQuery?.data?.items || residentsQuery?.data || [];
      const summary = summaryQuery?.data || {
            totalOpenAmount: 0,
            totalPaidAmount: 0,
            totalCashIn: 0,
            totalCashOut: 0,
            openChargeCount: 0,
            paidChargeCount: 0,
      };

      const billingMonthOptions = useMemo(
            () => getBillingMonthOptions(chargeForm.billingMonth),
            [chargeForm.billingMonth]
      );

      const openCharges = useMemo(
            () =>
                  charges.filter((charge: any) =>
                        ['open', 'partial'].includes(String(charge.status || 'open'))
                  ),
            [charges]
      );

      const selectedCharge = useMemo(
            () =>
                  charges.find(
                        (charge: any) => Number(charge.id) === Number(paymentForm.chargeId || 0)
                  ),
            [charges, paymentForm.chargeId]
      );

      const componentTotal = useMemo(
            () =>
                  chargeForm.components.reduce(
                        (total, item) => total + Number(item.amount || 0),
                        0
                  ),
            [chargeForm.components]
      );

      const baseStudentFeeAmount =
            chargeForm.studentFeeMode === 'composite'
                  ? componentTotal
                  : Number(chargeForm.amount || 0);

      const resolvedStudentFeeAmount =
            chargeForm.periodChargeMode === 'half_month'
                  ? Math.round(baseStudentFeeAmount / 2)
                  : chargeForm.periodChargeMode === 'custom_amount'
                        ? Number(chargeForm.customAmount || 0)
                        : chargeForm.periodChargeMode === 'prepaid_months'
                              ? baseStudentFeeAmount * Number(chargeForm.prepaidMonths || 1)
                              : baseStudentFeeAmount;

      const resolvedAmount =
            chargeForm.source === 'student_fee'
                  ? resolvedStudentFeeAmount
                  : Number(chargeForm.amount || 0);

      const resolvedPeriodStartDate = chargeForm.periodStartDate || getMonthStart(chargeForm.billingMonth);
      const resolvedPeriodEndDate = chargeForm.periodEndDate || getMonthEnd(chargeForm.billingMonth);

      function resetChargeForm() {
            setChargeForm({
                  source: 'student_fee',
                  studentFeeMode: 'fixed',
                  feeTypeId: '',
                  residentIds: [],
                  applyAll: false,
                  billingMonth: new Date().toISOString().slice(0, 7),
                  periodStartDate: '',
                  periodEndDate: '',
                  periodChargeMode: 'full_month',
                  prepaidMonths: '1',
                  customAmount: '',
                  amount: '',
                  dueDate: '',
                  targetType: '',
                  targetName: '',
                  donorName: '',
                  expenseCategory: '',
                  expenseTarget: '',
                  businessDirection: 'in',
                  businessCategory: '',
                  description: '',
                  components: [
                        {
                              name: '',
                              amount: '',
                        },
                  ],
            });
      }

      const updateChargeForm = (patch: Partial<typeof chargeForm>) => {
            setChargeForm((current) => ({ ...current, ...patch }));
      };

      const updatePaymentForm = (patch: Partial<typeof paymentForm>) => {
            setPaymentForm((current) => ({ ...current, ...patch }));
      };

      const toggleResident = (residentId: number) => {
            setChargeForm((current) => ({
                  ...current,
                  residentIds: current.residentIds.includes(residentId)
                        ? current.residentIds.filter((id) => id !== residentId)
                        : [...current.residentIds, residentId],
            }));
      };

      const setComponentValue = (
            index: number,
            key: 'name' | 'amount',
            value: string
      ) => {
            setChargeForm((current) => ({
                  ...current,
                  components: current.components.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, [key]: value } : item
                  ),
            }));
      };

      const addComponent = () => {
            setChargeForm((current) => ({
                  ...current,
                  components: [
                        ...current.components,
                        {
                              name: '',
                              amount: '',
                        },
                  ],
            }));
      };

      const removeComponent = (index: number) => {
            setChargeForm((current) => ({
                  ...current,
                  components:
                        current.components.length <= 1
                              ? current.components
                              : current.components.filter((_, itemIndex) => itemIndex !== index),
            }));
      };

      const getSelectedResidentIds = () => {
            if (chargeForm.applyAll) {
                  return residents.map((resident: any) => Number(resident.id)).filter(Boolean);
            }

            return chargeForm.residentIds;
      };

      const saveChargeOrTransaction = () => {
            if (chargeForm.source === 'student_fee') {
                  const selectedResidentIds = getSelectedResidentIds();

                  if (!chargeForm.feeTypeId || selectedResidentIds.length === 0 || resolvedAmount <= 0) {
                        return;
                  }

                  createChargeBatchMutation?.mutate?.({
                        feeTypeId: Number(chargeForm.feeTypeId),
                        residentIds: selectedResidentIds,
                        amount: resolvedAmount,
                        dueDate: chargeForm.dueDate || null,
                        source: 'student_fee',
                        feeMode: chargeForm.studentFeeMode,
                        billingMonth: chargeForm.billingMonth || null,
                        periodStartDate: resolvedPeriodStartDate || null,
                        periodEndDate: resolvedPeriodEndDate || null,
                        periodChargeMode: chargeForm.periodChargeMode,
                        periodMultiplier:
                              chargeForm.periodChargeMode === 'half_month'
                                    ? 0.5
                                    : chargeForm.periodChargeMode === 'prepaid_months'
                                          ? Number(chargeForm.prepaidMonths || 1)
                                          : 1,
                        targetType: chargeForm.applyAll ? 'all_students' : 'selected_students',
                        targetName: chargeForm.applyAll ? 'Tất cả học viên' : `${selectedResidentIds.length} học viên`,
                        description: toDescription([
                              `Kỳ: ${chargeForm.billingMonth || 'chưa chọn'} (${getPeriodLabel(chargeForm.periodChargeMode, chargeForm.prepaidMonths)})`,
                              chargeForm.description,
                              chargeForm.studentFeeMode === 'composite'
                                    ? `Gồm: ${chargeForm.components
                                            .filter((item) => item.name || item.amount)
                                            .map((item) => `${item.name || 'Khoản nhỏ'} ${formatMoney(item.amount)}`)
                                            .join(', ')}`
                                    : null,
                        ]),
                  });
                  return;
            }

            if (chargeForm.source === 'other_income' && !chargeForm.targetName) {
                  return;
            }

            if (chargeForm.source === 'donation' && !chargeForm.donorName) {
                  return;
            }

            if (chargeForm.source === 'expense' && !chargeForm.expenseTarget) {
                  return;
            }

            createTransactionMutation?.mutate?.({
                  source: chargeForm.source,
                  direction:
                        chargeForm.source === 'business'
                              ? chargeForm.businessDirection
                              : chargeForm.source === 'expense'
                                    ? 'out'
                                    : 'in',
                  amount: resolvedAmount,
                  transactionDate: chargeForm.dueDate || null,
                  targetType:
                        chargeForm.source === 'business'
                              ? 'business'
                              : chargeForm.source === 'expense'
                                    ? chargeForm.expenseCategory || 'expense'
                                    : chargeForm.targetType || chargeForm.source,
                  targetName:
                        chargeForm.source === 'donation'
                              ? chargeForm.donorName
                              : chargeForm.source === 'expense'
                                    ? chargeForm.expenseTarget
                                    : chargeForm.targetName || chargeForm.businessCategory || getSourceLabel(chargeForm.source),
                  description: toDescription([
                        chargeForm.source === 'business'
                              ? `Hạng mục kinh doanh: ${chargeForm.businessCategory || 'Chưa phân loại'}`
                              : null,
                        chargeForm.source === 'expense'
                              ? `Khoản chi: ${chargeForm.expenseCategory || 'Chưa phân loại'}`
                              : null,
                        chargeForm.description,
                  ]),
            });
      };

      const savePayment = () => {
            const charge = selectedCharge;

            if (!paymentForm.chargeId || !paymentForm.amount) return;

            recordPaymentMutation?.mutate?.({
                  chargeId: Number(paymentForm.chargeId),
                  residentId: Number(paymentForm.residentId || charge?.residentId || 0),
                  amount: Number(paymentForm.amount),
                  paymentDate: paymentForm.paymentDate || null,
                  method: paymentForm.method,
                  note: paymentForm.note || null,
            });
      };

      const isStudentFee = chargeForm.source === 'student_fee';
      const isOtherIncome = chargeForm.source === 'other_income';
      const isDonation = chargeForm.source === 'donation';
      const isExpense = chargeForm.source === 'expense';
      const isBusiness = chargeForm.source === 'business';

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
                                                      Quản lý khoản thu học viên, thu khác, tài trợ và dòng tiền kinh doanh ở mức cơ bản.
                                                </p>
                                          </div>

                                          <div className={residenceMediumStyle.standardHeaderActions}>
                                                <button
                                                      type="button"
                                                      onClick={() => setPaymentFormOpen(true)}
                                                      className={residenceMediumStyle.buttonCard}
                                                >
                                                      <CreditCard className={residenceMediumStyle.buttonCardIcon} />
                                                      Ghi nhận thu
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => setChargeFormOpen(true)}
                                                      className={residenceMediumStyle.buttonCardPrimary}
                                                >
                                                      <Plus className={residenceMediumStyle.buttonCardIcon} />
                                                      Tạo nghiệp vụ
                                                </button>
                                          </div>
                                    </div>
                              </div>

                              <div className={residenceMediumStyle.standardTabRail}>
                                    <div className={residenceMediumStyle.standardTabGrid}>
                                          {[
                                                { key: 'overview', label: 'Tổng quan' },
                                                { key: 'charges', label: 'Khoản phải thu' },
                                                { key: 'cashbook', label: 'Thu chi khác' },
                                          ].map((tab) => (
                                                <button
                                                      key={tab.key}
                                                      type="button"
                                                      onClick={() => setActiveTab(tab.key as FinanceTab)}
                                                      className={[
                                                            residenceMediumStyle.standardTabButton,
                                                            activeTab === tab.key
                                                                  ? residenceMediumStyle.standardTabButtonActive
                                                                  : residenceMediumStyle.standardTabButtonIdle,
                                                      ].join(' ')}
                                                >
                                                      {tab.label}
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              {activeTab === 'overview' && (
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                          {[
                                                {
                                                      label: 'Học viên còn phải thu',
                                                      value: formatMoney(summary.totalOpenAmount),
                                                      helper: `${summary.openChargeCount || 0} khoản`,
                                                      icon: WalletCards,
                                                },
                                                {
                                                      label: 'Đã thu học viên',
                                                      value: formatMoney(summary.totalPaidAmount),
                                                      helper: `${summary.paidChargeCount || 0} khoản`,
                                                      icon: ReceiptText,
                                                },
                                                {
                                                      label: 'Tiền vào khác',
                                                      value: formatMoney(summary.totalCashIn),
                                                      helper: 'tài trợ / thu khác / kinh doanh',
                                                      icon: ArrowDownCircle,
                                                },
                                                {
                                                      label: 'Tổng tiền ra',
                                                      value: formatMoney(summary.totalCashOut),
                                                      helper: 'khoản chi / chi kinh doanh',
                                                      icon: ArrowUpCircle,
                                                },
                                          ].map((item) => {
                                                const Icon = item.icon;

                                                return (
                                                      <div
                                                            key={item.label}
                                                            className={residenceMediumStyle.standardSoftPanel}
                                                      >
                                                            <div className="flex items-start justify-between gap-3">
                                                                  <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                                              {item.label}
                                                                        </p>
                                                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                                                              {item.value}
                                                                        </p>
                                                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                                                              {item.helper}
                                                                        </p>
                                                                  </div>
                                                                  <span className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-800">
                                                                        <Icon className="h-5 w-5" />
                                                                  </span>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              )}

                              {(activeTab === 'charges' || activeTab === 'cashbook') && (
                                    <div className="space-y-4">
                                          <div className={residenceMediumStyle.standardToolbar}>
                                                <div className="relative min-w-[260px] flex-1">
                                                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                      <input
                                                            value={searchTerm}
                                                            onChange={(event) => setSearchTerm(event.target.value)}
                                                            placeholder="Tìm học viên, mã khoản thu, mục tiêu..."
                                                            className="h-10 w-full rounded-xl border border-amber-100/70 bg-white/78 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      />
                                                </div>

                                                {activeTab === 'charges' && (
                                                      <select
                                                            value={statusFilter}
                                                            onChange={(event) =>
                                                                  setStatusFilter(event.target.value as ChargeStatus)
                                                            }
                                                            className="h-10 rounded-xl border border-amber-100/70 bg-white/78 px-3 text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-amber-100/80"
                                                      >
                                                            <option value="all">Tất cả trạng thái</option>
                                                            <option value="open">Chưa thu</option>
                                                            <option value="partial">Thu một phần</option>
                                                            <option value="paid">Đã thu</option>
                                                            <option value="cancelled">Đã hủy</option>
                                                      </select>
                                                )}
                                          </div>

                                          {activeTab === 'charges' && (
                                                <div className="space-y-3">
                                                      {charges.length === 0 ? (
                                                            <div className={residenceMediumStyle.standardSoftPanel}>
                                                                  <p className="text-sm font-semibold text-slate-800">
                                                                        Chưa có khoản phải thu học viên
                                                                  </p>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Tạo khoản thu học viên để theo dõi tình trạng thu.
                                                                  </p>
                                                            </div>
                                                      ) : (
                                                            charges.map((charge: any) => (
                                                                  <div
                                                                        key={charge.id}
                                                                        className={residenceMediumStyle.standardSoftCard}
                                                                  >
                                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                              <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <h3 className="font-bold text-slate-900">
                                                                                                {charge.feeName || charge.feeTypeName || 'Khoản thu học viên'}
                                                                                          </h3>
                                                                                          <span
                                                                                                className={[
                                                                                                      'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                                                                      getStatusClass(charge.status),
                                                                                                ].join(' ')}
                                                                                          >
                                                                                                {getStatusLabel(charge.status)}
                                                                                          </span>
                                                                                          <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                                                                {charge.targetName || getSourceLabel(charge.source)}
                                                                                          </span>
                                                                                    </div>
                                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                                          {charge.residentName || charge.fullName || 'Học viên'} · Kỳ {getBillingMonthLabel(charge.billingMonth)} · Hạn thu {formatDate(charge.dueDate)}
                                                                                    </p>
                                                                              </div>

                                                                              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                                                                                    <div className={residenceMediumStyle.standardInfoBox}>
                                                                                          <p className={residenceMediumStyle.standardInfoLabel}>
                                                                                                Phải thu
                                                                                          </p>
                                                                                          <p className={residenceMediumStyle.standardInfoText}>
                                                                                                {formatMoney(charge.amount)}
                                                                                          </p>
                                                                                    </div>
                                                                                    <div className={residenceMediumStyle.standardInfoBox}>
                                                                                          <p className={residenceMediumStyle.standardInfoLabel}>
                                                                                                Đã thu
                                                                                          </p>
                                                                                          <p className={residenceMediumStyle.standardInfoText}>
                                                                                                {formatMoney(charge.paidAmount)}
                                                                                          </p>
                                                                                    </div>
                                                                                    <div className={residenceMediumStyle.standardInfoBox}>
                                                                                          <p className={residenceMediumStyle.standardInfoLabel}>
                                                                                                Còn lại
                                                                                          </p>
                                                                                          <p className={residenceMediumStyle.standardInfoText}>
                                                                                                {formatMoney(charge.remainingAmount)}
                                                                                          </p>
                                                                                    </div>
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                            ))
                                                      )}
                                                </div>
                                          )}

                                          {activeTab === 'cashbook' && (
                                                <div className="space-y-3">
                                                      {transactions.length === 0 ? (
                                                            <div className={residenceMediumStyle.standardSoftPanel}>
                                                                  <p className="text-sm font-semibold text-slate-800">
                                                                        Chưa có thu chi khác
                                                                  </p>
                                                                  <p className="mt-1 text-sm text-slate-500">
                                                                        Ghi nhận tài trợ, thu khác hoặc dòng tiền kinh doanh cơ bản tại đây.
                                                                  </p>
                                                            </div>
                                                      ) : (
                                                            transactions.map((transaction: any) => (
                                                                  <div
                                                                        key={transaction.id}
                                                                        className={residenceMediumStyle.standardSoftCard}
                                                                  >
                                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                                              <div>
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <h3 className="font-bold text-slate-900">
                                                                                                {transaction.targetName || getSourceLabel(transaction.source)}
                                                                                          </h3>
                                                                                          <span
                                                                                                className={[
                                                                                                      'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                                                                      getSourceClass(transaction.source),
                                                                                                ].join(' ')}
                                                                                          >
                                                                                                {getSourceLabel(transaction.source)}
                                                                                          </span>
                                                                                          <span
                                                                                                className={[
                                                                                                      'rounded-full border px-2.5 py-1 text-xs font-semibold',
                                                                                                      transaction.direction === 'out'
                                                                                                            ? 'border-rose-100 bg-rose-50 text-rose-700'
                                                                                                            : 'border-emerald-100 bg-emerald-50 text-emerald-700',
                                                                                                ].join(' ')}
                                                                                          >
                                                                                                {transaction.direction === 'out' ? 'Tiền ra' : 'Tiền vào'}
                                                                                          </span>
                                                                                    </div>
                                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                                          {formatDate(transaction.transactionDate)} · {transaction.description || 'Không có ghi chú'}
                                                                                    </p>
                                                                              </div>

                                                                              <p
                                                                                    className={[
                                                                                          'text-xl font-bold',
                                                                                          transaction.direction === 'out'
                                                                                                ? 'text-rose-700'
                                                                                                : 'text-emerald-700',
                                                                                    ].join(' ')}
                                                                              >
                                                                                    {transaction.direction === 'out' ? '-' : '+'}
                                                                                    {formatMoney(transaction.amount)}
                                                                              </p>
                                                                        </div>
                                                                  </div>
                                                            ))
                                                      )}
                                                </div>
                                          )}
                                    </div>
                              )}

                              {chargeFormOpen && (
                                    <div className={residenceMediumStyle.standardModalOverlay}>
                                          <div className={`${residenceMediumStyle.standardModalShell} max-w-5xl`}>
                                                <div className={residenceMediumStyle.standardModalHeader}>
                                                      <div>
                                                            <h2 className="text-xl font-bold text-slate-900">
                                                                  Tạo nghiệp vụ tài chính
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Chọn đúng loại nghiệp vụ để sau này mở rộng báo cáo dễ hơn.
                                                            </p>
                                                      </div>
                                                      <button
                                                            type="button"
                                                            onClick={() => setChargeFormOpen(false)}
                                                            className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-amber-50"
                                                      >
                                                            Đóng
                                                      </button>
                                                </div>

                                                <div className="max-h-[calc(100vh-190px)] space-y-5 overflow-y-auto p-5">
                                                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                                            {[
                                                                  {
                                                                        key: 'student_fee',
                                                                        label: 'Thu phí học viên',
                                                                        icon: UserRound,
                                                                        hint: 'Khoản cố định/chung/gồm nhiều khoản nhỏ',
                                                                  },
                                                                  {
                                                                        key: 'other_income',
                                                                        label: 'Khoản thu khác',
                                                                        icon: ReceiptText,
                                                                        hint: 'Bắt buộc có mục tiêu thu',
                                                                  },
                                                                  {
                                                                        key: 'donation',
                                                                        label: 'Tài trợ / ủng hộ',
                                                                        icon: Gift,
                                                                        hint: 'Người/đơn vị tài trợ',
                                                                  },
                                                                  {
                                                                        key: 'expense',
                                                                        label: 'Khoản chi',
                                                                        icon: ArrowUpCircle,
                                                                        hint: 'Chi sinh hoạt, sửa chữa, vận hành...',
                                                                  },
                                                                  {
                                                                        key: 'business',
                                                                        label: 'Kinh doanh',
                                                                        icon: Store,
                                                                        hint: 'Tiền vào/ra cho cửa hàng sau này',
                                                                  },
                                                            ].map((item) => {
                                                                  const Icon = item.icon;
                                                                  const active = chargeForm.source === item.key;

                                                                  return (
                                                                        <button
                                                                              key={item.key}
                                                                              type="button"
                                                                              onClick={() =>
                                                                                    updateChargeForm({
                                                                                          source: item.key as ChargeSource,
                                                                                    })
                                                                              }
                                                                              className={[
                                                                                    'rounded-2xl border p-3 text-left transition',
                                                                                    active
                                                                                          ? 'border-amber-200 bg-amber-50 text-amber-900 shadow-sm'
                                                                                          : 'border-amber-100 bg-white/80 text-slate-600 hover:bg-amber-50/50',
                                                                              ].join(' ')}
                                                                        >
                                                                              <Icon className="h-5 w-5" />
                                                                              <p className="mt-2 text-sm font-bold">
                                                                                    {item.label}
                                                                              </p>
                                                                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                                    {item.hint}
                                                                              </p>
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>

                                                      {isStudentFee && (
                                                            <div className="space-y-4 rounded-2xl border border-amber-100 bg-white/70 p-4">
                                                                  <div>
                                                                        <p className="font-bold text-slate-900">
                                                                              Cấu trúc khoản thu học viên
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-slate-500">
                                                                              Dùng cho phí cố định, khoản thu chung hoặc gói gồm nhiều khoản nhỏ.
                                                                        </p>
                                                                  </div>

                                                                  <div className="grid gap-4 md:grid-cols-4">
                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Kỳ thu
                                                                              </span>
                                                                              <select
                                                                                    value={chargeForm.billingMonth}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                billingMonth: event.target.value,
                                                                                                periodStartDate: getMonthStart(event.target.value),
                                                                                                periodEndDate: getMonthEnd(event.target.value),
                                                                                          })
                                                                                    }
                                                                                    className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm font-semibold text-slate-700"
                                                                              >
                                                                                    {billingMonthOptions.map((option) => (
                                                                                          <option key={option.value} value={option.value}>
                                                                                                {option.label}
                                                                                          </option>
                                                                                    ))}
                                                                              </select>
                                                                        </label>

                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Từ ngày
                                                                              </span>
                                                                              <DatePickerInput
                                                                                    value={chargeForm.periodStartDate}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                periodStartDate: event.target.value,
                                                                                          })
                                                                                    }
                                                                              />
                                                                        </label>

                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Đến ngày
                                                                              </span>
                                                                              <DatePickerInput
                                                                                    value={chargeForm.periodEndDate}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                periodEndDate: event.target.value,
                                                                                          })
                                                                                    }
                                                                              />
                                                                        </label>

                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Cách thu
                                                                              </span>
                                                                              <select
                                                                                    value={chargeForm.periodChargeMode}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                periodChargeMode: event.target.value as PeriodChargeMode,
                                                                                          })
                                                                                    }
                                                                                    className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                              >
                                                                                    <option value="full_month">Thu trọn tháng</option>
                                                                                    <option value="half_month">Thu 1/2 tháng</option>
                                                                                    <option value="custom_amount">Thu số tiền tùy chỉnh</option>
                                                                                    <option value="prepaid_months">Thu trước nhiều tháng</option>
                                                                              </select>
                                                                        </label>
                                                                  </div>

                                                                  {(chargeForm.periodChargeMode === 'custom_amount' ||
                                                                        chargeForm.periodChargeMode === 'prepaid_months') && (
                                                                        <div className="grid gap-4 md:grid-cols-2">
                                                                              {chargeForm.periodChargeMode === 'custom_amount' && (
                                                                                    <label className="space-y-1.5">
                                                                                          <span className="text-sm font-semibold text-slate-700">
                                                                                                Số tiền tùy chỉnh
                                                                                          </span>
                                                                                          <input
                                                                                                value={chargeForm.customAmount}
                                                                                                onChange={(event) =>
                                                                                                      updateChargeForm({
                                                                                                            customAmount: event.target.value,
                                                                                                      })
                                                                                                }
                                                                                                type="number"
                                                                                                min="0"
                                                                                                className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                          />
                                                                                    </label>
                                                                              )}

                                                                              {chargeForm.periodChargeMode === 'prepaid_months' && (
                                                                                    <label className="space-y-1.5">
                                                                                          <span className="text-sm font-semibold text-slate-700">
                                                                                                Số tháng thu trước
                                                                                          </span>
                                                                                          <input
                                                                                                value={chargeForm.prepaidMonths}
                                                                                                onChange={(event) =>
                                                                                                      updateChargeForm({
                                                                                                            prepaidMonths: event.target.value,
                                                                                                      })
                                                                                                }
                                                                                                type="number"
                                                                                                min="1"
                                                                                                className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                          />
                                                                                    </label>
                                                                              )}
                                                                        </div>
                                                                  )}

                                                                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
                                                                        <p className="font-bold">
                                                                              Số tiền tính cho mỗi học viên: {formatMoney(resolvedStudentFeeAmount)}
                                                                        </p>
                                                                        <p className="mt-1 text-xs font-semibold text-amber-800">
                                                                              {getBillingMonthLabel(chargeForm.billingMonth)} · {formatDate(resolvedPeriodStartDate)} - {formatDate(resolvedPeriodEndDate)} · {getPeriodLabel(chargeForm.periodChargeMode, chargeForm.prepaidMonths)}
                                                                        </p>
                                                                  </div>

                                                                  <div className="grid gap-2 md:grid-cols-3">
                                                                        {[
                                                                              {
                                                                                    key: 'fixed',
                                                                                    label: 'Khoản cố định',
                                                                              },
                                                                              {
                                                                                    key: 'common',
                                                                                    label: 'Khoản chung',
                                                                              },
                                                                              {
                                                                                    key: 'composite',
                                                                                    label: 'Gồm nhiều khoản nhỏ',
                                                                              },
                                                                        ].map((mode) => (
                                                                              <button
                                                                                    key={mode.key}
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                          updateChargeForm({
                                                                                                studentFeeMode: mode.key as StudentFeeMode,
                                                                                          })
                                                                                    }
                                                                                    className={[
                                                                                          'rounded-xl border px-3 py-2 text-sm font-semibold',
                                                                                          chargeForm.studentFeeMode === mode.key
                                                                                                ? 'border-amber-200 bg-amber-50 text-amber-900'
                                                                                                : 'border-amber-100 bg-white text-slate-600',
                                                                                    ].join(' ')}
                                                                              >
                                                                                    {mode.label}
                                                                              </button>
                                                                        ))}
                                                                  </div>

                                                                  <div className="grid gap-4 md:grid-cols-3">
                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Loại khoản thu
                                                                              </span>
                                                                              <select
                                                                                    value={chargeForm.feeTypeId}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                feeTypeId: event.target.value,
                                                                                          })
                                                                                    }
                                                                                    className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                              >
                                                                                    <option value="">Chọn loại khoản thu</option>
                                                                                    {feeTypes.map((fee: any) => (
                                                                                          <option key={fee.id} value={fee.id}>
                                                                                                {fee.name || fee.feeName}
                                                                                          </option>
                                                                                    ))}
                                                                              </select>
                                                                        </label>

                                                                        {chargeForm.studentFeeMode !== 'composite' && (
                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Số tiền
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.amount}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      amount: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          type="number"
                                                                                          min="0"
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>
                                                                        )}

                                                                        <label className="space-y-1.5">
                                                                              <span className="text-sm font-semibold text-slate-700">
                                                                                    Hạn thu
                                                                              </span>
                                                                              <DatePickerInput
                                                                                    value={chargeForm.dueDate}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                dueDate: event.target.value,
                                                                                          })
                                                                                    }
                                                                              />
                                                                        </label>
                                                                  </div>

                                                                  {chargeForm.studentFeeMode === 'composite' && (
                                                                        <div className="space-y-2">
                                                                              <div className="flex items-center justify-between">
                                                                                    <p className="text-sm font-semibold text-slate-700">
                                                                                          Các khoản nhỏ
                                                                                    </p>
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={addComponent}
                                                                                          className="rounded-xl border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                                                                                    >
                                                                                          + Thêm khoản nhỏ
                                                                                    </button>
                                                                              </div>

                                                                              {chargeForm.components.map((component, index) => (
                                                                                    <div
                                                                                          key={index}
                                                                                          className="grid gap-2 md:grid-cols-[1fr_160px_auto]"
                                                                                    >
                                                                                          <input
                                                                                                value={component.name}
                                                                                                onChange={(event) =>
                                                                                                      setComponentValue(
                                                                                                            index,
                                                                                                            'name',
                                                                                                            event.target.value
                                                                                                      )
                                                                                                }
                                                                                                placeholder="Tên khoản nhỏ"
                                                                                                className="h-10 rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                          />
                                                                                          <input
                                                                                                value={component.amount}
                                                                                                onChange={(event) =>
                                                                                                      setComponentValue(
                                                                                                            index,
                                                                                                            'amount',
                                                                                                            event.target.value
                                                                                                      )
                                                                                                }
                                                                                                type="number"
                                                                                                min="0"
                                                                                                placeholder="Số tiền"
                                                                                                className="h-10 rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                          />
                                                                                          <button
                                                                                                type="button"
                                                                                                onClick={() => removeComponent(index)}
                                                                                                className="rounded-xl border border-rose-100 bg-rose-50 px-3 text-sm font-semibold text-rose-700"
                                                                                          >
                                                                                                Xóa
                                                                                          </button>
                                                                                    </div>
                                                                              ))}

                                                                              <p className="text-sm font-bold text-slate-800">
                                                                                    Tổng gói: {formatMoney(componentTotal)}
                                                                              </p>
                                                                        </div>
                                                                  )}

                                                                  <div className="space-y-2">
                                                                        <label className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm font-semibold text-amber-900">
                                                                              <input
                                                                                    type="checkbox"
                                                                                    checked={chargeForm.applyAll}
                                                                                    onChange={(event) =>
                                                                                          updateChargeForm({
                                                                                                applyAll: event.target.checked,
                                                                                          })
                                                                                    }
                                                                              />
                                                                              Áp dụng cho tất cả học viên đang lưu trú
                                                                        </label>

                                                                        {!chargeForm.applyAll && (
                                                                              <div className="grid max-h-72 gap-2 overflow-y-auto rounded-2xl border border-amber-100 bg-white/72 p-2 md:grid-cols-2">
                                                                                    {residents.map((resident: any) => {
                                                                                          const active = chargeForm.residentIds.includes(
                                                                                                Number(resident.id)
                                                                                          );

                                                                                          return (
                                                                                                <button
                                                                                                      key={resident.id}
                                                                                                      type="button"
                                                                                                      onClick={() =>
                                                                                                            toggleResident(Number(resident.id))
                                                                                                      }
                                                                                                      className={[
                                                                                                            'rounded-xl border px-3 py-2 text-left text-sm font-semibold transition',
                                                                                                            active
                                                                                                                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                                                                                                                  : 'border-amber-100 bg-white/86 text-slate-600 hover:bg-amber-50',
                                                                                                      ].join(' ')}
                                                                                                >
                                                                                                      {resident.fullName || resident.name}
                                                                                                </button>
                                                                                          );
                                                                                    })}
                                                                              </div>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      )}

                                                      {(isOtherIncome || isDonation || isExpense || isBusiness) && (
                                                            <div className="grid gap-4 rounded-2xl border border-amber-100 bg-white/70 p-4 md:grid-cols-2">
                                                                  {isExpense && (
                                                                        <>
                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Nhóm khoản chi
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.expenseCategory}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      expenseCategory: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="VD: sinh hoạt, sửa chữa, văn phòng phẩm..."
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>

                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Mục tiêu chi
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.expenseTarget}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      expenseTarget: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="Bắt buộc nhập mục tiêu chi"
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>
                                                                        </>
                                                                  )}

                                                                  {isBusiness && (
                                                                        <>
                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Loại dòng tiền
                                                                                    </span>
                                                                                    <select
                                                                                          value={chargeForm.businessDirection}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      businessDirection:
                                                                                                            event.target.value as TransactionDirection,
                                                                                                })
                                                                                          }
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    >
                                                                                          <option value="in">Tiền vào</option>
                                                                                          <option value="out">Tiền ra</option>
                                                                                    </select>
                                                                              </label>

                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Hạng mục kinh doanh
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.businessCategory}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      businessCategory: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="VD: Cửa hàng, bán nước, vật dụng..."
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>
                                                                        </>
                                                                  )}

                                                                  {isOtherIncome && (
                                                                        <>
                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Loại mục tiêu
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.targetType}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      targetType: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="VD: sửa chữa, sinh hoạt, sự kiện..."
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>

                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Mục tiêu thu
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.targetName}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      targetName: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="Bắt buộc nhập mục tiêu"
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>
                                                                        </>
                                                                  )}

                                                                  {isDonation && (
                                                                        <>
                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Người/đơn vị tài trợ
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.donorName}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      donorName: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="Tên người/đơn vị tài trợ"
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>

                                                                              <label className="space-y-1.5">
                                                                                    <span className="text-sm font-semibold text-slate-700">
                                                                                          Mục đích tài trợ
                                                                                    </span>
                                                                                    <input
                                                                                          value={chargeForm.targetName}
                                                                                          onChange={(event) =>
                                                                                                updateChargeForm({
                                                                                                      targetName: event.target.value,
                                                                                                })
                                                                                          }
                                                                                          placeholder="VD: học bổng, sửa chữa, sinh hoạt..."
                                                                                          className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                                    />
                                                                              </label>
                                                                        </>
                                                                  )}

                                                                  <label className="space-y-1.5">
                                                                        <span className="text-sm font-semibold text-slate-700">
                                                                              {isExpense ? 'Số tiền chi' : 'Số tiền'}
                                                                        </span>
                                                                        <input
                                                                              value={chargeForm.amount}
                                                                              onChange={(event) =>
                                                                                    updateChargeForm({
                                                                                          amount: event.target.value,
                                                                                    })
                                                                              }
                                                                              type="number"
                                                                              min="0"
                                                                              className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                        />
                                                                  </label>

                                                                  <label className="space-y-1.5">
                                                                        <span className="text-sm font-semibold text-slate-700">
                                                                              Ngày ghi nhận
                                                                        </span>
                                                                        <DatePickerInput
                                                                              value={chargeForm.dueDate}
                                                                              onChange={(event) =>
                                                                                    updateChargeForm({
                                                                                          dueDate: event.target.value,
                                                                                    })
                                                                              }
                                                                        />
                                                                  </label>
                                                            </div>
                                                      )}

                                                      <label className="block space-y-1.5">
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                  Ghi chú
                                                            </span>
                                                            <input
                                                                  value={chargeForm.description}
                                                                  onChange={(event) =>
                                                                        updateChargeForm({
                                                                              description: event.target.value,
                                                                        })
                                                                  }
                                                                  className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                            />
                                                      </label>

                                                      <div className="flex justify-end gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setChargeFormOpen(false)}
                                                                  className="rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-amber-50"
                                                            >
                                                                  Hủy
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={saveChargeOrTransaction}
                                                                  className={residenceMediumStyle.buttonCardPrimary}
                                                            >
                                                                  Lưu nghiệp vụ
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}

                              {paymentFormOpen && (
                                    <div className={residenceMediumStyle.standardModalOverlay}>
                                          <div className={`${residenceMediumStyle.standardModalShell} max-w-3xl`}>
                                                <div className={residenceMediumStyle.standardModalHeader}>
                                                      <div>
                                                            <h2 className="text-xl font-bold text-slate-900">
                                                                  Ghi nhận thanh toán học viên
                                                            </h2>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Ghi nhận số tiền đã thu cho một khoản phải thu học viên.
                                                            </p>
                                                      </div>
                                                      <button
                                                            type="button"
                                                            onClick={() => setPaymentFormOpen(false)}
                                                            className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-amber-50"
                                                      >
                                                            Đóng
                                                      </button>
                                                </div>

                                                <div className="space-y-4 p-5">
                                                      <label className="space-y-1.5">
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                  Khoản phải thu
                                                            </span>
                                                            <select
                                                                  value={paymentForm.chargeId}
                                                                  onChange={(event) =>
                                                                        updatePaymentForm({
                                                                              chargeId: event.target.value,
                                                                              residentId:
                                                                                    charges.find(
                                                                                          (charge: any) =>
                                                                                                Number(charge.id) ===
                                                                                                Number(event.target.value)
                                                                                    )?.residentId || '',
                                                                        })
                                                                  }
                                                                  className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                            >
                                                                  <option value="">Chọn khoản phải thu</option>
                                                                  {openCharges.map((charge: any) => (
                                                                        <option key={charge.id} value={charge.id}>
                                                                              {charge.residentName || charge.fullName} · {charge.feeName || charge.feeTypeName} · còn {formatMoney(charge.remainingAmount)}
                                                                        </option>
                                                                  ))}
                                                            </select>
                                                      </label>

                                                      <div className="grid gap-4 md:grid-cols-2">
                                                            <label className="space-y-1.5">
                                                                  <span className="text-sm font-semibold text-slate-700">
                                                                        Số tiền thu
                                                                  </span>
                                                                  <input
                                                                        value={paymentForm.amount}
                                                                        onChange={(event) =>
                                                                              updatePaymentForm({
                                                                                    amount: event.target.value,
                                                                              })
                                                                        }
                                                                        type="number"
                                                                        min="0"
                                                                        className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                                  />
                                                            </label>

                                                            <label className="space-y-1.5">
                                                                  <span className="text-sm font-semibold text-slate-700">
                                                                        Ngày thu
                                                                  </span>
                                                                  <DatePickerInput
                                                                        value={paymentForm.paymentDate}
                                                                        onChange={(event) =>
                                                                              updatePaymentForm({
                                                                                    paymentDate: event.target.value,
                                                                              })
                                                                        }
                                                                  />
                                                            </label>
                                                      </div>

                                                      <label className="space-y-1.5">
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                  Ghi chú
                                                            </span>
                                                            <input
                                                                  value={paymentForm.note}
                                                                  onChange={(event) =>
                                                                        updatePaymentForm({ note: event.target.value })
                                                                  }
                                                                  className="h-10 w-full rounded-xl border border-amber-100 bg-white/90 px-3 text-sm"
                                                            />
                                                      </label>

                                                      <div className="flex justify-end gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={() => setPaymentFormOpen(false)}
                                                                  className="rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-amber-50"
                                                            >
                                                                  Hủy
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={savePayment}
                                                                  className={residenceMediumStyle.buttonCardPrimary}
                                                            >
                                                                  Ghi nhận thu
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
