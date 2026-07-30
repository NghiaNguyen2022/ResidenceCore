-- ============================================================================
-- FINANCIAL MANAGEMENT TABLES
-- ============================================================================

-- ============================================================================
-- PHẦN 1: PHÍ THU (REVENUE) - 8 BẢNG
-- ============================================================================

-- 1. Bảng: residentFeeTypes - Loại phí cho học viên (Loại 1, 2, 3)
CREATE TABLE `residentFeeTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`roomFee` decimal(12, 2) NOT NULL DEFAULT 0,
	`mealFee` decimal(12, 2) NOT NULL DEFAULT 0,
	`activitiesFee` decimal(12, 2) NOT NULL DEFAULT 0,
	`totalMonthlyFee` decimal(12, 2) NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `residentFeeTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `residentFeeTypes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint

-- 2. Bảng: residentFeeAssignments - Gán loại phí cho học viên
CREATE TABLE `residentFeeAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`feeTypeId` int NOT NULL,
	`assignedDate` date NOT NULL,
	`effectiveFromMonth` int NOT NULL,
	`effectiveFromYear` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `residentFeeAssignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `residentFeeAssignments_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `residentFeeAssignments_feeTypeId_fk` FOREIGN KEY (`feeTypeId`) REFERENCES `residentFeeTypes`(`id`) ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint

-- 3. Bảng: feeChangeHistory - Lịch sử thay đổi phí
CREATE TABLE `feeChangeHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`oldFeeTypeId` int,
	`newFeeTypeId` int NOT NULL,
	`changeReason` varchar(255),
	`changeDate` date NOT NULL,
	`effectiveFromMonth` int NOT NULL,
	`effectiveFromYear` int NOT NULL,
	`changedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feeChangeHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `feeChangeHistory_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `feeChangeHistory_oldFeeTypeId_fk` FOREIGN KEY (`oldFeeTypeId`) REFERENCES `residentFeeTypes`(`id`) ON DELETE set null ON UPDATE no action,
	CONSTRAINT `feeChangeHistory_newFeeTypeId_fk` FOREIGN KEY (`newFeeTypeId`) REFERENCES `residentFeeTypes`(`id`) ON DELETE restrict ON UPDATE no action,
	CONSTRAINT `feeChangeHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 4. Bảng: additionalFees - Phí khác (từ hoạt động, khoá học)
CREATE TABLE `additionalFees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`feeCategory` varchar(100) NOT NULL,
	`description` text,
	`amount` decimal(12, 2) NOT NULL,
	`billingMonth` int NOT NULL,
	`billingYear` int NOT NULL,
	`reason` varchar(255),
	`relatedActivityId` int,
	`relatedCourseId` int,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `additionalFees_id` PRIMARY KEY(`id`),
	CONSTRAINT `additionalFees_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `additionalFees_approvedBy_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 5. Bảng: borrowedFees - Phí mượn/ứng
CREATE TABLE `borrowedFees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`amount` decimal(12, 2) NOT NULL,
	`borrowDate` date NOT NULL,
	`reason` text,
	`status` enum('pending','added_to_fee','paid') NOT NULL DEFAULT 'pending',
	`addedToMonthlyFeeMonth` int,
	`addedToMonthlyFeeYear` int,
	`paidDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `borrowedFees_id` PRIMARY KEY(`id`),
	CONSTRAINT `borrowedFees_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint

-- 6. Bảng: revenues - Phí thu hàng tháng
CREATE TABLE `revenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`residentId` int NOT NULL,
	`billingMonth` int NOT NULL,
	`billingYear` int NOT NULL,
	`baseFee` decimal(12, 2) NOT NULL,
	`additionalFeeAmount` decimal(12, 2) NOT NULL DEFAULT 0,
	`borrowedFeeAddition` decimal(12, 2) NOT NULL DEFAULT 0,
	`totalAmount` decimal(12, 2) NOT NULL,
	`status` enum('pending','due','overdue','paid','partial','cancelled') NOT NULL DEFAULT 'pending',
	`dueDate` date NOT NULL,
	`paidAmount` decimal(12, 2) NOT NULL DEFAULT 0,
	`paidDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenues_id` PRIMARY KEY(`id`),
	CONSTRAINT `revenues_residentId_fk` FOREIGN KEY (`residentId`) REFERENCES `residents`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `revenues_unique_resident_month` UNIQUE(`residentId`, `billingMonth`, `billingYear`)
);
--> statement-breakpoint

-- 7. Bảng: revenuePayments - Ghi nhận thanh toán
CREATE TABLE `revenuePayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revenueId` int NOT NULL,
	`amount` decimal(12, 2) NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','check','other') NOT NULL,
	`paymentDate` date NOT NULL,
	`reference` varchar(255),
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revenuePayments_id` PRIMARY KEY(`id`),
	CONSTRAINT `revenuePayments_revenueId_fk` FOREIGN KEY (`revenueId`) REFERENCES `revenues`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `revenuePayments_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 8. Bảng: revenueHistory - Lịch sử thay đổi phí thu
CREATE TABLE `revenueHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revenueId` int NOT NULL,
	`fieldChanged` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeReason` varchar(255),
	`changedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revenueHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `revenueHistory_revenueId_fk` FOREIGN KEY (`revenueId`) REFERENCES `revenues`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `revenueHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- ============================================================================
