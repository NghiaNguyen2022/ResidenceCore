-- Việc 16D - Daily closing for Store Ledger
-- Compatible with MySQL versions that do not support ADD COLUMN IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS `storeDailyClosings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledgerId` int NOT NULL,
  `closingCode` varchar(50) NOT NULL,
  `closingDate` date NOT NULL,
  `totalIn` decimal(14,2) NOT NULL DEFAULT 0.00,
  `totalOut` decimal(14,2) NOT NULL DEFAULT 0.00,
  `netAmount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `transactionCount` int NOT NULL DEFAULT 0,
  `status` enum('closed','cancelled') NOT NULL DEFAULT 'closed',
  `postedToFinance` tinyint(1) NOT NULL DEFAULT 0,
  `financeBatchId` varchar(100) NULL,
  `notes` text NULL,
  `createdBy` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeDailyClosings_ledger_date_unique` (`ledgerId`, `closingDate`),
  KEY `storeDailyClosings_ledger_idx` (`ledgerId`),
  KEY `storeDailyClosings_date_idx` (`closingDate`),
  KEY `storeDailyClosings_status_idx` (`status`)
);

SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeLedgerTransactions'
    AND COLUMN_NAME = 'dailyClosingId'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `storeLedgerTransactions` ADD COLUMN `dailyClosingId` int NULL AFTER `ledgerId`',
  'SELECT "dailyClosingId already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeLedgerTransactions'
    AND INDEX_NAME = 'storeLedgerTransactions_closing_idx'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `storeLedgerTransactions_closing_idx` ON `storeLedgerTransactions` (`dailyClosingId`)',
  'SELECT "storeLedgerTransactions_closing_idx already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional FK. If your DB already has strict data or older engine settings, you can skip this block safely.
SET @fk_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'storeLedgerTransactions_dailyClosing_fk'
);
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE `storeLedgerTransactions` ADD CONSTRAINT `storeLedgerTransactions_dailyClosing_fk` FOREIGN KEY (`dailyClosingId`) REFERENCES `storeDailyClosings`(`id`) ON DELETE SET NULL',
  'SELECT "storeLedgerTransactions_dailyClosing_fk already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
