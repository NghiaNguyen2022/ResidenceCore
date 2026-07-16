"use client";

import { useEffect, useMemo, useState } from "react";
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
import { StoreLedgerProductsTab } from "@/components/store-ledger/StoreLedgerProductsTab";
import { StoreLedgerModals } from "@/components/store-ledger/StoreLedgerModals";
import {
      CashflowLine,
      ErrorText,
      Field,
      MiniStat,
      Modal,
      ModalFooter,
      SummaryCard,
      inputClass,
} from "@/components/store-ledger/StoreLedgerShared";
import {
      canApproveClosing,
      canCancelClosing,
      categoryLabel,
      closingStatusClass,
      closingStatusLabel,
      defaultProductCategories,
      defaultProductUnits,
      directionClass,
      directionLabel,
      emptyLedgerForm,
      emptyPriceForm,
      emptyProductForm,
      emptyPurchaseStockForm,
      emptySaleStockForm,
      emptyTransactionForm,
      formatCurrencyInput,
      formatDateText,
      formatMoney,
      getMonthStartYmd,
      getTodayYmd,
      normalizeDateKey,
      parseCurrencyInput,
      productCategoryLabel,
      productCostingMethodLabel,
      resolveStoreTabFromLocation,
      resizeProductImageFile,
      salePriceReasonLabel,
      salePriceReasonOptions,
      stockMovementSourceLabel,
      storeTabRoutes,
      storeTabs,
      transactionCategories,
      type LedgerFormState,
      type PriceFormState,
      type ProductFormState,
      type PurchaseStockFormState,
      type SaleStockFormState,
      type StoreTab,
      type TransactionFormState,
} from "@/components/store-ledger/storeLedgerUtils";
import { StoreLedgerHeaderSummary } from "@/components/store-ledger/StoreLedgerHeaderSummary";
import { StoreDocumentFormModal } from "@/components/store-ledger/StoreDocumentFormModal";
import { StoreDocumentHistory } from "@/components/store-ledger/StoreDocumentHistory";
import { StoreDocumentVoucherPreview } from "@/components/store-ledger/StoreDocumentVoucherPreview";
import type { StoreDocumentDraft } from "@/components/store-ledger/storeDocumentTypes";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

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
      const [previewStoreDocument, setPreviewStoreDocument] = useState<any | null>(null);
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

      const stockInDocumentsQuery = storeLedgerApi?.listDocuments?.useQuery?.({
            ledgerId: selectedLedgerId || ledgers[0]?.id || undefined,
            documentType: "stock_in",
            fromDate,
            toDate,
            search: searchTerm || undefined,
            limit: 200,
      }) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const saleDocumentsQuery = storeLedgerApi?.listDocuments?.useQuery?.({
            ledgerId: selectedLedgerId || ledgers[0]?.id || undefined,
            documentType: "sale",
            fromDate,
            toDate,
            search: searchTerm || undefined,
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
            storeLedgerApi?.createStockInDocument?.useMutation?.({
                  onSuccess: async (document: any) => {
                        setPurchaseStockModalOpen(false);
                        setPreviewStoreDocument(document);
                        setPurchaseStockForm(emptyPurchaseStockForm);
                        setFormError("");
                        await Promise.all([
                              productsQuery.refetch?.(),
                              stockMovementsQuery.refetch?.(),
                              stockInDocumentsQuery.refetch?.(),
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
            storeLedgerApi?.createSaleDocument?.useMutation?.({
                  onSuccess: async (document: any) => {
                        setSaleStockModalOpen(false);
                        setPreviewStoreDocument(document);
                        setSaleStockForm(emptySaleStockForm);
                        setFormError("");
                        await Promise.all([
                              productsQuery.refetch?.(),
                              saleMovementsQuery.refetch?.(),
                              saleDocumentsQuery.refetch?.(),
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
                  if (stock <= 0 || (minStock > 0 && stock <= minStock)) lowStockCount += 1;
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
                        title: "Hàng hóa & sản phẩm",
                        description:
                              "Quản lý hàng hóa, hình minh họa, giá bán, tồn kho và xem nhanh giá trị hàng đang có.",
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
                  imageUrl: product.imageUrl || "",
                  imageData: product.imageData || "",
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
                  notes: priceForm.note || null,
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
                  imageUrl: productForm.imageUrl || null,
                  imageData: productForm.imageData || null,
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

      function handleCreatePurchaseStock(draft?: StoreDocumentDraft) {
            if (!activeLedgerId) {
                  setFormError("Vui lòng khởi tạo cửa hàng trước.");
                  return;
            }
            if (!draft) return;
            if (isClosedDate(draft.documentDate)) {
                  showClosedTransactionNotice("thêm");
                  return;
            }
            const lines = draft.lines.map((line) => ({
                  productId: Number(line.productId),
                  quantity: parseCurrencyInput(line.quantity),
                  unitCost: parseCurrencyInput(line.unitValue),
                  notes: line.notes || null,
            }));
            if (lines.some((line) => !line.productId || line.quantity <= 0 || line.unitCost <= 0)) {
                  setFormError("Vui lòng chọn hàng hóa, nhập số lượng và giá vốn hợp lệ cho mọi dòng.");
                  return;
            }
            createPurchaseStockMutation?.mutate?.({
                  ledgerId: activeLedgerId,
                  stockInSource: draft.stockInSource,
                  documentDate: draft.documentDate,
                  partnerName: draft.partnerName || null,
                  paymentMethod: draft.paymentMethod || "cash",
                  notes: draft.notes || null,
                  lines,
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

      function handleCreateSaleStock(draft?: StoreDocumentDraft) {
            if (!activeLedgerId) {
                  setFormError("Vui lòng khởi tạo cửa hàng trước.");
                  return;
            }
            if (!draft) return;
            if (isClosedDate(draft.documentDate)) {
                  showClosedTransactionNotice("thêm");
                  return;
            }
            const lines = draft.lines.map((line) => ({
                  productId: Number(line.productId),
                  quantity: parseCurrencyInput(line.quantity),
                  unitPrice: parseCurrencyInput(line.unitValue),
                  notes: line.notes || null,
            }));
            if (lines.some((line) => !line.productId || line.quantity <= 0 || line.unitPrice <= 0)) {
                  setFormError("Vui lòng chọn hàng hóa, nhập số lượng và giá bán hợp lệ cho mọi dòng.");
                  return;
            }
            createSaleStockMutation?.mutate?.({
                  ledgerId: activeLedgerId,
                  documentDate: draft.documentDate,
                  partnerName: draft.partnerName || null,
                  paymentMethod: draft.paymentMethod || "cash",
                  notes: draft.notes || null,
                  lines,
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

      function scrollToStoreSection(id: string) {
            window.requestAnimationFrame(() => {
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
      }

      function showAllProducts() {
            setLowStockOnly(false);
            setProductCategoryFilter("all");
            setProductSearch("");
            scrollToStoreSection("store-product-list");
      }

      function showLowStockProducts() {
            setLowStockOnly(true);
            setProductCategoryFilter("all");
            scrollToStoreSection("store-product-list");
      }

      function showInventoryReport() {
            scrollToStoreSection("store-inventory-report");
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
                              <StoreLedgerHeaderSummary
                                    pageHeaderMeta={pageHeaderMeta}
                                    activeStoreTab={activeStoreTab}
                                    openCreateProductModal={openCreateProductModal}
                                    openSaleStockModal={openSaleStockModal}
                                    openPurchaseStockModal={openPurchaseStockModal}
                                    handleCloseDaily={handleCloseDaily}
                                    stockInSummary={stockInSummary}
                                    saleSummary={saleSummary}
                                    summary={summary}
                                    productSummary={productSummary}
                                    lowStockOnly={lowStockOnly}
                                    onShowAllProducts={showAllProducts}
                                    onShowLowStock={showLowStockProducts}
                                    onShowInventoryReport={showInventoryReport}
                                    formatMoney={formatMoney}
                              />

                              {activeStoreTab === "products" ? (
                                    <StoreLedgerProductsTab
                                          productSearch={productSearch}
                                          setProductSearch={setProductSearch}
                                          lowStockOnly={lowStockOnly}
                                          setLowStockOnly={setLowStockOnly}
                                          productCategoryFilter={productCategoryFilter}
                                          setProductCategoryFilter={setProductCategoryFilter}
                                          productCategoryOptions={productCategoryOptions}
                                          productsQuery={productsQuery}
                                          products={products}
                                          productSummary={productSummary}
                                          openEditProductModal={openEditProductModal}
                                          openPriceInfo={openPriceInfo}
                                          handleDeleteProduct={handleDeleteProduct}
                                          deleteProductMutation={deleteProductMutation}
                                    />
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
                                                            <StoreDocumentHistory
                                                                  type="stock_in"
                                                                  documents={stockInDocumentsQuery.data || []}
                                                                  loading={stockInDocumentsQuery.isLoading}
                                                                  onPreview={setPreviewStoreDocument}
                                                            />
                                                      ) : null}

                                                      {activeStoreTab === "sales" ? (
                                                            <StoreDocumentHistory
                                                                  type="sale"
                                                                  documents={saleDocumentsQuery.data || []}
                                                                  loading={saleDocumentsQuery.isLoading}
                                                                  onPreview={setPreviewStoreDocument}
                                                            />
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

                  <StoreDocumentFormModal
                        open={purchaseStockModalOpen}
                        type="stock_in"
                        products={products}
                        loading={createPurchaseStockMutation?.isPending}
                        error={formError}
                        onClose={() => setPurchaseStockModalOpen(false)}
                        onSave={handleCreatePurchaseStock}
                  />
                  <StoreDocumentFormModal
                        open={saleStockModalOpen}
                        type="sale"
                        products={products}
                        loading={createSaleStockMutation?.isPending}
                        error={formError}
                        onClose={() => setSaleStockModalOpen(false)}
                        onSave={handleCreateSaleStock}
                  />
                  {previewStoreDocument ? (
                        <StoreDocumentVoucherPreview
                              document={previewStoreDocument}
                              onClose={() => setPreviewStoreDocument(null)}
                        />
                  ) : null}

                  <StoreLedgerModals
                        blockingNotice={blockingNotice}
                        setBlockingNotice={setBlockingNotice}
                        deleteProductTarget={deleteProductTarget}
                        setDeleteProductTarget={setDeleteProductTarget}
                        confirmDeleteProduct={confirmDeleteProduct}
                        deleteProductMutation={deleteProductMutation}
                        productModalOpen={productModalOpen}
                        editingProduct={editingProduct}
                        setProductModalOpen={setProductModalOpen}
                        productForm={productForm}
                        setProductForm={setProductForm}
                        defaultProductCategories={defaultProductCategories}
                        defaultProductUnits={defaultProductUnits}
                        formatCurrencyInput={formatCurrencyInput}
                        resizeProductImageFile={resizeProductImageFile}
                        formError={formError}
                        setFormError={setFormError}
                        handleSaveProduct={handleSaveProduct}
                        createProductMutation={createProductMutation}
                        updateProductMutation={updateProductMutation}
                        priceInfoProduct={priceInfoProduct}
                        setPriceInfoProduct={setPriceInfoProduct}
                        productPriceHistoryQuery={productPriceHistoryQuery}
                        formatMoney={formatMoney}
                        productCostingMethodLabel={productCostingMethodLabel}
                        openSalePriceModal={openSalePriceModal}
                        formatDateText={formatDateText}
                        salePriceReasonLabel={salePriceReasonLabel}
                        salePriceProduct={salePriceProduct}
                        setSalePriceProduct={setSalePriceProduct}
                        priceForm={priceForm}
                        setPriceForm={setPriceForm}
                        salePriceReasonOptions={salePriceReasonOptions}
                        handleUpdateSalePrice={handleUpdateSalePrice}
                        updateProductSalePriceMutation={updateProductSalePriceMutation}
                        ledgerModalOpen={ledgerModalOpen}
                        setLedgerModalOpen={setLedgerModalOpen}
                        ledgerForm={ledgerForm}
                        setLedgerForm={setLedgerForm}
                        handleCreateLedger={handleCreateLedger}
                        createLedgerMutation={createLedgerMutation}
                        purchaseStockModalOpen={false}
                        setPurchaseStockModalOpen={setPurchaseStockModalOpen}
                        purchaseStockForm={purchaseStockForm}
                        setPurchaseStockForm={setPurchaseStockForm}
                        products={products}
                        parseCurrencyInput={parseCurrencyInput}
                        handleCreatePurchaseStock={handleCreatePurchaseStock}
                        createPurchaseStockMutation={createPurchaseStockMutation}
                        saleStockModalOpen={false}
                        setSaleStockModalOpen={setSaleStockModalOpen}
                        saleStockForm={saleStockForm}
                        setSaleStockForm={setSaleStockForm}
                        handleCreateSaleStock={handleCreateSaleStock}
                        createSaleStockMutation={createSaleStockMutation}
                        transactionModalOpen={transactionModalOpen}
                        setTransactionModalOpen={setTransactionModalOpen}
                        transactionForm={transactionForm}
                        setTransactionForm={setTransactionForm}
                        transactionCategories={transactionCategories}
                        handleCreateTransaction={handleCreateTransaction}
                        createTransactionMutation={createTransactionMutation}
                        closingPreviewOpen={closingPreviewOpen}
                        setClosingPreviewOpen={setClosingPreviewOpen}
                        closingPreviewQuery={closingPreviewQuery}
                        directionClass={directionClass}
                        directionLabel={directionLabel}
                        categoryLabel={categoryLabel}
                        confirmCloseDaily={confirmCloseDaily}
                        closeDailyMutation={closeDailyMutation}
                        reviewClosingId={reviewClosingId}
                        setReviewClosingId={setReviewClosingId}
                        closingDetailQuery={closingDetailQuery}
                        reviewClosing={reviewClosing}
                        reviewTransactions={reviewTransactions}
                        closingStatusClass={closingStatusClass}
                        closingStatusLabel={closingStatusLabel}
                        canCancelClosing={canCancelClosing}
                        cancelDailyClosingMutation={cancelDailyClosingMutation}
                        canApproveClosing={canApproveClosing}
                        approveDailyClosingMutation={approveDailyClosingMutation}
                  />
            </ResidenceCareLayout>
      );
}
