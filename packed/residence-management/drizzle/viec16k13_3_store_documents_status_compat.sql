-- Việc 16K13.3
-- Đồng bộ tên cột trạng thái storeDocuments giữa DB và Drizzle schema.
-- Migration 16K9 chuẩn tạo cột `status`. Script này chỉ xử lý DB từng được tạo nhầm thành `documentStatus`.

SET @schema_name := DATABASE();
SET @has_status := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'storeDocuments' AND COLUMN_NAME = 'status'
);
SET @has_document_status := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'storeDocuments' AND COLUMN_NAME = 'documentStatus'
);

SET @sql := IF(
  @has_status = 0 AND @has_document_status = 1,
  'ALTER TABLE storeDocuments CHANGE COLUMN documentStatus status ENUM(''posted'',''cancelled'') NOT NULL DEFAULT ''posted''',
  'SELECT ''storeDocuments.status is already compatible'' AS result'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
