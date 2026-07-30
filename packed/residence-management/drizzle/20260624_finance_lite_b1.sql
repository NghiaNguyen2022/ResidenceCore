CREATE TABLE IF NOT EXISTS finance_fee_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fee_code VARCHAR(50) NOT NULL UNIQUE,
      fee_name VARCHAR(255) NOT NULL,
      default_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      cycle VARCHAR(30) NOT NULL DEFAULT 'monthly',
      description TEXT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 10,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_charges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      charge_code VARCHAR(80) NOT NULL UNIQUE,
      resident_id INT NOT NULL,
      fee_type_id INT NOT NULL,
      amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      paid_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      remaining_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      due_date DATE NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'open',
      description TEXT NULL,
      created_by INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_finance_charges_resident_id (resident_id),
      INDEX idx_finance_charges_fee_type_id (fee_type_id),
      INDEX idx_finance_charges_status (status),
      INDEX idx_finance_charges_due_date (due_date)
);

CREATE TABLE IF NOT EXISTS finance_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      charge_id INT NOT NULL,
      resident_id INT NOT NULL,
      amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
      payment_date DATE NOT NULL,
      method VARCHAR(30) NOT NULL DEFAULT 'cash',
      note TEXT NULL,
      created_by INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_finance_payments_charge_id (charge_id),
      INDEX idx_finance_payments_resident_id (resident_id),
      INDEX idx_finance_payments_payment_date (payment_date)
);

INSERT IGNORE INTO finance_fee_types (
      fee_code,
      fee_name,
      default_amount,
      cycle,
      description,
      is_active,
      sort_order
)
VALUES
      ('MONTHLY_FEE', 'Phí lưu trú tháng', 0, 'monthly', 'Khoản thu lưu trú theo tháng', 1, 10),
      ('MEAL_FEE', 'Phí ăn uống', 0, 'monthly', 'Khoản thu ăn uống hoặc sinh hoạt chung', 1, 20),
      ('OTHER_FEE', 'Khoản thu khác', 0, 'once', 'Khoản thu phát sinh khác', 1, 90);
