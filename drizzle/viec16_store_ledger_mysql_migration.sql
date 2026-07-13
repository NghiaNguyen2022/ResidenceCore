-- Việc 16A - Store/Fund Ledger lite migration
-- Compatible with MySQL/MariaDB using CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS storeLedgers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ledgerCode VARCHAR(50) NOT NULL,
      ledgerName VARCHAR(255) NOT NULL,
      ledgerType ENUM('store', 'fund', 'other') NOT NULL DEFAULT 'store',
      openingBalance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
      description TEXT NULL,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      createdBy INT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY storeLedgers_ledgerCode_unique (ledgerCode),
      KEY storeLedgers_active_idx (isActive),
      KEY storeLedgers_createdBy_idx (createdBy)
);

CREATE TABLE IF NOT EXISTS storeLedgerTransactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ledgerId INT NOT NULL,
      transactionCode VARCHAR(50) NOT NULL,
      direction ENUM('in', 'out') NOT NULL,
      transactionDate DATE NOT NULL,
      amount DECIMAL(14, 2) NOT NULL,
      category VARCHAR(100) NULL,
      title VARCHAR(255) NOT NULL,
      partnerName VARCHAR(255) NULL,
      paymentMethod VARCHAR(50) NULL DEFAULT 'cash',
      description TEXT NULL,
      status ENUM('posted', 'cancelled') NOT NULL DEFAULT 'posted',
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      createdBy INT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY storeLedgerTransactions_code_unique (transactionCode),
      KEY storeLedgerTransactions_ledger_idx (ledgerId),
      KEY storeLedgerTransactions_date_idx (transactionDate),
      KEY storeLedgerTransactions_direction_idx (direction),
      KEY storeLedgerTransactions_createdBy_idx (createdBy),
      CONSTRAINT storeLedgerTransactions_ledger_fk FOREIGN KEY (ledgerId) REFERENCES storeLedgers(id)
);

-- Optional seed for demo. Safe to run repeatedly.
INSERT INTO storeLedgers (ledgerCode, ledgerName, ledgerType, openingBalance, description, isActive)
SELECT 'CUA_HANG', 'Cửa hàng lưu xá', 'store', 0.00, 'Sổ thu chi riêng cho cửa hàng/quầy nhỏ.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM storeLedgers WHERE ledgerCode = 'CUA_HANG');
