import { HandCoins, PiggyBank, ReceiptText, WalletCards } from "lucide-react";

import { DatePickerInput } from "@/components/shared/form/DatePickerInput";
import { StandardModalShell } from "@/components/shared/overlay/StandardModalShell";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import type { EditChargeState, PeriodFormState } from "./financeLiteTypes";
import {
  formatMoney,
  formatMoneyInput,
  getBillingMonthLabel,
  getMonthEnd,
  getMonthStart,
  getTransactionDirectionForSource,
  getTransactionSourceMeta,
  toMoneyNumber,
} from "./financeLiteUtils";

type Setter<T> = (value: T | ((current: T) => T)) => void;

export function FinanceCreatePeriodModal({
  message,
  form,
  setForm,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  message: string;
  form: PeriodFormState;
  setForm: Setter<PeriodFormState>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <StandardModalShell
      title="Tạo kỳ thu"
      subtitle="Tạo khoản thu chung, chưa gắn học viên ở bước này."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Tên kỳ thu
          </label>
          <input
            value={form.periodName}
            onChange={(event) =>
              setForm({
                ...form,
                periodName: event.target.value,
              })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Năm</label>
            <input
              type="number"
              value={form.year}
              onChange={(event) => setForm({ ...form, year: event.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <MonthSelect
            label="Từ tháng"
            value={form.fromMonth}
            onChange={(fromMonth) => setForm({ ...form, fromMonth })}
          />
          <MonthSelect
            label="Đến tháng"
            value={form.toMonth}
            onChange={(toMonth) => setForm({ ...form, toMonth })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <MoneyInput
            label="Phí lưu trú"
            value={form.lodgingAmount}
            onChange={(lodgingAmount) => setForm({ ...form, lodgingAmount })}
          />
          <MoneyInput
            label="Ăn uống sinh hoạt"
            value={form.mealLivingAmount}
            onChange={(mealLivingAmount) =>
              setForm({ ...form, mealLivingAmount })
            }
          />
          <MoneyInput
            label="Khoản thu khác"
            value={form.otherAmount}
            onChange={(otherAmount) => setForm({ ...form, otherAmount })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <ModalActions
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submittingText="Đang lưu..."
          submitText="Lưu kỳ thu"
        />
      </div>
    </StandardModalShell>
  );
}

export function FinancePaymentModal({
  message,
  form,
  setForm,
  charges,
  openCharges,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  message: string;
  form: any;
  setForm: Setter<any>;
  charges: any[];
  openCharges: any[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <StandardModalShell
      title="Ghi nhận thanh toán"
      subtitle="Ghi nhận số tiền học viên đã nộp cho khoản phải thu."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Khoản phải thu
          </label>
          <select
            value={form.chargeId}
            onChange={(event) => {
              const charge = charges.find(
                (item: any) => Number(item.id) === Number(event.target.value),
              );
              setForm({
                ...form,
                chargeId: event.target.value,
                residentId: String(charge?.residentId || ""),
                amount: formatMoneyInput(
                  charge?.remainingAmount || charge?.amount || "",
                ),
              });
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Chọn khoản phải thu</option>
            {openCharges.map((charge: any) => (
              <option key={charge.id} value={charge.id}>
                {charge.residentName || charge.targetName} -{" "}
                {charge.feeTypeName || charge.periodItemName} - còn{" "}
                {formatMoney(charge.remainingAmount)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <MoneyInput
            label="Số tiền thu"
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
          />
          <div>
            <label className="text-sm font-medium text-slate-700">
              Ngày thu
            </label>
            <DatePickerInput
              value={form.paymentDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  paymentDate: event.target.value,
                })
              }
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
          <textarea
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
            className="mt-1 min-h-[70px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <ModalActions
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submittingText="Đang lưu..."
          submitText="Lưu thanh toán"
        />
      </div>
    </StandardModalShell>
  );
}

export function FinanceEditChargeModal({
  message,
  form,
  setForm,
  feeTypes,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  message: string;
  form: EditChargeState;
  setForm: Setter<EditChargeState>;
  feeTypes: any[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <StandardModalShell
      title="Sửa khoản phải thu"
      subtitle="Chỉ sửa khoản chưa khóa nghiệp vụ. Khoản đã thu đủ nên hạn chế chỉnh."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Loại khoản
            </label>
            <select
              value={form.feeTypeId}
              onChange={(event) =>
                setForm({
                  ...form,
                  feeTypeId: event.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Không chọn</option>
              {feeTypes.map((fee: any) => (
                <option key={fee.id} value={fee.id}>
                  {fee.feeName || fee.name}
                </option>
              ))}
            </select>
          </div>
          <MoneyInput
            label="Số tiền"
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Kỳ thu
            </label>
            <input
              type="month"
              value={form.billingMonth}
              onChange={(event) =>
                setForm({
                  ...form,
                  billingMonth: event.target.value,
                  periodStartDate: getMonthStart(event.target.value),
                  periodEndDate: getMonthEnd(event.target.value),
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <DateField
            label="Từ ngày"
            value={form.periodStartDate}
            onChange={(periodStartDate) =>
              setForm({ ...form, periodStartDate })
            }
          />
          <DateField
            label="Đến ngày"
            value={form.periodEndDate}
            onChange={(periodEndDate) => setForm({ ...form, periodEndDate })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value,
              })
            }
            className="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <ModalActions
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submittingText="Đang lưu..."
          submitText="Lưu thay đổi"
        />
      </div>
    </StandardModalShell>
  );
}

export function FinanceTransactionModal({
  message,
  form,
  setForm,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  message: string;
  form: any;
  setForm: Setter<any>;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const sourceMeta = getTransactionSourceMeta(form.source);
  const normalizedDirection = getTransactionDirectionForSource(form.source, form.direction);
  const isBusiness = form.source === "business";

  function selectSource(source: string) {
    setForm((current: any) => ({
      ...current,
      source,
      direction: getTransactionDirectionForSource(source, current.direction),
      expenseKind: source === "expense" ? current.expenseKind || "period" : "one_time",
      expenseBillingMonth: current.expenseBillingMonth || new Date().toISOString().slice(0, 7),
    }));
  }

  return (
    <StandardModalShell
      title="Ghi nhận thu / chi"
      subtitle="Tách rõ thu khác, tài trợ, khoản chi và nghiệp vụ kinh doanh để sổ thu chi dễ đối chiếu."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Loại nghiệp vụ
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <TransactionSourceCard
              active={form.source === "other_income"}
              icon={WalletCards}
              title="Thu khác"
              description="Quỹ, hoàn tiền, thu phát sinh"
              onClick={() => selectSource("other_income")}
            />
            <TransactionSourceCard
              active={form.source === "donation"}
              icon={PiggyBank}
              title="Tài trợ"
              description="Ủng hộ, tài trợ theo mục đích"
              onClick={() => selectSource("donation")}
            />
            <TransactionSourceCard
              active={form.source === "expense"}
              icon={HandCoins}
              title="Khoản chi"
              description="Điện nước, sửa chữa, mua sắm"
              onClick={() => selectSource("expense")}
            />
            <TransactionSourceCard
              active={form.source === "business"}
              icon={ReceiptText}
              title="Kinh doanh"
              description="Thu hoặc chi cửa hàng"
              onClick={() => selectSource("business")}
            />
          </div>
        </div>

        {form.source === "expense" ? (
          <div className="rounded-[24px] border border-[#ead9ad]/80 bg-white/86 p-4 shadow-[0_10px_24px_rgba(91,67,22,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cách ghi nhận khoản chi</p>
                <p className="mt-1 text-sm text-slate-600">Chọn chi theo kỳ/tháng để đối chiếu vận hành, hoặc chi một lần cho phát sinh riêng.</p>
              </div>
              {form.expenseKind === "period" ? (
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                  Theo kỳ {getBillingMonthLabel(form.expenseBillingMonth || "")}
                </span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">Chi một lần</span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px] md:items-end">
              <button
                type="button"
                onClick={() => setForm({ ...form, expenseKind: "period", expenseBillingMonth: form.expenseBillingMonth || new Date().toISOString().slice(0, 7) })}
                className={`rounded-2xl border p-3 text-left transition ${form.expenseKind === "period" ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_10px_22px_rgba(180,122,20,0.14)]" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/50"}`}
              >
                <p className="text-sm font-semibold">Khoản chi theo kỳ</p>
                <p className="mt-1 text-xs leading-4 opacity-75">Điện nước, internet, vệ sinh, bảo trì định kỳ theo tháng.</p>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, expenseKind: "one_time" })}
                className={`rounded-2xl border p-3 text-left transition ${form.expenseKind === "one_time" ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_10px_22px_rgba(180,122,20,0.14)]" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/50"}`}
              >
                <p className="text-sm font-semibold">Khoản chi một lần</p>
                <p className="mt-1 text-xs leading-4 opacity-75">Sửa chữa, mua vật dụng, hỗ trợ hoặc phát sinh không lặp lại.</p>
              </button>
              {form.expenseKind === "period" ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">Tháng/Kỳ chi</label>
                  <input
                    type="month"
                    value={form.expenseBillingMonth || new Date().toISOString().slice(0, 7)}
                    onChange={(event) => setForm({ ...form, expenseBillingMonth: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="rounded-[24px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fff6dd_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{sourceMeta.label}</p>
              <p className="text-xs text-slate-500">
                {normalizedDirection === "out" ? "Nghiệp vụ chi ra" : "Nghiệp vụ thu vào"}
              </p>
            </div>
            {isBusiness ? (
              <div className="flex rounded-2xl border border-slate-200 bg-white p-1">
                {[
                  ["in", "Thu"],
                  ["out", "Chi"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, direction: value })}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${form.direction === value ? "bg-amber-50 text-amber-800 shadow-sm" : "text-slate-500"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="rounded-full border border-amber-100 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
                {normalizedDirection === "out" ? "Chi ra" : "Thu vào"}
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MoneyInput
              label="Số tiền"
              value={form.amount}
              onChange={(amount) => setForm({ ...form, amount })}
            />
            <DateField
              label="Ngày ghi nhận"
              value={form.transactionDate}
              onChange={(transactionDate) => setForm({ ...form, transactionDate })}
            />
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700">
              {sourceMeta.targetLabel}
            </label>
            <input
              value={form.targetName}
              onChange={(event) => setForm({ ...form, targetName: event.target.value })}
              placeholder={sourceMeta.targetLabel}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700">
              {sourceMeta.descriptionLabel}
            </label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder={sourceMeta.descriptionLabel}
              className="mt-1 min-h-[86px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <ModalActions
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submittingText="Đang lưu..."
          submitText="Lưu nghiệp vụ"
        />
      </div>
    </StandardModalShell>
  );
}

function TransactionSourceCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition ${active ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_10px_24px_rgba(180,122,20,0.16)]" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/50"}`}
    >
      <div className="mb-2 inline-flex rounded-xl bg-white/75 p-2 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-4 opacity-75">{description}</p>
    </button>
  );
}

export function FinanceGroupPaymentModal({
  message,
  form,
  setForm,
  periods,
  months,
  residents,
  residentCharges,
  selectedChargeIds,
  lineAmounts,
  selectedCharges,
  allSelected,
  selectedRemainingTotal,
  inputTotal,
  afterRemainingTotal,
  hasInvalidLineAmount,
  isSubmitting,
  onPeriodChange,
  onMonthChange,
  onResidentChange,
  onToggleCharge,
  onUpdateLineAmount,
  onToggleAllCharges,
  onSyncSelectedAmounts,
  onClearLineAmounts,
  onClose,
  onSubmit,
}: {
  message: string;
  form: any;
  setForm: Setter<any>;
  periods: any[];
  months: any[];
  residents: any[];
  residentCharges: any[];
  selectedChargeIds: Record<string, boolean>;
  lineAmounts: Record<string, string>;
  selectedCharges: any[];
  allSelected: boolean;
  selectedRemainingTotal: number;
  inputTotal: number;
  afterRemainingTotal: number;
  hasInvalidLineAmount: boolean;
  isSubmitting?: boolean;
  onPeriodChange: (periodId: string) => void;
  onMonthChange: (billingMonth: string) => void;
  onResidentChange: (residentId: string) => void;
  onToggleCharge: (chargeId: number, checked: boolean) => void;
  onUpdateLineAmount: (chargeId: number, value: string) => void;
  onToggleAllCharges: (checked: boolean) => void;
  onSyncSelectedAmounts: () => void;
  onClearLineAmounts: () => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <StandardModalShell
      title="Thu theo học viên"
      subtitle="Chọn kỳ, tháng và học viên để thu nhiều khoản trong một lần."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <SelectField
            label="Kỳ thu"
            value={form.periodId}
            onChange={onPeriodChange}
            options={[
              ["", "Chọn kỳ thu"],
              ...periods.map((period: any) => [
                String(period.id),
                String(period.periodName || ""),
              ] as [string, string]),
            ]}
          />
          <SelectField
            label="Tháng"
            value={form.billingMonth}
            onChange={onMonthChange}
            options={[
              ["", "Chọn tháng"],
              ...months.map((month: any) => [
                String(month.value),
                String(month.label || ""),
              ] as [string, string]),
            ]}
          />
          <SelectField
            label="Học viên"
            value={form.residentId}
            onChange={onResidentChange}
            options={[
              ["", "Chọn học viên"],
              ...residents.map((resident: any) => [
                String(resident.id),
                `${resident.name}${resident.code ? ` (${resident.code})` : ""} - còn ${formatMoney(resident.totalRemaining)}`,
              ] as [string, string]),
            ]}
          />
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
                onClick={() => onToggleAllCharges(!allSelected)}
              >
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700"
                onClick={onSyncSelectedAmounts}
              >
                Thu đủ khoản chọn
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                onClick={onClearLineAmounts}
              >
                Xóa số thu
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {residentCharges.length ? (
              residentCharges.map((charge: any) => {
                const chargeId = String(charge.id);
                const checked = Boolean(selectedChargeIds[chargeId]);
                const remaining = toMoneyNumber(charge?.remainingAmount || 0);
                const lineAmount = lineAmounts[chargeId] || "";
                const lineAmountNumber = toMoneyNumber(lineAmount || 0);
                const invalidAmount = checked && lineAmountNumber > remaining;

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
                            onToggleCharge(Number(charge.id), event.target.checked)
                          }
                          className="h-4 w-4"
                        />
                      </div>
                      <ChargeAmountCell charge={charge} />
                      <AmountSummary label="Đã thu" value={charge.paidAmount} />
                      <AmountSummary
                        label="Còn lại"
                        value={charge.remainingAmount}
                        emphasized
                      />
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
                            onUpdateLineAmount(Number(charge.id), event.target.value)
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
          <TotalBox label="Tổng còn lại khoản chọn" value={selectedRemainingTotal} />
          <TotalBox
            label="Tổng thu lần này"
            value={inputTotal}
            className="border-amber-100 bg-amber-50"
            labelClassName="text-amber-600"
            valueClassName="text-amber-900"
          />
          <TotalBox
            label="Còn lại sau thu"
            value={afterRemainingTotal}
            className="bg-white"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DateField
            label="Ngày thu"
            value={form.paymentDate}
            onChange={(paymentDate) => setForm({ ...form, paymentDate })}
          />
          <SelectField
            label="Phương thức thu"
            value={form.method}
            onChange={(method) => setForm({ ...form, method })}
            options={[
              ["cash", "Tiền mặt"],
              ["bank_transfer", "Chuyển khoản"],
              ["other", "Khác"],
            ]}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Ghi chú</label>
          <textarea
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
            className="mt-1 min-h-[70px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={`Ví dụ: Thu tiền ${getBillingMonthLabel(form.billingMonth).toLowerCase()}, phụ huynh chuyển khoản...`}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            className={residenceMediumStyle.buttonCard}
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className={`${residenceMediumStyle.buttonCardPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              !selectedCharges.length ||
              inputTotal <= 0 ||
              hasInvalidLineAmount
            }
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thanh toán"}
          </button>
        </div>
      </div>
    </StandardModalShell>
  );
}

function MonthSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
          <option key={month} value={month}>
            {String(month).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(formatMoneyInput(event.target.value))}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-right text-sm"
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <DatePickerInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChargeAmountCell({ charge }: { charge: any }) {
  return (
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
  );
}

function AmountSummary({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string | number;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`font-semibold ${emphasized ? "text-slate-900" : "text-slate-700"}`}>
        {formatMoney(value)}
      </p>
    </div>
  );
}

function TotalBox({
  label,
  value,
  className = "bg-slate-50",
  labelClassName = "text-slate-400",
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string | number;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-100 px-4 py-3 ${className}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${labelClassName}`}>
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${valueClassName}`}>
        {formatMoney(value)}
      </p>
    </div>
  );
}

function ModalActions({
  onClose,
  onSubmit,
  isSubmitting,
  submittingText,
  submitText,
}: {
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submittingText: string;
  submitText: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        type="button"
        className={residenceMediumStyle.buttonCard}
        onClick={onClose}
      >
        Đóng
      </button>
      <button
        type="button"
        className={residenceMediumStyle.buttonCardPrimary}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? submittingText : submitText}
      </button>
    </div>
  );
}
