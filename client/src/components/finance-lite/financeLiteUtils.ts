import type { PeriodFormState } from "./financeLiteTypes";

const moneyFormatter = new Intl.NumberFormat("vi-VN");

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

export function normalizeStoredMoneyValue(value?: string | number | null) {
  if (typeof value === "number")
    return Number.isFinite(value) ? String(Math.round(value)) : "";
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^-?\d+\.\d{1,2}$/.test(raw)) return String(Math.round(Number(raw)));
  return raw.replace(/[^0-9]/g, "");
}

export function toMoneyNumber(value?: string | number | null) {
  const normalized = normalizeStoredMoneyValue(value);
  return normalized ? Number(normalized) : 0;
}

export function formatMoney(value?: number | string | null) {
  return `${moneyFormatter.format(toMoneyNumber(value))}đ`;
}

export function formatMoneyInput(value?: string | number | null) {
  const normalized = normalizeStoredMoneyValue(value);
  return normalized ? moneyFormatter.format(Number(normalized)) : "";
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
  return new Date(year, month, 0).toISOString().slice(0, 10);
}

export function getBillingMonthLabel(value?: string | null) {
  if (!value) return "Chưa chọn kỳ";
  const [yearText, monthText] = value.split("-");
  const monthIndex = Number(monthText) - 1;
  if (!yearText || monthIndex < 0 || monthIndex > 11) return value;
  return `${monthNames[monthIndex]} / ${yearText}`;
}

export function getCurrentBillingMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
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
  const year = String(new Date().getFullYear());
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
