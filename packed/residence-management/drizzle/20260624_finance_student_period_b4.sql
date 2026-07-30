ALTER TABLE finance_charges
      ADD COLUMN billing_month VARCHAR(7) NULL AFTER target_name,
      ADD COLUMN period_start_date DATE NULL AFTER billing_month,
      ADD COLUMN period_end_date DATE NULL AFTER period_start_date,
      ADD COLUMN period_charge_mode VARCHAR(40) NULL AFTER period_end_date,
      ADD COLUMN period_multiplier DECIMAL(10, 2) NOT NULL DEFAULT 1 AFTER period_charge_mode;

CREATE INDEX idx_finance_charges_period
      ON finance_charges (resident_id, fee_type_id, billing_month, period_start_date, period_end_date);
