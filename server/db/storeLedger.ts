import { and, desc, eq, gte, isNull, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
      storeDailyClosings,
      storeLedgers,
      storeProducts,
      storeProductCostHistories,
      storeProductSalePriceHistories,
      storeLedgerTransactions,
      storeDocuments,
      storeDocumentLines,
      storeStockMovements,
      storeDutyAssignments,
      storeDutyMembers,
      storeShifts,
      storeDutyAccessSessions,
      storeShiftHandovers,
      type InsertStoreDailyClosing,
      type InsertStoreLedger,
      type InsertStoreProduct,
      type InsertStoreProductCostHistory,
      type InsertStoreProductSalePriceHistory,
      type InsertStoreLedgerTransaction,
      type InsertStoreDocument,
      type InsertStoreDocumentLine,
      type InsertStoreStockMovement,
      type InsertStoreDutyAssignment,
      type InsertStoreDutyMember,
      type InsertStoreShift,
      type InsertStoreDutyAccessSession,
      type InsertStoreShiftHandover,
} from "../../drizzle/storeLedger";


export type StoreProductListInput = {
      search?: string | null;
      category?: string | null;
      isActive?: boolean | null;
      lowStockOnly?: boolean | null;
};

export type StoreStockMovementListInput = {
      fromDate?: string | null;
      toDate?: string | null;
      movementTypes?: Array<"purchase" | "production_in" | "self_supply_in" | "other_in" | "sale" | "adjustment_in" | "adjustment_out" | "return"> | null;
      limit?: number;
      offset?: number;
};

export type StoreDocumentListInput = {
      ledgerId?: number | null;
      documentType?: "stock_in" | "sale" | null;
      fromDate?: string | null;
      toDate?: string | null;
      search?: string | null;
      limit?: number;
      offset?: number;
};

export type StoreLedgerListInput = {
      search?: string | null;
      isActive?: boolean | null;
};


export type StoreDailyClosingListInput = {
      ledgerId?: number | null;
      fromDate?: string | null;
      toDate?: string | null;
      limit?: number;
      offset?: number;
};

export type StoreLedgerTransactionListInput = {
      ledgerId?: number | null;
      direction?: "in" | "out" | "all" | null;
      fromDate?: string | null;
      toDate?: string | null;
      search?: string | null;
      limit?: number;
      offset?: number;
};

async function dbOrThrow() {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db;
}


export async function listStoreProducts(input: StoreProductListInput = {}) {
      const db = await dbOrThrow();
      const conditions = [];

      if (input.isActive !== null && input.isActive !== undefined) {
            conditions.push(eq(storeProducts.isActive, input.isActive));
      }
      if (input.category && input.category !== "all") {
            conditions.push(eq(storeProducts.category, input.category));
      }
      if (input.lowStockOnly) {
            conditions.push(sql`${storeProducts.currentStock} <= ${storeProducts.minStock}` as any);
      }

      const search = input.search?.trim();
      if (search) {
            const keyword = `%${search}%`;
            conditions.push(or(like(storeProducts.productCode, keyword), like(storeProducts.productName, keyword), like(storeProducts.category, keyword)));
      }

      return db
            .select()
            .from(storeProducts)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(storeProducts.updatedAt), desc(storeProducts.id));
}

export async function getStoreProductById(id: number) {
      const db = await dbOrThrow();
      const rows = await db.select().from(storeProducts).where(eq(storeProducts.id, id)).limit(1);
      return rows[0] ?? null;
}

export async function getStoreProductByCode(productCode: string) {
      const db = await dbOrThrow();
      const rows = await db.select().from(storeProducts).where(eq(storeProducts.productCode, productCode)).limit(1);
      return rows[0] ?? null;
}

export async function listStoreProductCostHistories(productId: number) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeProductCostHistories)
            .where(eq(storeProductCostHistories.productId, productId))
            .orderBy(desc(storeProductCostHistories.effectiveDate), desc(storeProductCostHistories.id));
}

export async function createStoreProductCostHistory(data: InsertStoreProductCostHistory) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeProductCostHistories).values(data);
      return result;
}

export async function listStoreProductSalePriceHistories(productId: number) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeProductSalePriceHistories)
            .where(eq(storeProductSalePriceHistories.productId, productId))
            .orderBy(desc(storeProductSalePriceHistories.effectiveDate), desc(storeProductSalePriceHistories.id));
}

export async function getActiveStoreProductSalePrice(productId: number, effectiveDate: string) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeProductSalePriceHistories)
            .where(and(eq(storeProductSalePriceHistories.productId, productId), lte(storeProductSalePriceHistories.effectiveDate, effectiveDate)))
            .orderBy(desc(storeProductSalePriceHistories.effectiveDate), desc(storeProductSalePriceHistories.id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreProductSalePriceHistoryByDate(productId: number, effectiveDate: string) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeProductSalePriceHistories)
            .where(and(eq(storeProductSalePriceHistories.productId, productId), eq(storeProductSalePriceHistories.effectiveDate, effectiveDate)))
            .limit(1);
      return rows[0] ?? null;
}


