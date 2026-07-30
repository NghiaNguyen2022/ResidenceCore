-- Việc 16K10.2
-- Bổ sung cột hình minh họa đúng vào bảng storeProducts.
-- Migration idempotent: có thể chạy lại mà không tạo trùng cột.

SET @has_product_image_url := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeProducts'
    AND COLUMN_NAME = 'imageUrl'
);
SET @sql_product_image_url := IF(
  @has_product_image_url = 0,
  'ALTER TABLE storeProducts ADD COLUMN imageUrl VARCHAR(1000) NULL AFTER description',
  'SELECT 1'
);
PREPARE stmt_product_image_url FROM @sql_product_image_url;
EXECUTE stmt_product_image_url;
DEALLOCATE PREPARE stmt_product_image_url;

SET @has_product_image_data := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeProducts'
    AND COLUMN_NAME = 'imageData'
);
SET @sql_product_image_data := IF(
  @has_product_image_data = 0,
  'ALTER TABLE storeProducts ADD COLUMN imageData MEDIUMTEXT NULL AFTER imageUrl',
  'SELECT 1'
);
PREPARE stmt_product_image_data FROM @sql_product_image_data;
EXECUTE stmt_product_image_data;
DEALLOCATE PREPARE stmt_product_image_data;
