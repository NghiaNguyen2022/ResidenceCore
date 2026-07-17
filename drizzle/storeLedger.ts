import { mysqlTable, int, varchar, text, mediumtext, timestamp, boolean, date, mysqlEnum, decimal, index, unique } from "drizzle-orm/mysql-core";
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
            closedBy: int("closedBy").references(() => users.id, { onDelete: "set null" }),
            closedAt: timestamp("closedAt"),
            reviewedBy: int("reviewedBy").references(() => users.id, { onDelete: "set null" }),
            reviewedAt: timestamp("reviewedAt"),
            approvedBy: int("approvedBy").references(() => users.id, { onDelete: "set null" }),
            approvedAt: timestamp("approvedAt"),
            confirmedBy: int("confirmedBy").references(() => users.id, { onDelete: "set null" }),
            confirmedAt: timestamp("confirmedAt"),
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
            sourceType: mysqlEnum("sourceType", ["purchase", "processed", "both"]).default("purchase").notNull(),
            costingMethod: mysqlEnum("costingMethod", ["weighted_average", "latest", "manual"]).default("weighted_average").notNull(),
            averageCostPrice: decimal("averageCostPrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            currentSalePrice: decimal("currentSalePrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            description: text("description"),
            imageUrl: varchar("imageUrl", { length: 1000 }),
            imageData: mediumtext("imageData"),
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


export const storeProductCostHistories = mysqlTable(
      "storeProductCostHistories",
      {
            id: int("id").autoincrement().primaryKey(),
            productId: int("productId").notNull().references(() => storeProducts.id, { onDelete: "restrict" }),
            sourceType: mysqlEnum("sourceType", ["purchase", "processed", "self_supply", "other", "manual_adjustment"]).default("purchase").notNull(),
            effectiveDate: date("effectiveDate").notNull(),
            quantity: decimal("quantity", { precision: 14, scale: 2 }).default("0.00").notNull(),
            unitCost: decimal("unitCost", { precision: 14, scale: 2 }).default("0.00").notNull(),
            averageCostAfter: decimal("averageCostAfter", { precision: 14, scale: 2 }).default("0.00").notNull(),
            reason: varchar("reason", { length: 100 }),
            notes: text("notes"),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            productIdx: index("storeProductCostHistories_product_idx").on(table.productId),
            dateIdx: index("storeProductCostHistories_date_idx").on(table.effectiveDate),
      }),
);

