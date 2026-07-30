import { mysqlTable, int, varchar, text, mediumtext, timestamp, boolean, date, mysqlEnum, decimal, foreignKey, index, unique } from "drizzle-orm/mysql-core";
import { users } from "./core";
import { residents } from "./residents";

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


// ============================================================================
// STORE DUTY / SHIFT FOUNDATION (16L1)
// ============================================================================

export const storeDutyAssignments = mysqlTable(
      "storeDutyAssignments",
      {
            id: int("id").autoincrement().primaryKey(),

            // Liên kết logic với dutyAssignments. Không tạo FK chéo tại đây để
            // tránh vòng import giữa schema tổng và schema Cửa hàng.
            dutyAssignmentId: int("dutyAssignmentId"),

            ledgerId: int("ledgerId")
                  .notNull()
                  .references(() => storeLedgers.id, { onDelete: "restrict" }),

            shiftDate: date("shiftDate").notNull(),
            shiftType: mysqlEnum("shiftType", ["morning", "afternoon"]).notNull(),

            primaryResidentId: int("primaryResidentId")
                  .references(() => residents.id, { onDelete: "set null" }),

            managerId: int("managerId")
                  .references(() => users.id, { onDelete: "set null" }),

            openingCashPlanned: decimal("openingCashPlanned", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),

            status: mysqlEnum("status", [
                  "scheduled",
                  "access_issued",
                  "active",
                  "handover_pending",
                  "completed",
                  "cancelled",
            ])
                  .default("scheduled")
                  .notNull(),

            notes: text("notes"),

            createdBy: int("createdBy")
                  .references(() => users.id, { onDelete: "set null" }),

            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            dutyAssignmentIdx: index("storeDutyAssignments_duty_assignment_idx").on(
                  table.dutyAssignmentId
            ),
            ledgerDateShiftIdx: index("storeDutyAssignments_ledger_date_shift_idx").on(
                  table.ledgerId,
                  table.shiftDate,
                  table.shiftType
            ),
            primaryResidentIdx: index("storeDutyAssignments_primary_resident_idx").on(
                  table.primaryResidentId
            ),
            statusIdx: index("storeDutyAssignments_status_idx").on(table.status),
      }),
);

export const storeDutyMembers = mysqlTable(
      "storeDutyMembers",
      {
            id: int("id").autoincrement().primaryKey(),

            storeDutyAssignmentId: int("storeDutyAssignmentId")
                  .notNull(),

            residentId: int("residentId")
                  .notNull()
                  .references(() => residents.id, { onDelete: "cascade" }),

            memberRole: mysqlEnum("memberRole", [
                  "primary",
                  "assistant",
                  "receiver",
            ])
                  .default("assistant")
                  .notNull(),

            status: mysqlEnum("status", [
                  "assigned",
                  "confirmed",
                  "completed",
                  "cancelled",
            ])
                  .default("assigned")
                  .notNull(),

            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            assignmentFk: foreignKey({
                  columns: [table.storeDutyAssignmentId],
                  foreignColumns: [storeDutyAssignments.id],
                  name: "storeDutyMembers_assignment_fk",
            }).onDelete("cascade"),
            assignmentIdx: index("storeDutyMembers_assignment_idx").on(
                  table.storeDutyAssignmentId
            ),
            residentIdx: index("storeDutyMembers_resident_idx").on(table.residentId),
            assignmentResidentUnique: unique(
                  "storeDutyMembers_assignment_resident_unique"
            ).on(table.storeDutyAssignmentId, table.residentId),
      }),
);

