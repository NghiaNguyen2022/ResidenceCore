# 16L8.20 — Full code: bàn giao + giá mua/bán

Replace trực tiếp:

- `server/services/storeShiftHandoverService.ts`
- `client/src/components/store-ledger/StoreDocumentFormModal.tsx`

## Giá nhập
Ưu tiên:
1. `defaultCostPrice` — giá mua gần nhất.
2. `averageCostPrice` — giá mua trung bình.
3. Chưa có thì để trống.

## Giá bán
Ưu tiên:
1. `currentSalePrice`.
2. `defaultSalePrice`.
3. Nếu chưa có giá bán: dùng giá mua gần nhất.
4. Nếu chưa có giá mua gần nhất: dùng giá mua trung bình.

Khi dùng giá mua thay giá bán, giao diện hiện ghi chú màu vàng:
`Chưa có giá bán · đang tạm dùng giá mua ...`

## Bàn giao
- Chuẩn hóa ngày theo `Asia/Ho_Chi_Minh`.
- Tính đúng giao dịch trong ca qua `storeShiftId`.
- Bỏ giao dịch cancelled/void/inactive.
- Fallback dữ liệu cũ chưa có `storeShiftId`.

Sau khi replace:

```bash
pnpm check
pnpm dev
```
