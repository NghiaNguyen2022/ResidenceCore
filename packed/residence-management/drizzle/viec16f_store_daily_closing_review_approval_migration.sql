-- Việc 16F - Store daily closing review/approval workflow
-- Compatible MySQL/MariaDB style: adds review/approval columns if missing.

ALTER TABLE storeDailyClosings
  MODIFY COLUMN status ENUM('draft','reviewed','approved','cancelled','closed') NOT NULL DEFAULT 'draft';

UPDATE storeDailyClosings
SET status = 'approved'
WHERE status = 'closed';

SET @db_name := DATABASE();

SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE storeDailyClosings ADD COLUMN reviewedBy INT NULL AFTER notes',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeDailyClosings' AND COLUMN_NAME = 'reviewedBy'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE storeDailyClosings ADD COLUMN reviewedAt TIMESTAMP NULL AFTER reviewedBy',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeDailyClosings' AND COLUMN_NAME = 'reviewedAt'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE storeDailyClosings ADD COLUMN approvedBy INT NULL AFTER reviewedAt',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeDailyClosings' AND COLUMN_NAME = 'approvedBy'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE storeDailyClosings ADD COLUMN approvedAt TIMESTAMP NULL AFTER approvedBy',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'storeDailyClosings' AND COLUMN_NAME = 'approvedAt'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
