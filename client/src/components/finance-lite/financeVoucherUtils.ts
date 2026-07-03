import {
  formatDate,
  formatMoney,
  getTransactionDirectionForSource,
  getTransactionSourceMeta,
  isAdvanceActualSpending,
  toMoneyNumber,
} from "./financeLiteUtils";

export type FinanceVoucherTitleSettings = {
  studentFee: string;
  receipt: string;
  donation: string;
  payment: string;
  plannedExpense: string;
  advance: string;
  advanceSettlement: string;
};

export type FinanceVoucherPrefixSettings = {
  studentFee: string;
  receipt: string;
  donation: string;
  payment: string;
  plannedExpense: string;
  advance: string;
  advanceSettlement: string;
  generic: string;
};

export type FinanceVoucherSettings = {
  organizationName: string;
  organizationSubtitle: string;
  address: string;
  phone: string;
  email: string;
  headerText: string;
  footerText: string;
  cashierTitle: string;
  managerTitle: string;
  titles: FinanceVoucherTitleSettings;
  prefixes: FinanceVoucherPrefixSettings;
};

export const FINANCE_VOUCHER_SETTINGS_KEY = "residencecore.financeVoucherSettings.v1";

export const defaultFinanceVoucherSettings: FinanceVoucherSettings = {
  organizationName: "APP LƯU XÁ",
  organizationSubtitle: "Quản lý lưu xá",
  address: "",
  phone: "",
  email: "",
  headerText: "",
  footerText: "Phiếu được in từ hệ thống quản lý lưu xá.",
  cashierTitle: "Thủ quỹ",
  managerTitle: "Quản lý lưu xá",
  titles: {
    studentFee: "BIÊN NHẬN THU PHÍ HỌC VIÊN",
    receipt: "PHIẾU THU",
    donation: "BIÊN NHẬN TÀI TRỢ / ỦNG HỘ",
    payment: "PHIẾU CHI",
    plannedExpense: "PHIẾU ĐỀ NGHỊ CHI",
    advance: "PHIẾU TẠM ỨNG",
    advanceSettlement: "PHIẾU QUYẾT TOÁN TẠM ỨNG",
  },
  prefixes: {
    studentFee: "BN",
    receipt: "PT",
    donation: "PT",
    payment: "PC",
    plannedExpense: "DC",
    advance: "TU",
    advanceSettlement: "QT",
    generic: "CT",
  },
};

export function mergeFinanceVoucherSettings(value?: Partial<FinanceVoucherSettings> | null): FinanceVoucherSettings {
  return {
    ...defaultFinanceVoucherSettings,
    ...(value || {}),
    titles: {
      ...defaultFinanceVoucherSettings.titles,
      ...(value?.titles || {}),
    },
    prefixes: {
      ...defaultFinanceVoucherSettings.prefixes,
      ...(value?.prefixes || {}),
    },
  };
}

export function loadFinanceVoucherSettings(): FinanceVoucherSettings {
  if (typeof window === "undefined") return defaultFinanceVoucherSettings;
  try {
    const raw = window.localStorage.getItem(FINANCE_VOUCHER_SETTINGS_KEY);
    if (!raw) return defaultFinanceVoucherSettings;
    return mergeFinanceVoucherSettings(JSON.parse(raw));
  } catch {
    return defaultFinanceVoucherSettings;
  }
}

export function saveFinanceVoucherSettings(settings: FinanceVoucherSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FINANCE_VOUCHER_SETTINGS_KEY, JSON.stringify(mergeFinanceVoucherSettings(settings)));
}

export function getVoucherDirection(transaction: any) {
  return getTransactionDirectionForSource(transaction?.source, transaction?.direction);
}

export function isPlannedVoucher(transaction: any) {
  return transaction?.source === "expense_plan" || String(transaction?.targetType || "").startsWith("expense_plan");
}

export function isAdvanceVoucher(transaction: any) {
  return transaction?.source === "advance_out" || String(transaction?.targetType || "").startsWith("expense_advance:");
}

export function getFinanceVoucherKind(transaction: any): keyof FinanceVoucherTitleSettings | "generic" {
  const source = String(transaction?.source || "");
  if (source === "student_fee_payment") return "studentFee";
  if (source === "donation") return "donation";
  if (source === "other_income") return "receipt";
  if (isPlannedVoucher(transaction)) return "plannedExpense";
  if (isAdvanceVoucher(transaction)) return "advance";
  if (isAdvanceActualSpending(source)) return "advanceSettlement";
  if (getVoucherDirection(transaction) === "out") return "payment";
  return "receipt";
}

