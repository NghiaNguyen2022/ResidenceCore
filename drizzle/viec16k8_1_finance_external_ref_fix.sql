-- Việc 16K8.1: sửa idempotency khi đẩy chốt cửa hàng sang Finance
SET @has_external_ref := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'finance_transactions'
    AND COLUMN_NAME = 'external_ref'
);
SET @sql_add_external_ref := IF(
  @has_external_ref = 0,
  'ALTER TABLE finance_transactions ADD COLUMN external_ref VARCHAR(160) NULL AFTER description',
  'SELECT 1'
);
PREPARE stmt FROM @sql_add_external_ref;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_external_ref_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'finance_transactions'
    AND INDEX_NAME = 'uq_finance_transactions_external_ref'
);
SET @sql_add_external_ref_index := IF(
  @has_external_ref_index = 0,
  'CREATE UNIQUE INDEX uq_finance_transactions_external_ref ON finance_transactions (external_ref)',
  'SELECT 1'
);
PREPARE stmt FROM @sql_add_external_ref_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
