# Việc 16K3-2 - Price history upsert fix

## Vấn đề
Khi cập nhật giá bán cùng một sản phẩm và cùng ngày áp dụng, bảng `storeProductSalePriceHistories` có unique key `(productId, effectiveDate)` nên insert lần 2 gây lỗi `Failed query insert into storeProductSalePriceHistories`.

## Cách sửa
- Thêm hàm `getStoreProductSalePriceHistoryByDate`.
- Thêm hàm `updateStoreProductSalePriceHistory`.
- Khi cập nhật giá bán:
  - Nếu đã có lịch sử giá cùng ngày thì cập nhật dòng đó.
  - Nếu chưa có thì tạo dòng mới.
  - Nếu gặp duplicate do race condition thì lấy lại dòng cùng ngày và update.

## Không đổi
- Không đổi schema/migration.
- Không đổi UI.
- Không đổi logic giá hiện tại: nếu ngày áp dụng <= hôm nay thì cập nhật currentSalePrice/defaultSalePrice.