export function getFinanceVoucherTitle(transaction: any, settings = defaultFinanceVoucherSettings) {
  const merged = mergeFinanceVoucherSettings(settings);
  const kind = getFinanceVoucherKind(transaction);
  if (kind === "generic") return "CHỨNG TỪ";
  return merged.titles[kind] || defaultFinanceVoucherSettings.titles[kind];
}

export function getFinanceVoucherPrefix(transaction: any, settings = defaultFinanceVoucherSettings) {
  const merged = mergeFinanceVoucherSettings(settings);
  const kind = getFinanceVoucherKind(transaction);
  if (kind === "generic") return merged.prefixes.generic;
  return merged.prefixes[kind] || defaultFinanceVoucherSettings.prefixes[kind] || merged.prefixes.generic;
}

export function getFinanceVoucherNo(transaction: any, settings = defaultFinanceVoucherSettings) {
  const prefix = getFinanceVoucherPrefix(transaction, settings);
  const rawDate = String(transaction?.transactionDate || transaction?.createdAt || "");
  const year = rawDate.slice(0, 4) || new Date().getFullYear().toString();
  const id = String(transaction?.id || "000000").replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `${prefix}-${year}-${id}`;
}

export function getFinanceVoucherAmountText(transaction: any) {
  const amount = Math.abs(toMoneyNumber(transaction?.amount));
  return `${formatMoney(amount)} (${numberToVietnameseWords(amount)})`;
}

export function getFinanceVoucherCounterpartyLabel(transaction: any) {
  if (isAdvanceVoucher(transaction)) return "Người/đơn vị nhận tạm ứng";
  if (isPlannedVoucher(transaction)) return "Đơn vị/đối tượng đề nghị";
  if (getVoucherDirection(transaction) === "out") return "Người/đơn vị nhận tiền";
  return "Người/đơn vị nộp tiền";
}

export function getFinanceVoucherCounterparty(transaction: any) {
  return transaction?.targetName || transaction?.residentName || transaction?.studentName || "................................";
}

export function getFinanceVoucherContent(transaction: any) {
  const source = String(transaction?.source || "");
  const meta = getTransactionSourceMeta(source);
  const description = String(transaction?.description || "").trim();
  if (description) return description;
  if (source === "student_fee_payment") return "Thu phí học viên";
  return meta.label || "Nghiệp vụ tài chính";
}

export function getFinanceVoucherDate(transaction: any) {
  return formatDate(transaction?.transactionDate || transaction?.createdAt || new Date().toISOString().slice(0, 10));
}

export function getFinanceVoucherDetailRows(transaction: any) {
  const source = String(transaction?.source || "");
  const direction = getVoucherDirection(transaction);
  const amount = Math.abs(toMoneyNumber(transaction?.amount));
  return [
    {
      label: source === "student_fee_payment" ? "Khoản thu" : isPlannedVoucher(transaction) ? "Khoản dự chi" : isAdvanceVoucher(transaction) ? "Khoản tạm ứng" : direction === "out" ? "Khoản chi" : "Khoản thu",
      value: getFinanceVoucherContent(transaction),
      amount,
    },
  ];
}

const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readTriple(num: number, full = false) {
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  const words: string[] = [];

  if (hundred > 0 || full) {
    words.push(digits[hundred], "trăm");
    if (ten === 0 && unit > 0) words.push("lẻ");
  }

  if (ten > 1) {
    words.push(digits[ten], "mươi");
    if (unit === 1) words.push("mốt");
    else if (unit === 5) words.push("lăm");
    else if (unit > 0) words.push(digits[unit]);
  } else if (ten === 1) {
    words.push("mười");
    if (unit === 5) words.push("lăm");
    else if (unit > 0) words.push(digits[unit]);
  } else if (unit > 0) {
    words.push(digits[unit]);
  }

  return words.join(" ");
}

export function numberToVietnameseWords(value: number) {
  const amount = Math.round(Math.abs(value || 0));
  if (amount === 0) return "Không đồng";

  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let remaining = amount;

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const group = groups[i];
    if (group === 0) continue;
    const full = i < groups.length - 1 && group < 100;
    words.push(readTriple(group, full));
    if (units[i]) words.push(units[i]);
  }

  const sentence = words.join(" ").replace(/\s+/g, " ").trim();
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)} đồng`;
}
