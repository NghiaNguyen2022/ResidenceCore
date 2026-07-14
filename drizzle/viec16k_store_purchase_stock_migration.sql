-- Việc 16K - Store purchase stock / nhập hàng tăng tồn
-- Đặt file trong /drizzle theo quy ước mới của project.

CREATE TABLE IF NOT EXISTS `storeStockMovements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `transactionId` int NULL,
  `movementType` enum('purchase','sale','adjustment_in','adjustment_out','return') NOT NULL,
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
  KEY `storeStockMovements_type_idx` (`movementType`),
  CONSTRAINT `storeStockMovements_product_fk` FOREIGN KEY (`productId`) REFERENCES `storeProducts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `storeStockMovements_transaction_fk` FOREIGN KEY (`transactionId`) REFERENCES `storeLedgerTransactions` (`id`) ON DELETE SET NULL
);