export async function upsertStoreProductSalePriceHistoryByDate(data: {
      productId: number;
      effectiveDate: string;
      salePrice: string;
      reason?: "cost_increase" | "overhead_increase" | "market_adjustment" | "promotion" | "manual" | "other" | null;
      notes?: string | null;
      createdBy?: number | null;
}) {
      const db = await dbOrThrow();

      // Lịch sử giá bán là nhật ký thay đổi giá, không ghi đè theo ngày.
      // Cho phép một sản phẩm có nhiều lần cập nhật giá trong cùng ngày để lưu đúng lịch sử.
      await db.insert(storeProductSalePriceHistories).values({
            productId: data.productId,
            effectiveDate: data.effectiveDate,
            salePrice: data.salePrice,
            reason: data.reason ?? "manual",
            notes: data.notes?.trim() || null,
            createdBy: data.createdBy ?? null,
      } as any);
}

export async function createStoreProductSalePriceHistory(data: InsertStoreProductSalePriceHistory) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeProductSalePriceHistories).values(data);
      return result;
}

export async function updateStoreProductSalePriceHistory(id: number, data: Partial<InsertStoreProductSalePriceHistory>) {
      const db = await dbOrThrow();
      await db.update(storeProductSalePriceHistories).set(data).where(eq(storeProductSalePriceHistories.id, id));
      return id;
}

export async function createStoreProduct(data: InsertStoreProduct) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeProducts).values(data);
      const insertId = result?.insertId;
      return insertId ? getStoreProductById(Number(insertId)) : result;
}

export async function updateStoreProduct(id: number, data: Partial<InsertStoreProduct>) {
      const db = await dbOrThrow();
      await db.update(storeProducts).set(data).where(eq(storeProducts.id, id));
      return getStoreProductById(id);
}

export async function softDeleteStoreProduct(id: number) {
      const db = await dbOrThrow();
      await db.update(storeProducts).set({ isActive: false } as any).where(eq(storeProducts.id, id));
      return getStoreProductById(id);
}

export async function hasStoreProductUsage(id: number) {
      const product = await getStoreProductById(id);
      if (!product) return false;
      // In the current lite version, product-level purchase/sale lines are introduced in the next step.
      // Until then, existing stock is the practical blocker for deleting a product.
      return Number(product.currentStock || 0) > 0;
}


export async function addStoreProductStock(input: {
      productId: number;
      quantity: number;
      unitCost: number;
      averageCostAfter: number;
}) {
      const db = await dbOrThrow();
      await db
            .update(storeProducts)
            .set({
                  currentStock: sql`${storeProducts.currentStock} + ${input.quantity}`,
                  defaultCostPrice: String(Number(input.unitCost || 0).toFixed(2)),
                  averageCostPrice: String(Number(input.averageCostAfter || 0).toFixed(2)),
            } as any)
            .where(eq(storeProducts.id, input.productId));
      return getStoreProductById(input.productId);
}

export async function subtractStoreProductStock(input: {
      productId: number;
      quantity: number;
}) {
      const db = await dbOrThrow();
      const [result]: any = await db
            .update(storeProducts)
            .set({
                  currentStock: sql`${storeProducts.currentStock} - ${input.quantity}`,
            } as any)
            .where(
                  and(
                        eq(storeProducts.id, input.productId),
                        sql`${storeProducts.currentStock} >= ${input.quantity}` as any,
                  ),
            );

      const affectedRows = Number(result?.affectedRows ?? result?.rowsAffected ?? 0);
      if (affectedRows <= 0) return null;
      return getStoreProductById(input.productId);
}

export async function createStoreStockMovement(data: InsertStoreStockMovement) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeStockMovements).values(data);
      return result;
}

export async function getStoreStockMovementByTransactionId(transactionId: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeStockMovements)
            .where(eq(storeStockMovements.transactionId, transactionId))
            .limit(1);
      return rows[0] ?? null;
}

export async function listStoreStockMovementsByProduct(productId: number) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeStockMovements)
            .where(eq(storeStockMovements.productId, productId))
            .orderBy(desc(storeStockMovements.movementDate), desc(storeStockMovements.id));
}

export async function listStoreStockMovements(input: StoreStockMovementListInput = {}) {
      const db = await dbOrThrow();
      const conditions = [];
      if (input.fromDate) conditions.push(gte(storeStockMovements.movementDate, input.fromDate));
      if (input.toDate) conditions.push(lte(storeStockMovements.movementDate, input.toDate));
      if (input.movementTypes?.length) {
            conditions.push(sql`${storeStockMovements.movementType} IN (${sql.join(input.movementTypes.map((value) => sql`${value}`), sql`, `)})` as any);
      }

      return db
            .select({
                  id: storeStockMovements.id,
                  productId: storeStockMovements.productId,
                  productName: storeProducts.productName,
                  productUnit: storeProducts.unit,
                  transactionId: storeStockMovements.transactionId,
                  documentId: storeStockMovements.documentId,
                  documentLineId: storeStockMovements.documentLineId,
                  movementType: storeStockMovements.movementType,
                  movementDate: storeStockMovements.movementDate,
                  quantityIn: storeStockMovements.quantityIn,
                  quantityOut: storeStockMovements.quantityOut,
                  unitCost: storeStockMovements.unitCost,
                  note: storeStockMovements.note,
                  createdAt: storeStockMovements.createdAt,
            })
            .from(storeStockMovements)
            .leftJoin(storeProducts, eq(storeProducts.id, storeStockMovements.productId))
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(storeStockMovements.movementDate), desc(storeStockMovements.id))
            .limit(input.limit ?? 200)
            .offset(input.offset ?? 0);
}


export async function createStoreDocument(data: InsertStoreDocument) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeDocuments).values(data);
      const insertId = Number(result?.insertId || 0);
      return insertId ? getStoreDocumentById(insertId) : result;
}

