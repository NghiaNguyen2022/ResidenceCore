# ResidenceCore — Việc 16K4.3

## Mục tiêu

Tách giao diện Nhập kho khỏi các nội dung kế toán/thu chi.

## File cần chép

```text
client/src/pages/StoreLedger.tsx
PROJECT_SUMMARY.md
RESIDENCECORE_CHECKLIST.md
```

Không có migration mới.

## Kiểm tra

```bash
pnpm check
pnpm test
pnpm build
```

Runtime:

1. `/store-purchase` chỉ hiển thị bộ lọc và Lịch sử nhập kho.
2. Không còn Lịch sử chốt ngày, Sổ phát sinh, Chốt sổ ngày hoặc bộ lọc Thu/Chi tại trang Nhập kho.
3. `/store-cashflow` vẫn giữ các nội dung thu chi và chốt ngày.
