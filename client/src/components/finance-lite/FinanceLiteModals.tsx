import { DatePickerInput } from "@/components/shared/form/DatePickerInput";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { ModalShell } from "./FinanceLitePrimitives";
import type { EditChargeState, PeriodFormState } from "./financeLiteTypes";
import {
  formatMoney,
  formatMoneyInput,
  getMonthEnd,
  getMonthStart,
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
    <ModalShell
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
    </ModalShell>
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
    <ModalShell
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
    </ModalShell>
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
    <ModalShell
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
    </ModalShell>
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
  return (
    <ModalShell
      title="Thu / chi khác"
      subtitle="Ghi nhận khoản thu khác, tài trợ, ủng hộ, khoản chi hoặc kinh doanh."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {message ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            label="Loại nghiệp vụ"
            value={form.source}
            onChange={(source) => setForm({ ...form, source })}
            options={[
              ["other_income", "Khoản thu khác"],
              ["donation", "Tài trợ / ủng hộ"],
              ["expense", "Khoản chi"],
              ["business", "Thu / chi kinh doanh"],
            ]}
          />
          <SelectField
            label="Thu / chi"
            value={form.direction}
            onChange={(direction) => setForm({ ...form, direction })}
            options={[
              ["in", "Thu"],
              ["out", "Chi"],
            ]}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <MoneyInput
            label="Số tiền"
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
          />
          <DateField
            label="Ngày"
            value={form.transactionDate}
            onChange={(transactionDate) =>
              setForm({ ...form, transactionDate })
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Người/đơn vị/mục tiêu
          </label>
          <input
            value={form.targetName}
            onChange={(event) =>
              setForm({
                ...form,
                targetName: event.target.value,
              })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Mục đích / ghi chú
          </label>
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
          submitText="Lưu nghiệp vụ"
        />
      </div>
    </ModalShell>
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
