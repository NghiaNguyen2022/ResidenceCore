"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Plus,
  PackagePlus,
  PackageMinus,
  BadgeDollarSign,
  Boxes,
  Layers3,
  ShoppingCart,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Undo2,
  WalletCards,
  XCircle,
} from "lucide-react";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const transactionCategories = [
  { value: "sales", label: "Bán hàng" },
  { value: "donation", label: "Ủng hộ" },
  { value: "purchase_stock", label: "Mua hàng nhập kho" },
  { value: "purchase", label: "Mua hàng" },
  { value: "operation", label: "Vận hành" },
  { value: "other", label: "Khác" },
];

const defaultProductCategories = [
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

const defaultProductUnits = [
  { value: "gói", label: "Gói" },
  { value: "cái", label: "Cái" },
  { value: "chai", label: "Chai" },
  { value: "lít", label: "Lít" },
  { value: "cuốn", label: "Cuốn" },
];

const productSourceTypeOptions = [
  { value: "purchase", label: "Mua về" },
  { value: "processed", label: "Tự gia công" },
  { value: "both", label: "Mua về & gia công" },
];

const productCostingMethodOptions = [
  { value: "weighted_average", label: "Tính theo giá trung bình" },
  { value: "latest", label: "Theo lần nhập gần nhất" },
  { value: "manual", label: "Tự nhập" },
];

const salePriceReasonOptions = [
  { value: "input_cost_increase", label: "Giá nhập tăng" },
  { value: "operation_cost_increase", label: "Chi phí vận hành tăng" },
  { value: "market_adjustment", label: "Điều chỉnh theo thực tế" },
  { value: "promotion", label: "Giảm giá / khuyến mãi" },
  { value: "manual", label: "Cập nhật thủ công" },
  { value: "other", label: "Khác" },
];

function salePriceReasonLabel(value?: string | null) {
  return (
    salePriceReasonOptions.find((item) => item.value === value)?.label ||
    "Cập nhật thủ công"
  );
}

const storeTabs = [
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

type StoreTab = (typeof storeTabs)[number]["value"];

function getTodayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getMonthStartYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    amount,
  );
}

function parseCurrencyInput(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value).trim();
  if (!raw) return 0;

  // Values returned from MySQL DECIMAL often look like "5000.00".
  // Do not treat that dot as a thousands separator, otherwise 5.000đ becomes 500.000đ.
  if (/^-?\d+\.\d{1,2}$/.test(raw)) {
    const amount = Number(raw);
    return Number.isFinite(amount) ? Math.round(amount) : 0;
  }

  // User-facing Vietnamese currency input uses dot as thousands separator: 5.000, 135.000...
  const digits = raw.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function formatCurrencyInput(value: string | number | null | undefined) {
  const amount = parseCurrencyInput(value);
  return amount
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
        amount,
      )
    : "";
}

