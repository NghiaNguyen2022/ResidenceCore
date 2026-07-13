import { mysqlTable, int, varchar, text, timestamp, boolean, date, mysqlEnum, decimal, index, unique } from "drizzle-orm/mysql-core";
import { users } from "./core";

// Keep column names explicit. Do not reuse a mysqlEnum builder with a generic name,
// because Drizzle uses the enum builder name as the SQL column name.
export const storeLedgers = mysqlTable(
      "storeLedgers",
      {
            id: int("id").autoincrement().primaryKey(),
            ledgerCode: varchar("ledgerCode", { length: 50 }).notNull(),
            ledgerName: varchar("ledgerName", { length: 255 }).notNull(),
            ledgerType: mysqlEnum("ledgerType", ["store", "fund", "other"]).default("store").notNull(),
            openingBalance: decimal("openingBalance", { precision: 14, scale: 2 }).default("0.00").notNull(),
            description: text("description"),
            isActive: boolean("isActive").default(true).notNull(),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            codeUnique: unique("storeLedgers_ledgerCode_unique").on(table.ledgerCode),
            activeIdx: index("storeLedgers_active_idx").on(table.isActive),
      }),
);

export const storeLedgerTransactions = mysqlTable(
      "storeLedgerTransactions",
      {
            id: int("id").autoincrement().primaryKey(),
            ledgerId: int("ledgerId").notNull().references(() => storeLedgers.id, { onDelete: "restrict" }),
            transactionCode: varchar("transactionCode", { length: 50 }).notNull(),
            direction: mysqlEnum("direction", ["in", "out"]).notNull(),
            transactionDate: date("transactionDate").notNull(),
            amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
            category: varchar("category", { length: 100 }),
            title: varchar("title", { length: 255 }).notNull(),
            partnerName: varchar("partnerName", { length: 255 }),
            paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
            description: text("description"),
            status: mysqlEnum("status", ["posted", "cancelled"]).default("posted").notNull(),
            isActive: boolean("isActive").default(true).notNull(),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            ledgerIdx: index("storeLedgerTransactions_ledger_idx").on(table.ledgerId),
            dateIdx: index("storeLedgerTransactions_date_idx").on(table.transactionDate),
            directionIdx: index("storeLedgerTransactions_direction_idx").on(table.direction),
            codeUnique: unique("storeLedgerTransactions_code_unique").on(table.transactionCode),
      }),
);

export type StoreLedger = typeof storeLedgers.$inferSelect;
export type InsertStoreLedger = typeof storeLedgers.$inferInsert;
export type StoreLedgerTransaction = typeof storeLedgerTransactions.$inferSelect;
export type InsertStoreLedgerTransaction = typeof storeLedgerTransactions.$inferInsert;