export async function createStoreDocumentLine(data: InsertStoreDocumentLine) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeDocumentLines).values(data);
      return Number(result?.insertId || 0) || result;
}

export async function updateStoreDocumentTransaction(documentId: number, ledgerTransactionId: number | null) {
      const db = await dbOrThrow();
      await db.update(storeDocuments).set({ ledgerTransactionId } as any).where(eq(storeDocuments.id, documentId));
      return getStoreDocumentById(documentId);
}

export async function getStoreDocumentById(id: number) {
      const db = await dbOrThrow();
      const documentRows = await db.select().from(storeDocuments).where(eq(storeDocuments.id, id)).limit(1);
      const document = documentRows[0] ?? null;
      if (!document) return null;
      const lines = await db
            .select({
                  id: storeDocumentLines.id,
                  documentId: storeDocumentLines.documentId,
                  productId: storeDocumentLines.productId,
                  productName: storeProducts.productName,
                  productCode: storeProducts.productCode,
                  productUnit: storeProducts.unit,
                  lineNo: storeDocumentLines.lineNo,
                  quantity: storeDocumentLines.quantity,
                  unitCost: storeDocumentLines.unitCost,
                  unitPrice: storeDocumentLines.unitPrice,
                  lineAmount: storeDocumentLines.lineAmount,
                  notes: storeDocumentLines.notes,
            })
            .from(storeDocumentLines)
            .leftJoin(storeProducts, eq(storeProducts.id, storeDocumentLines.productId))
            .where(eq(storeDocumentLines.documentId, id))
            .orderBy(storeDocumentLines.lineNo);
      return { ...document, lines };
}

