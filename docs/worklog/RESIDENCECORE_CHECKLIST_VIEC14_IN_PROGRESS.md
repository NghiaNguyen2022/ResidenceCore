# RESIDENCECORE_CHECKLIST_VIEC14_IN_PROGRESS

## Nguyên tắc tracking
- File này ghi theo kiểu append-only / full-history.
- Không ghi đè các mục cũ; mỗi bước mới thêm vào cuối.
- Việc 14 tập trung module Hoạt động / Sự kiện lite, phục vụ demo full flow.

## Việc 14 — Hoạt động / Sự kiện lite

### Mục tiêu
- Manager tạo/sửa/hủy/xóa mềm hoạt động.
- Hoạt động có thể bật/tắt hiển thị trên portal học viên.
- Resident xem hoạt động công khai.
- UI/UX đơn giản, cùng style premium của hệ thống.
- Không làm đăng ký tham gia, điểm danh, workflow duyệt phức tạp ở bản lite.

### 14 Start — Checklist / file request
- [x] Tạo checklist khởi động Việc 14.
- [x] Xác định scope lite.
- [x] Yêu cầu các file nền: App, layout, navigation, schema.

### 14A — Activities lite
- [x] Thêm/chuẩn hóa table activities và activityParticipants.
- [x] Thêm cờ isPublicOnPortal.
- [x] Manager xem/tạo/sửa/hủy/xóa mềm hoạt động.
- [x] Manager lọc theo trạng thái/loại/tìm kiếm.
- [x] Resident xem hoạt động công khai ở /resident/activities.
- [x] Hoạt động nội bộ không hiện trên portal.
- [x] Date dùng FormDateInput.
- [x] Time dùng TimePickerInput.
- [x] Manager menu bật Hoạt động / Sự kiện.
- [x] Resident portal menu thêm Hoạt động.

### 14B — Activities DB migration fix
- [x] Phát hiện DB runtime lỗi do bảng/cột activities chưa align schema 14A.
- [x] Tạo SQL migration bổ sung bảng/cột/index cần thiết.
- [x] User chạy SQL nhưng MySQL không hỗ trợ ADD COLUMN IF NOT EXISTS.

### 14B2 — Activities DB migration compatible MySQL
- [x] Tạo migration tương thích MySQL cũ hơn bằng INFORMATION_SCHEMA.
- [x] Tránh dùng ALTER TABLE ADD COLUMN IF NOT EXISTS.
- [x] User chạy xong migration.

### 14C — Activities layout polish
- [x] Gọn lại header/list/filter.
- [x] Chuyển card hoạt động sang row compact.
- [x] Nút action gọn hơn.
- [x] Không đổi API/schema/service/router.

### 14D — Activity modal compact
- [x] Modal tạo/sửa hoạt động bớt dài.
- [x] Gom form vào grid 12 cột.
- [x] Giảm textarea xuống 2 dòng.
- [x] Checkbox portal chuyển thành block compact.
- [x] Không đổi date/time picker.

### 14E — Align Activities page with Daily Routine style
- [x] User phản hồi trang Hoạt động chưa bám style chung, cần nhìn theo Sinh hoạt hằng ngày.
- [x] Chỉnh header thành khối hero premium giống DailyRoutine: centered title, action góc phải, background gradient nhẹ.
- [x] Chuyển summary stats thành card nhỏ gọn dưới header.
- [x] Thêm quick status segmented filter giống tab/pill của DailyRoutine.
- [x] Search/filter panel gọn hơn, tone trắng/kem/amber.
- [x] List section đổi title và khoảng cách cho đồng bộ.
- [x] Không đổi API, schema, migration, service, router.

### Test cần chạy sau 14E
- [ ] pnpm check
- [ ] pnpm test
- [ ] pnpm build
- [ ] Mở /activities, kiểm tra header bám style DailyRoutine hơn.
- [ ] Quick filter Tất cả/Dự kiến/Đang diễn ra/Đã diễn ra hoạt động.
- [ ] Search/filter loại vẫn hoạt động.
- [ ] Tạo/sửa/hủy/xóa hoạt động vẫn hoạt động.
- [ ] Portal học viên vẫn chỉ thấy hoạt động public.
