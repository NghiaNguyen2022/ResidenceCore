# Việc 16L6 — Bàn giao ca Cửa hàng

## File
- server/db/storeLedger.ts
- server/services/storeShiftHandoverService.ts
- server/routers/modules/storeLedger.ts
- client/src/pages/ResidentStore.tsx

## Luồng
- Ca sáng lập bản nháp bàn giao.
- Hệ thống tính tiền dự kiến = tiền đầu ca + thu - chi.
- Ca sáng nhập tiền mặt thực tế, lý do chênh lệch, ghi chú.
- Người lập ký giao.
- Ca chiều đăng nhập đúng ca và ký nhận.
- Khi nhận xong:
  - biên bản chuyển `completed`;
  - ca sáng chuyển `handed_over`;
  - tiền thực nhận trở thành `openingCash` của ca chiều.
- Sau khi ký giao, ca sáng không sửa được.
- Quản lý có endpoint xem danh sách, không có endpoint ký thay.

## Áp dụng
Giải nén vào thư mục gốc ResidenceCore và chọn Replace/Overwrite.

Sau đó chạy:
pnpm check
pnpm dev

## Ghi chú
- Không có migration mới vì bảng `storeShiftHandovers` và các cột tiền đã có từ 16L1.
- Phần tổng thu/chi hiện lấy theo ngày và cửa hàng; cần runtime audit cùng dữ liệu ca thực tế.
- 16L6 chưa runtime test.