export async function listStoreDocuments(input: StoreDocumentListInput = {}) {
      const db = await dbOrThrow();
      const search = input.search?.trim();

      // 1) Chứng từ nhiều dòng mới.
      const documentConditions: any[] = [];
      if (input.ledgerId) documentConditions.push(eq(storeDocuments.ledgerId, input.ledgerId));
      if (input.documentType) documentConditions.push(eq(storeDocuments.documentType, input.documentType));
      if (input.fromDate) documentConditions.push(gte(storeDocuments.documentDate, input.fromDate));
      if (input.toDate) documentConditions.push(lte(storeDocuments.documentDate, input.toDate));
      if (search) {
            const keyword = `%${search}%`;
            documentConditions.push(or(
                  like(storeDocuments.documentCode, keyword),
                  like(storeDocuments.partnerName, keyword),
                  like(storeDocuments.notes, keyword),
            ));
      }

      const persistedRows = await db
            .select()
            .from(storeDocuments)
            .where(documentConditions.length ? and(...documentConditions) : undefined)
            .orderBy(desc(storeDocuments.documentDate), desc(storeDocuments.id))
            .limit(500);

      const persistedDocuments: any[] = [];
      for (const document of persistedRows) {
            const hydrated = await getStoreDocumentById(Number(document.id));
            if (hydrated) persistedDocuments.push(hydrated);
      }

      const persistedTransactionIds = new Set(
            persistedDocuments
                  .map((document: any) => Number(document.ledgerTransactionId || 0))
                  .filter(Boolean),
      );

      // 2) Dữ liệu cũ đã hiện trong Sổ thu chi nhưng chưa có storeDocuments.
      // Lấy giao dịch làm nguồn chính để không phụ thuộc việc stock movement cũ có còn liên kết hay không.
      const transactionConditions: any[] = [
            eq(storeLedgerTransactions.isActive, true),
      ];
      // App chỉ quản lý một cửa hàng chính. Dữ liệu cũ có thể thuộc ledger được tạo
      // trước khi cơ chế tự tạo cửa hàng mặc định ra đời, nên không khóa lịch sử cũ
      // theo ledgerId hiện tại. Nếu lọc ở đây, giao dịch vẫn thấy trong Sổ thu chi
      // nhưng biến mất khỏi Lịch sử mua/bán.
      if (input.fromDate) transactionConditions.push(gte(storeLedgerTransactions.transactionDate, input.fromDate));
      if (input.toDate) transactionConditions.push(lte(storeLedgerTransactions.transactionDate, input.toDate));
      if (input.documentType === "sale") {
            transactionConditions.push(and(
                  eq(storeLedgerTransactions.direction, "in"),
                  eq(storeLedgerTransactions.category, "sales"),
            ));
      } else if (input.documentType === "stock_in") {
            transactionConditions.push(and(
                  eq(storeLedgerTransactions.direction, "out"),
                  or(
                        eq(storeLedgerTransactions.category, "purchase_stock"),
                        eq(storeLedgerTransactions.category, "purchase"),
                  ),
            ));
      }
      if (search) {
            const keyword = `%${search}%`;
            transactionConditions.push(or(
                  like(storeLedgerTransactions.transactionCode, keyword),
                  like(storeLedgerTransactions.title, keyword),
                  like(storeLedgerTransactions.partnerName, keyword),
                  like(storeLedgerTransactions.description, keyword),
            ));
      }

      const legacyTransactions = await db
            .select()
            .from(storeLedgerTransactions)
            .where(and(...transactionConditions))
            .orderBy(desc(storeLedgerTransactions.transactionDate), desc(storeLedgerTransactions.id))
            .limit(500);

      const legacyDocuments: any[] = [];
      for (const transaction of legacyTransactions) {
            const transactionId = Number(transaction.id || 0);
            if (!transactionId || persistedTransactionIds.has(transactionId)) continue;

            const isSale = String(transaction.direction) === "in" && String(transaction.category) === "sales";
            const movements = await db
                  .select({
                        id: storeStockMovements.id,
                        productId: storeStockMovements.productId,
                        productName: storeProducts.productName,
                        productCode: storeProducts.productCode,
                        productUnit: storeProducts.unit,
                        movementType: storeStockMovements.movementType,
                        quantityIn: storeStockMovements.quantityIn,
                        quantityOut: storeStockMovements.quantityOut,
                        unitCost: storeStockMovements.unitCost,
                        note: storeStockMovements.note,
                  })
                  .from(storeStockMovements)
                  .leftJoin(storeProducts, eq(storeProducts.id, storeStockMovements.productId))
                  .where(eq(storeStockMovements.transactionId, transactionId))
                  .orderBy(storeStockMovements.id);

            const transactionAmount = Number(transaction.amount || 0);
            const lines = movements.map((movement: any, index: number) => {
                  const quantity = Number(isSale ? movement.quantityOut : movement.quantityIn) || 0;
                  const unitCost = Number(movement.unitCost || 0);
                  const unitPrice = isSale && quantity > 0
                        ? transactionAmount / Math.max(1, movements.reduce((sum: number, item: any) => sum + Number(item.quantityOut || 0), 0))
                        : 0;
                  return {
                        id: `legacy-line-${transactionId}-${movement.id}`,
                        documentId: `legacy-tx-${transactionId}`,
                        productId: Number(movement.productId || 0),
                        productName: movement.productName || "Hàng hóa",
                        productCode: movement.productCode || "",
                        productUnit: movement.productUnit || "",
                        lineNo: index + 1,
                        quantity: String(quantity.toFixed(2)),
                        unitCost: String(unitCost.toFixed(2)),
                        unitPrice: String(unitPrice.toFixed(2)),
                        lineAmount: String((isSale ? quantity * unitPrice : quantity * unitCost).toFixed(2)),
                        notes: movement.note || null,
                  };
            });

            const totalQuantity = lines.reduce((sum: number, line: any) => sum + Number(line.quantity || 0), 0);
            legacyDocuments.push({
                  id: `legacy-tx-${transactionId}`,
                  legacyTransactionId: transactionId,
                  ledgerId: Number(transaction.ledgerId || 0),
                  ledgerTransactionId: transactionId,
                  documentCode: transaction.transactionCode || `${isSale ? "BH" : "NH"}-CU-${transactionId}`,
                  documentType: isSale ? "sale" : "stock_in",
                  documentDate: transaction.transactionDate,
                  stockInSource: isSale ? null : "purchase",
                  partnerName: transaction.partnerName || null,
                  paymentMethod: transaction.paymentMethod || "cash",
                  totalQuantity: String(totalQuantity.toFixed(2)),
                  totalAmount: String(transactionAmount.toFixed(2)),
                  notes: transaction.description || transaction.title || null,
                  status: transaction.status || "posted",
                  createdBy: transaction.createdBy || null,
                  createdAt: transaction.createdAt,
                  updatedAt: transaction.updatedAt || transaction.createdAt,
                  isLegacy: true,
                  lines,
            });
      }

      // 3) Nhập nội bộ cũ không tạo giao dịch thu/chi: lấy trực tiếp từ stock movement.
      if (!input.documentType || input.documentType === "stock_in") {
            const movementConditions: any[] = [
                  isNull(storeStockMovements.documentId),
                  isNull(storeStockMovements.transactionId),
                  or(
                        eq(storeStockMovements.movementType, "production_in" as any),
                        eq(storeStockMovements.movementType, "self_supply_in" as any),
                        eq(storeStockMovements.movementType, "other_in" as any),
                  ),
            ];
            if (input.fromDate) movementConditions.push(gte(storeStockMovements.movementDate, input.fromDate));
            if (input.toDate) movementConditions.push(lte(storeStockMovements.movementDate, input.toDate));

            const internalRows = await db
                  .select({
                        id: storeStockMovements.id,
                        productId: storeStockMovements.productId,
                        productName: storeProducts.productName,
                        productCode: storeProducts.productCode,
                        productUnit: storeProducts.unit,
                        movementType: storeStockMovements.movementType,
                        movementDate: storeStockMovements.movementDate,
                        quantityIn: storeStockMovements.quantityIn,
                        unitCost: storeStockMovements.unitCost,
                        note: storeStockMovements.note,
                        createdBy: storeStockMovements.createdBy,
                        createdAt: storeStockMovements.createdAt,
                  })
                  .from(storeStockMovements)
                  .leftJoin(storeProducts, eq(storeProducts.id, storeStockMovements.productId))
                  .where(and(...movementConditions))
                  .orderBy(desc(storeStockMovements.movementDate), desc(storeStockMovements.id))
                  .limit(300);

            for (const row of internalRows as any[]) {
                  const haystack = `${row.productName || ""} ${row.productCode || ""} ${row.note || ""}`.toLowerCase();
                  if (search && !haystack.includes(search.toLowerCase())) continue;
                  const quantity = Number(row.quantityIn || 0);
                  const unitCost = Number(row.unitCost || 0);
                  const source = row.movementType === "production_in"
                        ? "production"
                        : row.movementType === "self_supply_in"
                              ? "self_supply"
                              : "other";
                  legacyDocuments.push({
                        id: `legacy-movement-${row.id}`,
                        legacyMovementId: Number(row.id),
                        ledgerId: Number(input.ledgerId || 0),
                        ledgerTransactionId: null,
                        documentCode: `NH-CU-${row.id}`,
                        documentType: "stock_in",
                        documentDate: row.movementDate,
                        stockInSource: source,
                        partnerName: null,
                        paymentMethod: "other",
                        totalQuantity: String(quantity.toFixed(2)),
                        totalAmount: String((quantity * unitCost).toFixed(2)),
                        notes: row.note || null,
                        status: "posted",
                        createdBy: row.createdBy || null,
                        createdAt: row.createdAt,
                        updatedAt: row.createdAt,
                        isLegacy: true,
                        lines: [{
                              id: `legacy-line-${row.id}`,
                              documentId: `legacy-movement-${row.id}`,
                              productId: Number(row.productId || 0),
                              productName: row.productName || "Hàng hóa",
                              productCode: row.productCode || "",
                              productUnit: row.productUnit || "",
                              lineNo: 1,
                              quantity: String(quantity.toFixed(2)),
                              unitCost: String(unitCost.toFixed(2)),
                              unitPrice: "0.00",
                              lineAmount: String((quantity * unitCost).toFixed(2)),
                              notes: row.note || null,
                        }],
                  });
            }
      }

      const combined = [...persistedDocuments, ...legacyDocuments]
            .filter((document: any) => !input.documentType || document.documentType === input.documentType)
            .sort((left: any, right: any) => {
                  const dateCompare = String(right.documentDate || "").localeCompare(String(left.documentDate || ""));
                  if (dateCompare !== 0) return dateCompare;
                  return String(right.createdAt || right.id).localeCompare(String(left.createdAt || left.id));
            });

      const offset = input.offset ?? 0;
      const limit = input.limit ?? 200;
      return combined.slice(offset, offset + limit);
}

