import { and, desc, eq, gte, isNull, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
      storeDailyClosings,
      storeLedgers,
      storeProducts,
      storeProductCostHistories,
      storeProductSalePriceHistories,
      storeLedgerTransactions,
      storeStockMovements,
      type InsertStoreDailyClosing,
      type InsertStoreLedger,
      type InsertStoreProduct,
      type InsertStoreProductCostHistory,
      type InsertStoreProductSalePriceHistory,
      type InsertStoreLedgerTransaction,
      type InsertStoreStockMovement,
} from "../../drizzle/schema";


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