function normalizeDateKey(value: unknown) {
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
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDateText(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function categoryLabel(value?: string | null) {
  return (
    transactionCategories.find((item) => item.value === value)?.label || "Khác"
  );
}

function stockMovementSourceLabel(value?: string | null) {
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

function productCategoryLabel(value?: string | null) {
  if (!value) return "Khác";
  return (
    defaultProductCategories.find((item) => item.value === value)?.label ||
    value
  );
}

function productSourceTypeLabel(value?: string | null) {
  return (
    productSourceTypeOptions.find((item) => item.value === value)?.label ||
    "Mua về"
  );
}

function productCostingMethodLabel(value?: string | null) {
  return (
    productCostingMethodOptions.find((item) => item.value === value)?.label ||
    "Tính theo giá trung bình"
  );
}

const storeTabRoutes: Record<StoreTab, string> = {
  products: "/store-products",
  purchase: "/store-purchase",
  sales: "/store-sales",
  cashflow: "/store-cashflow",
};

function resolveStoreTabFromLocation(location: string): StoreTab {
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

function directionLabel(value?: string | null) {
  return value === "in" ? "Thu" : "Chi";
}

function directionClass(value?: string | null) {
  return value === "in"
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-rose-100 bg-rose-50 text-rose-700";
}

function closingStatusLabel(status?: string | null) {
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

function closingStatusClass(status?: string | null) {
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

function canCancelClosing(status?: string | null) {
  return status === "draft" || status === "reviewed";
}

function canApproveClosing(status?: string | null) {
  return status === "draft" || status === "reviewed";
}

function canReviewClosing(status?: string | null) {
  return status === "draft";
}

type ProductFormState = {
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

type PriceFormState = {
  salePrice: string;
  effectiveDate: string;
  reason: string;
  note: string;
};

type LedgerFormState = {
  ledgerCode: string;
  ledgerName: string;
  ledgerType: "store";
  openingBalance: string;
  description: string;
};

type TransactionFormState = {
  direction: "in" | "out";
  transactionDate: string;
  amount: string;
  category: string;
  title: string;
  partnerName: string;
  paymentMethod: string;
  description: string;
};


type SaleStockFormState = {
  productId: string;
  transactionDate: string;
  quantity: string;
  unitPrice: string;
  customerName: string;
  paymentMethod: string;
  description: string;
};

type PurchaseStockFormState = {
  productId: string;
  stockInSource: "purchase" | "production" | "self_supply" | "other";
  transactionDate: string;
  quantity: string;
  unitCost: string;
  sourceName: string;
  description: string;
};

const emptyProductForm: ProductFormState = {
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

const emptyPriceForm: PriceFormState = {
  salePrice: "",
  effectiveDate: getTodayYmd(),
  reason: "manual",
  note: "",
};

const emptyLedgerForm: LedgerFormState = {
  ledgerCode: "CUA_HANG",
  ledgerName: "Cửa hàng lưu xá",
  ledgerType: "store",
  openingBalance: "",
  description: "",
};

const emptyTransactionForm: TransactionFormState = {
  direction: "in",
  transactionDate: getTodayYmd(),
  amount: "",
  category: "sales",
  title: "",
  partnerName: "",
  paymentMethod: "cash",
  description: "",
};


const emptySaleStockForm: SaleStockFormState = {
  productId: "",
  transactionDate: getTodayYmd(),
  quantity: "",
  unitPrice: "",
  customerName: "",
  paymentMethod: "cash",
  description: "",
};

const emptyPurchaseStockForm: PurchaseStockFormState = {
  productId: "",
  stockInSource: "purchase",
  transactionDate: getTodayYmd(),
  quantity: "",
  unitCost: "",
  sourceName: "",
  description: "",
};

export default function StoreLedger() {
  const storeLedgerApi = (trpc as any).storeLedger;
  const [location, navigate] = useLocation();
  const [activeStoreTab, setActiveStoreTab] = useState<StoreTab>(() =>
    resolveStoreTabFromLocation(
      typeof window === "undefined"
        ? ""
        : window.location.pathname + window.location.search,
    ),
  );
  const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [priceInfoProduct, setPriceInfoProduct] = useState<any | null>(null);
  const [salePriceProduct, setSalePriceProduct] = useState<any | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(getMonthStartYmd());
  const [toDate, setToDate] = useState(getTodayYmd());
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [purchaseStockModalOpen, setPurchaseStockModalOpen] = useState(false);
  const [saleStockModalOpen, setSaleStockModalOpen] = useState(false);
  const [closingDate, setClosingDate] = useState(getTodayYmd());
  const [closingError, setClosingError] = useState("");
  const [formError, setFormError] = useState("");
  const [blockingNotice, setBlockingNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<any | null>(
    null,
  );
  const [reviewClosingId, setReviewClosingId] = useState<number | null>(null);
  const [closingPreviewOpen, setClosingPreviewOpen] = useState(false);
  const [ledgerForm, setLedgerForm] =
    useState<LedgerFormState>(emptyLedgerForm);
  const [productForm, setProductForm] =
    useState<ProductFormState>(emptyProductForm);
  const [priceForm, setPriceForm] = useState<PriceFormState>(emptyPriceForm);
  const [transactionForm, setTransactionForm] =
    useState<TransactionFormState>(emptyTransactionForm);
  const [purchaseStockForm, setPurchaseStockForm] =
    useState<PurchaseStockFormState>(emptyPurchaseStockForm);
  const [saleStockForm, setSaleStockForm] =
    useState<SaleStockFormState>(emptySaleStockForm);

  useEffect(() => {
    const nextTab = resolveStoreTabFromLocation(location);
    setActiveStoreTab(nextTab);
    if (nextTab === "sales") setDirectionFilter("in");
    if (nextTab === "purchase") setDirectionFilter("out");
    if (nextTab === "cashflow" || nextTab === "products")
      setDirectionFilter("all");
  }, [location]);

  const ledgersQuery = storeLedgerApi?.listLedgers?.useQuery?.({
    isActive: true,
  }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };
  const ledgers = ledgersQuery.data || [];

  const productsQuery = storeLedgerApi?.listProducts?.useQuery?.({
    search: productSearch,
    category: productCategoryFilter === "all" ? null : productCategoryFilter,
    isActive: true,
    lowStockOnly,
  }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };
  const stockMovementsQuery = storeLedgerApi?.listStockMovements?.useQuery?.({
    fromDate,
    toDate,
    movementTypes: ["purchase", "production_in", "self_supply_in", "other_in"],
    limit: 200,
  }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

  const saleMovementsQuery = storeLedgerApi?.listStockMovements?.useQuery?.({
    fromDate,
    toDate,
    movementTypes: ["sale"],
    limit: 200,
  }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

  const activeLedgerId = selectedLedgerId || ledgers[0]?.id || null;

  const summaryQuery = storeLedgerApi?.getSummary?.useQuery?.(
    { ledgerId: activeLedgerId || undefined, fromDate, toDate },
    { enabled: !!activeLedgerId },
  ) ?? {
    data: { totalIn: 0, totalOut: 0, balance: 0, transactionCount: 0 },
    refetch: () => undefined,
  };

  const transactionsQuery = storeLedgerApi?.listTransactions?.useQuery?.(
    {
      ledgerId: activeLedgerId || undefined,
      direction: directionFilter,
      fromDate,
      toDate,
      search: searchTerm,
      limit: 200,
    },
    { enabled: !!activeLedgerId },
  ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

  const dailyClosingsQuery = storeLedgerApi?.listDailyClosings?.useQuery?.(
    { ledgerId: activeLedgerId || undefined, fromDate, toDate, limit: 20 },
    { enabled: !!activeLedgerId },
  ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

  const closingPreviewQuery = storeLedgerApi?.previewDailyClosing?.useQuery?.(
    { ledgerId: activeLedgerId || 0, closingDate },
    { enabled: closingPreviewOpen && !!activeLedgerId },
  ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

  const closingDetailQuery = storeLedgerApi?.getDailyClosingDetail?.useQuery?.(
    { id: reviewClosingId || 0 },
    { enabled: !!reviewClosingId },
  ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

  const priceHistoryProductId = priceInfoProduct?.id || salePriceProduct?.id || 0;
  const productPriceHistoryQuery = storeLedgerApi?.listProductPriceHistory?.useQuery?.(
    { productId: Number(priceHistoryProductId || 0) },
    { enabled: !!priceHistoryProductId },
  ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

  const createLedgerMutation = storeLedgerApi?.createLedger?.useMutation?.({
    onSuccess: async () => {
      setLedgerModalOpen(false);
      setLedgerForm(emptyLedgerForm);
      setFormError("");
      await ledgersQuery.refetch?.();
    },
    onError: (error: any) =>
      setFormError(error?.message || "Không thể khởi tạo cửa hàng."),
  });

  const createProductMutation = storeLedgerApi?.createProduct?.useMutation?.({
    onSuccess: async () => {
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setFormError("");
      await productsQuery.refetch?.();
    },
    onError: (error: any) =>
      setFormError(error?.message || "Không thể lưu sản phẩm."),
  });

  const updateProductMutation = storeLedgerApi?.updateProduct?.useMutation?.({
    onSuccess: async () => {
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setFormError("");
      await productsQuery.refetch?.();
    },
    onError: (error: any) =>
      setFormError(error?.message || "Không thể cập nhật sản phẩm."),
  });

  const updateProductSalePriceMutation =
    storeLedgerApi?.updateProductSalePrice?.useMutation?.({
      onSuccess: async () => {
        setSalePriceProduct(null);
        setPriceForm(emptyPriceForm);
        setFormError("");
        await Promise.all([
          productsQuery.refetch?.(),
          productPriceHistoryQuery.refetch?.(),
        ]);
      },
      onError: (error: any) =>
        setFormError(error?.message || "Không thể cập nhật giá bán."),
    });

  const deleteProductMutation = storeLedgerApi?.deleteProduct?.useMutation?.({
    onSuccess: async () => {
      setDeleteProductTarget(null);
      await productsQuery.refetch?.();
    },
    onError: (error: any) =>
      setBlockingNotice({
        title: "Không thể xóa hàng hóa",
        message:
          error?.message ||
          "Chỉ xóa được hàng hóa chưa có dữ liệu mua bán hoặc tồn kho.",
      }),
  });

  const createTransactionMutation =
    storeLedgerApi?.createTransaction?.useMutation?.({
      onSuccess: async () => {
        setTransactionModalOpen(false);
        setTransactionForm(emptyTransactionForm);
        setFormError("");
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
      },
      onError: (error: any) => {
        const message = error?.message || "Không thể lưu khoản thu/chi.";
        setFormError(message);
        if (
          message.includes("chốt sổ") ||
          message.includes("Ngày này đã chốt")
        ) {
          setBlockingNotice({
            title: "Ngày đã chốt sổ",
            message,
          });
        }
      },
    });

  const createPurchaseStockMutation =
    storeLedgerApi?.createStockIn?.useMutation?.({
      onSuccess: async () => {
        setPurchaseStockModalOpen(false);
        setPurchaseStockForm(emptyPurchaseStockForm);
        setFormError("");
        await Promise.all([
          productsQuery.refetch?.(),
          stockMovementsQuery.refetch?.(),
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
      },
      onError: (error: any) => {
        const message = error?.message || "Không thể tạo phiếu nhập kho.";
        setFormError(message);
        if (message.includes("chốt sổ") || message.includes("Ngày này")) {
          setBlockingNotice({ title: "Ngày đã chốt sổ", message });
        }
      },
    });

  const createSaleStockMutation =
    storeLedgerApi?.createSaleStock?.useMutation?.({
      onSuccess: async () => {
        setSaleStockModalOpen(false);
        setSaleStockForm(emptySaleStockForm);
        setFormError("");
        await Promise.all([
          productsQuery.refetch?.(),
          saleMovementsQuery.refetch?.(),
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
      },
      onError: (error: any) => {
        const message = error?.message || "Không thể tạo phiếu bán hàng.";
        setFormError(message);
        if (message.includes("chốt sổ") || message.includes("Ngày này")) {
          setBlockingNotice({ title: "Ngày đã chốt sổ", message });
        }
      },
    });

  const cancelTransactionMutation =
    storeLedgerApi?.cancelTransaction?.useMutation?.({
      onSuccess: async () => {
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
      },
      onError: (error: any) => {
        setBlockingNotice({
          title: "Không thể hủy phát sinh",
          message:
            error?.message ||
            "Phát sinh này không thể hủy ở trạng thái hiện tại.",
        });
      },
    });

  const deleteTransactionMutation =
    storeLedgerApi?.deleteTransaction?.useMutation?.({
      onSuccess: async () => {
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
      },
      onError: (error: any) => {
        setBlockingNotice({
          title: "Không thể xóa phát sinh",
          message:
            error?.message ||
            "Phát sinh này không thể xóa ở trạng thái hiện tại.",
        });
      },
    });

  const closeDailyMutation = storeLedgerApi?.closeDaily?.useMutation?.({
    onSuccess: async () => {
      setClosingError("");
      setClosingPreviewOpen(false);
      // Người lập chỉ hoàn tất thao tác chốt ngày. Không tự mở màn hình xác nhận,
      // vì bước review/xác nhận sẽ do người khác thực hiện từ Lịch sử chốt ngày.
      await Promise.all([
        summaryQuery.refetch?.(),
        transactionsQuery.refetch?.(),
        dailyClosingsQuery.refetch?.(),
      ]);
    },
    onError: (error: any) => {
      const message = error?.message || "Không thể chốt sổ ngày.";
      setClosingError(message);
      setBlockingNotice({ title: "Không thể chốt ngày", message });
    },
  });

  const reviewDailyClosingMutation =
    storeLedgerApi?.reviewDailyClosing?.useMutation?.({
      onSuccess: async () => {
        await Promise.all([
          dailyClosingsQuery.refetch?.(),
          closingDetailQuery.refetch?.(),
        ]);
      },
      onError: (error: any) =>
        setBlockingNotice({
          title: "Không thể review",
          message: error?.message || "Không thể review ngày chốt.",
        }),
    });

  const approveDailyClosingMutation =
    (storeLedgerApi?.confirmDailyClosing || storeLedgerApi?.approveDailyClosing)?.useMutation?.({
      onSuccess: async () => {
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
          closingDetailQuery.refetch?.(),
        ]);
      },
      onError: (error: any) =>
        setBlockingNotice({
          title: "Không thể xác nhận và đẩy sổ chung",
          message: error?.message || "Không thể xác nhận ngày chốt hoặc đẩy dữ liệu sang sổ tài chính chung.",
        }),
    });

  const cancelDailyClosingMutation =
    storeLedgerApi?.cancelDailyClosing?.useMutation?.({
      onSuccess: async () => {
        // Mở lại toàn bộ dữ liệu liên quan trước, sau đó mới đóng popup review,
        // để danh sách phát sinh, báo cáo, lịch sử nhập/bán và trạng thái chốt
        // đều phản ánh ngay dữ liệu vừa được trả về trạng thái chưa chốt.
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
          closingDetailQuery.refetch?.(),
          closingPreviewQuery.refetch?.(),
          stockMovementsQuery.refetch?.(),
          saleMovementsQuery.refetch?.(),
          productsQuery.refetch?.(),
        ]);
        setReviewClosingId(null);
        setClosingError("");
      },
      onError: (error: any) =>
        setBlockingNotice({
          title: "Không thể bỏ chốt",
          message: error?.message || "Không thể bỏ chốt ngày này.",
        }),
    });

  const summary = summaryQuery.data || {
    totalIn: 0,
    totalOut: 0,
    balance: 0,
    transactionCount: 0,
  };
  const transactions = transactionsQuery.data || [];
  const products = productsQuery.data || [];
  const productSummary = useMemo(() => {
    const categorySet = new Set<string>();
    let lowStockCount = 0;
    let totalStock = 0;
    let inventoryValue = 0;
    let expectedSaleValue = 0;

    products.forEach((product: any) => {
      const category = String(product.category || "general");
      categorySet.add(category);
      const stock = Number(product.currentStock || 0);
      const minStock = Number(product.minStock || 0);
      const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
      const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
      if (minStock > 0 && stock <= minStock) lowStockCount += 1;
      totalStock += stock;
      inventoryValue += stock * cost;
      expectedSaleValue += stock * sale;
    });

    return {
      totalProducts: products.length,
      totalCategories: categorySet.size,
      lowStockCount,
      totalStock,
      inventoryValue,
      expectedSaleValue,
      expectedProfit: expectedSaleValue - inventoryValue,
    };
  }, [products]);
  const productCategoryOptions = useMemo(() => {
    const optionMap = new Map<string, string>();
    defaultProductCategories.forEach((item) =>
      optionMap.set(item.value, item.label),
    );
    products.forEach((product: any) => {
      const category = String(product.category || "").trim();
      if (!category) return;
      if (!optionMap.has(category))
        optionMap.set(category, productCategoryLabel(category));
    });
    return Array.from(optionMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [products]);
  const stockMovements = stockMovementsQuery.data || [];
  const stockInSummary = useMemo(() => {
    const productIds = new Set<number>();
    let totalQuantity = 0;
    let purchaseCount = 0;

    stockMovements.forEach((item: any) => {
      const productId = Number(item.productId || 0);
      if (productId) productIds.add(productId);
      totalQuantity += Number(item.quantityIn || 0);
      if (String(item.movementType) === "purchase") purchaseCount += 1;
    });

    return {
      receiptCount: stockMovements.length,
      totalQuantity,
      productCount: productIds.size,
      purchaseCount,
    };
  }, [stockMovements]);
  const saleMovements = saleMovementsQuery.data || [];
  const saleSummary = useMemo(() => {
    const productIds = new Set<number>();
    let totalQuantity = 0;
    let estimatedRevenue = 0;

    saleMovements.forEach((item: any) => {
      const productId = Number(item.productId || 0);
      if (productId) productIds.add(productId);
      totalQuantity += Number(item.quantityOut || 0);
      const transaction = transactions.find(
        (tx: any) => Number(tx.id) === Number(item.transactionId),
      );
      estimatedRevenue += Number(transaction?.amount || 0);
    });

    return {
      receiptCount: saleMovements.length,
      totalQuantity,
      productCount: productIds.size,
      revenue: estimatedRevenue,
    };
  }, [saleMovements, transactions]);

  const cashflowReport = useMemo(() => {
    const posted = transactions.filter((item: any) => item.status !== "cancelled");
    const totalIn = posted
      .filter((item: any) => item.direction === "in")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const totalOut = posted
      .filter((item: any) => item.direction === "out")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const salesRevenue = posted
      .filter((item: any) => item.direction === "in" && item.category === "sales")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const purchaseExpense = posted
      .filter((item: any) => item.direction === "out" && item.category === "purchase_stock")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const operationExpense = posted
      .filter((item: any) => item.direction === "out" && item.category === "operation")
      .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    const otherIn = totalIn - salesRevenue;
    const otherOut = totalOut - purchaseExpense - operationExpense;
    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      salesRevenue,
      purchaseExpense,
      operationExpense,
      otherIn,
      otherOut,
      transactionCount: posted.length,
    };
  }, [transactions]);

  const dailyClosings = dailyClosingsQuery.data || [];
  const visibleDailyClosings = useMemo(
    () => dailyClosings.filter((closing: any) => String(closing.status) !== "cancelled"),
    [dailyClosings],
  );
  const activeLedger = ledgers.find(
    (item: any) => Number(item.id) === Number(activeLedgerId),
  );
  const activeTabMeta =
    storeTabs.find((item) => item.value === activeStoreTab) || storeTabs[0];

  const pageHeaderMeta = useMemo(() => {
    if (activeStoreTab === "products") {
      return {
        eyebrow: "Dữ liệu cửa hàng",
        title: "Hàng hóa & nhóm hàng",
        description:
          "Quản lý danh mục hàng hóa và nhóm hàng. Hàng hóa có thể mua về để bán hoặc tự gia công rồi đưa vào cửa hàng.",
      };
    }
    if (activeStoreTab === "purchase") {
      return {
        eyebrow: "Nhập hàng / nhập kho",
        title: "Nhập kho cửa hàng",
        description:
          "Nhập kho từ mua hàng, sản xuất/gia công nội bộ hoặc nguồn tự cung cấp. Chỉ mua hàng mới tự động ghi khoản chi.",
      };
    }
    if (activeStoreTab === "sales") {
      return {
        eyebrow: "Bán hàng",
        title: "Bán hàng cửa hàng",
        description:
          "Tạo phiếu bán theo sản phẩm, giảm tồn kho và tự động ghi nhận khoản thu bán hàng.",
      };
    }
    return {
      eyebrow: "Tổng hợp thu chi",
      title: "Dòng tiền cửa hàng",
      description:
        "Theo dõi phát sinh, số dư và chốt sổ cửa hàng theo ngày trước khi đưa vào sổ chung.",
    };
  }, [activeStoreTab]);
  const tabTransactions = useMemo(() => {
    if (activeStoreTab === "sales") {
      return transactions.filter(
        (item: any) => item.direction === "in" && item.category === "sales",
      );
    }
    if (activeStoreTab === "purchase") {
      return transactions.filter(
        (item: any) =>
          item.direction === "out" &&
          ["purchase", "purchase_stock", "operation"].includes(item.category),
      );
    }
    return transactions;
  }, [transactions, activeStoreTab]);
  const transactionDayGroups = useMemo(() => {
    const closingByDate = new Map<string, any>();
    visibleDailyClosings.forEach((closing: any) => {
      closingByDate.set(normalizeDateKey(closing.closingDate), closing);
    });

    const groups = new Map<string, any>();
    tabTransactions.forEach((transaction: any) => {
      const dateKey = normalizeDateKey(transaction.transactionDate);
      if (!dateKey) return;
      const current = groups.get(dateKey) || {
        dateKey,
        transactions: [],
        totalIn: 0,
        totalOut: 0,
        closing: closingByDate.get(dateKey) || null,
      };
      current.transactions.push(transaction);
      if (transaction.status !== "cancelled") {
        if (transaction.direction === "in") current.totalIn += Number(transaction.amount || 0);
        if (transaction.direction === "out") current.totalOut += Number(transaction.amount || 0);
      }
      groups.set(dateKey, current);
    });

    return Array.from(groups.values()).sort((left: any, right: any) =>
      String(right.dateKey).localeCompare(String(left.dateKey)),
    );
  }, [tabTransactions, visibleDailyClosings]);
  const closingDetail = closingDetailQuery.data as any;
  const reviewClosing = closingDetail?.closing;
  const reviewTransactions = closingDetail?.transactions || [];

  function isClosedDate(dateValue: string) {
    return dailyClosings.some((closing: any) => {
      const closingDate =
        typeof closing.closingDate === "string"
          ? closing.closingDate.slice(0, 10)
          : new Date(closing.closingDate).toISOString().slice(0, 10);
      return closingDate === dateValue && closing.status !== "cancelled";
    });
  }

  function showClosedTransactionNotice(action: "thêm" | "hủy" | "xóa") {
    setBlockingNotice({
      title: "Ngày đã chốt sổ",
      message: `Không thể ${action} phát sinh thuộc ngày đang chốt hoặc đã xác nhận chốt. Nếu ngày mới ở trạng thái chờ review/đã review, hãy bấm Bỏ chốt để bổ sung rồi chốt lại.`,
    });
  }

  function openCreateProductModal() {
    setFormError("");
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductModalOpen(true);
  }

  function openEditProductModal(product: any) {
    setFormError("");
    setEditingProduct(product);
    setProductForm({
      productCode: product.productCode || "",
      productName: product.productName || "",
      category: product.category || "general",
      unit: product.unit || "cái",
      sourceType: product.sourceType || "purchase",
      costingMethod: product.costingMethod || "weighted_average",
      defaultCostPrice: formatCurrencyInput(product.defaultCostPrice || 0),
      defaultSalePrice: formatCurrencyInput(product.currentSalePrice || product.defaultSalePrice || 0),
      minStock: formatCurrencyInput(product.minStock || 0),
      currentStock: formatCurrencyInput(product.currentStock || 0),
      description: product.description || "",
    });
    setProductModalOpen(true);
  }

  function openPriceInfo(product: any) {
    setFormError("");
    setPriceInfoProduct(product);
  }

  function openSalePriceModal(product: any) {
    setFormError("");
    setPriceInfoProduct(null);
    setSalePriceProduct(product);
    setPriceForm({
      salePrice: formatCurrencyInput(product.currentSalePrice || product.defaultSalePrice || 0),
      effectiveDate: getTodayYmd(),
      reason: "manual",
      note: "",
    });
  }

  function handleUpdateSalePrice() {
    if (!salePriceProduct?.id) return;
    const salePrice = parseCurrencyInput(priceForm.salePrice);
    if (!salePrice) {
      setFormError("Vui lòng nhập giá bán lớn hơn 0.");
      return;
    }
    updateProductSalePriceMutation?.mutate?.({
      productId: Number(salePriceProduct.id),
      salePrice,
      effectiveDate: priceForm.effectiveDate,
      reason: priceForm.reason,
      note: priceForm.note || null,
    });
  }

  function handleSaveProduct() {
    setFormError("");
    const payload = {
      productCode: productForm.productCode,
      productName: productForm.productName,
      category: productForm.category.trim() || "general",
      unit: productForm.unit.trim() || "cái",
      sourceType: productForm.sourceType || "purchase",
      costingMethod: productForm.costingMethod || "weighted_average",
      defaultCostPrice: parseCurrencyInput(productForm.defaultCostPrice),
      defaultSalePrice: editingProduct?.id
        ? parseCurrencyInput(productForm.defaultSalePrice)
        : 0,
      minStock: parseCurrencyInput(productForm.minStock),
      currentStock: parseCurrencyInput(productForm.currentStock),
      description: productForm.description || null,
    };
    if (editingProduct?.id) {
      updateProductMutation?.mutate?.({
        id: Number(editingProduct.id),
        ...payload,
      });
    } else {
      createProductMutation?.mutate?.(payload);
    }
  }

  function handleDeleteProduct(product: any) {
    const stock = Number(product.currentStock || 0);
    if (stock > 0) {
      setBlockingNotice({
        title: "Không thể xóa hàng hóa",
        message:
          "Hàng hóa đang còn tồn kho. Hãy kiểm kê/điều chỉnh tồn về 0 trước khi xóa khỏi danh mục.",
      });
      return;
    }
    setDeleteProductTarget(product);
  }

  function confirmDeleteProduct() {
    if (!deleteProductTarget?.id) return;
    deleteProductMutation?.mutate?.({ id: Number(deleteProductTarget.id) });
  }

  function handleCreateLedger() {
    setFormError("");
    const openingBalance = parseCurrencyInput(ledgerForm.openingBalance);
    createLedgerMutation?.mutate?.({
      ledgerCode: ledgerForm.ledgerCode,
      ledgerName: ledgerForm.ledgerName,
      ledgerType: ledgerForm.ledgerType,
      openingBalance,
      description: ledgerForm.description || null,
    });
  }

  function openTransactionModal(direction: "in" | "out") {
    setFormError("");
    setTransactionForm({
      ...emptyTransactionForm,
      direction,
      category: direction === "in" ? "sales" : "purchase",
    });
    setTransactionModalOpen(true);
  }

  function openPurchaseStockModal() {
    setFormError("");
    const firstProduct = products.find((item: any) => item?.isActive !== false);
    setPurchaseStockForm({
      ...emptyPurchaseStockForm,
      productId: firstProduct?.id ? String(firstProduct.id) : "",
      transactionDate: getTodayYmd(),
      unitCost: (firstProduct?.averageCostPrice || firstProduct?.defaultCostPrice)
        ? formatCurrencyInput(firstProduct.averageCostPrice || firstProduct.defaultCostPrice)
        : "",
    });
    setPurchaseStockModalOpen(true);
  }

  function handleCreatePurchaseStock() {
    if (!activeLedgerId) {
      setFormError("Vui lòng khởi tạo cửa hàng trước.");
      return;
    }
    if (!purchaseStockForm.productId) {
      setFormError("Vui lòng chọn hàng hóa cần nhập.");
      return;
    }
    if (isClosedDate(purchaseStockForm.transactionDate)) {
      showClosedTransactionNotice("thêm");
      return;
    }
    const quantity = parseCurrencyInput(purchaseStockForm.quantity);
    const unitCost = parseCurrencyInput(purchaseStockForm.unitCost);
    if (!quantity || !unitCost) {
      setFormError("Vui lòng nhập số lượng và giá vốn đơn vị lớn hơn 0.");
      return;
    }
    createPurchaseStockMutation?.mutate?.({
      ledgerId: activeLedgerId,
      productId: Number(purchaseStockForm.productId),
      transactionDate: purchaseStockForm.transactionDate,
      quantity,
      unitCost,
      stockInSource: purchaseStockForm.stockInSource,
      sourceName: purchaseStockForm.sourceName || null,
      description: purchaseStockForm.description || null,
    });
  }

  function openSaleStockModal() {
    setFormError("");
    const firstProduct = products.find(
      (item: any) => item?.isActive !== false && Number(item.currentStock || 0) > 0,
    );
    setSaleStockForm({
      ...emptySaleStockForm,
      productId: firstProduct?.id ? String(firstProduct.id) : "",
      transactionDate: getTodayYmd(),
      unitPrice: firstProduct
        ? formatCurrencyInput(firstProduct.currentSalePrice || firstProduct.defaultSalePrice || 0)
        : "",
    });
    setSaleStockModalOpen(true);
  }

  function handleCreateSaleStock() {
    if (!activeLedgerId) {
      setFormError("Vui lòng khởi tạo cửa hàng trước.");
      return;
    }
    if (!saleStockForm.productId) {
      setFormError("Vui lòng chọn hàng hóa cần bán.");
      return;
    }
    if (isClosedDate(saleStockForm.transactionDate)) {
      showClosedTransactionNotice("thêm");
      return;
    }

    const selectedProduct = products.find(
      (item: any) => Number(item.id) === Number(saleStockForm.productId),
    );
    const quantity = parseCurrencyInput(saleStockForm.quantity);
    const unitPrice = parseCurrencyInput(saleStockForm.unitPrice);
    const currentStock = Number(selectedProduct?.currentStock || 0);

    if (!quantity || !unitPrice) {
      setFormError("Vui lòng nhập số lượng và giá bán lớn hơn 0.");
      return;
    }
    if (quantity > currentStock) {
      setFormError(`Không đủ tồn kho. Hiện còn ${formatMoney(currentStock)} ${selectedProduct?.unit || ""}.`);
      return;
    }

    createSaleStockMutation?.mutate?.({
      ledgerId: activeLedgerId,
      productId: Number(saleStockForm.productId),
      transactionDate: saleStockForm.transactionDate,
      quantity,
      unitPrice,
      customerName: saleStockForm.customerName || null,
      paymentMethod: saleStockForm.paymentMethod,
      description: saleStockForm.description || null,
    });
  }

  function handleCreateTransaction() {
    if (!activeLedgerId) {
      setFormError("Vui lòng khởi tạo cửa hàng trước.");
      return;
    }
    if (isClosedDate(transactionForm.transactionDate)) {
      showClosedTransactionNotice("thêm");
      return;
    }
    const amount = parseCurrencyInput(transactionForm.amount);
    createTransactionMutation?.mutate?.({
      ledgerId: activeLedgerId,
      direction: transactionForm.direction,
      transactionDate: transactionForm.transactionDate,
      amount,
      category: transactionForm.category,
      title: transactionForm.title,
      partnerName: transactionForm.partnerName || null,
      paymentMethod: transactionForm.paymentMethod,
      description: transactionForm.description || null,
    });
  }

  function handleCloseDaily() {
    if (!activeLedgerId) {
      setClosingError("Vui lòng khởi tạo cửa hàng trước.");
      return;
    }
    setClosingError("");
    setClosingPreviewOpen(true);
  }

  function confirmCloseDaily() {
    if (!activeLedgerId) return;
    closeDailyMutation?.mutate?.({ ledgerId: activeLedgerId, closingDate });
  }

  function switchStoreTab(tab: StoreTab) {
    setActiveStoreTab(tab);
    if (tab === "sales") setDirectionFilter("in");
    if (tab === "purchase") setDirectionFilter("out");
    if (tab === "cashflow" || tab === "products") setDirectionFilter("all");
    navigate(storeTabRoutes[tab]);
  }

  return (
    <ResidenceCareLayout>
      <div className={residenceMediumStyle.page}>
        <div className={residenceMediumStyle.pageAura} />
        <div
          className={`${residenceMediumStyle.standardPageContent} space-y-5`}
        >
          <section className="relative overflow-hidden px-5 pb-7 pt-8 text-slate-900 sm:px-6">
            <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.96),transparent_28%),radial-gradient(circle_at_72%_0%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_18%_2%,rgba(217,119,6,0.10),transparent_24%)]" />
            <div className="relative min-h-[118px]">
              <div className="mx-auto flex max-w-4xl flex-col items-center pt-4 text-center lg:pt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[40px]">
                  {pageHeaderMeta.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {pageHeaderMeta.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:justify-end">
                {!activeLedgerId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setLedgerModalOpen(true);
                    }}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Khởi tạo cửa hàng
                  </button>
                ) : activeStoreTab === "products" ? (
                  <button
                    type="button"
                    onClick={openCreateProductModal}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm hàng hóa
                  </button>
                ) : activeStoreTab === "sales" ? (
                  <button
                    type="button"
                    onClick={openSaleStockModal}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Tạo phiếu bán
                  </button>
                ) : activeStoreTab === "purchase" ? (
                  <button
                    type="button"
                    onClick={openPurchaseStockModal}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Tạo phiếu nhập
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseDaily}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Chốt ngày
                  </button>
                )}
              </div>
            </div>
          </section>

          {activeStoreTab === "purchase" ? (
            <section className="grid gap-3 md:grid-cols-4">
              <SummaryCard
                icon={<PackagePlus className="h-5 w-5" />}
                label="Phiếu nhập"
                value={String(stockInSummary.receiptCount)}
                tone="amber"
              />
              <SummaryCard
                icon={<Boxes className="h-5 w-5" />}
                label="Số lượng nhập"
                value={formatMoney(stockInSummary.totalQuantity)}
                tone="emerald"
              />
              <SummaryCard
                icon={<Layers3 className="h-5 w-5" />}
                label="Mặt hàng đã nhập"
                value={String(stockInSummary.productCount)}
                tone="slate"
              />
              <SummaryCard
                icon={<ShoppingCart className="h-5 w-5" />}
                label="Phiếu mua hàng"
                value={String(stockInSummary.purchaseCount)}
                tone="rose"
              />
            </section>
          ) : activeStoreTab === "sales" ? (
            <section className="grid gap-3 md:grid-cols-4">
              <SummaryCard
                icon={<PackageMinus className="h-5 w-5" />}
                label="Phiếu bán"
                value={String(saleSummary.receiptCount)}
                tone="amber"
              />
              <SummaryCard
                icon={<Boxes className="h-5 w-5" />}
                label="Số lượng bán"
                value={formatMoney(saleSummary.totalQuantity)}
                tone="emerald"
              />
              <SummaryCard
                icon={<Layers3 className="h-5 w-5" />}
                label="Mặt hàng đã bán"
                value={String(saleSummary.productCount)}
                tone="slate"
              />
              <SummaryCard
                icon={<BadgeDollarSign className="h-5 w-5" />}
                label="Doanh thu bán"
                value={`${formatMoney(saleSummary.revenue)} đ`}
                tone="rose"
              />
            </section>
          ) : activeStoreTab !== "products" ? (
            <section className="grid gap-3 md:grid-cols-4">
              <SummaryCard
                icon={<CircleDollarSign className="h-5 w-5" />}
                label="Tổng thu"
                value={`${formatMoney(summary.totalIn)} đ`}
                tone="emerald"
              />
              <SummaryCard
                icon={<WalletCards className="h-5 w-5" />}
                label="Tổng chi"
                value={`${formatMoney(summary.totalOut)} đ`}
                tone="rose"
              />
              <SummaryCard
                icon={<Store className="h-5 w-5" />}
                label="Số dư"
                value={`${formatMoney(summary.balance)} đ`}
                tone="amber"
              />
              <SummaryCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Phát sinh"
                value={String(summary.transactionCount || 0)}
                tone="slate"
              />
            </section>
          ) : null}

          {!activeLedgerId ? (
            <section className="rounded-[1.75rem] border border-dashed border-amber-200 bg-amber-50/70 p-5 text-center shadow-sm">
              <p className="text-sm font-black text-slate-900">
                Chưa khởi tạo cửa hàng
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Khởi tạo một lần để quản lý sản phẩm, mua hàng, bán hàng và chốt
                ngày.
              </p>
              <button
                type="button"
                onClick={() => setLedgerModalOpen(true)}
                className="mt-4 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/10"
              >
                Khởi tạo cửa hàng
              </button>
            </section>
          ) : null}

          {activeStoreTab === "products" ? (
            <section className={residenceMediumStyle.section}>
              <div
                className={`${residenceMediumStyle.sectionHeader} flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                    Danh mục
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Danh sách hàng hóa
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                    Tạo hàng hóa, chọn nhóm hàng, đơn vị tính và cập nhật giá
                    bán khi cần.
                  </p>
                </div>
              </div>
              <div className={`${residenceMediumStyle.sectionBody} space-y-4`}>
                <div className="rounded-[1.4rem] border border-amber-100 bg-white/90 p-3 shadow-sm">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative min-w-0">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={productSearch}
                        onChange={(event) =>
                          setProductSearch(event.target.value)
                        }
                        className={`${inputClass} pl-9`}
                        placeholder="Tìm tên hàng hóa hoặc nhóm hàng..."
                      />
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-4 py-2 text-sm font-black text-amber-800 shadow-sm">
                      <input
                        type="checkbox"
                        checked={lowStockOnly}
                        onChange={(event) =>
                          setLowStockOnly(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-amber-300"
                      />
                      Sắp hết
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Nhóm hàng
                    </span>
                    {productCategoryOptions.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setProductCategoryFilter(item.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${productCategoryFilter === item.value ? "bg-slate-950 text-white shadow-md" : "border border-amber-100 bg-white text-slate-700 hover:bg-amber-50"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                {productsQuery.isLoading ? (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                    Đang tải hàng hóa...
                  </div>
                ) : products.length ? (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {products.slice(0, 12).map((product: any) => {
                      const stock = Number(product.currentStock || 0);
                      const minStock = Number(product.minStock || 0);
                      const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
                      const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
                      const lowStock = minStock > 0 && stock <= minStock;
                      const canDelete = stock <= 0;
                      return (
                        <article
                          key={product.id}
                          className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                                  {productCategoryLabel(product.category)}
                                </span>
                                {lowStock ? (
                                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                                    Sắp hết
                                  </span>
                                ) : null}
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                  {product.unit || "cái"}
                                </span>
                              </div>
                              <h3 className="mt-2 truncate text-xl font-black text-slate-950">
                                {product.productName}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                Tồn {formatMoney(stock)} {product.unit || ""}
                                {minStock > 0
                                  ? ` · Tối thiểu ${formatMoney(minStock)}`
                                  : ""}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
                                <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600 ring-1 ring-slate-100">
                                  Giá vốn: {cost > 0 ? `${formatMoney(cost)}đ` : "chưa có"}
                                </span>
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
                                  Giá bán: {sale > 0 ? `${formatMoney(sale)}đ` : "chưa nhập"}
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(product)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => openPriceInfo(product)}
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-100"
                              >
                                Thông tin giá
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product)}
                                disabled={
                                  !canDelete || deleteProductMutation?.isPending
                                }
                                className={`rounded-full border px-3 py-1.5 text-xs font-black shadow-sm ${canDelete ? "border-rose-100 bg-white text-rose-600 hover:bg-rose-50" : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"}`}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">
                    Chưa có hàng hóa nào. Thêm một vài mặt hàng demo như nông
                    sản, bánh kẹo, sách, đồ thủ công hoặc sản phẩm tự gia công.
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {activeStoreTab === "products" ? (
            <section className={residenceMediumStyle.section}>
              <div className={residenceMediumStyle.sectionHeader}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                    Báo cáo tồn kho
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Giá trị hàng đang có
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                    Tổng hợp theo danh sách và bộ lọc hiện tại. Giá vốn dùng giá vốn trung bình; giá bán dự kiến dùng giá bán hiện hành.
                  </p>
                </div>
              </div>
              <div className={`${residenceMediumStyle.sectionBody} space-y-4`}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    icon={<Boxes className="h-5 w-5" />}
                    label="Tổng lượng tồn"
                    value={formatMoney(productSummary.totalStock)}
                    tone="slate"
                  />
                  <SummaryCard
                    icon={<WalletCards className="h-5 w-5" />}
                    label="Giá trị vốn"
                    value={`${formatMoney(productSummary.inventoryValue)} đ`}
                    tone="rose"
                  />
                  <SummaryCard
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    label="Doanh thu dự kiến"
                    value={`${formatMoney(productSummary.expectedSaleValue)} đ`}
                    tone="emerald"
                  />
                  <SummaryCard
                    icon={<Store className="h-5 w-5" />}
                    label="Lãi gộp dự kiến"
                    value={`${formatMoney(productSummary.expectedProfit)} đ`}
                    tone="amber"
                  />
                </div>

                {products.length ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-[#eadfca] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-amber-50/80 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Hàng hóa</th>
                            <th className="px-4 py-3 text-right">Tồn</th>
                            <th className="px-4 py-3 text-right">Giá vốn</th>
                            <th className="px-4 py-3 text-right">Giá bán</th>
                            <th className="px-4 py-3 text-right">Giá trị vốn</th>
                            <th className="px-4 py-3 text-right">Doanh thu dự kiến</th>
                            <th className="px-4 py-3 text-right">Lãi dự kiến</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efe5d3]">
                          {products.map((product: any) => {
                            const stock = Number(product.currentStock || 0);
                            const minStock = Number(product.minStock || 0);
                            const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
                            const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
                            const costValue = stock * cost;
                            const saleValue = stock * sale;
                            const expectedProfit = saleValue - costValue;
                            const lowStock = minStock > 0 && stock <= minStock;
                            return (
                              <tr key={`inventory-${product.id}`} className="text-slate-700">
                                <td className="px-4 py-3">
                                  <div className="font-black text-slate-950">{product.productName}</div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                    <span>{productCategoryLabel(product.category)}</span>
                                    {lowStock ? <span className="rounded-full bg-rose-50 px-2 py-0.5 font-black text-rose-700">Sắp hết</span> : null}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-950">{formatMoney(stock)} {product.unit || ""}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-bold">{cost > 0 ? `${formatMoney(cost)} đ` : "—"}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-amber-700">{sale > 0 ? `${formatMoney(sale)} đ` : "—"}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-black">{formatMoney(costValue)} đ</td>
                                <td className="whitespace-nowrap px-4 py-3 text-right font-black text-emerald-700">{formatMoney(saleValue)} đ</td>
                                <td className={`whitespace-nowrap px-4 py-3 text-right font-black ${expectedProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatMoney(expectedProfit)} đ</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">
                    Chưa có dữ liệu hàng hóa để lập báo cáo tồn kho.
                  </div>
                )}
                <p className="text-xs font-semibold leading-5 text-slate-500">
                  Lãi gộp dự kiến chỉ là giá bán hiện tại trừ giá vốn hiện tại của lượng hàng còn tồn; chưa trừ chi phí vận hành và các khoản chi khác.
                </p>
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <main className="min-w-0 space-y-4">
              {activeStoreTab !== "products" ? (
                <>
                  <section className="rounded-[1.75rem] border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fffaf0_100%)] p-4 shadow-lg shadow-amber-950/5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                          {activeTabMeta.label}
                        </p>
                        <h2 className="text-xl font-black text-slate-950">
                          {activeStoreTab === "sales"
                            ? "Bán hàng"
                            : activeStoreTab === "purchase"
                              ? "Nhập kho đa nguồn"
                              : "Tổng hợp thu chi cửa hàng"}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {activeTabMeta.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeStoreTab === "sales" ? (
                          <button
                            type="button"
                            onClick={openSaleStockModal}
                            disabled={!activeLedgerId}
                            className={residenceMediumStyle.buttonCardPrimary}
                          >
                            <Plus className="h-4 w-4" />
                            Tạo phiếu bán
                          </button>
                        ) : null}
                        {activeStoreTab === "purchase" ? (
                          <>
                            <button
                              type="button"
                              onClick={openPurchaseStockModal}
                              disabled={!activeLedgerId || !products.length}
                              className={residenceMediumStyle.buttonCardPrimary}
                            >
                              <Plus className="h-4 w-4" />
                              Tạo phiếu nhập
                            </button>
                            <button
                              type="button"
                              onClick={() => openTransactionModal("out")}
                              disabled={!activeLedgerId}
                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                              Chi vận hành
                            </button>
                          </>
                        ) : null}
                        {activeStoreTab === "cashflow" ? (
                          <button
                            type="button"
                            onClick={handleCloseDaily}
                            disabled={
                              !activeLedgerId || closeDailyMutation?.isPending
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-800 shadow-sm hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CalendarDays className="h-4 w-4" />
                            {closeDailyMutation?.isPending
                              ? "Đang chốt..."
                              : "Chốt ngày"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </section>
                  <section className="rounded-[1.75rem] border border-[#eadfca] bg-white/90 p-4 shadow-lg shadow-amber-950/5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px]">
                      <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          className={residenceMediumStyle.searchInput}
                          placeholder="Tìm nội dung, mã phiếu, người nhận/nộp..."
                        />
                      </label>
                      <FormDateInput
                        value={fromDate}
                        onChange={(event: any) =>
                          setFromDate(event.target.value)
                        }
                      />
                      <FormDateInput
                        value={toDate}
                        onChange={(event: any) => setToDate(event.target.value)}
                      />
                    </div>
                    {activeStoreTab === "cashflow" ? (
                      <>
                        <div className="mt-3 grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-3 lg:grid-cols-[140px_180px_minmax(0,1fr)] lg:items-center">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                            Chốt sổ ngày
                          </p>
                          <FormDateInput
                            value={closingDate}
                            onChange={(event: any) =>
                              setClosingDate(event.target.value)
                            }
                          />
                          <div className="text-xs font-semibold leading-5 text-slate-500">
                            Chốt ngày là bước của người lập. Dữ liệu chỉ được khóa chính thức và đẩy sang sổ tài chính chung khi một người có quyền thực hiện Xác nhận chốt.
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            { value: "all", label: "Tất cả" },
                            { value: "in", label: "Khoản thu" },
                            { value: "out", label: "Khoản chi" },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setDirectionFilter(item.value as any)}
                              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${directionFilter === item.value ? "bg-slate-950 text-white shadow-md" : "border border-amber-100 bg-amber-50/70 text-slate-700 hover:bg-amber-100"}`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        {closingError ? (
                          <ErrorText>{closingError}</ErrorText>
                        ) : null}
                      </>
                    ) : null}
                  </section>

                  {activeStoreTab === "cashflow" ? (
                    <section className={residenceMediumStyle.section}>
                      <div className={residenceMediumStyle.sectionHeader}>
                        <div>
                          <h2 className="text-base font-black text-slate-950">Báo cáo dòng tiền</h2>
                          <p className="text-sm font-semibold text-slate-500">Tổng hợp cơ cấu thu, chi trong khoảng thời gian đang lọc.</p>
                        </div>
                      </div>
                      <div className={`${residenceMediumStyle.sectionBody} space-y-4`}>
                        <div className="grid gap-3 md:grid-cols-3">
                          <MiniStat label="Tổng thu" value={`${formatMoney(cashflowReport.totalIn)} đ`} />
                          <MiniStat label="Tổng chi" value={`${formatMoney(cashflowReport.totalOut)} đ`} />
                          <MiniStat label="Chênh lệch" value={`${formatMoney(cashflowReport.net)} đ`} />
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Cơ cấu thu</p>
                            <div className="mt-3 space-y-2">
                              <CashflowLine label="Thu bán hàng" value={cashflowReport.salesRevenue} total={cashflowReport.totalIn} />
                              <CashflowLine label="Thu khác" value={cashflowReport.otherIn} total={cashflowReport.totalIn} />
                            </div>
                          </div>
                          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Cơ cấu chi</p>
                            <div className="mt-3 space-y-2">
                              <CashflowLine label="Mua hàng nhập kho" value={cashflowReport.purchaseExpense} total={cashflowReport.totalOut} />
                              <CashflowLine label="Chi vận hành" value={cashflowReport.operationExpense} total={cashflowReport.totalOut} />
                              <CashflowLine label="Chi khác" value={cashflowReport.otherOut} total={cashflowReport.totalOut} />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-500">Báo cáo dựa trên {cashflowReport.transactionCount} phát sinh chưa hủy trong khoảng ngày đang chọn.</p>
                      </div>
                    </section>
                  ) : null}

                  {activeStoreTab === "cashflow" ? (
                  <section className={residenceMediumStyle.section}>
                    <div className={residenceMediumStyle.sectionHeader}>
                      <div>
                        <h2 className="text-base font-black text-slate-950">
                          Lịch sử chốt ngày
                        </h2>
                        <p className="text-sm font-semibold text-slate-500">
                          Chốt ngày và xác nhận chốt là hai thao tác riêng. Người xác nhận mở Review để kiểm tra và đẩy sang sổ chung.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`${residenceMediumStyle.sectionBody} space-y-2`}
                    >
                      {dailyClosingsQuery.isLoading ? (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                          Đang tải lịch sử chốt...
                        </div>
                      ) : visibleDailyClosings.length ? (
                        visibleDailyClosings.map((closing: any) => (
                          <article
                            key={closing.id}
                            className="rounded-2xl border border-[#eadfca] bg-white/90 px-4 py-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-black text-slate-950">
                                    {formatDateText(closing.closingDate)} ·{" "}
                                    {closing.closingCode}
                                  </p>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${closingStatusClass(closing.status)}`}
                                  >
                                    {closingStatusLabel(closing.status)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {closing.transactionCount || 0} phát sinh ·
                                  Thu {formatMoney(closing.totalIn)}đ · Chi{" "}
                                  {formatMoney(closing.totalOut)}đ
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                  {closing.postedToFinance ? "Đã đẩy sổ chung" : "Chưa đẩy sổ chung"}
                                </span>
                                <span
                                  className={`text-sm font-black ${Number(closing.netAmount || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                                >
                                  {formatMoney(closing.netAmount)}đ
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReviewClosingId(Number(closing.id))
                                  }
                                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Review
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">
                          Chưa có ngày nào được chốt trong khoảng lọc.
                        </div>
                      )}
                    </div>
                  </section>
                  ) : null}

                  {activeStoreTab === "purchase" ? (
                    <section className={residenceMediumStyle.section}>
                      <div className={residenceMediumStyle.sectionHeader}>
                        <div>
                          <h2 className="text-base font-black text-slate-950">Lịch sử nhập kho</h2>
                          <p className="text-sm font-semibold text-slate-500">Hiển thị mọi nguồn nhập, kể cả các phiếu không phát sinh dòng tiền.</p>
                        </div>
                      </div>
                      <div className={`${residenceMediumStyle.sectionBody} space-y-2`}>
                        {stockMovementsQuery.isLoading ? (
                          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải lịch sử nhập kho...</div>
                        ) : stockMovements.length ? (
                          stockMovements.map((item: any) => (
                            <article key={item.id} className="rounded-2xl border border-[#eadfca] bg-white/95 p-4 shadow-sm">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">{stockMovementSourceLabel(item.movementType)}</span>
                                    <span className="text-xs font-bold text-slate-400">{formatDateText(item.movementDate)}</span>
                                  </div>
                                  <h3 className="mt-2 text-base font-black text-slate-950">{item.productName || "Hàng hóa"}</h3>
                                  {item.note ? <p className="mt-1 text-sm font-semibold text-slate-500">{item.note}</p> : null}
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-base font-black text-emerald-700">+{formatMoney(item.quantityIn)} {item.productUnit || ""}</p>
                                  <p className="mt-1 text-xs font-bold text-slate-500">Giá vốn {formatMoney(item.unitCost)}đ / {item.productUnit || "đơn vị"}</p>
                                  <p className="mt-1 text-xs font-black text-slate-700">Giá trị {formatMoney(Number(item.quantityIn || 0) * Number(item.unitCost || 0))}đ</p>
                                </div>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">Chưa có phiếu nhập kho trong khoảng thời gian này.</div>
                        )}
                      </div>
                    </section>
                  ) : null}

                  {activeStoreTab === "sales" ? (
                    <section className={residenceMediumStyle.section}>
                      <div className={residenceMediumStyle.sectionHeader}>
                        <div>
                          <h2 className="text-base font-black text-slate-950">Lịch sử bán hàng</h2>
                          <p className="text-sm font-semibold text-slate-500">Phiếu bán theo sản phẩm, số lượng xuất và doanh thu ghi nhận.</p>
                        </div>
                      </div>
                      <div className={`${residenceMediumStyle.sectionBody} space-y-2`}>
                        {saleMovementsQuery.isLoading ? (
                          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải lịch sử bán hàng...</div>
                        ) : saleMovements.length ? (
                          saleMovements.map((item: any) => {
                            const transaction = transactions.find(
                              (tx: any) => Number(tx.id) === Number(item.transactionId),
                            );
                            const quantity = Number(item.quantityOut || 0);
                            const amount = Number(transaction?.amount || 0);
                            const unitPrice = quantity > 0 ? amount / quantity : 0;
                            return (
                              <article key={item.id} className="rounded-2xl border border-[#eadfca] bg-white/95 p-4 shadow-sm">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Bán hàng</span>
                                      <span className="text-xs font-bold text-slate-400">{formatDateText(item.movementDate)}</span>
                                    </div>
                                    <h3 className="mt-2 text-base font-black text-slate-950">{item.productName || "Hàng hóa"}</h3>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                      {transaction?.partnerName || item.note || transaction?.transactionCode || "Khách lẻ"}
                                    </p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <p className="text-base font-black text-rose-700">-{formatMoney(quantity)} {item.productUnit || ""}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-500">Giá bán {formatMoney(unitPrice)}đ / {item.productUnit || "đơn vị"}</p>
                                    <p className="mt-1 text-sm font-black text-emerald-700">Doanh thu {formatMoney(amount)}đ</p>
                                  </div>
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">Chưa có phiếu bán hàng trong khoảng thời gian này.</div>
                        )}
                      </div>
                    </section>
                  ) : null}

                  {activeStoreTab === "cashflow" ? (
                  <section className={residenceMediumStyle.section}>
                    <div className={residenceMediumStyle.sectionHeader}>
                      <div>
                        <h2 className="text-base font-black text-slate-950">Sổ phát sinh theo ngày</h2>
                        <p className="text-sm font-semibold text-slate-500">
                          {activeLedger ? activeLedger.ledgerName : "Chưa khởi tạo cửa hàng"} · Có thể chốt trực tiếp tại từng ngày chưa chốt.
                        </p>
                      </div>
                    </div>
                    <div className={`${residenceMediumStyle.sectionBody} space-y-3`}>
                      {transactionsQuery.isLoading ? (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">Đang tải phát sinh...</div>
                      ) : transactionDayGroups.length ? (
                        transactionDayGroups.map((group: any) => {
                          const closing = group.closing;
                          const isApproved = closing && ["approved", "closed"].includes(String(closing.status));
                          const isWaiting = closing && ["draft", "reviewed"].includes(String(closing.status));
                          return (
                            <article key={group.dateKey} className="overflow-hidden rounded-[1.5rem] border border-[#eadfca] bg-white/95 shadow-sm">
                              <div className="flex flex-col gap-3 border-b border-[#efe5d3] bg-[linear-gradient(135deg,#fffaf0_0%,#ffffff_100%)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-black text-slate-950">{formatDateText(group.dateKey)}</h3>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${isApproved ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : isWaiting ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                                      {isApproved ? "Đã xác nhận · Đã đẩy sổ chung" : isWaiting ? "Đã chốt · Chờ xác nhận" : "Chưa chốt"}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {group.transactions.length} phát sinh · Thu {formatMoney(group.totalIn)}đ · Chi {formatMoney(group.totalOut)}đ · Chênh lệch {formatMoney(group.totalIn - group.totalOut)}đ
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {!closing ? (
                                    <button type="button" onClick={() => { setClosingDate(group.dateKey); setClosingError(""); setClosingPreviewOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-sm">
                                      <ShieldCheck className="h-4 w-4" /> Chốt ngày
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => setReviewClosingId(Number(closing.id))} className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-50">
                                      <Eye className="h-4 w-4" /> {isApproved ? "Xem" : "Review"}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="divide-y divide-[#efe5d3]">
                                {group.transactions.map((item: any) => (
                                  <div key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}>{directionLabel(item.direction)}</span>
                                        <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-bold text-amber-700">{categoryLabel(item.category)}</span>
                                      </div>
                                      <p className="mt-1 truncate text-sm font-black text-slate-950">{item.title}</p>
                                      <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.partnerName || item.description || item.transactionCode}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <p className={`text-base font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}>{item.direction === "in" ? "+" : "-"}{formatMoney(item.amount)} đ</p>
                                      <button type="button" onClick={() => item.dailyClosingId ? showClosedTransactionNotice("hủy") : cancelTransactionMutation?.mutate?.({ id: Number(item.id) })} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Hủy phát sinh"><XCircle className="h-4 w-4" /></button>
                                      <button type="button" onClick={() => item.dailyClosingId ? showClosedTransactionNotice("xóa") : deleteTransactionMutation?.mutate?.({ id: Number(item.id) })} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Xóa phát sinh"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center">
                          <CheckCircle2 className="mx-auto h-8 w-8 text-amber-500" />
                          <p className="mt-2 text-sm font-black text-slate-800">Chưa có phát sinh trong khoảng thời gian này</p>
                        </div>
                      )}
                    </div>
                  </section>
                  ) : null}
                </>
              ) : null}
            </main>
          </section>
        </div>
      </div>

      {blockingNotice ? (
        <Modal
          title={blockingNotice.title}
          onClose={() => setBlockingNotice(null)}
          overlayClassName="z-[110]"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
              <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  Thao tác đang bị khóa
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {blockingNotice.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBlockingNotice(null)}
                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-slate-800"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleteProductTarget ? (
        <Modal
          title="Xác nhận xóa hàng hóa"
          onClose={() => setDeleteProductTarget(null)}
          overlayClassName="z-[110]"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-rose-900">
              <div className="rounded-full bg-white p-2 text-rose-600 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  Xóa khỏi danh mục đang dùng?
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  Hàng hóa “{deleteProductTarget.productName}” sẽ được đưa khỏi
                  danh mục đang dùng. Chỉ nên xóa khi chưa có tồn kho hoặc phát
                  sinh mua bán.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteProductTarget(null)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deleteProductMutation?.isPending}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteProductMutation?.isPending
                  ? "Đang xóa..."
                  : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {productModalOpen ? (
        <Modal
          title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          onClose={() => setProductModalOpen(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mã sản phẩm">
              <input
                value={productForm.productCode}
                disabled={!!editingProduct}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    productCode: event.target.value,
                  }))
                }
                className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
                placeholder="NUOC_SUOI_500"
              />
            </Field>
            <Field label="Tên sản phẩm">
              <input
                value={productForm.productName}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    productName: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Nước suối 500ml"
              />
            </Field>
            <Field label="Nhóm hàng">
              <div className="space-y-2">
                <select
                  value={
                    defaultProductCategories.some(
                      (item) => item.value === productForm.category,
                    )
                      ? productForm.category
                      : "__custom"
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setProductForm((prev) => ({
                      ...prev,
                      category: value === "__custom" ? "" : value,
                    }));
                  }}
                  className={inputClass}
                >
                  {defaultProductCategories
                    .filter((item) => item.value !== "all")
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  <option value="__custom">+ Nhóm hàng mới</option>
                </select>
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="VD: Nông sản, thủ công, bánh kẹo, sách..."
                />
              </div>
            </Field>
            <Field label="Đơn vị tính">
              <div className="space-y-2">
                <select
                  value={
                    defaultProductUnits.some(
                      (item) => item.value === productForm.unit,
                    )
                      ? productForm.unit
                      : "__custom"
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setProductForm((prev) => ({
                      ...prev,
                      unit: value === "__custom" ? "" : value,
                    }));
                  }}
                  className={inputClass}
                >
                  {defaultProductUnits.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                  <option value="__custom">+ Đơn vị mới</option>
                </select>
                <input
                  value={productForm.unit}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      unit: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="VD: bó, hộp, ký..."
                />
              </div>
            </Field>
            <Field label="Tồn tối thiểu">
              <input
                inputMode="numeric"
                value={productForm.minStock}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    minStock: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="20"
              />
            </Field>
            <div className="sm:col-span-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
              Chỉ nhập thông tin hàng hóa cơ bản ở đây. Giá vốn và giá bán được quản lý ở nút <b>Thông tin giá</b> để giữ lịch sử thay đổi rõ ràng.
            </div>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className={inputClass}
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setProductModalOpen(false)}
            onSave={handleSaveProduct}
            saveText={editingProduct ? "Lưu hàng hóa" : "Thêm hàng hóa"}
            loading={
              createProductMutation?.isPending ||
              updateProductMutation?.isPending
            }
          />
        </Modal>
      ) : null}

      {priceInfoProduct ? (
        <Modal
          title={`Thông tin giá - ${priceInfoProduct.productName || "Hàng hóa"}`}
          onClose={() => setPriceInfoProduct(null)}
        >
          {(() => {
            const historyData = productPriceHistoryQuery.data as any;
            const costHistory = historyData?.costHistory || historyData?.costHistories || [];
            const saleHistory = historyData?.salePriceHistory || historyData?.salePriceHistories || [];
            const stock = Number(priceInfoProduct.currentStock || 0);
            const cost = Number(priceInfoProduct.averageCostPrice || priceInfoProduct.defaultCostPrice || 0);
            const sale = Number(priceInfoProduct.currentSalePrice || priceInfoProduct.defaultSalePrice || 0);
            return (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Giá vốn hiện tại</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{cost > 0 ? `${formatMoney(cost)}đ` : "Chưa có"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{productCostingMethodLabel(priceInfoProduct.costingMethod)}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">Giá bán hiện tại</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{sale > 0 ? `${formatMoney(sale)}đ` : "Chưa nhập"}</p>
                    <button
                      type="button"
                      onClick={() => openSalePriceModal(priceInfoProduct)}
                      className="mt-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white"
                    >
                      Cập nhật giá bán
                    </button>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Giá trị tồn</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{formatMoney(stock * cost)}đ</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Tồn {formatMoney(stock)} {priceInfoProduct.unit || ""}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                  Giá vốn lấy từ các lần nhập hàng hoặc tự gia công. Giá bán có lịch sử riêng để biết vì sao thay đổi: giá nhập tăng, chi phí vận hành tăng, điều chỉnh theo thực tế hoặc khuyến mãi.
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-100 bg-white p-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Lịch sử giá vốn</h3>
                    <div className="mt-3 space-y-2">
                      {productPriceHistoryQuery.isLoading ? (
                        <p className="text-sm font-semibold text-slate-500">Đang tải lịch sử...</p>
                      ) : costHistory.length ? (
                        costHistory.slice(0, 6).map((item: any) => (
                          <div key={item.id || `${item.effectiveDate}-${item.unitCost}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <p className="font-black text-slate-900">{formatDateText(item.effectiveDate || item.createdAt)} · Giá vào {formatMoney(item.unitCost || item.costPrice || 0)}đ</p>
                            <p className="text-xs font-semibold text-slate-500">{item.quantity ? `Số lượng ${formatMoney(item.quantity)} · ` : ""}Giá cuối: {formatMoney(item.averageCostAfter || item.averageCostPrice || item.unitCost || 0)}đ</p>
                            {item.note || item.reason ? <p className="text-xs font-semibold text-amber-700">{item.reason || item.note}</p> : null}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">Chưa có lịch sử giá vốn. Khi nhập hàng hoặc ghi nhận gia công, hệ thống sẽ tạo lịch sử ở đây.</p>
                      )}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-amber-100 bg-white p-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.14em] text-amber-600">Lịch sử giá bán</h3>
                    <div className="mt-3 space-y-2">
                      {productPriceHistoryQuery.isLoading ? (
                        <p className="text-sm font-semibold text-slate-500">Đang tải lịch sử...</p>
                      ) : saleHistory.length ? (
                        saleHistory.slice(0, 6).map((item: any) => (
                          <div key={item.id || `${item.effectiveDate}-${item.salePrice}`} className="rounded-xl bg-amber-50 px-3 py-2 text-sm">
                            <p className="font-black text-slate-900">{formatDateText(item.effectiveDate || item.createdAt)} · Giá bán {formatMoney(item.salePrice || 0)}đ</p>
                            <p className="text-xs font-semibold text-amber-700">{salePriceReasonLabel(item.reason)}</p>
                            {item.note ? <p className="text-xs font-semibold text-slate-500">{item.note}</p> : null}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-semibold text-slate-500">Chưa có lịch sử giá bán. Bấm Cập nhật giá bán để ghi nhận giá đầu tiên.</p>
                      )}
                    </div>
                  </section>
                </div>
                <ModalFooter
                  onClose={() => setPriceInfoProduct(null)}
                  onSave={() => openSalePriceModal(priceInfoProduct)}
                  saveText="Cập nhật giá bán"
                />
              </div>
            );
          })()}
        </Modal>
      ) : null}

      {salePriceProduct ? (
        <Modal
          title={`Cập nhật giá bán - ${salePriceProduct.productName || "Hàng hóa"}`}
          onClose={() => setSalePriceProduct(null)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Giá bán mới">
              <input
                inputMode="numeric"
                value={priceForm.salePrice}
                onChange={(event) =>
                  setPriceForm((prev) => ({
                    ...prev,
                    salePrice: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="5.000"
              />
            </Field>
            <Field label="Ngày áp dụng">
              <FormDateInput
                value={priceForm.effectiveDate}
                onChange={(value) =>
                  setPriceForm((prev) => ({ ...prev, effectiveDate: value }))
                }
              />
            </Field>
            <Field label="Lý do thay đổi" className="sm:col-span-2">
              <select
                value={priceForm.reason}
                onChange={(event) =>
                  setPriceForm((prev) => ({ ...prev, reason: event.target.value }))
                }
                className={inputClass}
              >
                {salePriceReasonOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={priceForm.note}
                onChange={(event) =>
                  setPriceForm((prev) => ({ ...prev, note: event.target.value }))
                }
                rows={3}
                className={inputClass}
                placeholder="VD: giá nhập tăng, chi phí vận chuyển tăng, điều chỉnh theo thị trường..."
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setSalePriceProduct(null)}
            onSave={handleUpdateSalePrice}
            saveText="Lưu giá bán"
            loading={updateProductSalePriceMutation?.isPending}
          />
        </Modal>
      ) : null}

      {ledgerModalOpen ? (
        <Modal
          title="Khởi tạo cửa hàng"
          onClose={() => setLedgerModalOpen(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mã cửa hàng">
              <input
                value={ledgerForm.ledgerCode}
                onChange={(event) =>
                  setLedgerForm((prev) => ({
                    ...prev,
                    ledgerCode: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Tên cửa hàng">
              <input
                value={ledgerForm.ledgerName}
                onChange={(event) =>
                  setLedgerForm((prev) => ({
                    ...prev,
                    ledgerName: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Vốn/số dư đầu kỳ">
              <input
                inputMode="numeric"
                value={ledgerForm.openingBalance}
                onChange={(event) =>
                  setLedgerForm((prev) => ({
                    ...prev,
                    openingBalance: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="0"
              />
            </Field>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={ledgerForm.description}
                onChange={(event) =>
                  setLedgerForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className={inputClass}
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setLedgerModalOpen(false)}
            onSave={handleCreateLedger}
            saveText="Khởi tạo cửa hàng"
            loading={createLedgerMutation?.isPending}
          />
        </Modal>
      ) : null}


      {purchaseStockModalOpen ? (
        <Modal
          title="Tạo phiếu nhập kho"
          onClose={() => setPurchaseStockModalOpen(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nguồn nhập" className="sm:col-span-2">
              <select
                value={purchaseStockForm.stockInSource}
                onChange={(event) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    stockInSource: event.target.value as PurchaseStockFormState["stockInSource"],
                    sourceName: "",
                  }))
                }
                className={inputClass}
              >
                <option value="purchase">Mua hàng</option>
                <option value="production">Sản xuất / gia công nội bộ</option>
                <option value="self_supply">Tự cung cấp / được cấp</option>
                <option value="other">Nguồn khác</option>
              </select>
            </Field>
            <Field label="Hàng hóa" className="sm:col-span-2">
              <select
                value={purchaseStockForm.productId}
                onChange={(event) => {
                  const selectedProduct = products.find(
                    (item: any) => String(item.id) === event.target.value,
                  );
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    productId: event.target.value,
                    unitCost: (selectedProduct?.averageCostPrice || selectedProduct?.defaultCostPrice)
                      ? formatCurrencyInput(selectedProduct.averageCostPrice || selectedProduct.defaultCostPrice)
                      : prev.unitCost,
                  }));
                }}
                className={inputClass}
              >
                <option value="">Chọn hàng hóa</option>
                {products.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.productName} · tồn {formatMoney(product.currentStock)} {product.unit || ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ngày nhập">
              <FormDateInput
                value={purchaseStockForm.transactionDate}
                onChange={(event: any) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    transactionDate: event.target.value,
                  }))
                }
              />
            </Field>
            <Field
              label={
                purchaseStockForm.stockInSource === "purchase"
                  ? "Nhà cung cấp / nơi mua"
                  : purchaseStockForm.stockInSource === "production"
                    ? "Bộ phận / mẻ sản xuất"
                    : purchaseStockForm.stockInSource === "self_supply"
                      ? "Người / đơn vị cung cấp"
                      : "Nguồn cung cấp"
              }
            >
              <input
                value={purchaseStockForm.sourceName}
                onChange={(event) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    sourceName: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder={
                  purchaseStockForm.stockInSource === "purchase"
                    ? "VD: Chợ đầu mối / nhà cung cấp"
                    : purchaseStockForm.stockInSource === "production"
                      ? "VD: Bếp / nhóm gia công / mẻ số..."
                      : "Tên người, đơn vị hoặc nguồn nhập"
                }
              />
            </Field>
            <Field label="Số lượng">
              <input
                inputMode="numeric"
                value={purchaseStockForm.quantity}
                onChange={(event) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    quantity: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="10"
              />
            </Field>
            <Field label="Giá vốn / đơn vị">
              <input
                inputMode="numeric"
                value={purchaseStockForm.unitCost}
                onChange={(event) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    unitCost: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="5.000"
              />
            </Field>
            <div className="sm:col-span-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-bold text-slate-700">
              Giá trị nhập kho: <span className="text-slate-950">{formatMoney(parseCurrencyInput(purchaseStockForm.quantity) * parseCurrencyInput(purchaseStockForm.unitCost))}đ</span>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {purchaseStockForm.stockInSource === "purchase"
                  ? "Hệ thống sẽ tăng tồn, cập nhật giá vốn và tự động tạo khoản chi mua hàng."
                  : "Hệ thống sẽ tăng tồn và cập nhật giá vốn; không tự động tạo khoản chi cửa hàng."}
              </p>
            </div>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={purchaseStockForm.description}
                onChange={(event) =>
                  setPurchaseStockForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className={inputClass}
                placeholder="Ghi chú lô hàng, mẻ sản xuất, chất lượng hoặc chứng từ nếu có"
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setPurchaseStockModalOpen(false)}
            onSave={handleCreatePurchaseStock}
            saveText="Lưu phiếu nhập"
            loading={createPurchaseStockMutation?.isPending}
          />
        </Modal>
      ) : null}

      {saleStockModalOpen ? (
        <Modal
          title="Tạo phiếu bán hàng"
          onClose={() => setSaleStockModalOpen(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Hàng hóa" className="sm:col-span-2">
              <select
                value={saleStockForm.productId}
                onChange={(event) => {
                  const selectedProduct = products.find(
                    (item: any) => String(item.id) === event.target.value,
                  );
                  setSaleStockForm((prev) => ({
                    ...prev,
                    productId: event.target.value,
                    unitPrice: selectedProduct
                      ? formatCurrencyInput(selectedProduct.currentSalePrice || selectedProduct.defaultSalePrice || 0)
                      : "",
                  }));
                }}
                className={inputClass}
              >
                <option value="">Chọn hàng hóa</option>
                {products.map((product: any) => (
                  <option key={product.id} value={product.id} disabled={Number(product.currentStock || 0) <= 0}>
                    {product.productName} · tồn {formatMoney(product.currentStock)} {product.unit || ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ngày bán">
              <FormDateInput
                value={saleStockForm.transactionDate}
                onChange={(event: any) =>
                  setSaleStockForm((prev) => ({
                    ...prev,
                    transactionDate: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Khách hàng / người mua">
              <input
                value={saleStockForm.customerName}
                onChange={(event) =>
                  setSaleStockForm((prev) => ({ ...prev, customerName: event.target.value }))
                }
                className={inputClass}
                placeholder="Để trống nếu bán khách lẻ"
              />
            </Field>
            <Field label="Số lượng bán">
              <input
                inputMode="numeric"
                value={saleStockForm.quantity}
                onChange={(event) =>
                  setSaleStockForm((prev) => ({
                    ...prev,
                    quantity: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="1"
              />
            </Field>
            <Field label="Giá bán / đơn vị">
              <input
                inputMode="numeric"
                value={saleStockForm.unitPrice}
                onChange={(event) =>
                  setSaleStockForm((prev) => ({
                    ...prev,
                    unitPrice: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="10.000"
              />
            </Field>
            <Field label="Phương thức thanh toán">
              <select
                value={saleStockForm.paymentMethod}
                onChange={(event) =>
                  setSaleStockForm((prev) => ({ ...prev, paymentMethod: event.target.value }))
                }
                className={inputClass}
              >
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="other">Khác</option>
              </select>
            </Field>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-bold text-slate-700">
              Thành tiền: <span className="text-emerald-800">{formatMoney(parseCurrencyInput(saleStockForm.quantity) * parseCurrencyInput(saleStockForm.unitPrice))}đ</span>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Hệ thống sẽ giảm tồn kho và tự động ghi khoản thu bán hàng.
              </p>
            </div>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={saleStockForm.description}
                onChange={(event) =>
                  setSaleStockForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={2}
                className={inputClass}
                placeholder="Ghi chú đơn bán, người nhận hoặc thông tin liên quan"
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setSaleStockModalOpen(false)}
            onSave={handleCreateSaleStock}
            saveText="Lưu phiếu bán"
            loading={createSaleStockMutation?.isPending}
          />
        </Modal>
      ) : null}

      {transactionModalOpen ? (
        <Modal
          title={
            transactionForm.direction === "in" ? "Thu bán hàng" : "Chi cửa hàng"
          }
          onClose={() => setTransactionModalOpen(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Loại phát sinh">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 p-1">
                {(
                  [
                    { value: "in", label: "Thu" },
                    { value: "out", label: "Chi" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setTransactionForm((prev) => ({
                        ...prev,
                        direction: item.value,
                        category: item.value === "in" ? "sales" : "purchase",
                      }))
                    }
                    className={`rounded-xl px-3 py-2 text-sm font-black ${transactionForm.direction === item.value ? "bg-slate-950 text-white shadow" : "text-slate-600"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Ngày phát sinh">
              <FormDateInput
                value={transactionForm.transactionDate}
                onChange={(event: any) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    transactionDate: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Số tiền">
              <input
                inputMode="numeric"
                value={transactionForm.amount}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    amount: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right text-base font-black`}
                placeholder="1.000.000"
              />
            </Field>
            <Field label="Nhóm khoản">
              <select
                value={transactionForm.category}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                className={inputClass}
              >
                {transactionCategories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nội dung" className="sm:col-span-2">
              <input
                value={transactionForm.title}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Ví dụ: Bán nước uống / Mua vật tư cửa hàng"
              />
            </Field>
            <Field label="Người nộp/nhận">
              <input
                value={transactionForm.partnerName}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    partnerName: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Phương thức">
              <select
                value={transactionForm.paymentMethod}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    paymentMethod: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="other">Khác</option>
              </select>
            </Field>
            <Field label="Ghi chú" className="sm:col-span-2">
              <textarea
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className={inputClass}
              />
            </Field>
          </div>
          {formError ? <ErrorText>{formError}</ErrorText> : null}
          <ModalFooter
            onClose={() => setTransactionModalOpen(false)}
            onSave={handleCreateTransaction}
            saveText="Lưu phát sinh"
            loading={createTransactionMutation?.isPending}
          />
        </Modal>
      ) : null}

      {closingPreviewOpen ? (
        <Modal
          title="Xem trước chốt ngày"
          onClose={() => setClosingPreviewOpen(false)}
          overlayClassName="z-[95]"
        >
          {closingPreviewQuery.isLoading ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
              Đang tổng hợp phát sinh trong ngày...
            </div>
          ) : closingPreviewQuery.error ? (
            <ErrorText>{(closingPreviewQuery.error as any)?.message || "Không thể tải dữ liệu xem trước."}</ErrorText>
          ) : (closingPreviewQuery.data as any)?.summary ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Ngày {formatDateText((closingPreviewQuery.data as any).closingDate)}
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Kiểm tra trước khi chốt</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  Đây chỉ là bản xem trước. Dữ liệu chưa bị khóa và chưa tạo lịch sử chốt cho đến khi bấm Xác nhận chốt ngày.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <MiniStat label="Phát sinh" value={String((closingPreviewQuery.data as any).summary.transactionCount || 0)} />
                  <MiniStat label="Tổng thu" value={`${formatMoney((closingPreviewQuery.data as any).summary.totalIn)} đ`} />
                  <MiniStat label="Tổng chi" value={`${formatMoney((closingPreviewQuery.data as any).summary.totalOut)} đ`} />
                  <MiniStat label="Chênh lệch" value={`${formatMoney((closingPreviewQuery.data as any).summary.balance)} đ`} />
                </div>
              </div>
              <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                {((closingPreviewQuery.data as any).transactions || []).map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}>{directionLabel(item.direction)}</span>
                          <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{categoryLabel(item.category)}</span>
                        </div>
                        <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.partnerName || item.transactionCode}</p>
                      </div>
                      <p className={`text-base font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}>
                        {item.direction === "in" ? "+" : "-"}{formatMoney(item.amount)} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-[#eadfca] pt-4">
                <button type="button" onClick={() => setClosingPreviewOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Quay lại</button>
                <button type="button" onClick={confirmCloseDaily} disabled={closeDailyMutation?.isPending} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
                  <ShieldCheck className="h-4 w-4" />
                  {closeDailyMutation?.isPending ? "Đang chốt..." : "Xác nhận chốt ngày"}
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      ) : null}

      {reviewClosingId ? (
        <Modal
          title="Kiểm tra và xác nhận ngày chốt"
          onClose={() => setReviewClosingId(null)}
          overlayClassName="z-[95]"
        >
          {closingDetailQuery.isLoading ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
              Đang tải chi tiết ngày chốt...
            </div>
          ) : reviewClosing ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                      {formatDateText(reviewClosing.closingDate)} ·{" "}
                      {reviewClosing.closingCode}
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">
                      Kiểm tra chi tiết trước khi xác nhận
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      Người lập đã thực hiện Chốt ngày. Trước khi xác nhận có thể bỏ chốt để bổ sung; khi xác nhận, dữ liệu khóa chính thức và được đẩy sang sổ tài chính chung.
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${closingStatusClass(reviewClosing.status)}`}
                  >
                    {closingStatusLabel(reviewClosing.status)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <MiniStat
                    label="Phát sinh"
                    value={String(reviewClosing.transactionCount || 0)}
                  />
                  <MiniStat
                    label="Tổng thu"
                    value={`${formatMoney(reviewClosing.totalIn)} đ`}
                  />
                  <MiniStat
                    label="Tổng chi"
                    value={`${formatMoney(reviewClosing.totalOut)} đ`}
                  />
                  <MiniStat
                    label="Dòng tiền"
                    value={`${formatMoney(reviewClosing.netAmount)} đ`}
                  />
                </div>
              </div>

              <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                {reviewTransactions.length ? (
                  reviewTransactions.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}
                            >
                              {directionLabel(item.direction)}
                            </span>
                            <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                              {categoryLabel(item.category)}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {formatDateText(item.transactionDate)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm font-black text-slate-950">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-500">
                            {item.partnerName || item.transactionCode}
                          </p>
                        </div>
                        <p
                          className={`text-base font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}
                        >
                          {item.direction === "in" ? "+" : "-"}
                          {formatMoney(item.amount)} đ
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-center text-sm font-semibold text-slate-600">
                    Không có phát sinh trong ngày chốt này.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-[#eadfca] pt-4 sm:flex-row sm:justify-end">
                {canCancelClosing(reviewClosing.status) ? (
                  <button
                    type="button"
                    onClick={() =>
                      cancelDailyClosingMutation?.mutate?.({
                        id: Number(reviewClosing.id),
                      })
                    }
                    disabled={cancelDailyClosingMutation?.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-black text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Undo2 className="h-4 w-4" />
                    Bỏ chốt để bổ sung
                  </button>
                ) : null}
                {canApproveClosing(reviewClosing.status) ? (
                  <button
                    type="button"
                    onClick={() =>
                      approveDailyClosingMutation?.mutate?.({
                        id: Number(reviewClosing.id),
                      })
                    }
                    disabled={approveDailyClosingMutation?.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận & đẩy sổ chung
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <ErrorText>Không tải được chi tiết ngày chốt.</ErrorText>
          )}
        </Modal>
      ) : null}
    </ResidenceCareLayout>
  );
}

function CashflowLine({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <span className="text-sm font-black text-slate-950">{formatMoney(value)} đ</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-700" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
      <p className="mt-1 text-right text-[11px] font-bold text-slate-400">{percent}%</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "rose" | "amber" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "rose"
        ? "text-rose-700"
        : tone === "amber"
          ? "text-amber-700"
          : "text-slate-700";
  return (
    <div className="rounded-[1.5rem] border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fff7df_100%)] p-4 shadow-lg shadow-amber-950/5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-amber-100 ${toneClass}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-black text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#e5d8bd] bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#d6a63d] focus:ring-4 focus:ring-amber-100";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({
  title,
  children,
  onClose,
  overlayClassName = "z-[80]",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  overlayClassName?: string;
}) {
  return (
    <div
      className={`fixed inset-0 ${overlayClassName} flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm`}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#eadfca] bg-[linear-gradient(135deg,#fffdf7_0%,#ffffff_54%,#fff7df_100%)] shadow-2xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-[#eadfca] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              Quản lý cửa hàng
            </p>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {children}
    </div>
  );
}

function ModalFooter({
  onClose,
  onSave,
  saveText,
  loading,
}: {
  onClose: () => void;
  onSave: () => void;
  saveText: string;
  loading?: boolean;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2 border-t border-[#eadfca] pt-4">
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:opacity-60"
      >
        {loading ? "Đang lưu..." : saveText}
      </button>
    </div>
  );
}
