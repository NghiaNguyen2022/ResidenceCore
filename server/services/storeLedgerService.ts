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

            const directionPrefix = input.direction === "in" ? "THU" : "CHI";
            const transactionCode = `${directionPrefix}-${todayCodeDate()}-${Date.now().toString().slice(-5)}`;

            return storeLedgerDb.createStoreLedgerTransaction({
                  ledgerId: input.ledgerId,
                  transactionCode,
                  direction: input.direction,
                  transactionDate: ensureDate(input.transactionDate, "Ngày phát sinh không hợp lệ."),
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
            return storeLedgerDb.updateStoreLedgerTransaction(id, { status: "cancelled" } as any);
      },

      async deleteTransaction(id: number) {
            const transaction = await storeLedgerDb.getStoreLedgerTransactionById(id);
            if (!transaction || !transaction.isActive) {
                  throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy khoản thu/chi." });
            }
            return storeLedgerDb.softDeleteStoreLedgerTransaction(id);
      },
};