export async function listStoreLedgers(input: StoreLedgerListInput = {}) {
      const db = await dbOrThrow();
      const conditions = [];

      if (input.isActive !== null && input.isActive !== undefined) {
            conditions.push(eq(storeLedgers.isActive, input.isActive));
      }

      const search = input.search?.trim();
      if (search) {
            const keyword = `%${search}%`;
            conditions.push(or(like(storeLedgers.ledgerCode, keyword), like(storeLedgers.ledgerName, keyword)));
      }

      return db
            .select()
            .from(storeLedgers)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(storeLedgers.updatedAt));
}

export async function getStoreLedgerById(id: number) {
      const db = await dbOrThrow();
      const rows = await db.select().from(storeLedgers).where(eq(storeLedgers.id, id)).limit(1);
      return rows[0] ?? null;
}

export async function getStoreLedgerByCode(ledgerCode: string) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeLedgers)
            .where(eq(storeLedgers.ledgerCode, ledgerCode))
            .limit(1);
      return rows[0] ?? null;
}

export async function createStoreLedger(data: InsertStoreLedger) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeLedgers).values(data);
      const insertId = result?.insertId;
      return insertId ? getStoreLedgerById(Number(insertId)) : result;
}

export async function updateStoreLedger(id: number, data: Partial<InsertStoreLedger>) {
      const db = await dbOrThrow();
      await db.update(storeLedgers).set(data).where(eq(storeLedgers.id, id));
      return getStoreLedgerById(id);
}

export async function listStoreLedgerTransactions(input: StoreLedgerTransactionListInput = {}) {
      const db = await dbOrThrow();
      const conditions = [eq(storeLedgerTransactions.isActive, true)];

      if (input.ledgerId) conditions.push(eq(storeLedgerTransactions.ledgerId, input.ledgerId));
      if (input.direction && input.direction !== "all") conditions.push(eq(storeLedgerTransactions.direction, input.direction));
      if (input.fromDate) conditions.push(gte(storeLedgerTransactions.transactionDate, input.fromDate));
      if (input.toDate) conditions.push(lte(storeLedgerTransactions.transactionDate, input.toDate));

      const search = input.search?.trim();
      if (search) {
            const keyword = `%${search}%`;
            conditions.push(
                  or(
                        like(storeLedgerTransactions.transactionCode, keyword),
                        like(storeLedgerTransactions.title, keyword),
                        like(storeLedgerTransactions.category, keyword),
                        like(storeLedgerTransactions.partnerName, keyword),
                  ),
            );
      }

      return db
            .select()
            .from(storeLedgerTransactions)
            .where(and(...conditions))
            .orderBy(desc(storeLedgerTransactions.transactionDate), desc(storeLedgerTransactions.id))
            .limit(input.limit ?? 200)
            .offset(input.offset ?? 0);
}

export async function getStoreLedgerTransactionById(id: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeLedgerTransactions)
            .where(eq(storeLedgerTransactions.id, id))
            .limit(1);
      return rows[0] ?? null;
}

export async function listStoreLedgerTransactionsByClosing(closingId: number) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeLedgerTransactions)
            .where(and(eq(storeLedgerTransactions.dailyClosingId, closingId), eq(storeLedgerTransactions.isActive, true)))
            .orderBy(desc(storeLedgerTransactions.id));
}

export async function createStoreLedgerTransaction(data: InsertStoreLedgerTransaction) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeLedgerTransactions).values(data);
      const insertId = result?.insertId;
      return insertId ? getStoreLedgerTransactionById(Number(insertId)) : result;
}