export const storeProductSalePriceHistories = mysqlTable(
      "storeProductSalePriceHistories",
      {
            id: int("id").autoincrement().primaryKey(),
            productId: int("productId").notNull().references(() => storeProducts.id, { onDelete: "restrict" }),
            effectiveDate: date("effectiveDate").notNull(),
            salePrice: decimal("salePrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            reason: mysqlEnum("reason", ["cost_increase", "overhead_increase", "market_adjustment", "promotion", "manual", "other"]).default("manual").notNull(),
            notes: text("notes"),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            productIdx: index("storeProductSalePriceHistories_product_idx").on(table.productId),
            dateIdx: index("storeProductSalePriceHistories_date_idx").on(table.effectiveDate),
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


export const storeDocuments = mysqlTable(
      "storeDocuments",
      {
            id: int("id").autoincrement().primaryKey(),
            ledgerId: int("ledgerId").notNull().references(() => storeLedgers.id, { onDelete: "restrict" }),
            ledgerTransactionId: int("ledgerTransactionId").references(() => storeLedgerTransactions.id, { onDelete: "set null" }),
            documentCode: varchar("documentCode", { length: 50 }).notNull(),
            documentType: mysqlEnum("documentType", ["stock_in", "sale"]).notNull(),
            documentDate: date("documentDate").notNull(),
            stockInSource: mysqlEnum("stockInSource", ["purchase", "production", "self_supply", "other"]),
            partnerName: varchar("partnerName", { length: 255 }),
            paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash"),
            totalQuantity: decimal("totalQuantity", { precision: 14, scale: 2 }).default("0.00").notNull(),
            totalAmount: decimal("totalAmount", { precision: 14, scale: 2 }).default("0.00").notNull(),
            notes: text("notes"),
            status: mysqlEnum("status", ["posted", "cancelled"]).default("posted").notNull(),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            codeUnique: unique("storeDocuments_documentCode_unique").on(table.documentCode),
            ledgerIdx: index("storeDocuments_ledger_idx").on(table.ledgerId),
            typeDateIdx: index("storeDocuments_type_date_idx").on(table.documentType, table.documentDate),
            transactionIdx: index("storeDocuments_transaction_idx").on(table.ledgerTransactionId),
      }),
);

export const storeDocumentLines = mysqlTable(
      "storeDocumentLines",
      {
            id: int("id").autoincrement().primaryKey(),
            documentId: int("documentId").notNull().references(() => storeDocuments.id, { onDelete: "cascade" }),
            productId: int("productId").notNull().references(() => storeProducts.id, { onDelete: "restrict" }),
            lineNo: int("lineNo").notNull(),
            quantity: decimal("quantity", { precision: 14, scale: 2 }).notNull(),
            unitCost: decimal("unitCost", { precision: 14, scale: 2 }).default("0.00").notNull(),
            unitPrice: decimal("unitPrice", { precision: 14, scale: 2 }).default("0.00").notNull(),
            lineAmount: decimal("lineAmount", { precision: 14, scale: 2 }).default("0.00").notNull(),
            notes: text("notes"),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
      },
      (table) => ({
            documentIdx: index("storeDocumentLines_document_idx").on(table.documentId),
            productIdx: index("storeDocumentLines_product_idx").on(table.productId),
            documentLineUnique: unique("storeDocumentLines_document_line_unique").on(table.documentId, table.lineNo),
      }),
);



export const storeStockMovements = mysqlTable(
      "storeStockMovements",
      {
            id: int("id").autoincrement().primaryKey(),
            productId: int("productId").notNull().references(() => storeProducts.id, { onDelete: "restrict" }),
            transactionId: int("transactionId").references(() => storeLedgerTransactions.id, { onDelete: "set null" }),
            documentId: int("documentId").references(() => storeDocuments.id, { onDelete: "set null" }),
            documentLineId: int("documentLineId").references(() => storeDocumentLines.id, { onDelete: "set null" }),
            movementType: mysqlEnum("movementType", ["purchase", "production_in", "self_supply_in", "other_in", "sale", "adjustment_in", "adjustment_out", "return"]).notNull(),
            movementDate: date("movementDate").notNull(),
            quantityIn: decimal("quantityIn", { precision: 14, scale: 2 }).default("0.00").notNull(),
            quantityOut: decimal("quantityOut", { precision: 14, scale: 2 }).default("0.00").notNull(),
            unitCost: decimal("unitCost", { precision: 14, scale: 2 }).default("0.00").notNull(),
            note: text("note"),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
      },
      (table) => ({
            productIdx: index("storeStockMovements_product_idx").on(table.productId),
            transactionIdx: index("storeStockMovements_transaction_idx").on(table.transactionId),
            documentIdx: index("storeStockMovements_document_idx").on(table.documentId),
            documentLineIdx: index("storeStockMovements_document_line_idx").on(table.documentLineId),
            dateIdx: index("storeStockMovements_date_idx").on(table.movementDate),
            typeIdx: index("storeStockMovements_type_idx").on(table.movementType),
      }),
);

export type StoreLedger = typeof storeLedgers.$inferSelect;
export type InsertStoreLedger = typeof storeLedgers.$inferInsert;
export type StoreDailyClosing = typeof storeDailyClosings.$inferSelect;
export type InsertStoreDailyClosing = typeof storeDailyClosings.$inferInsert;
export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;
export type StoreProductCostHistory = typeof storeProductCostHistories.$inferSelect;
export type InsertStoreProductCostHistory = typeof storeProductCostHistories.$inferInsert;
export type StoreProductSalePriceHistory = typeof storeProductSalePriceHistories.$inferSelect;
export type InsertStoreProductSalePriceHistory = typeof storeProductSalePriceHistories.$inferInsert;
export type StoreLedgerTransaction = typeof storeLedgerTransactions.$inferSelect;
export type InsertStoreLedgerTransaction = typeof storeLedgerTransactions.$inferInsert;
export type StoreDocument = typeof storeDocuments.$inferSelect;
export type InsertStoreDocument = typeof storeDocuments.$inferInsert;
export type StoreDocumentLine = typeof storeDocumentLines.$inferSelect;
export type InsertStoreDocumentLine = typeof storeDocumentLines.$inferInsert;
export type StoreStockMovement = typeof storeStockMovements.$inferSelect;
export type InsertStoreStockMovement = typeof storeStockMovements.$inferInsert;
