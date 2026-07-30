-- Việc 16K3-5: Cho phép lưu nhiều lần thay đổi giá bán trong cùng một ngày.
-- Lý do: lịch sử giá bán là nhật ký thay đổi, không nên unique theo productId + effectiveDate.
-- File migration đặt trong /drizzle theo quy ước mới.

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'storeProductSalePriceHistories'
    AND INDEX_NAME = 'storeProductSalePriceHistories_product_date_unique'
);

SET @sql := IF(
  @idx_exists > 0,
  'ALTER TABLE storeProductSalePriceHistories DROP INDEX storeProductSalePriceHistories_product_date_unique',
  'SELECT ''storeProductSalePriceHistories_product_date_unique not found; skipped'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE INDEX storeProductSalePriceHistories_product_date_idx
  ON storeProductSalePriceHistories (productId, effectiveDate);
