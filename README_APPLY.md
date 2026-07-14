# ResidenceCore — Việc 16K5

## Phạm vi

Bán hàng theo sản phẩm, giảm tồn kho và tự động ghi khoản thu cửa hàng.

## File cần chép

- `server/db/storeLedger.ts`
- `server/services/storeLedgerService.ts`
- `server/routers/modules/storeLedger.ts`
- `client/src/pages/StoreLedger.tsx`
- `PROJECT_SUMMARY.md`
- `RESIDENCECORE_CHECKLIST.md`

`drizzle/storeLedger.ts` được kèm để đối chiếu base nhưng không có thay đổi DB ở bước này.

## Migration

Không có migration mới. Enum `movementType = sale` đã tồn tại từ schema hiện tại.

## Kiểm tra

```bash
pnpm check
pnpm test
pnpm build
```

Runtime:

1. Bán số lượng nhỏ hơn tồn: giảm tồn và tăng tổng thu.
2. Bán hết tồn: tồn về 0.
3. Bán vượt tồn: bị chặn, không tạo khoản thu.
4. Giá bán thực tế khác giá hiện tại: dùng đúng giá phiếu, không cập nhật lịch sử giá bán.
5. Ngày đang chốt hoặc đã xác nhận chốt: bị chặn.
6. `/store-sales` chỉ còn nội dung bán hàng; chốt ngày và sổ phát sinh chỉ ở `/store-cashflow`.
