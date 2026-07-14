# Việc 16K3-5 — Sale price history append-only

## Lý do

Cập nhật giá bán không nên ghi đè lịch sử theo ngày. Một ngày có thể có nhiều lần thử/điều chỉnh giá, cần lưu lại lịch sử đầy đủ.

## Đã chỉnh

- Bỏ unique index `storeProductSalePriceHistories_product_date_unique`.
- Khi cập nhật giá bán: luôn thêm một dòng lịch sử giá mới.
- Lý do thay đổi không bắt buộc; nếu trống thì mặc định `manual`.
- `salePrice = ?` trong lỗi SQL chỉ là placeholder của prepared statement; giá thật nằm ở `params`, ví dụ `5000.00`.

## File ảnh hưởng

- `drizzle/storeLedger.ts`
- `drizzle/viec16k3_5_sale_price_history_allow_multiple_per_day.sql`
- `server/db/storeLedger.ts`
- `server/services/storeLedgerService.ts`