-- PHẦN 2: PHÍ TRẢ (EXPENSE) - 8 BẢNG
-- ============================================================================

-- 9. Bảng: expenseCategories - Danh mục chi phí
CREATE TABLE `expenseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`budgetAmount` decimal(12, 2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenseCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenseCategories_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint

-- 10. Bảng: expenses - Chi phí vận hành
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`department` enum('general','store','library','other') NOT NULL DEFAULT 'general',
	`description` text NOT NULL,
	`amount` decimal(12, 2) NOT NULL,
	`expenseDate` date NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','check','other') NOT NULL,
	`invoiceNumber` varchar(100),
	`invoiceFile` varchar(255),
	`status` enum('draft','submitted','approved','rejected','paid') NOT NULL DEFAULT 'draft',
	`approvedBy` int,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenses_categoryId_fk` FOREIGN KEY (`categoryId`) REFERENCES `expenseCategories`(`id`) ON DELETE restrict ON UPDATE no action,
	CONSTRAINT `expenses_approvedBy_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action,
	CONSTRAINT `expenses_createdBy_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 11. Bảng: storeRevenues - Doanh thu cửa hàng
CREATE TABLE `storeRevenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revenueDate` date NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(12, 2) NOT NULL,
	`totalAmount` decimal(12, 2) NOT NULL,
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storeRevenues_id` PRIMARY KEY(`id`),
	CONSTRAINT `storeRevenues_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 12. Bảng: storeSaleItems - Chi tiết sản phẩm bán
CREATE TABLE `storeSaleItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productName` varchar(255) NOT NULL,
	`totalQuantitySold` int NOT NULL DEFAULT 0,
	`totalRevenue` decimal(12, 2) NOT NULL DEFAULT 0,
	`averageUnitPrice` decimal(12, 2),
	`lastSaleDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeSaleItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- 13. Bảng: storeExpenses - Chi phí cửa hàng
CREATE TABLE `storeExpenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expenseDate` date NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(12, 2) NOT NULL,
	`expenseType` enum('purchase','rent','utilities','staff','other') NOT NULL,
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storeExpenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `storeExpenses_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 14. Bảng: libraryRevenues - Doanh thu thư viện
CREATE TABLE `libraryRevenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revenueDate` date NOT NULL,
	`revenueType` enum('rental','photocopy','printing','registration','other') NOT NULL,
	`description` text,
	`amount` decimal(12, 2) NOT NULL,
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `libraryRevenues_id` PRIMARY KEY(`id`),
	CONSTRAINT `libraryRevenues_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 15. Bảng: libraryExpenses - Chi phí thư viện
CREATE TABLE `libraryExpenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expenseDate` date NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(12, 2) NOT NULL,
	`expenseType` enum('books','maintenance','utilities','staff','other') NOT NULL,
	`notes` text,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `libraryExpenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `libraryExpenses_recordedBy_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- 16. Bảng: expenseHistory - Lịch sử thay đổi chi phí
CREATE TABLE `expenseHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expenseId` int NOT NULL,
	`fieldChanged` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeReason` varchar(255),
	`changedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenseHistory_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenseHistory_expenseId_fk` FOREIGN KEY (`expenseId`) REFERENCES `expenses`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `expenseHistory_changedBy_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX `idx_revenues_residentId` ON `revenues`(`residentId`);
CREATE INDEX `idx_revenues_billingMonth` ON `revenues`(`billingMonth`, `billingYear`);
CREATE INDEX `idx_revenues_status` ON `revenues`(`status`);
CREATE INDEX `idx_expenses_categoryId` ON `expenses`(`categoryId`);
CREATE INDEX `idx_expenses_status` ON `expenses`(`status`);
CREATE INDEX `idx_expenses_expenseDate` ON `expenses`(`expenseDate`);
CREATE INDEX `idx_additionalFees_residentId` ON `additionalFees`(`residentId`);
CREATE INDEX `idx_borrowedFees_residentId` ON `borrowedFees`(`residentId`);
CREATE INDEX `idx_storeRevenues_revenueDate` ON `storeRevenues`(`revenueDate`);
CREATE INDEX `idx_libraryRevenues_revenueDate` ON `libraryRevenues`(`revenueDate`);
