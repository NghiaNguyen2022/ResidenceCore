# Việc 16K3-4 — Price history update-then-insert fix

## Lý do

Môi trường MySQL/driver vẫn lỗi với `ON DUPLICATE KEY UPDATE` khi cập nhật lịch sử giá bán.

## Cách sửa

- Bỏ raw SQL `INSERT ... ON DUPLICATE KEY UPDATE`.
- Dùng Drizzle `update` trước theo `productId + effectiveDate`.
- Nếu chưa có dòng thì `insert` mới.
- Nếu bị duplicate do race-condition thì update lại.

## File ảnh hưởng

- `server/db/storeLedger.ts`
- `server/services/storeLedgerService.ts` giữ nguyên logic gọi upsert.

## Test

- Cập nhật giá bán cùng một sản phẩm cùng một ngày nhiều lần.
- Không còn lỗi Failed query insert/select/upsert.
- Lịch sử giá chỉ có một dòng cho mỗi sản phẩm + ngày áp dụng.
