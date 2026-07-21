# 16L8.4 — Nút gửi mã Cửa hàng trên card công tác

## File hoàn chỉnh
- server/services/storeDutyAccessService.ts
- server/routers/modules/storeLedger.ts

## Frontend
- client/src/pages/Duties.tsx.patch

Patch frontend được tạo đúng theo `Duties.tsx` tại commit GitHub:
`5389e00cdf04e358aae7080aa2268154ba56c224`

## Áp dụng

1. Giải nén vào thư mục gốc ResidenceCore.
2. Replace hai file backend.
3. Từ thư mục gốc chạy:

```bash
git apply --whitespace=fix client/src/pages/Duties.tsx.patch
pnpm check
pnpm dev
```

Sau khi patch thành công có thể xóa file `.patch`.

## Kết quả
- Card công tác có tên chứa `cửa hàng` và giao trực tiếp cho học viên sẽ hiện nút `Gửi mã Cửa hàng`.
- Quản lý bấm nút trực tiếp, không cần mở chi tiết.
- Backend tự tìm ca Store từ `dutyAssignmentId`.
- Mã cũ bị thu hồi, mã mới tạo và gửi qua Thông báo.
- Quản lý không thấy mã trên màn hình.
