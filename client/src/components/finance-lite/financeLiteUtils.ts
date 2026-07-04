import {
  formatMoney as formatSharedMoney,
  formatMoneyInput as formatSharedMoneyInput,
  normalizeStoredMoneyValue,
  toMoneyNumber,
} from "@/lib/format";
import type { PeriodFormState } from "./financeLiteTypes";


export const monthNames = [
  "Tháng 01",
  "Tháng 02",
  "Tháng 03",
  "Tháng 04",
  "Tháng 05",
  "Tháng 06",
  "Tháng 07",
  "Tháng 08",
  "Tháng 09",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function getVietnamDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

export function getVietnamDateInputValue(date = new Date()) {
  const parts = getVietnamDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getVietnamCurrentYear() {
  return getVietnamDateParts().year;
}

export { normalizeStoredMoneyValue, toMoneyNumber };

export function formatMoney(value?: number | string | null) {
  return formatSharedMoney(value);
}

export function formatMoneyInput(value?: string | number | null) {
  return formatSharedMoneyInput(value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "Chưa có ngày";
  return String(value).slice(0, 10);
}

export function getMonthStart(monthValue?: string) {
  return monthValue ? `${monthValue}-01` : "";
}

export function getMonthEnd(monthValue?: string) {
  if (!monthValue) return "";
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return "";
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${yearText}-${monthText}-${String(lastDay).padStart(2, "0")}`;
}

export function getBillingMonthLabel(value?: string | null) {
  if (!value) return "Chưa chọn kỳ";
  const [yearText, monthText] = value.split("-");
  const monthIndex = Number(monthText) - 1;
  if (!yearText || monthIndex < 0 || monthIndex > 11) return value;
  return `${monthNames[monthIndex]} / ${yearText}`;
}

export function getCurrentBillingMonth() {
  const parts = getVietnamDateParts();
  return `${parts.year}-${parts.month}`;
}

export function periodContainsBillingMonth(period: any, billingMonth: string) {
  if (!period || !billingMonth) return false;
  const [yearText, monthText] = billingMonth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const periodYear = Number(period?.year || 0);
  const fromMonth = Number(period?.fromMonth || 1);
  const toMonth = Number(period?.toMonth || 12);
  return periodYear === year && month >= fromMonth && month <= toMonth;
}

export function getStatusLabel(status?: string | null) {
  if (status === "paid") return "Đã thu";
  if (status === "partial") return "Thu một phần";
  if (status === "cancelled") return "Đã hủy";
  return "Chưa thu";
}

export function getStatusClass(status?: string | null) {
  if (status === "paid")
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "partial")
    return "border-amber-100 bg-amber-50 text-amber-800";
  if (status === "cancelled")
    return "border-slate-200 bg-slate-100 text-slate-500";
  return "border-rose-100 bg-rose-50 text-rose-700";
}

export function emptyPeriodForm(): PeriodFormState {
  const year = getVietnamCurrentYear();
  return {
    periodName: `Phí lưu xá năm ${year}`,
    year,
    fromMonth: "1",
    toMonth: "12",
    lodgingAmount: "1.200.000",
    mealLivingAmount: "1.800.000",
    otherAmount: "500.000",
    description: "",
  };
}


export function getTransactionDirectionForSource(source?: string | null, direction?: string | null) {
  if (source === "advance_actual_spending") return "memo";
  if (source === "expense" || source === "expense_plan" || source === "advance_out") return "out";
  if (source === "other_income" || source === "donation") return "in";
  return direction === "out" ? "out" : "in";
}

export function isAdvanceActualSpending(source?: string | null) {
  return source === "advance_actual_spending";
}

export function isTransactionAffectingCashFlow(source?: string | null) {
  if (source === "expense_plan") return false;
  if (source === "advance_actual_spending") return false;
  return true;
}

export function getTransactionSourceMeta(source?: string | null) {
  if (source === "donation") {
    return {
      label: "Tài trợ / ủng hộ",
      shortLabel: "Tài trợ",
      targetLabel: "Người/đơn vị tài trợ",
      descriptionLabel: "Mục đích tài trợ / ghi chú",
      tone: "emerald",
    };
  }
  if (source === "expense_plan") {
    return {
      label: "Khoản đề xuất / dự chi",
      shortLabel: "Dự chi",
      targetLabel: "Đơn vị/nhà cung cấp dự kiến",
      descriptionLabel: "Nội dung dự chi / ghi chú",
      tone: "blue",
    };
  }
  if (source === "advance_out") {
    return {
      label: "Xuất tạm ứng",
      shortLabel: "Tạm ứng",
      targetLabel: "Ban/Tổ/Cá nhân nhận tạm ứng",
      descriptionLabel: "Nội dung tạm ứng / ghi chú",
      tone: "amber",
    };
  }
  if (source === "advance_actual_spending") {
    return {
      label: "Cập nhật thực chi tạm ứng",
      shortLabel: "Thực chi",
      targetLabel: "Khoản tạm ứng",
      descriptionLabel: "Nội dung thực chi",
      tone: "slate",
    };
  }
  if (source === "expense") {
    return {
      label: "Khoản chi",
      shortLabel: "Chi phí",
      targetLabel: "Người nhận / đơn vị nhận",
      descriptionLabel: "Mục đích chi / ghi chú",
      tone: "amber",
    };
  }
  if (source === "business") {
    return {
      label: "Thu / chi kinh doanh",
      shortLabel: "Kinh doanh",
      targetLabel: "Đối tượng / cửa hàng",
      descriptionLabel: "Nội dung nghiệp vụ / ghi chú",
      tone: "slate",
    };
  }
  return {
    label: "Khoản thu khác",
    shortLabel: "Thu khác",
    targetLabel: "Nguồn thu / đối tượng",
    descriptionLabel: "Mục đích thu / ghi chú",
    tone: "blue",
  };
}
