
---

# PROJECT SUMMARY APPEND — VIỆC 13

## 2026-07-04 — Start Việc 13: Thông báo nội bộ Lite

Sau khi Việc 12 Organization + Công tác + Portal theo chức vụ đã Done/Pass, chuyển sang Việc 13 để bổ sung thông báo nội bộ ở mức lite cho demo full flow.

### Mục tiêu Việc 13

Tạo/chuẩn hóa chức năng thông báo nội bộ đơn giản, phục vụ các tình huống demo thực tế:

- Học viên thấy thông báo liên quan đến mình trên portal.
- Thông báo có trạng thái đã đọc/chưa đọc.
- Thông báo có thể gắn với công tác, tài chính hoặc hoạt động liên quan.
- Manager có thể xem/kiểm soát thông báo ở mức cần thiết.
- UI/UX đơn giản, rõ ràng, không realtime phức tạp.

### Phạm vi giữ gọn

Việc 13 chỉ làm notification lite. Không làm WebSocket, push notification, email/SMS/Zalo, template engine hoặc rule engine nâng cao.

### Nguyên tắc tracking

Các file tracking của Việc 13 phải append-only. Khi cập nhật checklist hoặc PROJECT_SUMMARY, không thay thế nội dung cũ; phải ghi thêm cuối file và gửi lại bản full accumulated.

---

## 2026-07-04 — 13A: Notification lite audit + patch chuẩn bị

Đã audit các file do user gửi cho Việc 13, bao gồm schema, resident portal router/service, notification service, duties/finance routers, navigation resident và ResidentToday/MyDuties.

Kết quả chính:

- Project đã có bảng `notifications` trong schema.
- `notifications.recipientId` đang reference `users.id`; vì vậy thông báo gửi cho học viên phải resolve từ `resident.userId`.
- Resident Portal chưa có API xem thông báo cá nhân / đếm chưa đọc / đánh dấu đã đọc.
- Resident Portal chưa có route/menu `Thông báo`.
- Luồng phân công công tác và áp dụng kỳ thu chưa phát sinh notification lite rõ ràng cho portal học viên.

Patch 13A chuẩn bị:

- Chuẩn hóa `server/services/notificationService.ts` để gửi/list/mark-read notification theo user recipient.
- Thêm API vào `server/routers/modules/residentPortal.ts`:
  - `getMyNotifications`
  - `getMyUnreadNotificationCount`
  - `markMyNotificationRead`
- Gắn thông báo khi phân công công tác trong `server/routers/modules/duties.ts`.
- Gắn thông báo khi áp dụng kỳ thu trong `server/routers/modules/finance.ts`.
- Thêm trang `client/src/pages/ResidentNotifications.tsx`.
- Thêm route `/resident/notifications` trong `client/src/App.tsx`.
- Thêm menu `Thông báo` vào `client/src/navigation/residentNavigation.ts`.

Phạm vi vẫn giữ lite: không realtime, không push notification, không email/SMS/Zalo, không template engine phức tạp.
