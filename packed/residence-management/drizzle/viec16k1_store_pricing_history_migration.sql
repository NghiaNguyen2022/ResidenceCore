-- Việc 16K1 - Store product pricing history foundation
-- Compatible MySQL migration. Run from ResidenceCore database.

SET @db_name := DATABASE();

-- 1) Extend storeProducts for store pricing/costing configuration.
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeProducts' AND COLUMN_NAME = 'sourceType'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE storeProducts ADD COLUMN sourceType ENUM(''purchase'',''processed'',''both'') NOT NULL DEFAULT ''purchase'' AFTER currentStock',
  'SELECT ''storeProducts.sourceType already exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeProducts' AND COLUMN_NAME = 'costingMethod'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE storeProducts ADD COLUMN costingMethod ENUM(''weighted_average'',''latest'',''manual'') NOT NULL DEFAULT ''weighted_average'' AFTER sourceType',
  'SELECT ''storeProducts.costingMethod already exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeProducts' AND COLUMN_NAME = 'averageCostPrice'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE storeProducts ADD COLUMN averageCostPrice DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER costingMethod',
  'SELECT ''storeProducts.averageCostPrice already exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeProducts' AND COLUMN_NAME = 'currentSalePrice'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE storeProducts ADD COLUMN currentSalePrice DECIMAL(14,2) NOT NULL DEFAULT 0.00 AFTER averageCostPrice',
  'SELECT ''storeProducts.currentSalePrice already exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill current values from the previous lite fields.
UPDATE storeProducts
SET averageCostPrice = COALESCE(NULLIF(defaultCostPrice, 0), averageCostPrice, 0),
    currentSalePrice = COALESCE(NULLIF(defaultSalePrice, 0), currentSalePrice, 0)
WHERE averageCostPrice = 0 OR currentSalePrice = 0;

-- 2) Cost history: mostly written by purchase/stock-in workflows later.
CREATE TABLE IF NOT EXISTS storeProductCostHistories (
  id INT NOT NULL AUTO_INCREMENT,
  productId INT NOT NULL,
  sourceType ENUM('purchase','processed','manual_adjustment') NOT NULL DEFAULT 'purchase',
  effectiveDate DATE NOT NULL,
  quantity DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  unitCost DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  averageCostAfter DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  reason VARCHAR(100) NULL,
  notes TEXT NULL,
  createdBy INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY storeProductCostHistories_product_idx (productId),
  KEY storeProductCostHistories_date_idx (effectiveDate),
  CONSTRAINT storeProductCostHistories_product_fk FOREIGN KEY (productId) REFERENCES storeProducts(id) ON DELETE RESTRICT,
  CONSTRAINT storeProductCostHistories_createdBy_fk FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- 3) Sale price history: every sale price change is append-only by effective date.
CREATE TABLE IF NOT EXISTS storeProductSalePriceHistories (
  id INT NOT NULL AUTO_INCREMENT,
  productId INT NOT NULL,
  effectiveDate DATE NOT NULL,
  salePrice DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  reason ENUM('cost_increase','overhead_increase','market_adjustment','promotion','manual','other') NOT NULL DEFAULT 'manual',
  notes TEXT NULL,
  createdBy INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY storeProductSalePriceHistories_product_date_unique (productId, effectiveDate),
  KEY storeProductSalePriceHistories_product_idx (productId),
  KEY storeProductSalePriceHistories_date_idx (effectiveDate),
  CONSTRAINT storeProductSalePriceHistories_product_fk FOREIGN KEY (productId) REFERENCES storeProducts(id) ON DELETE RESTRICT,
  CONSTRAINT storeProductSalePriceHistories_createdBy_fk FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed sale price history from existing defaultSalePrice/currentSalePrice if not already present.
INSERT INTO storeProductSalePriceHistories (productId, effectiveDate, salePrice, reason, notes, createdBy)
SELECT p.id, CURDATE(), COALESCE(NULLIF(p.currentSalePrice, 0), p.defaultSalePrice, 0), 'manual', 'Seed từ giá bán hiện tại khi nâng cấp lịch sử giá.', p.createdBy
FROM storeProducts p
WHERE p.isActive = 1
  AND COALESCE(NULLIF(p.currentSalePrice, 0), p.defaultSalePrice, 0) > 0
  AND NOT EXISTS (
    SELECT 1 FROM storeProductSalePriceHistories h
    WHERE h.productId = p.id AND h.effectiveDate = CURDATE()
  );
