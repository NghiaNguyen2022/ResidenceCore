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
- Popup thông báo mới ở mức lite trong layout portal.

### Không làm trong Việc 13

- Realtime WebSocket.
- Push notification/mobile push.
- Email/SMS/Zalo.
- Notification template phức tạp.
- Rule engine nâng cao.
- Lịch nhắc nhiều cấp.

---

## Checklist audit

- [x] Kiểm tra schema/bảng notification hiện có.
- [x] Kiểm tra router/service notification hiện có nếu có.
- [x] Kiểm tra navigation manager/resident có menu thông báo chưa.
- [x] Kiểm tra Resident Portal có trang/khối thông báo chưa.
- [x] Kiểm tra notification có liên kết target module/targetId chưa.
- [x] Kiểm tra quyền: resident chỉ xem thông báo của mình.
- [ ] Kiểm tra quyền: manager xem/quản trị thông báo phù hợp. Ghi chú: chưa làm manager notification center ở 13A/13B.

---

## 13A — Notification lite API/page/menu

### Trạng thái

- [x] User apply patch 13A.
- [x] User xác nhận 13A pass.

### Nội dung đã làm

- [x] Chuẩn hóa notification recipient theo `users.id`.
- [x] Thêm API resident portal:
  - [x] `getMyNotifications`
  - [x] `getMyUnreadNotificationCount`
  - [x] `markMyNotificationRead`
- [x] Thêm trang `/resident/notifications`.
- [x] Thêm menu `Thông báo` trong resident navigation.
- [x] Tạo thông báo khi phân công công tác theo cá nhân/phòng/tổ/ban.
- [x] Tạo thông báo khi áp dụng kỳ thu cho học viên.
- [x] Không làm realtime/WebSocket/push/email.

---

## 13B — Popup thông báo mới trong layout

### Lý do bổ sung

Sau 13A, user xác nhận chức năng danh sách thông báo đã pass nhưng còn thiếu khả năng tự popup thông báo mới. Cần bổ sung popup lite, không dùng realtime phức tạp.

### Checklist patch

- [x] Thêm query unread notifications trong `ResidenceCareLayout` cho resident user.
- [x] Tự hiển thị popup khi có thông báo chưa đọc.
- [x] Popup hiển thị tiêu đề/nội dung ngắn.
- [x] Có nút ẩn popup trong phiên hiện tại.
- [x] Có nút đánh dấu đã đọc.
- [x] Có nút mở trang Thông báo.
- [x] Không hiển thị khi bắt buộc đổi mật khẩu.
- [x] Không ảnh hưởng manager navigation.
- [x] Không dùng WebSocket/realtime nâng cao; dùng polling nhẹ.

### Runtime test 13B

- [ ] Resident login khi có thông báo chưa đọc sẽ thấy popup.
- [ ] Bấm X thì popup ẩn, thông báo vẫn chưa đọc.
- [ ] Bấm Đã đọc thì popup mất và notification chuyển trạng thái đã đọc.
- [ ] Bấm Xem tất cả đi tới `/resident/notifications`.
- [ ] Popup không che modal đổi mật khẩu.
- [ ] Manager không thấy popup resident notification.

---

## Trạng thái hiện tại

- 13A: PASS.
- 13B: Patch chuẩn bị, chờ user apply/test.

---

## 13C — Badge số thông báo chưa đọc trên menu portal

### Lý do bổ sung

Sau 13A có trang thông báo và 13B có popup thông báo mới, portal vẫn cần một dấu hiệu nhẹ trên menu để học viên biết còn bao nhiêu thông báo chưa đọc ngay cả khi đã tắt popup trong phiên hiện tại.

### Checklist patch

- [x] Dùng `residentPortal.getMyUnreadNotificationCount` trong `ResidenceCareLayout`.
- [x] Polling nhẹ 30 giây, đồng bộ với popup 13B.
- [x] Gắn badge số chưa đọc vào menu `/resident/notifications`.
- [x] Ẩn badge khi không còn thông báo chưa đọc.
- [x] Giới hạn hiển thị `99+` nếu số lượng lớn.
- [x] Không hiện badge cho manager.
- [x] Không đổi schema/API/backend.

### Runtime test 13C

- [ ] Resident có 0 thông báo chưa đọc: menu Thông báo không có badge.
- [ ] Resident có 1+ thông báo chưa đọc: menu Thông báo hiện badge số.
- [ ] Bấm `Đã đọc` trong popup: badge giảm/mất sau khi cache invalidate.
- [ ] Đánh dấu đã đọc ở trang Thông báo: badge cập nhật.
- [ ] Manager không thấy badge thông báo resident.

### Trạng thái

- 13C: Patch chuẩn bị, chờ user apply/test.

---

## 13D — Polish trang `/resident/notifications`

### Lý do bổ sung

Sau 13A/13B/13C, trang thông báo đã đủ chức năng nhưng UI còn nặng: card quá cao, tiêu đề lặp lớn, action chiếm diện tích và thiếu bộ lọc nhanh. User yêu cầu chỉnh lại trang cho chuyên nghiệp hơn.

### Checklist patch

- [x] Chuyển trang thông báo về kiểu notification center / inbox gọn.
- [x] Giảm chiều cao card thông báo.
- [x] Giảm kích thước title item, tránh cảm giác landing page.
- [x] Thêm filter bar: Tất cả / Chưa đọc / Công tác / Tài chính / Hệ thống.
- [x] Thêm summary nhỏ: số chưa đọc và tổng thông báo.
- [x] Thêm icon theo loại thông báo.
- [x] Nút đánh dấu đã đọc chuyển thành action nhỏ.
- [x] Giữ nguyên API residentPortal.getMyNotifications / markMyNotificationRead.
- [x] Không đổi backend/schema/navigation.

### Runtime test 13D

- [ ] Trang `/resident/notifications` nhìn gọn, chuyên nghiệp hơn.
- [ ] Filter `Tất cả` hiển thị đủ thông báo.
- [ ] Filter `Chưa đọc` chỉ hiển thị thông báo chưa đọc.
- [ ] Filter `Công tác` chỉ hiển thị thông báo công tác.
- [ ] Filter `Tài chính` chỉ hiển thị thông báo tài chính.
- [ ] Bấm `Đánh dấu` cập nhật trạng thái đọc và invalidate badge/popup.
- [ ] Empty state đúng khi chưa có thông báo hoặc filter không có kết quả.

### Trạng thái

- 13D: Patch chuẩn bị, chờ user apply/test.
