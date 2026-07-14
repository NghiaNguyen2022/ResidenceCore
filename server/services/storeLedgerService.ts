import { TRPCError } from "@trpc/server";
import * as storeLedgerDb from "../db/storeLedger";
import * as financeDb from "../db/finance";

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
}

function todayCodeDate() {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

function ensureDate(value: string, message: string) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new TRPCError({ code: "BAD_REQUEST", message });
      }
      return value;
}

function normalizeDateYmd(value: unknown, message = "Ngày dữ liệu không hợp lệ.") {
      const raw = String(value ?? "").trim();
      const directMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
      if (directMatch) return directMatch[1];

      const dateValue = value instanceof Date ? value : new Date(raw);
      if (Number.isNaN(dateValue.getTime())) {
            throw new TRPCError({ code: "BAD_REQUEST", message });
      }

      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(dateValue);
      const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
      const normalized = `${part("year")}-${part("month")}-${part("day")}`;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            throw new TRPCError({ code: "BAD_REQUEST", message });
      }
      return normalized;
}

function ensureAmount(value: number) {
      if (!Number.isFinite(value) || value <= 0) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Số tiền phải lớn hơn 0." });
      }
      return Number(value.toFixed(2));
}

export const storeLedgerService = {

      async listProducts(input: storeLedgerDb.StoreProductListInput = {}) {
            return storeLedgerDb.listStoreProducts(input);
      },

      async listStockMovements(input: storeLedgerDb.StoreStockMovementListInput = {}) {
            return storeLedgerDb.listStoreStockMovements(input);
      },

      async createProduct(input: {
            productCode: string;
            productName: string;
            category?: string | null;
            unit?: string | null;
            defaultCostPrice?: number | null;
            defaultSalePrice?: number | null;
            sourceType?: "purchase" | "processed" | "both" | null;
            costingMethod?: "weighted_average" | "latest" | "manual" | null;
            minStock?: number | null;
            currentStock?: number | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            const productCode = normalizeCode(input.productCode || input.productName);
            if (!productCode) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng nhập mã sản phẩm." });
            }
            if (!input.productName?.trim()) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng nhập tên sản phẩm." });
            }

            const existingProduct = await storeLedgerDb.getStoreProductByCode(productCode);
            if (existingProduct) {
                  if (existingProduct.isActive) {
                        throw new TRPCError({ code: "CONFLICT", message: "Mã sản phẩm đã tồn tại. Vui lòng dùng mã khác hoặc sửa sản phẩm hiện có." });
                  }
                  throw new TRPCError({ code: "CONFLICT", message: "Mã sản phẩm đã tồn tại nhưng đang ngưng dùng. Vui lòng dùng mã khác." });
            }

            return storeLedgerDb.createStoreProduct({
                  productCode,
                  productName: input.productName.trim(),
                  category: input.category?.trim() || "general",
                  unit: input.unit?.trim() || "cái",
                  defaultCostPrice: String(Number(input.defaultCostPrice || 0).toFixed(2)),
                  defaultSalePrice: String(Number(input.defaultSalePrice || 0).toFixed(2)),
                  averageCostPrice: String(Number(input.defaultCostPrice || 0).toFixed(2)),
                  currentSalePrice: String(Number(input.defaultSalePrice || 0).toFixed(2)),
                  sourceType: input.sourceType ?? "purchase",
                  costingMethod: input.costingMethod ?? "weighted_average",
                  minStock: String(Number(input.minStock || 0).toFixed(2)),
                  currentStock: String(Number(input.currentStock || 0).toFixed(2)),
                  description: input.description?.trim() || null,
                  isActive: true,
                  createdBy: input.createdBy ?? null,
            } as any);
      },

      async updateProduct(id: number, input: {
            productName?: string;
            category?: string | null;
            unit?: string | null;
            defaultCostPrice?: number | null;
            defaultSalePrice?: number | null;
            sourceType?: "purchase" | "processed" | "both" | null;
            costingMethod?: "weighted_average" | "latest" | "manual" | null;
            minStock?: number | null;
            currentStock?: number | null;
            description?: string | null;
            isActive?: boolean;
      }) {
            const product = await storeLedgerDb.getStoreProductById(id);
            if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy sản phẩm." });

            return storeLedgerDb.updateStoreProduct(id, {
                  productName: input.productName?.trim() || product.productName,
                  category: input.category?.trim() || product.category || "general",
                  unit: input.unit?.trim() || product.unit || "cái",
                  defaultCostPrice: input.defaultCostPrice !== undefined && input.defaultCostPrice !== null ? String(Number(input.defaultCostPrice).toFixed(2)) : product.defaultCostPrice,
                  defaultSalePrice: input.defaultSalePrice !== undefined && input.defaultSalePrice !== null ? String(Number(input.defaultSalePrice).toFixed(2)) : product.defaultSalePrice,
                  sourceType: input.sourceType ?? (product as any).sourceType ?? "purchase",
                  costingMethod: input.costingMethod ?? (product as any).costingMethod ?? "weighted_average",
                  minStock: input.minStock !== undefined && input.minStock !== null ? String(Number(input.minStock).toFixed(2)) : product.minStock,
                  currentStock: input.currentStock !== undefined && input.currentStock !== null ? String(Number(input.currentStock).toFixed(2)) : product.currentStock,
                  description: input.description?.trim() || null,
                  isActive: input.isActive ?? product.isActive,
            } as any);
      },

      async deleteProduct(id: number) {
            const product = await storeLedgerDb.getStoreProductById(id);
            if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy sản phẩm." });
            if (!product.isActive) return product;

            const hasUsage = await storeLedgerDb.hasStoreProductUsage(id);
            if (hasUsage) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Chỉ xóa được hàng hóa chưa có dữ liệu mua bán hoặc tồn kho.",
                  });
            }

            return storeLedgerDb.softDeleteStoreProduct(id);
      },

      async listProductPriceHistory(productId: number) {
            const product = await storeLedgerDb.getStoreProductById(productId);
            if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy hàng hóa." });
            const [costHistory, salePriceHistory] = await Promise.all([
                  storeLedgerDb.listStoreProductCostHistories(productId),
                  storeLedgerDb.listStoreProductSalePriceHistories(productId),
            ]);
            return { product, costHistory, salePriceHistory };
      },

      async updateProductSalePrice(input: {
            productId: number;
            salePrice: number;
            effectiveDate: string;
            reason?: "cost_increase" | "overhead_increase" | "market_adjustment" | "promotion" | "manual" | "other" | null;
            notes?: string | null;
            createdBy?: number | null;
      }) {
            const product = await storeLedgerDb.getStoreProductById(input.productId);
            if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy hàng hóa." });
            const effectiveDate = ensureDate(input.effectiveDate, "Ngày áp dụng giá bán không hợp lệ.");
            const salePrice = ensureAmount(input.salePrice);

            const priceHistoryPayload = {
                  productId: input.productId,
                  effectiveDate,
                  salePrice: String(salePrice.toFixed(2)),
                  reason: input.reason ?? "manual",
                  notes: input.notes?.trim() || null,
                  createdBy: input.createdBy ?? null,
            } as any;

            // Ghi thêm một dòng lịch sử giá bán. Lý do không bắt buộc; nếu trống thì lưu mặc định là "manual".
            // Không cập nhật/ghi đè dòng cũ để giữ đúng lịch sử thay đổi giá.
            await storeLedgerDb.upsertStoreProductSalePriceHistoryByDate(priceHistoryPayload);

            const today = new Date().toISOString().slice(0, 10);
            if (effectiveDate <= today) {
                  await storeLedgerDb.updateStoreProduct(input.productId, {
                        defaultSalePrice: String(salePrice.toFixed(2)),
                        currentSalePrice: String(salePrice.toFixed(2)),
                  } as any);
            }
            return this.listProductPriceHistory(input.productId);
      },

      async listLedgers(input: storeLedgerDb.StoreLedgerListInput = {}) {
            return storeLedgerDb.listStoreLedgers(input);
      },

      async createLedger(input: {
            ledgerCode: string;
            ledgerName: string;
            ledgerType?: "store" | "fund" | "other";
            openingBalance?: number | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            const ledgerCode = normalizeCode(input.ledgerCode || input.ledgerName);
            if (!ledgerCode) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng nhập mã sổ/quỹ." });
            }
            if (!input.ledgerName?.trim()) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng nhập tên sổ/quỹ." });
            }

            const existingLedger = await storeLedgerDb.getStoreLedgerByCode(ledgerCode);
            if (existingLedger) {
                  if (existingLedger.isActive) {
                        return existingLedger;
                  }
                  throw new TRPCError({
                        code: "CONFLICT",
                        message: "Mã sổ/quỹ đã tồn tại nhưng đang ngưng sử dụng. Vui lòng dùng mã khác.",
                  });
            }

            try {
                  return await storeLedgerDb.createStoreLedger({
                        ledgerCode,
                        ledgerName: input.ledgerName.trim(),
                        ledgerType: input.ledgerType ?? "store",
                        openingBalance: String(Number(input.openingBalance || 0).toFixed(2)),
                        description: input.description?.trim() || null,
                        isActive: true,
                        createdBy: input.createdBy ?? null,
                  } as any);
            } catch (error: any) {
                  if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062 || String(error?.message || "").includes("Duplicate entry")) {
                        const latestLedger = await storeLedgerDb.getStoreLedgerByCode(ledgerCode);
                        if (latestLedger?.isActive) return latestLedger;
                        throw new TRPCError({ code: "CONFLICT", message: "Mã sổ/quỹ đã tồn tại. Vui lòng dùng mã khác." });
                  }
                  throw error;
            }
      },

      async updateLedger(id: number, input: {
            ledgerName?: string;
            ledgerType?: "store" | "fund" | "other";
            openingBalance?: number | null;
            description?: string | null;
            isActive?: boolean;
      }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(id);
            if (!ledger) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy sổ/quỹ." });

            return storeLedgerDb.updateStoreLedger(id, {
                  ledgerName: input.ledgerName?.trim() || ledger.ledgerName,
                  ledgerType: input.ledgerType ?? (ledger.ledgerType as any),
                  openingBalance: input.openingBalance !== undefined && input.openingBalance !== null ? String(Number(input.openingBalance).toFixed(2)) : ledger.openingBalance,
                  description: input.description?.trim() || null,
                  isActive: input.isActive ?? ledger.isActive,
            } as any);
      },

      async getSummary(input: { ledgerId?: number | null; fromDate?: string | null; toDate?: string | null } = {}) {
            return storeLedgerDb.getStoreLedgerSummary(input);
      },

      async listTransactions(input: storeLedgerDb.StoreLedgerTransactionListInput = {}) {
            return storeLedgerDb.listStoreLedgerTransactions(input);
      },

      async listDailyClosings(input: storeLedgerDb.StoreDailyClosingListInput = {}) {
            return storeLedgerDb.listStoreDailyClosings(input);
      },

      async previewDailyClosing(input: { ledgerId: number; closingDate: string }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(input.ledgerId);
            if (!ledger || !ledger.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Sổ/quỹ không hợp lệ hoặc đã ngừng sử dụng." });
            }

            const closingDate = ensureDate(input.closingDate, "Ngày chốt sổ không hợp lệ.");
            const existingClosing = await storeLedgerDb.getStoreDailyClosingByDate(input.ledgerId, closingDate);
            if (existingClosing && !["cancelled"].includes(String(existingClosing.status))) {
                  throw new TRPCError({
                        code: "CONFLICT",
                        message: "Ngày này đã được chốt. Nếu cần bổ sung dữ liệu, hãy Bỏ chốt rồi chốt lại.",
                  });
            }

            const summary = await storeLedgerDb.getUnclosedStoreLedgerSummary({
                  ledgerId: input.ledgerId,
                  closingDate,
            });

            const transactions = await storeLedgerDb.listUnclosedStoreLedgerTransactions({
                  ledgerId: input.ledgerId,
                  closingDate,
            });

            return {
                  ledgerId: input.ledgerId,
                  closingDate,
                  summary,
                  transactions,
            };
      },

      async closeDaily(input: {
            ledgerId: number;
            closingDate: string;
            notes?: string | null;
            createdBy?: number | null;
      }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(input.ledgerId);
            if (!ledger || !ledger.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Sổ/quỹ không hợp lệ hoặc đã ngừng sử dụng." });
            }

            const closingDate = ensureDate(input.closingDate, "Ngày chốt sổ không hợp lệ.");
            const existingClosing = await storeLedgerDb.getStoreDailyClosingByDate(input.ledgerId, closingDate);
            if (existingClosing && !["cancelled"].includes(String(existingClosing.status))) {
                  return existingClosing;
            }

            const summary = await storeLedgerDb.getUnclosedStoreLedgerSummary({ ledgerId: input.ledgerId, closingDate });
            if (!summary.transactionCount) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Không có phát sinh chưa chốt trong ngày này." });
            }

            const closingCode = existingClosing?.closingCode || `CHOT-${closingDate.replace(/-/g, "")}-${input.ledgerId}`;
            const closingPayload = {
                  ledgerId: input.ledgerId,
                  closingCode,
                  closingDate,
                  totalIn: String(summary.totalIn.toFixed(2)),
                  totalOut: String(summary.totalOut.toFixed(2)),
                  netAmount: String(summary.balance.toFixed(2)),
                  transactionCount: summary.transactionCount,
                  status: "draft",
                  postedToFinance: false,
                  financeBatchId: null,
                  notes: input.notes?.trim() || null,
                  closedBy: input.createdBy ?? null,
                  closedAt: new Date(),
                  reviewedBy: null,
                  reviewedAt: null,
                  approvedBy: null,
                  approvedAt: null,
                  confirmedBy: null,
                  confirmedAt: null,
                  createdBy: input.createdBy ?? null,
            } as any;

            const closing = existingClosing?.status === "cancelled"
                  ? await storeLedgerDb.updateStoreDailyClosing(Number(existingClosing.id), closingPayload)
                  : await storeLedgerDb.createStoreDailyClosing(closingPayload);

            if (closing?.id) {
                  await storeLedgerDb.markStoreLedgerTransactionsClosed({
                        ledgerId: input.ledgerId,
                        closingDate,
                        closingId: Number(closing.id),
                  });
            }

            return closing;
      },

      async getDailyClosingDetail(id: number) {
            const closing = await storeLedgerDb.getStoreDailyClosingById(id);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }
            const transactions = await storeLedgerDb.listStoreLedgerTransactionsByClosing(id);
            return { closing, transactions };
      },

      async reviewDailyClosing(id: number, reviewedBy?: number | null) {
            const closing = await storeLedgerDb.getStoreDailyClosingById(id);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }
            if (["approved", "closed"].includes(String(closing.status))) {
                  return closing;
            }
            if (String(closing.status) !== "draft") {
                  return closing;
            }
            return storeLedgerDb.updateStoreDailyClosing(id, {
                  status: "reviewed",
                  reviewedBy: reviewedBy ?? null,
                  reviewedAt: new Date(),
            } as any);
      },

      async confirmDailyClosing(id: number, confirmedBy?: number | null) {
            const closing = await storeLedgerDb.getStoreDailyClosingById(id);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }

            if (Boolean((closing as any).postedToFinance)) {
                  return closing;
            }

            if (!["draft", "reviewed"].includes(String(closing.status))) {
                  if (["approved", "closed"].includes(String(closing.status))) {
                        throw new TRPCError({ code: "CONFLICT", message: "Ngày đã xác nhận nhưng chưa hoàn tất trạng thái đẩy sổ. Vui lòng kiểm tra dữ liệu trước khi thao tác lại." });
                  }
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Ngày chưa ở trạng thái đã chốt để xác nhận." });
            }

            const ledger = await storeLedgerDb.getStoreLedgerById(Number((closing as any).ledgerId));
            const closingCode = String((closing as any).closingCode || `STORE-CLOSING-${id}`);
            const batchId = String((closing as any).financeBatchId || `STORE-${closingCode}`);
            const totalIn = Number((closing as any).totalIn || 0);
            const totalOut = Number((closing as any).totalOut || 0);
            const closingDate = normalizeDateYmd((closing as any).closingDate, "Ngày chốt sổ không hợp lệ.");
            const targetName = String((ledger as any)?.ledgerName || "Cửa hàng lưu xá");
            const actorId = confirmedBy ?? null;

            // Mỗi ngày chốt được đẩy theo một batch. Hai dòng tổng hợp Thu/Chi dùng externalRef
            // riêng để retry an toàn và không tạo trùng khi mạng hoặc request bị lặp.
            if (totalIn > 0) {
                  await financeDb.createFinanceTransaction({
                        source: "store_daily_closing",
                        direction: "in",
                        amount: totalIn,
                        transactionDate: closingDate,
                        targetType: "store_daily_closing_income",
                        targetName,
                        description: `Tổng thu cửa hàng ngày ${closingDate} · ${closingCode}`,
                        externalRef: `${batchId}:IN`,
                        createdBy: actorId,
                  });
            }
            if (totalOut > 0) {
                  await financeDb.createFinanceTransaction({
                        source: "store_daily_closing",
                        direction: "out",
                        amount: totalOut,
                        transactionDate: closingDate,
                        targetType: "store_daily_closing_expense",
                        targetName,
                        description: `Tổng chi cửa hàng ngày ${closingDate} · ${closingCode}`,
                        externalRef: `${batchId}:OUT`,
                        createdBy: actorId,
                  });
            }

            return storeLedgerDb.updateStoreDailyClosing(id, {
                  status: "approved",
                  approvedBy: actorId,
                  approvedAt: new Date(),
                  confirmedBy: actorId,
                  confirmedAt: new Date(),
                  postedToFinance: true,
                  financeBatchId: batchId,
            } as any);
      },

      // Compatibility alias for clients still using the old endpoint name.
      async approveDailyClosing(id: number, approvedBy?: number | null) {
            return this.confirmDailyClosing(id, approvedBy);
      },

      async cancelDailyClosing(id: number) {
            const closing = await storeLedgerDb.getStoreDailyClosingById(id);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }
            if (["approved", "closed"].includes(String(closing.status))) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Ngày này đã xác nhận chốt, không thể bỏ chốt. Hãy xử lý bằng nghiệp vụ điều chỉnh." });
            }
            await storeLedgerDb.clearStoreLedgerTransactionsClosing(id);
            return storeLedgerDb.updateStoreDailyClosing(id, { status: "cancelled" } as any);
      },


      async createStockIn(input: {
            ledgerId: number;
            productId: number;
            stockInSource: "purchase" | "production" | "self_supply" | "other";
            transactionDate: string;
            quantity: number;
            unitCost: number;
            sourceName?: string | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(input.ledgerId);
            if (!ledger || !ledger.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Cửa hàng chưa được khởi tạo hoặc đã ngừng sử dụng." });
            }

            const product = await storeLedgerDb.getStoreProductById(input.productId);
            if (!product || !product.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Hàng hóa không hợp lệ hoặc đã ngừng sử dụng." });
            }

            const transactionDate = ensureDate(input.transactionDate, "Ngày nhập kho không hợp lệ.");
            const closedDate = await storeLedgerDb.getStoreDailyClosingByDate(input.ledgerId, transactionDate);
            if (closedDate && String(closedDate.status) !== "cancelled") {
                  const status = String(closedDate.status);
                  const canReopen = ["draft", "reviewed"].includes(status);
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: canReopen
                              ? "Ngày này đang trong quy trình chốt sổ. Có thể bỏ chốt để bổ sung phiếu nhập kho trước khi xác nhận."
                              : "Ngày này đã xác nhận chốt sổ. Không thể tạo phiếu nhập kho mới.",
                  });
            }

            if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Số lượng nhập phải lớn hơn 0." });
            }

            const quantity = Number(input.quantity.toFixed(2));
            const unitCost = ensureAmount(input.unitCost);
            const amount = Number((quantity * unitCost).toFixed(2));
            const previousStock = Number((product as any).currentStock || 0);
            const previousAverageCost = Number((product as any).averageCostPrice || (product as any).defaultCostPrice || 0);
            const newStock = previousStock + quantity;
            const averageCostAfter = newStock > 0
                  ? Number((((previousStock * previousAverageCost) + amount) / newStock).toFixed(2))
                  : unitCost;

            const sourceMeta = {
                  purchase: { label: "Mua hàng", movementType: "purchase", historyType: "purchase", reason: "Nhập kho từ mua hàng" },
                  production: { label: "Sản xuất / gia công nội bộ", movementType: "production_in", historyType: "processed", reason: "Nhập kho từ sản xuất / gia công" },
                  self_supply: { label: "Tự cung cấp / được cấp", movementType: "self_supply_in", historyType: "self_supply", reason: "Nhập kho tự cung cấp / được cấp" },
                  other: { label: "Nguồn khác", movementType: "other_in", historyType: "other", reason: "Nhập kho từ nguồn khác" },
            } as const;
            const source = sourceMeta[input.stockInSource];
            const productName = String((product as any).productName || "Hàng hóa");

            // Chỉ nhập kho do mua hàng mới tự động tạo khoản chi cửa hàng.
            let transaction: any = null;
            if (input.stockInSource === "purchase") {
                  const transactionCode = `NHAP-${todayCodeDate()}-${Date.now().toString().slice(-5)}`;
                  transaction = await storeLedgerDb.createStoreLedgerTransaction({
                        ledgerId: input.ledgerId,
                        transactionCode,
                        direction: "out",
                        transactionDate,
                        amount: String(amount.toFixed(2)),
                        category: "purchase_stock",
                        title: `Mua và nhập kho: ${productName}`,
                        partnerName: input.sourceName?.trim() || null,
                        paymentMethod: "cash",
                        description: input.description?.trim() || null,
                        status: "posted",
                        isActive: true,
                        createdBy: input.createdBy ?? null,
                  } as any);
            }

            const transactionId = Number((transaction as any)?.id || 0) || null;
            const movementNote = [source.label, input.sourceName?.trim(), input.description?.trim()].filter(Boolean).join(" · ") || null;

            await storeLedgerDb.createStoreStockMovement({
                  productId: input.productId,
                  transactionId,
                  movementType: source.movementType,
                  movementDate: transactionDate,
                  quantityIn: String(quantity.toFixed(2)),
                  quantityOut: "0.00",
                  unitCost: String(unitCost.toFixed(2)),
                  note: movementNote,
                  createdBy: input.createdBy ?? null,
            } as any);

            await storeLedgerDb.createStoreProductCostHistory({
                  productId: input.productId,
                  sourceType: source.historyType,
                  effectiveDate: transactionDate,
                  quantity: String(quantity.toFixed(2)),
                  unitCost: String(unitCost.toFixed(2)),
                  averageCostAfter: String(averageCostAfter.toFixed(2)),
                  reason: source.reason,
                  notes: movementNote,
                  createdBy: input.createdBy ?? null,
            } as any);

            const updatedProduct = await storeLedgerDb.addStoreProductStock({
                  productId: input.productId,
                  quantity,
                  unitCost,
                  averageCostAfter,
            });

            return {
                  transaction,
                  product: updatedProduct,
                  averageCostAfter,
                  stockInSource: input.stockInSource,
                  createdExpense: input.stockInSource === "purchase",
            };
      },

      // Compatibility alias for clients that still call the 16K4 purchase endpoint.
      async createPurchaseStock(input: {
            ledgerId: number;
            productId: number;
            transactionDate: string;
            quantity: number;
            unitCost: number;
            supplierName?: string | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            return this.createStockIn({
                  ledgerId: input.ledgerId,
                  productId: input.productId,
                  stockInSource: "purchase",
                  transactionDate: input.transactionDate,
                  quantity: input.quantity,
                  unitCost: input.unitCost,
                  sourceName: input.supplierName,
                  description: input.description,
                  createdBy: input.createdBy,
            });
      },

      async createSaleStock(input: {
            ledgerId: number;
            productId: number;
            transactionDate: string;
            quantity: number;
            unitPrice?: number | null;
            customerName?: string | null;
            paymentMethod?: string | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(input.ledgerId);
            if (!ledger || !ledger.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Cửa hàng chưa được khởi tạo hoặc đã ngừng sử dụng." });
            }

            const product = await storeLedgerDb.getStoreProductById(input.productId);
            if (!product || !product.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Hàng hóa không hợp lệ hoặc đã ngừng sử dụng." });
            }

            const transactionDate = ensureDate(input.transactionDate, "Ngày bán hàng không hợp lệ.");
            const closedDate = await storeLedgerDb.getStoreDailyClosingByDate(input.ledgerId, transactionDate);
            if (closedDate && String(closedDate.status) !== "cancelled") {
                  const status = String(closedDate.status);
                  const canReopen = ["draft", "reviewed"].includes(status);
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: canReopen
                              ? "Ngày này đang trong quy trình chốt sổ. Có thể bỏ chốt để bổ sung phiếu bán hàng trước khi xác nhận."
                              : "Ngày này đã xác nhận chốt sổ. Không thể tạo phiếu bán hàng mới.",
                  });
            }

            if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Số lượng bán phải lớn hơn 0." });
            }

            const quantity = Number(input.quantity.toFixed(2));
            const currentStock = Number((product as any).currentStock || 0);
            if (quantity > currentStock) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `Không đủ tồn kho. Hiện còn ${currentStock} ${(product as any).unit || ""}.`,
                  });
            }

            const defaultSalePrice = Number((product as any).currentSalePrice || (product as any).defaultSalePrice || 0);
            const unitPrice = ensureAmount(Number(input.unitPrice ?? defaultSalePrice));
            const amount = Number((quantity * unitPrice).toFixed(2));
            const unitCost = Number((product as any).averageCostPrice || (product as any).defaultCostPrice || 0);
            const transactionCode = `BAN-${todayCodeDate()}-${Date.now().toString().slice(-5)}`;
            const productName = String((product as any).productName || "Hàng hóa");

            const transaction = await storeLedgerDb.createStoreLedgerTransaction({
                  ledgerId: input.ledgerId,
                  transactionCode,
                  direction: "in",
                  transactionDate,
                  amount: String(amount.toFixed(2)),
                  category: "sales",
                  title: `Bán hàng: ${productName}`,
                  partnerName: input.customerName?.trim() || null,
                  paymentMethod: input.paymentMethod?.trim() || "cash",
                  description: input.description?.trim() || null,
                  status: "posted",
                  isActive: true,
                  createdBy: input.createdBy ?? null,
            } as any);

            const transactionId = Number((transaction as any)?.id || 0) || null;
            const updatedProduct = await storeLedgerDb.subtractStoreProductStock({
                  productId: input.productId,
                  quantity,
            });

            if (!updatedProduct) {
                  await storeLedgerDb.softDeleteStoreLedgerTransaction(Number((transaction as any)?.id || 0));
                  throw new TRPCError({
                        code: "CONFLICT",
                        message: "Tồn kho vừa thay đổi. Vui lòng kiểm tra lại số lượng và tạo phiếu bán lại.",
                  });
            }

            await storeLedgerDb.createStoreStockMovement({
                  productId: input.productId,
                  transactionId,
                  movementType: "sale",
                  movementDate: transactionDate,
                  quantityIn: "0.00",
                  quantityOut: String(quantity.toFixed(2)),
                  unitCost: String(unitCost.toFixed(2)),
                  note: [input.customerName?.trim(), input.description?.trim()].filter(Boolean).join(" · ") || null,
                  createdBy: input.createdBy ?? null,
            } as any);

            return {
                  transaction,
                  product: updatedProduct,
                  quantity,
                  unitPrice,
                  amount,
                  stockAfter: Number((updatedProduct as any).currentStock || 0),
            };
      },

      async createTransaction(input: {
            ledgerId: number;
            direction: "in" | "out";
            transactionDate: string;
            amount: number;
            category?: string | null;
            title: string;
            partnerName?: string | null;
            paymentMethod?: string | null;
            description?: string | null;
            createdBy?: number | null;
      }) {
            const ledger = await storeLedgerDb.getStoreLedgerById(input.ledgerId);
            if (!ledger || !ledger.isActive) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Sổ/quỹ không hợp lệ hoặc đã ngừng sử dụng." });
            }
            if (!input.title?.trim()) {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng nhập nội dung thu/chi." });
            }

            const transactionDate = ensureDate(input.transactionDate, "Ngày phát sinh không hợp lệ.");
            const closedDate = await storeLedgerDb.getStoreDailyClosingByDate(input.ledgerId, transactionDate);
            if (closedDate && closedDate.status !== "cancelled") {
                  const status = String(closedDate.status);
                  const canReopen = ["draft", "reviewed"].includes(status);
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: canReopen
                              ? "Ngày này đang trong quy trình chốt sổ. Có thể bỏ chốt để bổ sung phát sinh trước khi xác nhận."
                              : "Ngày này đã xác nhận chốt sổ. Không thể thêm phát sinh mới.",
                  });
            }

            const directionPrefix = input.direction === "in" ? "THU" : "CHI";
            const transactionCode = `${directionPrefix}-${todayCodeDate()}-${Date.now().toString().slice(-5)}`;

            return storeLedgerDb.createStoreLedgerTransaction({
                  ledgerId: input.ledgerId,
                  transactionCode,
                  direction: input.direction,
                  transactionDate,
                  amount: String(ensureAmount(input.amount)),
                  category: input.category?.trim() || null,
                  title: input.title.trim(),
                  partnerName: input.partnerName?.trim() || null,
                  paymentMethod: input.paymentMethod?.trim() || "cash",
                  description: input.description?.trim() || null,
                  status: "posted",
                  isActive: true,
                  createdBy: input.createdBy ?? null,
            } as any);
      },

      async cancelTransaction(id: number) {
            const transaction = await storeLedgerDb.getStoreLedgerTransactionById(id);
            if (!transaction || !transaction.isActive) {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy khoản thu/chi." });
            }
            const stockMovement = await storeLedgerDb.getStoreStockMovementByTransactionId(id);
            if (stockMovement) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Phát sinh này đã liên kết với nhập/xuất kho. Không thể hủy trực tiếp vì sẽ làm sai tồn kho; hãy dùng nghiệp vụ trả hàng hoặc điều chỉnh kho.",
                  });
            }
            if ((transaction as any).dailyClosingId) {
                  const closing = await storeLedgerDb.getStoreDailyClosingById(Number((transaction as any).dailyClosingId));
                  const canReopen = closing && ["draft", "reviewed"].includes(String(closing.status));
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: canReopen
                              ? "Khoản này đang nằm trong ngày chốt tạm. Hãy bỏ chốt ngày để bổ sung/chỉnh sửa."
                              : "Khoản này đã thuộc ngày xác nhận chốt sổ, không thể hủy trực tiếp.",
                  });
            }
            return storeLedgerDb.updateStoreLedgerTransaction(id, { status: "cancelled" } as any);
      },

      async deleteTransaction(id: number) {
            const transaction = await storeLedgerDb.getStoreLedgerTransactionById(id);
            if (!transaction || !transaction.isActive) {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy khoản thu/chi." });
            }
            const stockMovement = await storeLedgerDb.getStoreStockMovementByTransactionId(id);
            if (stockMovement) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Phát sinh này đã liên kết với nhập/xuất kho. Không thể hủy trực tiếp vì sẽ làm sai tồn kho; hãy dùng nghiệp vụ trả hàng hoặc điều chỉnh kho.",
                  });
            }
            if ((transaction as any).dailyClosingId) {
                  const closing = await storeLedgerDb.getStoreDailyClosingById(Number((transaction as any).dailyClosingId));
                  const canReopen = closing && ["draft", "reviewed"].includes(String(closing.status));
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: canReopen
                              ? "Khoản này đang nằm trong ngày chốt tạm. Hãy bỏ chốt ngày để bổ sung/chỉnh sửa."
                              : "Khoản này đã thuộc ngày xác nhận chốt sổ, không thể xóa trực tiếp.",
                  });
            }
            return storeLedgerDb.softDeleteStoreLedgerTransaction(id);
      },
};
