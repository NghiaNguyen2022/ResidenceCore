# RESIDENCECORE CHECKLIST - VIỆC 13

## Việc 13 — Thông báo nội bộ Lite

### Mục tiêu

Xây dựng/rá soát module thông báo nội bộ ở mức lite để phục vụ demo full flow, không làm realtime phức tạp.

Luồng demo cần hỗ trợ:

- Manager tạo hoặc hệ thống phát sinh thông báo.
- Học viên thấy thông báo của mình trên portal.
- Thông báo liên quan công tác/khoản thu có thể dẫn về màn phù hợp.
- Có trạng thái đã đọc/chưa đọc.
- UI đơn giản, dễ hiểu, không làm nặng hệ thống.

---

## Nguyên tắc phạm vi

### Làm trong Việc 13

- Notification nội bộ cơ bản.
- Danh sách thông báo.
- Đếm chưa đọc nếu đã có nền.
- Mark as read.
- Notification cho công tác được giao.
- Notification cho khoản thu mới nếu route/service finance hiện tại hỗ trợ dễ nối.
- Portal học viên xem thông báo cá nhân.

### Không làm trong Việc 13

- Realtime WebSocket.
- Push notification/mobile push.
- Email/SMS/Zalo.
- Notification template phức tạp.
- Rule engine nâng cao.
- Lịch nhắc nhiều cấp.

---

## Checklist audit

- [ ] Kiểm tra schema/bảng notification hiện có.
- [ ] Kiểm tra router/service notification hiện có nếu có.
- [ ] Kiểm tra navigation manager/resident có menu thông báo chưa.
- [ ] Kiểm tra Resident Portal có trang/khối thông báo chưa.
- [ ] Kiểm tra notification có liên kết target module/targetId chưa.
- [ ] Kiểm tra quyền: resident chỉ xem thông báo của mình.
- [ ] Kiểm tra quyền: manager xem/quản trị thông báo phù hợp.

---

## Checklist patch dự kiến

- [ ] Thêm hoặc chuẩn hóa notification service/db tối thiểu.
- [ ] Thêm API list my notifications.
- [ ] Thêm API mark as read.
- [ ] Thêm helper tạo notification nội bộ.
- [ ] Gắn notification khi phân công công tác nếu phù hợp.
- [ ] Gắn notification khi tạo khoản thu nếu phù hợp.
- [ ] Thêm/chuẩn hóa UI thông báo lite.
- [ ] Cập nhật portal học viên.
- [ ] Cập nhật checklist và PROJECT_SUMMARY theo append-only.

---

## Runtime test

- [ ] Resident login thấy danh sách thông báo của mình.
- [ ] Resident không thấy thông báo của người khác.
- [ ] Phân công công tác phát sinh thông báo hoặc hiển thị rõ trong portal.
- [ ] Khoản thu mới phát sinh thông báo nếu scope được chốt.
- [ ] Click/mark read cập nhật trạng thái.
- [ ] Empty state đẹp khi chưa có thông báo.
- [ ] UI không rối, không modal chồng không cần thiết.

---

## Trạng thái

- 2026-07-04: Bắt đầu Việc 13 sau khi Việc 12 Done/Pass.

---

## 2026-07-04 — 13A: Notification lite audit + patch chuẩn bị

### Audit kết quả

- [x] Schema hiện đã có bảng `notifications` trong `drizzle/schema.ts`.
- [x] Đã có `server/services/notificationService.ts` nhưng đang thiên về helper cũ.
- [x] `notifications.recipientId` reference `users.id`, vì vậy thông báo cho học viên phải resolve từ `resident.userId`, không dùng nhầm `resident.id`.
- [x] Resident Portal hiện chưa có API list/mark-read notification.
- [x] Resident Portal navigation hiện chưa có menu Thông báo.
- [x] Phân công công tác chưa phát sinh thông báo nội bộ rõ ràng.
- [x] Áp dụng kỳ thu có thể gắn thông báo lite theo từng học viên nếu tính được số tiền áp dụng.

### Patch 13A

- [x] Chuẩn hóa `notificationService` theo hướng recipient là `userId`.
- [x] Thêm API resident portal:
  - `getMyNotifications`
  - `getMyUnreadNotificationCount`
  - `markMyNotificationRead`
- [x] Gắn thông báo khi phân công công tác:
  - cá nhân
  - phòng
  - tổ
  - ban
- [x] Gắn thông báo khi áp dụng kỳ thu, nếu dòng học viên có tổng tiền > 0.
- [x] Thêm trang portal `ResidentNotifications`.
- [x] Thêm route `/resident/notifications`.
- [x] Thêm menu `Thông báo` cho resident portal.
- [x] Không làm realtime/WebSocket/push.

### File patch 13A

- `server/services/notificationService.ts`
- `server/routers/modules/residentPortal.ts`
- `server/routers/modules/duties.ts`
- `server/routers/modules/finance.ts`
- `client/src/pages/ResidentNotifications.tsx`
- `client/src/navigation/residentNavigation.ts`
- `client/src/App.tsx`

### Runtime test cần chạy

- [ ] Apply patch 13A.
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Resident login thấy menu `Thông báo`.
- [ ] Resident mở `/resident/notifications` thấy empty state nếu chưa có thông báo.
- [ ] Manager phân công công tác cho cá nhân → resident nhận thông báo.
- [ ] Manager phân công công tác cho phòng → resident trong phòng nhận thông báo.
- [ ] Manager phân công công tác cho tổ/ban → thành viên tổ/ban nhận thông báo.
- [ ] Manager áp dụng kỳ thu → resident có tài khoản nhận thông báo tài chính.
- [ ] Resident đánh dấu đã đọc → trạng thái cập nhật, không thấy thông báo của người khác.
