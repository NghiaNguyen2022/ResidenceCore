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
  getVietnamDateInputValue,
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


const EXPENSE_PERIOD_PRESETS = [
  { key: "electricity", label: "Điện", hint: "Chi điện theo tháng/kỳ", targetName: "Tiền điện", description: "Chi phí điện vận hành theo kỳ" },
  { key: "water", label: "Nước", hint: "Chi nước sinh hoạt", targetName: "Tiền nước", description: "Chi phí nước sinh hoạt theo kỳ" },
  { key: "internet", label: "Internet", hint: "Mạng, wifi, cáp", targetName: "Internet / mạng", description: "Chi phí internet, wifi theo kỳ" },
  { key: "utilities", label: "Tiện ích", hint: "Rác, vệ sinh, bảo vệ", targetName: "Tiện ích vận hành", description: "Chi phí tiện ích vận hành định kỳ" },
  { key: "maintenance", label: "Bảo trì", hint: "Bảo trì định kỳ", targetName: "Bảo trì định kỳ", description: "Chi phí bảo trì định kỳ" },
];

const EXPENSE_DAILY_PRESETS = [
  { key: "market", label: "Tiền đi chợ", hint: "Thực phẩm, bữa ăn, sinh hoạt", targetName: "Tiền đi chợ", description: "Chi phí đi chợ / thực phẩm trong ngày" },
  { key: "stationery", label: "Văn phòng phẩm", hint: "Giấy, bút, mực, hồ sơ", targetName: "Văn phòng phẩm", description: "Chi phí văn phòng phẩm" },
  { key: "flowers_lights", label: "Hoa đèn", hint: "Trang trí, lễ nghi, sinh hoạt", targetName: "Hoa đèn / trang trí", description: "Chi phí hoa đèn, trang trí hoặc sinh hoạt chung" },
  { key: "supplies", label: "Vật dụng", hint: "Đồ dùng, dụng cụ nhỏ", targetName: "Mua vật dụng", description: "Chi phí mua vật dụng phát sinh" },
  { key: "repair", label: "Sửa chữa", hint: "Sửa phòng, thiết bị, điện nước", targetName: "Sửa chữa phát sinh", description: "Chi phí sửa chữa phát sinh" },
  { key: "support", label: "Hỗ trợ", hint: "Hỗ trợ học viên / hoạt động", targetName: "Hỗ trợ sinh hoạt", description: "Chi phí hỗ trợ học viên hoặc hoạt động" },
];

const EXPENSE_ADVANCE_PRESETS = [
  { key: "market", label: "Tạm ứng tiền chợ", hint: "Ứng trước theo tuần/tháng, cập nhật chi thực tế mỗi ngày", targetName: "Người/tổ nhận tiền chợ", description: "Tạm ứng tiền chợ theo kỳ" },
  { key: "flowers_lights", label: "Tạm ứng hoa nến", hint: "Hoa đèn, nến, trang trí, phụng vụ", targetName: "Người/tổ nhận hoa nến", description: "Tạm ứng hoa nến / hoa đèn theo kỳ" },
  { key: "stationery", label: "Tạm ứng văn phòng phẩm", hint: "Giấy, bút, mực, hồ sơ dùng trong kỳ", targetName: "Người/tổ nhận văn phòng phẩm", description: "Tạm ứng văn phòng phẩm theo kỳ" },
  { key: "supplies", label: "Tạm ứng vật dụng", hint: "Vật dụng sinh hoạt nhỏ dùng theo kỳ", targetName: "Người/tổ nhận vật dụng", description: "Tạm ứng vật dụng sinh hoạt theo kỳ" },
];

const ADVANCE_PERIOD_OPTIONS = [
  { key: "week", label: "Theo tuần", hint: "Phù hợp tiền chợ, hoa nến ngắn kỳ" },
  { key: "month", label: "Theo tháng", hint: "Phù hợp văn phòng phẩm, vật dụng" },
  { key: "custom", label: "Tùy chọn", hint: "Tự chọn từ ngày đến ngày" },
];

const ADVANCE_RECEIVER_OPTIONS = [
  { key: "committee", label: "Ban", hint: "Thường là Ban Hậu cần" },
  { key: "team", label: "Tổ", hint: "Giao cho tổ phụ trách" },
  { key: "person", label: "Cá nhân", hint: "Giao cho một người cụ thể" },
  { key: "room", label: "Phòng / nhóm", hint: "Nhóm/phòng nhận tạm ứng" },
];

