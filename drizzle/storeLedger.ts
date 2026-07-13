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

export const storeDailyClosings = mysqlTable(
      "storeDailyClosings",
      {
            id: int("id").autoincrement().primaryKey(),
            ledgerId: int("ledgerId").notNull().references(() => storeLedgers.id, { onDelete: "restrict" }),
            closingCode: varchar("closingCode", { length: 50 }).notNull(),
            closingDate: date("closingDate").notNull(),
            totalIn: decimal("totalIn", { precision: 14, scale: 2 }).default("0.00").notNull(),
            totalOut: decimal("totalOut", { precision: 14, scale: 2 }).default("0.00").notNull(),
            netAmount: decimal("netAmount", { precision: 14, scale: 2 }).default("0.00").notNull(),
            transactionCount: int("transactionCount").default(0).notNull(),
            status: mysqlEnum("status", ["draft", "reviewed", "approved", "cancelled", "closed"]).default("draft").notNull(),
            reviewedBy: int("reviewedBy").references(() => users.id, { onDelete: "set null" }),
            reviewedAt: timestamp("reviewedAt"),
            approvedBy: int("approvedBy").references(() => users.id, { onDelete: "set null" }),
            approvedAt: timestamp("approvedAt"),
            postedToFinance: boolean("postedToFinance").default(false).notNull(),
            financeBatchId: varchar("financeBatchId", { length: 100 }),
            notes: text("notes"),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            ledgerDateUnique: unique("storeDailyClosings_ledger_date_unique").on(table.ledgerId, table.closingDate),
            ledgerIdx: index("storeDailyClosings_ledger_idx").on(table.ledgerId),
            dateIdx: index("storeDailyClosings_date_idx").on(table.closingDate),
            statusIdx: index("storeDailyClosings_status_idx").on(table.status),
      }),
);


export const storeProducts = mysqlTable(
      "storeProducts",
      {
            id: int("id").autoincrement().primaryKey(),
            productCode: varchar("productCode", { length: 50 }).notNull(),
            productName: varchar("productName", { length: 255 }).notNull(),
            category: varchar("category", { length: 100 }).default("general"),
            unit: varchar("unit", { length: 50 }).default("cái").notNull(),
            defaultCostPrice: decimal("defaultCostPrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            defaultSalePrice: decimal("defaultSalePrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            minStock: decimal("minStock", { precision: 14, scale: 2 }).default("0.00").notNull(),
            currentStock: decimal("currentStock", { precision: 14, scale: 2 }).default("0.00").notNull(),
            description: text("description"),
            isActive: boolean("isActive").default(true).notNull(),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            codeUnique: unique("storeProducts_productCode_unique").on(table.productCode),
            activeIdx: index("storeProducts_active_idx").on(table.isActive),
            categoryIdx: index("storeProducts_category_idx").on(table.category),
      }),
);

export const storeLedgerTransactions = mysqlTable(
      "storeLedgerTransactions",
      {
            id: int("id").autoincrement().primaryKey(),
            ledgerId: int("ledgerId").notNull().references(() => storeLedgers.id, { onDelete: "restrict" }),
            dailyClosingId: int("dailyClosingId").references(() => storeDailyClosings.id, { onDelete: "set null" }),
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
            closingIdx: index("storeLedgerTransactions_closing_idx").on(table.dailyClosingId),
            dateIdx: index("storeLedgerTransactions_date_idx").on(table.transactionDate),
            directionIdx: index("storeLedgerTransactions_direction_idx").on(table.direction),
            codeUnique: unique("storeLedgerTransactions_code_unique").on(table.transactionCode),
      }),
);

export type StoreLedger = typeof storeLedgers.$inferSelect;
export type InsertStoreLedger = typeof storeLedgers.$inferInsert;
export type StoreDailyClosing = typeof storeDailyClosings.$inferSelect;
export type InsertStoreDailyClosing = typeof storeDailyClosings.$inferInsert;
export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;
export type StoreLedgerTransaction = typeof storeLedgerTransactions.$inferSelect;
export type InsertStoreLedgerTransaction = typeof storeLedgerTransactions.$inferInsert;