export async function updateStoreLedgerTransaction(id: number, data: Partial<InsertStoreLedgerTransaction>) {
      const db = await dbOrThrow();
      await db.update(storeLedgerTransactions).set(data).where(eq(storeLedgerTransactions.id, id));
      return getStoreLedgerTransactionById(id);
}

export async function softDeleteStoreLedgerTransaction(id: number) {
      return updateStoreLedgerTransaction(id, { isActive: false } as any);
}

export async function getStoreLedgerSummary(input: { ledgerId?: number | null; fromDate?: string | null; toDate?: string | null } = {}) {
      const db = await dbOrThrow();
      const conditions = [eq(storeLedgerTransactions.isActive, true), eq(storeLedgerTransactions.status, "posted" as any)];

      if (input.ledgerId) conditions.push(eq(storeLedgerTransactions.ledgerId, input.ledgerId));
      if (input.fromDate) conditions.push(gte(storeLedgerTransactions.transactionDate, input.fromDate));
      if (input.toDate) conditions.push(lte(storeLedgerTransactions.transactionDate, input.toDate));

      const rows = await db
            .select({
                  totalIn: sql<string>`COALESCE(SUM(CASE WHEN ${storeLedgerTransactions.direction} = 'in' THEN ${storeLedgerTransactions.amount} ELSE 0 END), 0)`,
                  totalOut: sql<string>`COALESCE(SUM(CASE WHEN ${storeLedgerTransactions.direction} = 'out' THEN ${storeLedgerTransactions.amount} ELSE 0 END), 0)`,
                  transactionCount: sql<number>`COUNT(*)`,
            })
            .from(storeLedgerTransactions)
            .where(and(...conditions));

      const summary = rows[0] ?? { totalIn: "0", totalOut: "0", transactionCount: 0 };
      const totalIn = Number(summary.totalIn || 0);
      const totalOut = Number(summary.totalOut || 0);
      return {
            totalIn,
            totalOut,
            balance: totalIn - totalOut,
            transactionCount: Number(summary.transactionCount || 0),
      };
}


export async function listStoreDailyClosings(input: StoreDailyClosingListInput = {}) {
      const db = await dbOrThrow();
      const conditions = [];

      if (input.ledgerId) conditions.push(eq(storeDailyClosings.ledgerId, input.ledgerId));
      if (input.fromDate) conditions.push(gte(storeDailyClosings.closingDate, input.fromDate));
      if (input.toDate) conditions.push(lte(storeDailyClosings.closingDate, input.toDate));

      return db
            .select()
            .from(storeDailyClosings)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(storeDailyClosings.closingDate), desc(storeDailyClosings.id))
            .limit(input.limit ?? 60)
            .offset(input.offset ?? 0);
}

export async function getStoreDailyClosingById(id: number) {
      const db = await dbOrThrow();
      const rows = await db.select().from(storeDailyClosings).where(eq(storeDailyClosings.id, id)).limit(1);
      return rows[0] ?? null;
}

export async function getStoreDailyClosingByDate(ledgerId: number, closingDate: string) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDailyClosings)
            .where(and(eq(storeDailyClosings.ledgerId, ledgerId), eq(storeDailyClosings.closingDate, closingDate)))
            .limit(1);
      return rows[0] ?? null;
}

export async function createStoreDailyClosing(data: InsertStoreDailyClosing) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeDailyClosings).values(data);
      const insertId = result?.insertId;
      return insertId ? getStoreDailyClosingById(Number(insertId)) : result;
}

export async function updateStoreDailyClosing(id: number, data: Partial<InsertStoreDailyClosing>) {
      const db = await dbOrThrow();
      await db.update(storeDailyClosings).set(data).where(eq(storeDailyClosings.id, id));
      return getStoreDailyClosingById(id);
}

export async function listUnclosedStoreLedgerTransactions(input: { ledgerId: number; closingDate: string }) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeLedgerTransactions)
            .where(
                  and(
                        eq(storeLedgerTransactions.ledgerId, input.ledgerId),
                        eq(storeLedgerTransactions.transactionDate, input.closingDate),
                        eq(storeLedgerTransactions.isActive, true),
                        eq(storeLedgerTransactions.status, "posted" as any),
                        isNull(storeLedgerTransactions.dailyClosingId),
                  ),
            )
            .orderBy(desc(storeLedgerTransactions.id));
}

export async function getUnclosedStoreLedgerSummary(input: { ledgerId: number; closingDate: string }) {
      const db = await dbOrThrow();
      const rows = await db
            .select({
                  totalIn: sql<string>`COALESCE(SUM(CASE WHEN ${storeLedgerTransactions.direction} = 'in' THEN ${storeLedgerTransactions.amount} ELSE 0 END), 0)`,
                  totalOut: sql<string>`COALESCE(SUM(CASE WHEN ${storeLedgerTransactions.direction} = 'out' THEN ${storeLedgerTransactions.amount} ELSE 0 END), 0)`,
                  transactionCount: sql<number>`COUNT(*)`,
            })
            .from(storeLedgerTransactions)
            .where(
                  and(
                        eq(storeLedgerTransactions.ledgerId, input.ledgerId),
                        eq(storeLedgerTransactions.transactionDate, input.closingDate),
                        eq(storeLedgerTransactions.isActive, true),
                        eq(storeLedgerTransactions.status, "posted" as any),
                        isNull(storeLedgerTransactions.dailyClosingId),
                  ),
            );

      const summary = rows[0] ?? { totalIn: "0", totalOut: "0", transactionCount: 0 };
      const totalIn = Number(summary.totalIn || 0);
      const totalOut = Number(summary.totalOut || 0);
      return {
            totalIn,
            totalOut,
            balance: totalIn - totalOut,
            transactionCount: Number(summary.transactionCount || 0),
      };
}

