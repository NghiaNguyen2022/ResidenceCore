export const transactionCategories = [
      { value: "sales", label: "Bán hàng" },
      { value: "donation", label: "Ủng hộ" },
      { value: "purchase_stock", label: "Mua hàng nhập kho" },
      { value: "purchase", label: "Mua hàng" },
      { value: "operation", label: "Vận hành" },
      { value: "other", label: "Khác" },
];

export const defaultProductCategories = [
      { value: "all", label: "Tất cả" },
      { value: "nong_san", label: "Nông sản" },
      { value: "thu_cong", label: "Thủ công" },
      { value: "banh_keo", label: "Bánh kẹo" },
      { value: "sach", label: "Sách" },
      { value: "drink", label: "Đồ uống" },
      { value: "food", label: "Đồ ăn" },
      { value: "stationery", label: "Văn phòng phẩm" },
      { value: "general", label: "Khác" },
];

export const defaultProductUnits = [
      { value: "gói", label: "Gói" },
      { value: "cái", label: "Cái" },
      { value: "chai", label: "Chai" },
      { value: "lít", label: "Lít" },
      { value: "cuốn", label: "Cuốn" },
];

export const productSourceTypeOptions = [
      { value: "purchase", label: "Mua về" },
      { value: "processed", label: "Tự gia công" },
      { value: "both", label: "Mua về & gia công" },
];

export const productCostingMethodOptions = [
      { value: "weighted_average", label: "Tính theo giá trung bình" },
      { value: "latest", label: "Theo lần nhập gần nhất" },
      { value: "manual", label: "Tự nhập" },
];

export const salePriceReasonOptions = [
      { value: "input_cost_increase", label: "Giá nhập tăng" },
      { value: "operation_cost_increase", label: "Chi phí vận hành tăng" },
      { value: "market_adjustment", label: "Điều chỉnh theo thực tế" },
      { value: "promotion", label: "Giảm giá / khuyến mãi" },
      { value: "manual", label: "Cập nhật thủ công" },
      { value: "other", label: "Khác" },
];

export function salePriceReasonLabel(value?: string | null) {
      return (
            salePriceReasonOptions.find((item) => item.value === value)?.label ||
            "Cập nhật thủ công"
      );
}

export const storeTabs = [
      {
            value: "products",
            label: "Dữ liệu sản phẩm",
            description: "Sản phẩm, giá bán, tồn tối thiểu",
      },
      {
            value: "purchase",
            label: "Mua hàng / nhập kho",
            description: "Phiếu nhập, nguồn nhập và số lượng hàng vào kho",
      },
      {
            value: "sales",
            label: "Bán hàng",
            description: "Thu bán hàng theo sản phẩm",
      },
      {
            value: "cashflow",
            label: "Tổng hợp thu chi",
            description: "Dòng tiền, phát sinh và chốt ngày",
      },
] as const;

export type StoreTab = (typeof storeTabs)[number]["value"];

export function getTodayYmd() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getMonthStartYmd() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function formatMoney(value: number | string | null | undefined) {
      const amount = Number(value || 0);
      return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
            amount,
      );
}

export function parseCurrencyInput(value: string | number | null | undefined) {
      if (value === null || value === undefined) return 0;

      if (typeof value === "number") {
            return Number.isFinite(value) ? value : 0;
      }

      const raw = String(value).trim();
      if (!raw) return 0;

      // Values returned from MySQL DECIMAL often look like "5000.00".
      // Do not treat that dot as a thousands separator, otherwise 5.000d becomes 500.000d.
      if (/^-?\d+\.\d{1,2}$/.test(raw)) {
            const amount = Number(raw);
            return Number.isFinite(amount) ? Math.round(amount) : 0;
      }

      // User-facing Vietnamese currency input uses dot as thousands separator: 5.000, 135.000...
      const digits = raw.replace(/[^0-9]/g, "");
      return digits ? Number(digits) : 0;
}

export function formatCurrencyInput(value: string | number | null | undefined) {
      const amount = parseCurrencyInput(value);
      return amount
            ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
                  amount,
            )
            : "";
}

export function normalizeDateKey(value: unknown) {
      if (!value) return "";
      if (typeof value === "string") {
            const direct = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
            if (direct) return direct;
      }
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(date);
      const part = (type: string) =>
            parts.find((item) => item.type === type)?.value || "";
      return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatDateText(value: unknown) {
      if (!value) return "";
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
      }).format(date);
}

export function categoryLabel(value?: string | null) {
      return (
            transactionCategories.find((item) => item.value === value)?.label || "Khác"
      );
}

export function stockMovementSourceLabel(value?: string | null) {
      switch (value) {
            case "purchase":
                  return "Mua hàng";
            case "production_in":
                  return "Sản xuất / gia công";
            case "self_supply_in":
                  return "Tự cung cấp / được cấp";
            case "other_in":
                  return "Nguồn khác";
            default:
                  return "Nhập kho";
      }
}

export function productCategoryLabel(value?: string | null) {
      if (!value) return "Khác";
      return (
            defaultProductCategories.find((item) => item.value === value)?.label ||
            value
      );
}

export function productSourceTypeLabel(value?: string | null) {
      return (
            productSourceTypeOptions.find((item) => item.value === value)?.label ||
            "Mua về"
      );
}