const ADVANCE_RECEIVER_PRESETS = [
  { receiverType: "committee", label: "Ban Hậu cần", hint: "Mặc định cho tiền chợ, vật dụng, hậu cần" },
  { receiverType: "committee", label: "Ban Phụng vụ", hint: "Phù hợp hoa nến / hoa đèn" },
  { receiverType: "committee", label: "Ban Văn phòng", hint: "Phù hợp văn phòng phẩm" },
  { receiverType: "team", label: "Tổ trực tuần", hint: "Giao cho tổ đang trực hoặc tổ phụ trách tuần" },
  { receiverType: "person", label: "Cá nhân phụ trách", hint: "Chọn khi cần ghi tên người nhận cụ thể" },
  { receiverType: "room", label: "Nhóm hậu cần", hint: "Dùng khi chưa gắn với ban/tổ chính thức" },
];

function getDefaultAdvanceReceiverName(receiverType?: string | null) {
  if (receiverType === "committee") return "Ban Hậu cần";
  if (receiverType === "team") return "Tổ trực tuần";
  if (receiverType === "room") return "Nhóm hậu cần";
  return "";
}

function isAutoAdvanceReceiverName(value?: string | null) {
  const name = String(value || "").trim();
  if (!name) return true;
  return ADVANCE_RECEIVER_PRESETS.some((preset) => preset.label === name);
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
  const isExpense = form.source === "expense";
  const expenseKind = ["period", "advance", "one_time"].includes(form.expenseKind) ? form.expenseKind : "one_time";
  const expenseMonths = expenseKind === "period" ? getModalExpenseMonths(form.expenseFromMonth || form.expenseBillingMonth, form.expenseToMonth || form.expenseFromMonth || form.expenseBillingMonth) : [];
  const amountPerPeriod = toMoneyNumber(form.amount);
  const estimatedTotal = isExpense && expenseKind === "period" ? amountPerPeriod * Math.max(1, expenseMonths.length) : amountPerPeriod;
  const advanceStartDate = form.advanceStartDate || getVietnamDateInputValue();
  const advanceEndDate = form.advanceEndDate || advanceStartDate;
  const advanceReceiverType = form.advanceReceiverType || "committee";
  const visibleAdvanceReceiverPresets = ADVANCE_RECEIVER_PRESETS.filter(
    (preset) => preset.receiverType === advanceReceiverType,
  );
  const dynamicTargetLabel =
    isExpense && expenseKind === "advance"
      ? advanceReceiverType === "committee"
        ? "Ban nhận tạm ứng"
        : advanceReceiverType === "team"
          ? "Tổ nhận tạm ứng"
          : advanceReceiverType === "room"
            ? "Phòng / nhóm nhận tạm ứng"
            : "Người nhận tạm ứng"
      : sourceMeta.targetLabel;
  const dynamicDescriptionLabel =
    isExpense && expenseKind === "advance"
      ? "Nội dung tạm ứng / mục đích sử dụng"
      : sourceMeta.descriptionLabel;

  function selectSource(source: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setForm((current: any) => ({
      ...current,
      source,
      direction: getTransactionDirectionForSource(source, current.direction),
      expenseKind: source === "expense" ? current.expenseKind || "period" : "one_time",
      expenseBillingMonth: current.expenseBillingMonth || current.expenseFromMonth || currentMonth,
      expenseFromMonth: current.expenseFromMonth || current.expenseBillingMonth || currentMonth,
      expenseToMonth: current.expenseToMonth || current.expenseFromMonth || current.expenseBillingMonth || currentMonth,
      expensePreset: source === "expense" ? current.expensePreset || "" : "",
      expensePresetLabel: source === "expense" ? current.expensePresetLabel || "" : "",
      advancePeriodMode: current.advancePeriodMode || "week",
      advanceStartDate: current.advanceStartDate || getVietnamDateInputValue(),
      advanceEndDate: current.advanceEndDate || getVietnamDateInputValue(),
      advanceReceiverType: current.advanceReceiverType || "committee",
    }));
  }

  function selectExpenseKind(kind: "period" | "advance" | "one_time") {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setForm((current: any) => ({
      ...current,
      expenseKind: kind,
      expenseBillingMonth: current.expenseBillingMonth || current.expenseFromMonth || currentMonth,
      expenseFromMonth: current.expenseFromMonth || current.expenseBillingMonth || currentMonth,
      expenseToMonth: current.expenseToMonth || current.expenseFromMonth || current.expenseBillingMonth || currentMonth,
      expensePreset: "",
      expensePresetLabel: "",
      targetName: kind === "advance" ? current.targetName || "Ban Hậu cần" : "",
      description: "",
      advancePeriodMode: current.advancePeriodMode || "week",
      advanceStartDate: current.advanceStartDate || getVietnamDateInputValue(),
      advanceEndDate: current.advanceEndDate || getVietnamDateInputValue(),
      advanceReceiverType: kind === "advance" ? current.advanceReceiverType || "committee" : current.advanceReceiverType || "committee",
    }));
  }

  function selectExpensePreset(preset: any) {
    setForm((current: any) => ({
      ...current,
      expensePreset: preset.key,
      expensePresetLabel: preset.label,
      targetName:
        expenseKind === "advance"
          ? current.targetName || getDefaultAdvanceReceiverName(current.advanceReceiverType || "committee") || preset.targetName
          : current.targetName || preset.targetName,
      description: current.description || preset.description,
    }));
  }

  function selectAdvanceReceiverType(receiverType: string) {
    setForm((current: any) => ({
      ...current,
      advanceReceiverType: receiverType,
      targetName: isAutoAdvanceReceiverName(current.targetName)
        ? getDefaultAdvanceReceiverName(receiverType)
        : current.targetName,
    }));
  }

  function selectAdvanceReceiverPreset(preset: any) {
    setForm((current: any) => ({
      ...current,
      advanceReceiverType: preset.receiverType,
      targetName: preset.label,
    }));
  }

  return (
    <StandardModalShell
      title="Ghi nhận thu / chi"
      subtitle="Tách rõ thu khác, tài trợ, khoản chi theo kỳ và khoản chi phát sinh để sổ thu chi dễ đối chiếu."
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
            <TransactionSourceCard active={form.source === "other_income"} icon={WalletCards} title="Thu khác" description="Quỹ, hoàn tiền, thu phát sinh" onClick={() => selectSource("other_income")} />
            <TransactionSourceCard active={form.source === "donation"} icon={PiggyBank} title="Tài trợ" description="Ủng hộ, tài trợ theo mục đích" onClick={() => selectSource("donation")} />
            <TransactionSourceCard active={form.source === "expense"} icon={HandCoins} title="Khoản chi" description="Theo kỳ hoặc phát sinh hằng ngày" onClick={() => selectSource("expense")} />
            <TransactionSourceCard active={form.source === "business"} icon={ReceiptText} title="Kinh doanh" description="Thu hoặc chi cửa hàng" onClick={() => selectSource("business")} />
          </div>
        </div>

        {isExpense ? (
          <div className="rounded-[26px] border border-[#ead9ad]/80 bg-[linear-gradient(180deg,#fffdf8_0%,#fff7df_100%)] p-4 shadow-[0_12px_30px_rgba(91,67,22,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Thiết kế khoản chi linh hoạt</p>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">
                  Tách rõ dự chi cố định, tạm ứng theo kỳ và chi phát sinh. Dự chi theo kỳ chỉ là kế hoạch, chưa vào sổ thu chi cho đến khi ghi nhận chi thực tế.
                </p>
              </div>
              <span className="rounded-full border border-[#e6c675] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#8a5305]">
                {expenseKind === "period" ? `${expenseMonths.length || 1} kỳ` : expenseKind === "advance" ? "Tạm ứng theo kỳ" : "Một lần / theo ngày"}
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => selectExpenseKind("period")}
                className={`rounded-[22px] border p-4 text-left transition ${expenseKind === "period" ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_12px_26px_rgba(180,122,20,0.16)]" : "border-slate-200 bg-white/85 text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
              >
                <p className="text-sm font-semibold">Dự chi cố định theo kỳ</p>
                <p className="mt-1 text-xs leading-5 opacity-75">Điện, nước, internet, tiện ích, bảo trì. Tạo kế hoạch nhiều tháng, chưa ghi giảm tiền mặt.</p>
              </button>
              <button
                type="button"
                onClick={() => selectExpenseKind("advance")}
                className={`rounded-[22px] border p-4 text-left transition ${expenseKind === "advance" ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_12px_26px_rgba(180,122,20,0.16)]" : "border-slate-200 bg-white/85 text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
              >
                <p className="text-sm font-semibold">Tạm ứng theo kỳ</p>
                <p className="mt-1 text-xs leading-5 opacity-75">Tiền chợ, hoa nến, văn phòng phẩm: ứng trước cho người/tổ rồi cập nhật thực chi.</p>
              </button>
              <button
                type="button"
                onClick={() => selectExpenseKind("one_time")}
                className={`rounded-[22px] border p-4 text-left transition ${expenseKind === "one_time" ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_12px_26px_rgba(180,122,20,0.16)]" : "border-slate-200 bg-white/85 text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
              >
                <p className="text-sm font-semibold">Chi một lần</p>
                <p className="mt-1 text-xs leading-5 opacity-75">Sửa chữa, mua sắm, hỗ trợ hoặc phát sinh riêng trong ngày.</p>
              </button>
            </div>

            {expenseKind === "period" ? (
              <div className="mt-4 rounded-[22px] border border-[#ead9ad]/70 bg-white/75 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Áp dụng nhiều kỳ</p>
                    <p className="text-xs text-slate-500">Nhập số tiền mỗi kỳ, hệ thống sẽ ghi nhận tổng tiền cho các kỳ đã chọn.</p>
                  </div>
                  <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                    {expenseMonths.length ? expenseMonths.map(getBillingMonthLabel).join(" · ") : "Chưa chọn kỳ"}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <MonthInput label="Từ kỳ" value={form.expenseFromMonth || form.expenseBillingMonth || new Date().toISOString().slice(0, 7)} onChange={(expenseFromMonth) => setForm({ ...form, expenseFromMonth, expenseBillingMonth: expenseFromMonth, expenseToMonth: form.expenseToMonth || expenseFromMonth })} />
                  <MonthInput label="Đến kỳ" value={form.expenseToMonth || form.expenseFromMonth || form.expenseBillingMonth || new Date().toISOString().slice(0, 7)} onChange={(expenseToMonth) => setForm({ ...form, expenseToMonth })} />
                </div>
              </div>
            ) : null}

            {expenseKind === "advance" ? (
              <div className="mt-4 rounded-[22px] border border-[#ead9ad]/70 bg-white/75 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Thông tin tạm ứng</p>
                    <p className="text-xs text-slate-500">Dùng cho khoản ứng trước theo tuần/tháng/khoảng ngày. Sau đó cập nhật chi thực tế từng ngày và quyết toán cuối kỳ.</p>
                  </div>
                  <span className="rounded-full border border-[#e6c675] bg-[#fff6dc] px-3 py-1.5 text-xs font-semibold text-[#8a5305]">
                    Tạm ứng · {form.advancePeriodMode === "month" ? "tháng" : form.advancePeriodMode === "custom" ? "tùy chọn" : "tuần"}
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  {ADVANCE_PERIOD_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setForm({ ...form, advancePeriodMode: option.key })}
                      className={`rounded-2xl border px-3 py-2.5 text-left transition ${form.advancePeriodMode === option.key ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00]" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"}`}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-0.5 text-[11px] leading-4 opacity-70">{option.hint}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <DateField label="Từ ngày" value={advanceStartDate} onChange={(advanceStartDate) => setForm({ ...form, advanceStartDate })} />
                  <DateField label="Đến ngày" value={advanceEndDate} onChange={(advanceEndDate) => setForm({ ...form, advanceEndDate })} />
                </div>

                <div className="mt-4 rounded-[22px] border border-[#ead9ad]/70 bg-[linear-gradient(180deg,#fffdf8_0%,#fff8e6_100%)] p-3.5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Giao tạm ứng cho</p>
                      <p className="mt-1 text-xs text-slate-500">Gắn khoản tạm ứng vào đúng cá nhân, tổ hoặc ban phụ trách. Mặc định thường dùng: Ban Hậu cần.</p>
                    </div>
                    <span className="rounded-full border border-[#e6c675] bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#8a5305]">
                      {advanceReceiverType === "committee" ? "Ban" : advanceReceiverType === "team" ? "Tổ" : advanceReceiverType === "room" ? "Phòng / nhóm" : "Cá nhân"}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-4">
                    {ADVANCE_RECEIVER_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => selectAdvanceReceiverType(option.key)}
                        className={`rounded-2xl border px-3 py-2.5 text-left transition ${advanceReceiverType === option.key ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_8px_18px_rgba(180,122,20,0.12)]" : "border-slate-200 bg-white text-slate-500 hover:border-amber-200"}`}
                      >
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 opacity-70">{option.hint}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {visibleAdvanceReceiverPresets.map((preset) => (
                      <button
                        key={`${preset.receiverType}-${preset.label}`}
                        type="button"
                        onClick={() => selectAdvanceReceiverPreset(preset)}
                        className={`rounded-2xl border px-3 py-2.5 text-left transition ${form.targetName === preset.label ? "border-[#d8b45d] bg-white text-[#4a2b00] shadow-[0_8px_18px_rgba(180,122,20,0.12)]" : "border-slate-200 bg-white/75 text-slate-600 hover:border-amber-200 hover:bg-white"}`}
                      >
                        <span className="block text-sm font-semibold">{preset.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{preset.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {expenseKind === "period" ? "Chi phí mặc định theo kỳ" : expenseKind === "advance" ? "Khoản tạm ứng thường dùng" : "Chi phí một lần thường gặp"}
              </p>
              <div className="grid gap-2 md:grid-cols-3">
                {(expenseKind === "period" ? EXPENSE_PERIOD_PRESETS : expenseKind === "advance" ? EXPENSE_ADVANCE_PRESETS : EXPENSE_DAILY_PRESETS).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => selectExpensePreset(preset)}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${form.expensePreset === preset.key ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00] shadow-[0_10px_22px_rgba(180,122,20,0.14)]" : "border-slate-200 bg-white/82 text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
                  >
                    <p className="text-sm font-semibold">{preset.label}</p>
                    <p className="mt-1 text-xs leading-4 opacity-70">{preset.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MiniTransactionMetric label={expenseKind === "period" ? "Số kỳ" : expenseKind === "advance" ? "Kỳ tạm ứng" : "Loại"} value={expenseKind === "period" ? `${Math.max(1, expenseMonths.length)} kỳ` : expenseKind === "advance" ? "Theo ngày thực chi" : "Một lần"} />
              <MiniTransactionMetric label={expenseKind === "period" ? "Mỗi kỳ" : expenseKind === "advance" ? "Số tiền ứng" : "Số tiền"} value={formatMoney(amountPerPeriod)} />
              <MiniTransactionMetric label={expenseKind === "period" ? "Tổng dự chi" : "Tổng ghi nhận"} value={formatMoney(estimatedTotal)} highlight />
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
                {[["in", "Thu"], ["out", "Chi"]].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, direction: value })} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${form.direction === value ? "bg-amber-50 text-amber-800 shadow-sm" : "text-slate-500"}`}>
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
            <MoneyInput label={isExpense && expenseKind === "period" ? "Số tiền dự chi mỗi kỳ" : isExpense && expenseKind === "advance" ? "Số tiền tạm ứng" : "Số tiền"} value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
            <DateField label={isExpense && expenseKind === "period" ? "Ngày lập dự chi" : "Ngày ghi nhận"} value={form.transactionDate} onChange={(transactionDate) => setForm({ ...form, transactionDate })} />
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700">{dynamicTargetLabel}</label>
            <input
              value={form.targetName}
              onChange={(event) => setForm({ ...form, targetName: event.target.value })}
              placeholder={dynamicTargetLabel}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium text-slate-700">{dynamicDescriptionLabel}</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder={dynamicDescriptionLabel}
              className="mt-1 min-h-[86px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <ModalActions onClose={onClose} onSubmit={onSubmit} isSubmitting={isSubmitting} submittingText="Đang lưu..." submitText="Lưu nghiệp vụ" />
      </div>
    </StandardModalShell>
  );
}

function getModalExpenseMonths(fromMonth?: string, toMonth?: string) {
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

function MonthInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="month"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
      />
    </div>
  );
}

function MiniTransactionMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3.5 py-2.5 ${highlight ? "border-[#d8b45d] bg-[#fff2c5] text-[#4a2b00]" : "border-slate-200 bg-white/80 text-slate-700"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-65">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
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