export const storeShifts = mysqlTable(
      "storeShifts",
      {
            id: int("id").autoincrement().primaryKey(),

            storeDutyAssignmentId: int("storeDutyAssignmentId")
                  .notNull()
                  .references(() => storeDutyAssignments.id, {
                        onDelete: "restrict",
                  }),

            ledgerId: int("ledgerId")
                  .notNull()
                  .references(() => storeLedgers.id, { onDelete: "restrict" }),

            shiftDate: date("shiftDate").notNull(),
            shiftType: mysqlEnum("shiftType", ["morning", "afternoon"]).notNull(),

            scheduledFrom: timestamp("scheduledFrom").notNull(),
            scheduledTo: timestamp("scheduledTo").notNull(),

            // Khoảng được phép nhập mã và thao tác. Ca sáng 07:00–14:00,
            // ca chiều 13:00–19:00; thời gian thực tế sẽ do service tạo ca quyết định.
            accessValidFrom: timestamp("accessValidFrom").notNull(),
            accessValidUntil: timestamp("accessValidUntil").notNull(),

            primaryResidentId: int("primaryResidentId")
                  .references(() => residents.id, { onDelete: "set null" }),

            openingCash: decimal("openingCash", { precision: 14, scale: 2 })
                  .default("0.00")
                  .notNull(),

            expectedClosingCash: decimal("expectedClosingCash", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),

            countedClosingCash: decimal("countedClosingCash", {
                  precision: 14,
                  scale: 2,
            }),

            cashDifference: decimal("cashDifference", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),

            status: mysqlEnum("status", [
                  "scheduled",
                  "access_issued",
                  "opened",
                  "in_progress",
                  "handover_pending",
                  "handed_over",
                  "closing_pending",
                  "closed",
                  "reviewed",
                  "confirmed",
                  "expired",
                  "closing_overdue",
                  "cancelled",
            ])
                  .default("scheduled")
                  .notNull(),

            openedAt: timestamp("openedAt"),
            handedOverAt: timestamp("handedOverAt"),
            closedAt: timestamp("closedAt"),

            closedBy: int("closedBy")
                  .references(() => users.id, { onDelete: "set null" }),

            reviewedBy: int("reviewedBy")
                  .references(() => users.id, { onDelete: "set null" }),
            reviewedAt: timestamp("reviewedAt"),

            confirmedBy: int("confirmedBy")
                  .references(() => users.id, { onDelete: "set null" }),
            confirmedAt: timestamp("confirmedAt"),

            notes: text("notes"),

            createdBy: int("createdBy")
                  .references(() => users.id, { onDelete: "set null" }),

            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            assignmentUnique: unique("storeShifts_assignment_unique").on(
                  table.storeDutyAssignmentId
            ),
            ledgerDateShiftUnique: unique("storeShifts_ledger_date_shift_unique").on(
                  table.ledgerId,
                  table.shiftDate,
                  table.shiftType
            ),
            primaryResidentIdx: index("storeShifts_primary_resident_idx").on(
                  table.primaryResidentId
            ),
            accessWindowIdx: index("storeShifts_access_window_idx").on(
                  table.accessValidFrom,
                  table.accessValidUntil
            ),
            statusIdx: index("storeShifts_status_idx").on(table.status),
      }),
);

export const storeDutyAccessSessions = mysqlTable(
      "storeDutyAccessSessions",
      {
            id: int("id").autoincrement().primaryKey(),

            storeShiftId: int("storeShiftId")
                  .notNull()
                  .references(() => storeShifts.id, { onDelete: "cascade" }),

            storeDutyAssignmentId: int("storeDutyAssignmentId")
                  .notNull(),

            residentId: int("residentId")
                  .notNull()
                  .references(() => residents.id, { onDelete: "cascade" }),

            // Mã ca và access token chỉ lưu hash.
            accessCodeHash: varchar("accessCodeHash", { length: 255 }).notNull(),
            accessTokenHash: varchar("accessTokenHash", { length: 255 }),

            // Gắn quyền Cửa hàng với đúng phiên portal hiện tại khi có thể.
            portalSessionId: varchar("portalSessionId", { length: 255 }),

            validFrom: timestamp("validFrom").notNull(),
            validUntil: timestamp("validUntil").notNull(),

            verifiedAt: timestamp("verifiedAt"),
            lastStoreActivityAt: timestamp("lastStoreActivityAt"),
            sessionExpiresAt: timestamp("sessionExpiresAt"),

            status: mysqlEnum("status", [
                  "pending",
                  "active",
                  "expired",
                  "revoked",
                  "completed",
            ])
                  .default("pending")
                  .notNull(),

            issuedBy: int("issuedBy")
                  .references(() => users.id, { onDelete: "set null" }),
            issuedAt: timestamp("issuedAt").defaultNow().notNull(),
            revokedAt: timestamp("revokedAt"),

            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            assignmentFk: foreignKey({
                  columns: [table.storeDutyAssignmentId],
                  foreignColumns: [storeDutyAssignments.id],
                  name: "storeDutyAccess_assignment_fk",
            }).onDelete("cascade"),
            shiftResidentIdx: index("storeDutyAccessSessions_shift_resident_idx").on(
                  table.storeShiftId,
                  table.residentId
            ),
            assignmentIdx: index("storeDutyAccessSessions_assignment_idx").on(
                  table.storeDutyAssignmentId
            ),
            tokenIdx: index("storeDutyAccessSessions_token_idx").on(
                  table.accessTokenHash
            ),
            statusExpiryIdx: index("storeDutyAccessSessions_status_expiry_idx").on(
                  table.status,
                  table.sessionExpiresAt
            ),
      }),
);

