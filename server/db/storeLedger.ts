import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
      storeLedgers,
      storeLedgerTransactions,
      type InsertStoreLedger,
      type InsertStoreLedgerTransaction,
} from "../../drizzle/schema";

export type StoreLedgerListInput = {
      search?: string | null;
      isActive?: boolean | null;
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
