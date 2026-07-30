-- Việc 16K3-7: Store product cost history table fix
-- Purpose: create the cost-price history table required by storeLedger.listProductPriceHistory.
-- Safe to run multiple times on MySQL 8 / MySQL Workbench.

CREATE TABLE IF NOT EXISTS `storeProductCostHistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `sourceType` enum('purchase','processed','adjustment','manual') NOT NULL DEFAULT 'manual',
  `effectiveDate` date NOT NULL,
  `quantity` decimal(14,2) NOT NULL DEFAULT 0.00,
  `unitCost` decimal(14,2) NOT NULL DEFAULT 0.00,
  `averageCostAfter` decimal(14,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(100) NULL,
  `notes` text NULL,
  `createdBy` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeProductCostHistories_product_date_idx` (`productId`, `effectiveDate`),
  KEY `storeProductCostHistories_createdBy_idx` (`createdBy`),
  CONSTRAINT `storeProductCostHistories_product_fk`
    FOREIGN KEY (`productId`) REFERENCES `storeProducts` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill one simple manual cost-history row for existing products that have a cost price,
-- so the Price Info popup has an initial history to display.
INSERT INTO `storeProductCostHistories` (
  `productId`,
  `sourceType`,
  `effectiveDate`,
  `quantity`,
  `unitCost`,
  `averageCostAfter`,
  `reason`,
  `notes`,
  `createdBy`
)
SELECT
  p.`id`,
  'manual',
  CURDATE(),
  COALESCE(p.`currentStock`, 0),
  COALESCE(NULLIF(p.`averageCostPrice`, 0), NULLIF(p.`defaultCostPrice`, 0), 0),
  COALESCE(NULLIF(p.`averageCostPrice`, 0), NULLIF(p.`defaultCostPrice`, 0), 0),
  'initial',
  'Dòng khởi tạo lịch sử giá vốn từ dữ liệu hàng hóa hiện có.',
  p.`createdBy`
FROM `storeProducts` p
WHERE p.`id` > 0
  AND COALESCE(NULLIF(p.`averageCostPrice`, 0), NULLIF(p.`defaultCostPrice`, 0), 0) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM `storeProductCostHistories` h
    WHERE h.`productId` = p.`id`
  );

-- Quick checks after running:
-- SHOW TABLES LIKE 'storeProductCostHistories';
-- SHOW COLUMNS FROM storeProductCostHistories;
-- SELECT * FROM storeProductCostHistories ORDER BY productId, effectiveDate DESC, id DESC LIMIT 20;