export function productCostingMethodLabel(value?: string | null) {
      return (
            productCostingMethodOptions.find((item) => item.value === value)?.label ||
            "Tính theo giá trung bình"
      );
}

export const storeTabRoutes: Record<StoreTab, string> = {
      products: "/store-products",
      purchase: "/store-purchase",
      sales: "/store-sales",
      cashflow: "/store-cashflow",
};

export function resolveStoreTabFromLocation(location: string): StoreTab {
      const [path, query = ""] = location.split("?");
      const normalizedPath = path.replace(/\/$/, "");

      if (
            normalizedPath === "/store-products" ||
            normalizedPath === "/store-ledger/products"
      )
            return "products";
      if (
            normalizedPath === "/store-purchase" ||
            normalizedPath === "/store-ledger/purchase"
      )
            return "purchase";
      if (
            normalizedPath === "/store-sales" ||
            normalizedPath === "/store-ledger/sales"
      )
            return "sales";
      if (
            normalizedPath === "/store-cashflow" ||
            normalizedPath === "/store-ledger/cashflow"
      )
            return "cashflow";

      const queryTab = new URLSearchParams(query).get("tab") as StoreTab | null;
      if (queryTab && storeTabs.some((item) => item.value === queryTab))
            return queryTab;

      return "products";
}

export function directionLabel(value?: string | null) {
      return value === "in" ? "Thu" : "Chi";
}

export function directionClass(value?: string | null) {
      return value === "in"
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-rose-100 bg-rose-50 text-rose-700";
}

export function closingStatusLabel(status?: string | null) {
      switch (status) {
            case "draft":
                  return "Đã chốt · Chờ xác nhận";
            case "reviewed":
                  return "Đã chốt · Chờ xác nhận";
            case "approved":
            case "closed":
                  return "Đã xác nhận";
            case "cancelled":
                  return "Đã bỏ chốt";
            default:
                  return "Chờ review";
      }
}

export function closingStatusClass(status?: string | null) {
      switch (status) {
            case "draft":
                  return "bg-amber-50 text-amber-700 ring-amber-100";
            case "reviewed":
                  return "bg-sky-50 text-sky-700 ring-sky-100";
            case "approved":
            case "closed":
                  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
            case "cancelled":
                  return "bg-slate-100 text-slate-500 ring-slate-200";
            default:
                  return "bg-amber-50 text-amber-700 ring-amber-100";
      }
}

export function canCancelClosing(status?: string | null) {
      return status === "draft" || status === "reviewed";
}

export function canApproveClosing(status?: string | null) {
      return status === "draft" || status === "reviewed";
}

export type ProductFormState = {
      productCode: string;
      productName: string;
      category: string;
      unit: string;
      sourceType: string;
      costingMethod: string;
      defaultCostPrice: string;
      defaultSalePrice: string;
      minStock: string;
      currentStock: string;
      description: string;
};

export type PriceFormState = {
      salePrice: string;
      effectiveDate: string;
      reason: string;
      note: string;
};

export type LedgerFormState = {
      ledgerCode: string;
      ledgerName: string;
      ledgerType: "store";
      openingBalance: string;
      description: string;
};

export type TransactionFormState = {
      direction: "in" | "out";
      transactionDate: string;
      amount: string;
      category: string;
      title: string;
      partnerName: string;
      paymentMethod: string;
      description: string;
};

export type SaleStockFormState = {
      productId: string;
      transactionDate: string;
      quantity: string;
      unitPrice: string;
      customerName: string;
      paymentMethod: string;
      description: string;
};

export type PurchaseStockFormState = {
      productId: string;
      stockInSource: "purchase" | "production" | "self_supply" | "other";
      transactionDate: string;
      quantity: string;
      unitCost: string;
      sourceName: string;
      description: string;
};

export const emptyProductForm: ProductFormState = {
      productCode: "",
      productName: "",
      category: "nong_san",
      unit: "cái",
      sourceType: "purchase",
      costingMethod: "weighted_average",
      defaultCostPrice: "",
      defaultSalePrice: "",
      minStock: "",
      currentStock: "",
      description: "",
};

export const emptyPriceForm: PriceFormState = {
      salePrice: "",
      effectiveDate: getTodayYmd(),
      reason: "manual",
      note: "",
};

export const emptyLedgerForm: LedgerFormState = {
      ledgerCode: "CUA_HANG",
      ledgerName: "Cửa hàng lưu xá",
      ledgerType: "store",
      openingBalance: "",
      description: "",
};

export const emptyTransactionForm: TransactionFormState = {
      direction: "in",
      transactionDate: getTodayYmd(),
      amount: "",
      category: "sales",
      title: "",
      partnerName: "",
      paymentMethod: "cash",
      description: "",
};

export const emptySaleStockForm: SaleStockFormState = {
      productId: "",
      transactionDate: getTodayYmd(),
      quantity: "",
      unitPrice: "",
      customerName: "",
      paymentMethod: "cash",
      description: "",
};

export const emptyPurchaseStockForm: PurchaseStockFormState = {
      productId: "",
      stockInSource: "purchase",
      transactionDate: getTodayYmd(),
      quantity: "",
      unitCost: "",
      sourceName: "",
      description: "",
};
