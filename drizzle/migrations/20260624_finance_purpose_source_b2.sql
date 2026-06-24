ALTER TABLE finance_charges
      ADD COLUMN source VARCHAR(40) NOT NULL DEFAULT 'student_fee' AFTER status,
      ADD COLUMN fee_mode VARCHAR(40) NULL AFTER source,
      ADD COLUMN target_type VARCHAR(80) NULL AFTER fee_mode,
      ADD COLUMN target_name VARCHAR(255) NULL AFTER target_type;

CREATE TABLE IF NOT EXISTS finance_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(40) NOT NULL,
      direction VARCHAR(10) NOT NULL DEFAULT 'in',
      amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      transaction_date DATE NOT NULL,
      target_type VARCHAR(80) NULL,
      target_name VARCHAR(255) NULL,
      description TEXT NULL,
      created_by INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_finance_transactions_source (source),
      INDEX idx_finance_transactions_direction (direction),
      INDEX idx_finance_transactions_transaction_date (transaction_date),
      INDEX idx_finance_transactions_target_type (target_type)
);
