# Việc 16L3 — Vào Cửa hàng bằng mã ca trực

## Base đã đọc từ GitHub
Repo: NghiaNguyen2022/ResidenceCore
Branch: main

## File mới
- `server/services/storeDutyAccessService.ts`

## File patch
- `server/db/storeLedger.ts`
- `server/routers/modules/residentPortal.ts`
- `server/routers/modules/storeLedger.ts`
- `client/src/pages/MyDuties.tsx`

## Chức năng
- Quản lý cấp mã 6 số cho từng học viên trong đúng ca trực.
- Mã chỉ lưu dưới dạng HMAC hash.
- Mã mới thu hồi phiên/mã cũ của cùng học viên trong ca.
- Portal học viên thấy card “Ca trực Cửa hàng”.
- Nút “Vào cửa hàng” chỉ bật trong access window của ca.
- Học viên nhập mã, backend kiểm tra ca + thành viên + thời gian.
- Khi đúng mã, tạo access token tạm thời và giữ nguyên phiên portal.
- Token được lưu ở `sessionStorage` phía client để dùng ở 16L4/16L5.

## Biến môi trường
Bắt buộc có một trong:
- `STORE_ACCESS_SECRET`
- `JWT_SECRET`
- `SESSION_SECRET`

Khuyến nghị thêm:
`STORE_ACCESS_SECRET=<chuỗi-ngẫu-nhiên-dài>`

## Chưa làm trong bước này
- timeout 30 phút theo hoạt động Store;
- middleware bảo vệ từng API bán/nhập hàng;
- menu nghiệp vụ Cửa hàng cho học viên;
- bàn giao/chốt ca.

## Kiểm tra
1. `pnpm check`
2. `pnpm dev`
3. Quản lý gọi `storeLedger.issueDutyAccessCode`.
4. Đăng nhập học viên được phân công.
5. Mở “Công tác của tôi” → “Vào cửa hàng”.
6. Nhập mã 6 số.
