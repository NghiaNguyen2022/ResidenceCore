-- Việc 16G - Store products lite
-- Adds a compact product catalog for the store/fund module.

CREATE TABLE IF NOT EXISTS `storeProducts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productCode` VARCHAR(50) NOT NULL,
  `productName` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL DEFAULT 'general',
  `unit` VARCHAR(50) NOT NULL DEFAULT 'cái',
  `defaultCostPrice` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `defaultSalePrice` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `minStock` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `currentStock` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `description` TEXT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdBy` INT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeProducts_productCode_unique` (`productCode`),
  KEY `storeProducts_active_idx` (`isActive`),
  KEY `storeProducts_category_idx` (`category`)
);

-- Demo seed: safe because productCode is unique.
INSERT IGNORE INTO `storeProducts`
(`productCode`, `productName`, `category`, `unit`, `defaultCostPrice`, `defaultSalePrice`, `minStock`, `currentStock`, `description`, `isActive`)
VALUES
('NUOC_SUOI_500', 'Nước suối 500ml', 'drink', 'chai', 3500.00, 5000.00, 20.00, 0.00, 'Sản phẩm demo cửa hàng', 1),
('MI_GOI', 'Mì gói', 'food', 'gói', 4500.00, 7000.00, 15.00, 0.00, 'Sản phẩm demo cửa hàng', 1),
('BUT_BI', 'Bút bi', 'stationery', 'cây', 2500.00, 5000.00, 10.00, 0.00, 'Sản phẩm demo cửa hàng', 1);
