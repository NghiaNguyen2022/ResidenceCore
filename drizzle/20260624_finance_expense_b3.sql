-- Finance Expense B3
-- Không cần thêm cột mới nếu đã chạy migration finance_purpose_source_b2.
-- Khoản chi dùng finance_transactions:
--   source = 'expense'
--   direction = 'out'
--   target_type = nhóm khoản chi
--   target_name = mục tiêu chi
--
-- Đảm bảo bảng finance_transactions tồn tại.
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
