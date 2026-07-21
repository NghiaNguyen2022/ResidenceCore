# 16L8.8 — Hoàn thiện gửi mã Cửa hàng qua Thông báo

## File thay thế
`server/services/storeDutyAccessService.ts`

## Điểm sửa
- Không còn phụ thuộc vào object resident trung gian để lấy userId.
- Đọc trực tiếp `residents.userId` từ DB.
- Tạo trực tiếp bản ghi trong bảng `notifications` với `recipientId = residents.userId`.
- Nội dung có mã 6 số và hướng dẫn vào Cửa hàng.
- Trả về `recipientUserId` và `notificationId` để frontend/server kiểm tra.
- Log server:
  `[STORE ACCESS] Notification sent`
- Nếu gửi thông báo thất bại:
  - thu hồi mã vừa tạo;
  - trả ca về `scheduled`;
  - báo lỗi rõ ràng;
  - không để tồn tại mã mà học viên không nhận được.

## Áp dụng
Giải nén vào thư mục gốc ResidenceCore và Replace file.

Sau đó:
```bash
pnpm check
pnpm dev
```

## Test
1. Quản lý mở Chi tiết công tác Trực cửa hàng.
2. Bấm `Gửi mã qua Thông báo`.
3. Phải thấy toast thành công.
4. Terminal phải có `[STORE ACCESS] Notification sent`.
5. Học viên reload trang Thông báo.
6. Thấy thông báo `Mã vào Cửa hàng`.

Có thể chạy:
`drizzle/verify_store_access_notifications.sql`
để đối chiếu `residents.userId = notifications.recipientId`.