export async function markStoreLedgerTransactionsClosed(input: { ledgerId: number; closingDate: string; closingId: number }) {
      const db = await dbOrThrow();
      await db
            .update(storeLedgerTransactions)
            .set({ dailyClosingId: input.closingId } as any)
            .where(
                  and(
                        eq(storeLedgerTransactions.ledgerId, input.ledgerId),
                        eq(storeLedgerTransactions.transactionDate, input.closingDate),
                        eq(storeLedgerTransactions.isActive, true),
                        eq(storeLedgerTransactions.status, "posted" as any),
                        isNull(storeLedgerTransactions.dailyClosingId),
                  ),
            );
}


export async function clearStoreLedgerTransactionsClosing(closingId: number) {
      const db = await dbOrThrow();
      await db
            .update(storeLedgerTransactions)
            .set({ dailyClosingId: null } as any)
            .where(eq(storeLedgerTransactions.dailyClosingId, closingId));
}

// ============================================================================
// STORE DUTY / SHIFT FOUNDATION (16L1)
// Các hàm này chỉ tạo nền dữ liệu. Chưa thay quyền hoặc luồng Cửa hàng hiện tại.
// ============================================================================

export async function createStoreDutyAssignment(data: InsertStoreDutyAssignment) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeDutyAssignments).values(data);
      const insertId = Number(result?.insertId || 0);
      return insertId ? getStoreDutyAssignmentById(insertId) : result;
}

export async function getStoreDutyAssignmentById(id: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAssignments)
            .where(eq(storeDutyAssignments.id, id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreDutyAssignmentByDutyAssignmentId(dutyAssignmentId: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAssignments)
            .where(eq(storeDutyAssignments.dutyAssignmentId, dutyAssignmentId))
            .limit(1);
      return rows[0] ?? null;
}

export async function updateStoreDutyAssignment(
      id: number,
      data: Partial<InsertStoreDutyAssignment>,
) {
      const db = await dbOrThrow();
      await db
            .update(storeDutyAssignments)
            .set(data)
            .where(eq(storeDutyAssignments.id, id));
      return getStoreDutyAssignmentById(id);
}

export async function replaceStoreDutyMembers(
      storeDutyAssignmentId: number,
      members: Array<{
            residentId: number;
            memberRole?: "primary" | "assistant" | "receiver";
            status?: "assigned" | "confirmed" | "completed" | "cancelled";
      }>,
) {
      const db = await dbOrThrow();
      await db
            .delete(storeDutyMembers)
            .where(eq(storeDutyMembers.storeDutyAssignmentId, storeDutyAssignmentId));

      if (members.length) {
            await db.insert(storeDutyMembers).values(
                  members.map((member) => ({
                        storeDutyAssignmentId,
                        residentId: member.residentId,
                        memberRole: member.memberRole ?? "assistant",
                        status: member.status ?? "assigned",
                  })) as InsertStoreDutyMember[],
            );
      }

      return listStoreDutyMembers(storeDutyAssignmentId);
}

export async function listStoreDutyMembers(storeDutyAssignmentId: number) {
      const db = await dbOrThrow();
      return db
            .select()
            .from(storeDutyMembers)
            .where(eq(storeDutyMembers.storeDutyAssignmentId, storeDutyAssignmentId))
            .orderBy(storeDutyMembers.id);
}

export async function createStoreShift(data: InsertStoreShift) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeShifts).values(data);
      const insertId = Number(result?.insertId || 0);
      return insertId ? getStoreShiftById(insertId) : result;
}

export async function getStoreShiftById(id: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeShifts)
            .where(eq(storeShifts.id, id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreShiftByAssignmentId(storeDutyAssignmentId: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeShifts)
            .where(eq(storeShifts.storeDutyAssignmentId, storeDutyAssignmentId))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreShiftByLedgerDateType(input: {
      ledgerId: number;
      shiftDate: string;
      shiftType: "morning" | "afternoon";
}) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeShifts)
            .where(
                  and(
                        eq(storeShifts.ledgerId, input.ledgerId),
                        eq(storeShifts.shiftDate, input.shiftDate),
                        eq(storeShifts.shiftType, input.shiftType),
                  ),
            )
            .limit(1);
      return rows[0] ?? null;
}

export async function updateStoreShift(id: number, data: Partial<InsertStoreShift>) {
      const db = await dbOrThrow();
      await db.update(storeShifts).set(data).where(eq(storeShifts.id, id));
      return getStoreShiftById(id);
}

export async function createStoreDutyAccessSession(
      data: InsertStoreDutyAccessSession,
) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeDutyAccessSessions).values(data);
      const insertId = Number(result?.insertId || 0);
      return insertId ? getStoreDutyAccessSessionById(insertId) : result;
}

export async function getStoreDutyAccessSessionById(id: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAccessSessions)
            .where(eq(storeDutyAccessSessions.id, id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getActiveStoreDutyAccessSession(input: {
      storeShiftId: number;
      residentId: number;
}) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAccessSessions)
            .where(
                  and(
                        eq(storeDutyAccessSessions.storeShiftId, input.storeShiftId),
                        eq(storeDutyAccessSessions.residentId, input.residentId),
                        eq(storeDutyAccessSessions.status, "active"),
                  ),
            )
            .orderBy(desc(storeDutyAccessSessions.id))
            .limit(1);
      return rows[0] ?? null;
}