export const storeShiftHandovers = mysqlTable(
      "storeShiftHandovers",
      {
            id: int("id").autoincrement().primaryKey(),

            storeShiftId: int("storeShiftId")
                  .notNull()
                  .references(() => storeShifts.id, { onDelete: "restrict" }),

            handoverType: mysqlEnum("handoverType", [
                  "shift_to_shift",
                  "end_of_day",
                  "manager_adjustment",
            ]).notNull(),

            handoverToShiftId: int("handoverToShiftId")
                  .references(() => storeShifts.id, { onDelete: "set null" }),

            openingCash: decimal("openingCash", { precision: 14, scale: 2 })
                  .default("0.00")
                  .notNull(),
            totalSales: decimal("totalSales", { precision: 14, scale: 2 })
                  .default("0.00")
                  .notNull(),
            totalOtherIncome: decimal("totalOtherIncome", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),
            totalPurchases: decimal("totalPurchases", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),
            totalOtherExpense: decimal("totalOtherExpense", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),

            expectedCash: decimal("expectedCash", { precision: 14, scale: 2 })
                  .default("0.00")
                  .notNull(),
            countedCash: decimal("countedCash", { precision: 14, scale: 2 })
                  .default("0.00")
                  .notNull(),
            differenceAmount: decimal("differenceAmount", {
                  precision: 14,
                  scale: 2,
            })
                  .default("0.00")
                  .notNull(),

            differenceReason: text("differenceReason"),
            notes: text("notes"),

            handedOverByResidentId: int("handedOverByResidentId")
                  .references(() => residents.id, { onDelete: "set null" }),
            receivedByResidentId: int("receivedByResidentId")
                  .references(() => residents.id, { onDelete: "set null" }),

            handedOverAt: timestamp("handedOverAt"),
            receivedAt: timestamp("receivedAt"),
            giverSignedAt: timestamp("giverSignedAt"),
            receiverSignedAt: timestamp("receiverSignedAt"),

            status: mysqlEnum("status", [
                  "draft",
                  "giver_signed",
                  "receiver_signed",
                  "completed",
                  "cancelled",
            ])
                  .default("draft")
                  .notNull(),

            createdBy: int("createdBy")
                  .references(() => users.id, { onDelete: "set null" }),

            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            shiftIdx: index("storeShiftHandovers_shift_idx").on(table.storeShiftId),
            receiverShiftIdx: index("storeShiftHandovers_receiver_shift_idx").on(
                  table.handoverToShiftId
            ),
            statusIdx: index("storeShiftHandovers_status_idx").on(table.status),
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
            storeShiftId: int("storeShiftId").references(() => storeShifts.id, { onDelete: "set null" }),
            storeDutyAssignmentId: int("storeDutyAssignmentId"),
            createdByResidentId: int("createdByResidentId").references(() => residents.id, { onDelete: "set null" }),
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
            dutyAssignmentFk: foreignKey({
                  columns: [table.storeDutyAssignmentId],
                  foreignColumns: [storeDutyAssignments.id],
                  name: "storeLedgerTx_duty_assignment_fk",
            }).onDelete("set null"),
            ledgerIdx: index("storeLedgerTransactions_ledger_idx").on(table.ledgerId),
            closingIdx: index("storeLedgerTransactions_closing_idx").on(table.dailyClosingId),
            shiftIdx: index("storeLedgerTransactions_shift_idx").on(table.storeShiftId),
            dutyAssignmentIdx: index("storeLedgerTransactions_duty_assignment_idx").on(table.storeDutyAssignmentId),
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
            storeShiftId: int("storeShiftId").references(() => storeShifts.id, { onDelete: "set null" }),
            storeDutyAssignmentId: int("storeDutyAssignmentId").references(() => storeDutyAssignments.id, { onDelete: "set null" }),
            createdByResidentId: int("createdByResidentId").references(() => residents.id, { onDelete: "set null" }),
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
            shiftIdx: index("storeDocuments_shift_idx").on(table.storeShiftId),
            dutyAssignmentIdx: index("storeDocuments_duty_assignment_idx").on(table.storeDutyAssignmentId),
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


export type StoreDutyAssignment = typeof storeDutyAssignments.$inferSelect;
export type InsertStoreDutyAssignment = typeof storeDutyAssignments.$inferInsert;
export type StoreDutyMember = typeof storeDutyMembers.$inferSelect;
export type InsertStoreDutyMember = typeof storeDutyMembers.$inferInsert;
export type StoreShift = typeof storeShifts.$inferSelect;
export type InsertStoreShift = typeof storeShifts.$inferInsert;
export type StoreDutyAccessSession = typeof storeDutyAccessSessions.$inferSelect;
export type InsertStoreDutyAccessSession = typeof storeDutyAccessSessions.$inferInsert;
export type StoreShiftHandover = typeof storeShiftHandovers.$inferSelect;
export type InsertStoreShiftHandover = typeof storeShiftHandovers.$inferInsert;

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
