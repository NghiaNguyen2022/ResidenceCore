import { TRPCError } from "@trpc/server";
import * as storeLedgerDb from "../db/storeLedger";

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

      async createProduct(input: {
            productCode: string;
            productName: string;
            category?: string | null;
            unit?: string | null;
            defaultCostPrice?: number | null;
            defaultSalePrice?: number | null;
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
                  reviewedBy: null,
                  reviewedAt: null,
                  approvedBy: null,
                  approvedAt: null,
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

      async approveDailyClosing(id: number, approvedBy?: number | null) {
            const closing = await storeLedgerDb.getStoreDailyClosingById(id);
            if (!closing || String(closing.status) === "cancelled") {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy ngày chốt." });
            }
            if (["approved", "closed"].includes(String(closing.status))) {
                  return closing;
            }
            if (String(closing.status) !== "reviewed") {
                  throw new TRPCError({ code: "BAD_REQUEST", message: "Vui lòng review chi tiết ngày chốt trước khi xác nhận chốt." });
            }
            return storeLedgerDb.updateStoreDailyClosing(id, {
                  status: "approved",
                  approvedBy: approvedBy ?? null,
                  approvedAt: new Date(),
            } as any);
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