export async function getLatestStoreDutyAccessSession(input: {
      storeShiftId: number;
      residentId: number;
}) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAccessSessions)
            .where(
                  and(
                        eq(storeDutyAccessSessions.storeShiftId, input.storeShiftId),
                        eq(storeDutyAccessSessions.residentId, input.residentId),
                  ),
            )
            .orderBy(desc(storeDutyAccessSessions.id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getLatestPendingStoreDutyAccessSession(input: {
      storeShiftId: number;
      residentId: number;
}) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAccessSessions)
            .where(
                  and(
                        eq(storeDutyAccessSessions.storeShiftId, input.storeShiftId),
                        eq(storeDutyAccessSessions.residentId, input.residentId),
                        eq(storeDutyAccessSessions.status, "pending"),
                  ),
            )
            .orderBy(desc(storeDutyAccessSessions.id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreDutyAccessSessionByTokenHash(accessTokenHash: string) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyAccessSessions)
            .where(eq(storeDutyAccessSessions.accessTokenHash, accessTokenHash))
            .orderBy(desc(storeDutyAccessSessions.id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getStoreDutyMember(input: {
      storeDutyAssignmentId: number;
      residentId: number;
}) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeDutyMembers)
            .where(
                  and(
                        eq(storeDutyMembers.storeDutyAssignmentId, input.storeDutyAssignmentId),
                        eq(storeDutyMembers.residentId, input.residentId),
                  ),
            )
            .limit(1);
      return rows[0] ?? null;
}

export async function listStoreShiftCandidatesForResident(residentId: number) {
      const db = await dbOrThrow();
      return db
            .select({
                  storeShiftId: storeShifts.id,
                  storeDutyAssignmentId: storeShifts.storeDutyAssignmentId,
                  ledgerId: storeShifts.ledgerId,
                  ledgerName: storeLedgers.ledgerName,
                  shiftDate: storeShifts.shiftDate,
                  shiftType: storeShifts.shiftType,
                  scheduledFrom: storeShifts.scheduledFrom,
                  scheduledTo: storeShifts.scheduledTo,
                  accessValidFrom: storeShifts.accessValidFrom,
                  accessValidUntil: storeShifts.accessValidUntil,
                  shiftStatus: storeShifts.status,
                  memberRole: storeDutyMembers.memberRole,
            })
            .from(storeDutyMembers)
            .innerJoin(
                  storeDutyAssignments,
                  eq(storeDutyAssignments.id, storeDutyMembers.storeDutyAssignmentId),
            )
            .innerJoin(
                  storeShifts,
                  eq(storeShifts.storeDutyAssignmentId, storeDutyAssignments.id),
            )
            .innerJoin(storeLedgers, eq(storeLedgers.id, storeShifts.ledgerId))
            .where(
                  and(
                        eq(storeDutyMembers.residentId, residentId),
                        sql`${storeDutyMembers.status} <> 'cancelled'`,
                        sql`${storeShifts.status} NOT IN ('cancelled','confirmed','expired')`,
                        sql`${storeShifts.accessValidUntil} >= NOW()`,
                  ),
            )
            .orderBy(storeShifts.accessValidFrom, storeShifts.id);
}

export async function updateStoreDutyAccessSession(
      id: number,
      data: Partial<InsertStoreDutyAccessSession>,
) {
      const db = await dbOrThrow();
      await db
            .update(storeDutyAccessSessions)
            .set(data)
            .where(eq(storeDutyAccessSessions.id, id));
      return getStoreDutyAccessSessionById(id);
}

export async function revokeStoreDutyAccessSessions(input: {
      storeShiftId: number;
      residentId?: number | null;
      revokedAt?: Date;
}) {
      const db = await dbOrThrow();
      const conditions: any[] = [
            eq(storeDutyAccessSessions.storeShiftId, input.storeShiftId),
      ];
      if (input.residentId) {
            conditions.push(eq(storeDutyAccessSessions.residentId, input.residentId));
      }

      await db
            .update(storeDutyAccessSessions)
            .set({
                  status: "revoked",
                  revokedAt: input.revokedAt ?? new Date(),
                  sessionExpiresAt: input.revokedAt ?? new Date(),
            } as any)
            .where(and(...conditions));
}

export async function createStoreShiftHandover(data: InsertStoreShiftHandover) {
      const db = await dbOrThrow();
      const [result]: any = await db.insert(storeShiftHandovers).values(data);
      const insertId = Number(result?.insertId || 0);
      return insertId ? getStoreShiftHandoverById(insertId) : result;
}

export async function getStoreShiftHandoverById(id: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeShiftHandovers)
            .where(eq(storeShiftHandovers.id, id))
            .limit(1);
      return rows[0] ?? null;
}

export async function getLatestStoreShiftHandover(storeShiftId: number) {
      const db = await dbOrThrow();
      const rows = await db
            .select()
            .from(storeShiftHandovers)
            .where(eq(storeShiftHandovers.storeShiftId, storeShiftId))
            .orderBy(desc(storeShiftHandovers.id))
            .limit(1);
      return rows[0] ?? null;
}

export async function updateStoreShiftHandover(
      id: number,
      data: Partial<InsertStoreShiftHandover>,
) {
      const db = await dbOrThrow();
      await db
            .update(storeShiftHandovers)
            .set(data)
            .where(eq(storeShiftHandovers.id, id));
      return getStoreShiftHandoverById(id);
}

