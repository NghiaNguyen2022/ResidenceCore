# ResidenceCore — Việc 16K9

## 1. Chạy migration

```sql
/drizzle/viec16k9_store_documents_multiline.sql
```

## 2. Chép file đúng đường dẫn

Gói đã giữ nguyên cấu trúc thư mục dự án.

## 3. Kiểm tra

```bash
pnpm check
pnpm test
pnpm build
```

## Lưu ý

- Các endpoint cũ `createStockIn`, `createPurchaseStock`, `createSaleStock` vẫn được giữ để tương thích.
- UI mới sử dụng `createStockInDocument` và `createSaleDocument`.
- `PROJECT_SUMMARY.md` và `RESIDENCECORE_CHECKLIST.md` không có trong bộ file người dùng gửi lần này, vì vậy gói cung cấp `TRACKING_APPEND_16K9.md` để append vào hai file tracking mới nhất, tránh ghi đè bản cũ.
