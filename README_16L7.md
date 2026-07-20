# Việc 16L7 — Chốt ngày, quá hạn, review/xác nhận và mở lại

## File
- server/db/storeLedger.ts
- server/services/storeShiftClosingService.ts
- server/routers/modules/storeLedger.ts
- client/src/pages/ResidentStore.tsx

## Luồng
- Học viên ca chiều chốt ngày: shift chuyển `closed`, phiên Store bị thu hồi, quay về Công tác.
- Quản lý review: daily closing và shift cùng chuyển `reviewed`.
- Quản lý xác nhận: giữ nguyên luồng đẩy Finance hiện có; shift chuyển `confirmed`.
- Quá giờ ca chiều mà chưa chốt: shift chuyển `closing_overdue`, gửi cảnh báo owner.
- Quản lý mở lại: bắt buộc lý do, chỉ khi chưa xác nhận/đẩy Finance; giao dịch được trả về chưa chốt, shift chuyển `closing_pending`.

## Áp dụng
Giải nén vào thư mục gốc ResidenceCore, chọn Replace/Overwrite, rồi chạy:

pnpm check
pnpm dev

## Trạng thái
- Không có migration mới.
- Chưa runtime test.
