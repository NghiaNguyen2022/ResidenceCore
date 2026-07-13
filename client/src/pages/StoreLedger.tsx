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

const storeTabs = [
  {
    value: "products",
    label: "Dữ liệu sản phẩm",
    description: "Sản phẩm, giá bán, tồn tối thiểu",
  },
  {
    value: "purchase",
    label: "Mua hàng / nhập kho",
    description: "Chi mua hàng, nhập hàng về kho",
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

function parseCurrencyInput(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function formatCurrencyInput(value: string | number) {
  const amount = typeof value === "number" ? value : parseCurrencyInput(value);
  return amount
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
        amount,
      )
    : "";
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

function productCategoryLabel(value?: string | null) {
  if (!value) return "Khác";
  return (
    defaultProductCategories.find((item) => item.value === value)?.label ||
    value
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
      return "Chờ review";
    case "reviewed":
      return "Đã review";
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
  return status === "reviewed";
}

function canReviewClosing(status?: string | null) {
  return status === "draft";
}

type ProductFormState = {
  productCode: string;
  productName: string;
  category: string;
  unit: string;
  defaultCostPrice: string;
  defaultSalePrice: string;
  minStock: string;
  currentStock: string;
  description: string;
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

const emptyProductForm: ProductFormState = {
  productCode: "",
  productName: "",
  category: "nong_san",
  unit: "cái",
  defaultCostPrice: "",
  defaultSalePrice: "",
  minStock: "",
  currentStock: "",
  description: "",
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
  const [ledgerForm, setLedgerForm] =
    useState<LedgerFormState>(emptyLedgerForm);
  const [productForm, setProductForm] =
    useState<ProductFormState>(emptyProductForm);
  const [transactionForm, setTransactionForm] =
    useState<TransactionFormState>(emptyTransactionForm);

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

  const closingDetailQuery = storeLedgerApi?.getDailyClosingDetail?.useQuery?.(
    { id: reviewClosingId || 0 },
    { enabled: !!reviewClosingId },
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
    onSuccess: async (closing: any) => {
      setClosingError("");
      if (closing?.id) setReviewClosingId(Number(closing.id));
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
    storeLedgerApi?.approveDailyClosing?.useMutation?.({
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
          title: "Không thể xác nhận chốt",
          message: error?.message || "Không thể xác nhận ngày chốt.",
        }),
    });

  const cancelDailyClosingMutation =
    storeLedgerApi?.cancelDailyClosing?.useMutation?.({
      onSuccess: async () => {
        setReviewClosingId(null);
        await Promise.all([
          summaryQuery.refetch?.(),
          transactionsQuery.refetch?.(),
          dailyClosingsQuery.refetch?.(),
        ]);
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
    let inventoryValue = 0;
    products.forEach((product: any) => {
      const category = String(product.category || "general");
      categorySet.add(category);
      const stock = Number(product.currentStock || 0);
      const minStock = Number(product.minStock || 0);
      const cost = Number(product.defaultCostPrice || 0);
      if (minStock > 0 && stock <= minStock) lowStockCount += 1;
      inventoryValue += stock * cost;
    });
    return {
      totalProducts: products.length,
      totalCategories: categorySet.size,
      lowStockCount,
      inventoryValue,
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
  const dailyClosings = dailyClosingsQuery.data || [];
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
        eyebrow: "Mua hàng / nhập kho",
        title: "Mua hàng cửa hàng",
        description:
          "Ghi nhận chi mua hàng, chi vận hành và chuẩn bị dữ liệu cho nhập kho.",
      };
    }
    if (activeStoreTab === "sales") {
      return {
        eyebrow: "Bán hàng",
        title: "Bán hàng cửa hàng",
        description:
          "Ghi nhận doanh thu bán hàng, chuẩn bị cho phiếu bán theo từng sản phẩm.",
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
          ["purchase", "operation"].includes(item.category),
      );
    }
    return transactions;
  }, [transactions, activeStoreTab]);
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
      defaultCostPrice: formatCurrencyInput(product.defaultCostPrice || 0),
      defaultSalePrice: formatCurrencyInput(product.defaultSalePrice || 0),
      minStock: formatCurrencyInput(product.minStock || 0),
      currentStock: formatCurrencyInput(product.currentStock || 0),
      description: product.description || "",
    });
    setProductModalOpen(true);
  }

  function handleSaveProduct() {
    setFormError("");
    const payload = {
      productCode: productForm.productCode,
      productName: productForm.productName,
      category: productForm.category.trim() || "general",
      unit: productForm.unit.trim() || "cái",
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
          <div className="relative overflow-visible px-5 pb-2 pt-3 text-slate-900 sm:px-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-75 [background-image:radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.94),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(251,191,36,0.20),transparent_26%),radial-gradient(circle_at_18%_0%,rgba(217,119,6,0.10),transparent_24%)]" />
            <div className="relative min-h-[106px] rounded-[30px] border border-amber-100/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(255,251,235,0.42)_58%,rgba(245,158,11,0.10)_100%)] px-5 py-6 shadow-[0_18px_46px_rgba(12,10,9,0.06),inset_0_1px_0_rgba(255,255,255,0.74)] sm:px-7">
              <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">
                  {pageHeaderMeta.eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-[38px]">
                  {pageHeaderMeta.title}
                </h1>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {pageHeaderMeta.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-6 lg:top-6 lg:mt-0 lg:justify-end">
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
                    onClick={() => openTransactionModal("in")}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Thu bán hàng
                  </button>
                ) : activeStoreTab === "purchase" ? (
                  <button
                    type="button"
                    onClick={() => openTransactionModal("out")}
                    className={residenceMediumStyle.buttonCardPrimary}
                  >
                    <Plus className="h-4 w-4" />
                    Chi mua hàng
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
          </div>

          {activeStoreTab !== "products" ? (
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
                      const cost = Number(product.defaultCostPrice || 0);
                      const sale = Number(product.defaultSalePrice || 0);
                      const lowStock = minStock > 0 && stock <= minStock;
                      const canDelete = stock <= 0;
                      return (
                        <article
                          key={product.id}
                          className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
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
                              <h3 className="mt-2 truncate text-lg font-black text-slate-950">
                                {product.productName}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                Tồn {formatMoney(stock)} {product.unit || ""}
                                {minStock > 0
                                  ? ` · Tối thiểu ${formatMoney(minStock)}`
                                  : ""}
                                {cost > 0
                                  ? ` · Giá nhập ${formatMoney(cost)}đ`
                                  : ""}
                              </p>
                              <p className="mt-1 text-sm font-black text-slate-700">
                                {sale > 0
                                  ? `Giá bán ${formatMoney(sale)}đ`
                                  : "Chưa nhập giá bán"}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(product)}
                                className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-50"
                              >
                                {sale > 0 ? "Sửa" : "Nhập giá"}
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
                              ? "Mua hàng, nhập hàng kho"
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
                            onClick={() => openTransactionModal("in")}
                            disabled={!activeLedgerId}
                            className={residenceMediumStyle.buttonCardPrimary}
                          >
                            <Plus className="h-4 w-4" />
                            Thu bán hàng
                          </button>
                        ) : null}
                        {activeStoreTab === "purchase" ? (
                          <button
                            type="button"
                            onClick={() => openTransactionModal("out")}
                            disabled={!activeLedgerId}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                            Chi mua hàng / vận hành
                          </button>
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
                        Tạo bản chốt tạm theo ngày để review chi tiết. Chỉ khi
                        bấm xác nhận chốt thì ngày mới khóa chính thức.
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
                  </section>

                  <section className={residenceMediumStyle.section}>
                    <div className={residenceMediumStyle.sectionHeader}>
                      <div>
                        <h2 className="text-base font-black text-slate-950">
                          Lịch sử chốt ngày
                        </h2>
                        <p className="text-sm font-semibold text-slate-500">
                          Các ngày đã khóa phát sinh, chưa đẩy sang sổ chung.
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
                      ) : dailyClosings.length ? (
                        dailyClosings.map((closing: any) => (
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
                                  Chưa đẩy sổ chung
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

                  <section className={residenceMediumStyle.section}>
                    <div className={residenceMediumStyle.sectionHeader}>
                      <div>
                        <h2 className="text-base font-black text-slate-950">
                          Sổ phát sinh
                        </h2>
                        <p className="text-sm font-semibold text-slate-500">
                          {activeLedger
                            ? activeLedger.ledgerName
                            : "Chưa khởi tạo cửa hàng"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`${residenceMediumStyle.sectionBody} space-y-2`}
                    >
                      {transactionsQuery.isLoading ? (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                          Đang tải phát sinh...
                        </div>
                      ) : tabTransactions.length ? (
                        tabTransactions.map((item: any) => (
                          <article
                            key={item.id}
                            className="group rounded-2xl border border-[#eadfca] bg-[linear-gradient(135deg,#ffffff_0%,#fffaf0_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}
                                  >
                                    {directionLabel(item.direction)}
                                  </span>
                                  <span className="rounded-full border border-amber-100 bg-white px-2.5 py-1 text-xs font-bold text-amber-700">
                                    {categoryLabel(item.category)}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                    {formatDateText(item.transactionDate)}
                                  </span>
                                </div>
                                <h3 className="mt-2 truncate text-base font-black text-slate-950">
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                  {item.partnerName ||
                                    item.description ||
                                    item.transactionCode}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                                <p
                                  className={`text-lg font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}
                                >
                                  {item.direction === "in" ? "+" : "-"}
                                  {formatMoney(item.amount)} đ
                                </p>
                                <div className="flex items-center gap-1">
                                  {item.status !== "cancelled" ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        item.dailyClosingId
                                          ? showClosedTransactionNotice("hủy")
                                          : cancelTransactionMutation?.mutate?.(
                                              { id: Number(item.id) },
                                            )
                                      }
                                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                      title="Hủy phát sinh"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                      Đã hủy
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      item.dailyClosingId
                                        ? showClosedTransactionNotice("xóa")
                                        : deleteTransactionMutation?.mutate?.({
                                            id: Number(item.id),
                                          })
                                    }
                                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                    title="Xóa phát sinh"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center">
                          <CheckCircle2 className="mx-auto h-8 w-8 text-amber-500" />
                          <p className="mt-2 text-sm font-black text-slate-800">
                            Chưa có phát sinh trong khoảng thời gian này
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Bấm Ghi thu hoặc Ghi chi để bắt đầu.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
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
            <Field label="Giá nhập tham khảo">
              <input
                inputMode="numeric"
                value={productForm.defaultCostPrice}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    defaultCostPrice: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="3.500"
              />
            </Field>
            {editingProduct ? (
              <Field label="Giá bán">
                <input
                  inputMode="numeric"
                  value={productForm.defaultSalePrice}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      defaultSalePrice: formatCurrencyInput(event.target.value),
                    }))
                  }
                  className={`${inputClass} text-right font-black`}
                  placeholder="5.000"
                />
              </Field>
            ) : null}
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
            <Field label="Tồn hiện tại">
              <input
                inputMode="numeric"
                value={productForm.currentStock}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    currentStock: formatCurrencyInput(event.target.value),
                  }))
                }
                className={`${inputClass} text-right font-black`}
                placeholder="0"
              />
            </Field>
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

      {reviewClosingId ? (
        <Modal
          title="Review ngày chốt"
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
                      Review chi tiết trước khi xác nhận chốt
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      Ngày chốt tạm có thể bỏ chốt để bổ sung. Sau khi xác nhận
                      chốt, phát sinh trong ngày sẽ bị khóa chính thức.
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
                {canReviewClosing(reviewClosing.status) ? (
                  <button
                    type="button"
                    onClick={() =>
                      reviewDailyClosingMutation?.mutate?.({
                        id: Number(reviewClosing.id),
                      })
                    }
                    disabled={reviewDailyClosingMutation?.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-black text-sky-700 shadow-sm hover:bg-sky-100 disabled:opacity-60"
                  >
                    <Eye className="h-4 w-4" />
                    Đã review
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
                    Xác nhận chốt
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
