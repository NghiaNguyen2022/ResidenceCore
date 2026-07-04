# ResidenceCore Checklist - Việc 11: Học tập / Lịch học

## Trạng thái

- Việc 1 → 10: Done / Pass.
- Việc 11: In progress - patch ready.

## Scope Việc 11

Mục tiêu demo: quản lý nhập được thông tin học tập và lịch học của học viên; lịch học dùng để tránh phân công công tác trùng giờ.

## Checklist chi tiết

### UI/UX

- [x] Có tab Học tập trong chi tiết học viên.
- [x] Có phần thông tin học tập.
- [x] Có phần lịch học.
- [x] Giờ học dùng `TimePickerInput`.
- [ ] Runtime test thao tác tạo/sửa/xóa lịch học.

### Backend/API

- [x] Có API lấy/lưu thông tin học tập.
- [x] Có API lấy/tạo/sửa/xóa lịch học.
- [x] Patch 11A thêm guard manager cho query học tập/lịch học.
- [x] Patch 11A chặn cập nhật cho học viên đã inactive/transferred_out/left.
- [x] Patch 11A validate giờ học đúng `HH:mm`.

### Data

- [x] Có bảng `residentEducation`.
- [x] Có bảng `residentStudySchedules`.
- [x] Có check trùng lịch trong cùng ngày.
- [x] Patch 11A làm chặt validate giờ ở DB layer.

### Test cần chạy

- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`

## Kết luận hiện tại

Patch ready, chờ apply và runtime test.
