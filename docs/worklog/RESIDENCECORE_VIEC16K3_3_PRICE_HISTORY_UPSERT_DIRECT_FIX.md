# Việc 16K3-3 - Price history direct upsert fix

## Vấn đề
Cập nhật giá bán vẫn lỗi ở bước `select ... where productId = ? and effectiveDate = ?` trước khi insert/update lịch sử giá bán.

## Hướng sửa
Bỏ bước pre-select theo ngày. Dùng MySQL `INSERT ... ON DUPLICATE KEY UPDATE` trực tiếp theo unique key `(productId, effectiveDate)`.

## File ảnh hưởng
- `server/db/storeLedger.ts`
- `server/services/storeLedgerService.ts`

## Test
- Cập nhật giá bán lần đầu cho một ngày.
- Cập nhật lại giá bán cùng ngày.
- Lịch sử giá không trùng ngày, giá ngày đó được cập nhật.
