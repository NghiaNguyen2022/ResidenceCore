-- ResidenceCore / App Luu Xa
-- Viec 16K3-6: Store sale price history table fix
-- Purpose:
--   Fix migration error: Table 'storeproductsalepricehistories' doesn't exist
--   by creating storeProductSalePriceHistories if missing and ensuring the
--   index is non-unique so multiple price changes per product/day are allowed.

CREATE TABLE IF NOT EXISTS `storeProductSalePriceHistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `effectiveDate` date NOT NULL,
  `salePrice` decimal(14,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(100) NULL,
  `notes` text NULL,
  `createdBy` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeProductSalePriceHistories_product_idx` (`productId`),
  KEY `storeProductSalePriceHistories_effectiveDate_idx` (`effectiveDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If an old UNIQUE index exists on (productId, effectiveDate), remove it.
-- This is safe for MySQL Workbench safe-update mode because it uses DDL only.
SET @idx_name := (
  SELECT INDEX_NAME
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeProductSalePriceHistories'
    AND NON_UNIQUE = 0
    AND INDEX_NAME <> 'PRIMARY'
    AND COLUMN_NAME IN ('productId', 'effectiveDate')
  GROUP BY INDEX_NAME
  HAVING SUM(COLUMN_NAME = 'productId') > 0
     AND SUM(COLUMN_NAME = 'effectiveDate') > 0
  LIMIT 1
);

SET @drop_sql := IF(
  @idx_name IS NULL,
  'SELECT "No unique product/date index to drop" AS message',
  CONCAT('ALTER TABLE `storeProductSalePriceHistories` DROP INDEX `', @idx_name, '`')
);
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create a normal non-unique index if it does not exist.
SET @has_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeProductSalePriceHistories'
    AND INDEX_NAME = 'storeProductSalePriceHistories_product_date_idx'
);

SET @create_idx_sql := IF(
  @has_idx > 0,
  'SELECT "Index already exists" AS message',
  'CREATE INDEX `storeProductSalePriceHistories_product_date_idx` ON `storeProductSalePriceHistories` (`productId`, `effectiveDate`)'
);
PREPARE stmt FROM @create_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional sanity check.
SHOW COLUMNS FROM `storeProductSalePriceHistories`;
SHOW INDEX FROM `storeProductSalePriceHistories`;
