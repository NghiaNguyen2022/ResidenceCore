-- Việc 16K4.1 - Nhập kho đa nguồn
-- Nguồn nhập: mua hàng, sản xuất/gia công nội bộ, tự cung cấp/được cấp, nguồn khác.
-- Chỉ nguồn mua hàng mới tự động tạo khoản chi cửa hàng.
-- File đặt trong /drizzle theo rule project.

CREATE TABLE IF NOT EXISTS `storeStockMovements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `transactionId` int NULL,
  `movementType` enum('purchase','production_in','self_supply_in','other_in','sale','adjustment_in','adjustment_out','return') NOT NULL,
  `movementDate` date NOT NULL,
  `quantityIn` decimal(14,2) NOT NULL DEFAULT 0.00,
  `quantityOut` decimal(14,2) NOT NULL DEFAULT 0.00,
  `unitCost` decimal(14,2) NOT NULL DEFAULT 0.00,
  `note` text NULL,
  `createdBy` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `storeStockMovements_product_idx` (`productId`),
  KEY `storeStockMovements_transaction_idx` (`transactionId`),
  KEY `storeStockMovements_date_idx` (`movementDate`),
  KEY `storeStockMovements_type_idx` (`movementType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dùng khi bảng storeStockMovements đã được tạo từ bản 16K4 cũ.
ALTER TABLE `storeStockMovements`
  MODIFY COLUMN `movementType`
  enum('purchase','production_in','self_supply_in','other_in','sale','adjustment_in','adjustment_out','return') NOT NULL;

-- Mở rộng nguồn lịch sử giá vốn cho tự cung cấp và nguồn khác.
ALTER TABLE `storeProductCostHistories`
  MODIFY COLUMN `sourceType`
  enum('purchase','processed','self_supply','other','manual_adjustment') NOT NULL DEFAULT 'purchase';

-- Bổ sung khóa ngoại nếu môi trường cho phép. Nếu báo trùng tên constraint thì có thể bỏ qua.
-- ALTER TABLE `storeStockMovements` ADD CONSTRAINT `storeStockMovements_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeProducts` (`id`) ON DELETE RESTRICT;
-- ALTER TABLE `storeStockMovements` ADD CONSTRAINT `storeStockMovements_transaction_fk` FOREIGN KEY (`transactionId`) REFERENCES `storeLedgerTransactions` (`id`) ON DELETE SET NULL;
