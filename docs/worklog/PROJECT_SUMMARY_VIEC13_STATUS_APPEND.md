
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

---

## 2026-07-04 — 13A: PASS

User xác nhận 13A pass. Chức năng danh sách thông báo nội bộ lite đã hoạt động ở mức cơ bản:

- Resident có menu/trang Thông báo.
- Resident xem được thông báo của mình.
- Có đánh dấu đã đọc.
- Công tác/khoản thu có thể phát sinh notification.

Sau 13A, user yêu cầu bổ sung chức năng tự popup thông báo.

---

## 2026-07-04 — 13B: Popup thông báo mới trong layout

Bổ sung popup thông báo lite ngay trong `ResidenceCareLayout`.

Nội dung patch 13B:

- `ResidenceCareLayout` query danh sách thông báo chưa đọc của resident bằng `residentPortal.getMyNotifications`.
- Dùng polling nhẹ 30 giây, không dùng WebSocket/realtime phức tạp.
- Khi có thông báo chưa đọc, hiển thị popup góc phải phía trên.
- Popup có tiêu đề/nội dung ngắn, nút ẩn, nút `Đã đọc`, nút `Xem tất cả`.
- Nút `Đã đọc` gọi `residentPortal.markMyNotificationRead` và invalidate cache notification.
- Nút `Xem tất cả` điều hướng tới `/resident/notifications`.
- Popup chỉ bật cho user có role `resident`, không hiển thị cho manager hoặc khi đang bị bắt buộc đổi mật khẩu.

Patch này không đổi schema, không đổi API, không thêm WebSocket/push/email.

---

## 2026-07-04 — 13C: Badge số thông báo chưa đọc trên menu portal

Sau 13A và 13B, bổ sung polish nhỏ cho trải nghiệm portal: menu `Thông báo` hiển thị badge số lượng chưa đọc.

Nội dung patch 13C:

- `ResidenceCareLayout` gọi `residentPortal.getMyUnreadNotificationCount` cho resident user.
- Gắn badge động vào navigation item `/resident/notifications`.
- Badge tự ẩn khi số chưa đọc bằng 0.
- Badge hiển thị `99+` nếu số thông báo chưa đọc quá lớn.
- Query dùng polling nhẹ 30 giây, đồng bộ với popup thông báo 13B.
- Không đổi schema, không đổi API/backend, không thêm realtime/WebSocket/push.

Patch này giúp demo rõ hơn: học viên vừa có popup khi có thông báo mới, vừa luôn nhìn thấy số lượng thông báo chưa đọc trên menu portal.

---

## 2026-07-08 — 13D: Polish trang thông báo portal học viên

User phản hồi trang `/resident/notifications` đã có chức năng nhưng UI chưa chuyên nghiệp: card quá lớn, lặp tiêu đề nhiều, nút đánh dấu đọc chiếm nhiều diện tích và thiếu bộ lọc nhanh.

Patch 13D chuẩn bị:

- Chuyển trang thông báo thành notification center dạng inbox gọn.
- Header giữ tone premium nhưng gọn hơn, có thống kê nhỏ `chưa đọc` và `tổng thông báo`.
- Thêm filter bar client-side: `Tất cả`, `Chưa đọc`, `Công tác`, `Tài chính`, `Hệ thống`.
- Mỗi thông báo hiển thị dạng row/card compact: icon loại, badge loại, trạng thái đọc, title, nội dung, thời gian, action nhỏ.
- Giữ nguyên API/backend/schema; chỉ chỉnh `client/src/pages/ResidentNotifications.tsx`.

Patch này tiếp tục giữ phạm vi Việc 13 ở mức lite, không thêm realtime/WebSocket/push.
