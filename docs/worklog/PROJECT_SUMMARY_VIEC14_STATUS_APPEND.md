# PROJECT_SUMMARY — APPEND VIỆC 14

## Tracking rule
- Nội dung này là phần append cho PROJECT_SUMMARY.md.
- Không thay thế nội dung cũ của PROJECT_SUMMARY.md.
- Khi cập nhật tiếp, ghi thêm vào cuối và gửi lại full-history.

## Việc 14 — Hoạt động / Sự kiện lite

### Mục tiêu
Module Hoạt động / Sự kiện lite dùng cho demo full flow của ResidenceCore/App Lưu Xá. Scope hiện tại chỉ gồm quản lý hoạt động chung và hiển thị hoạt động công khai trên portal học viên. Không làm realtime, đăng ký tham gia, điểm danh, duyệt nhiều bước, hoặc event workflow phức tạp.

### 14A — Activities lite
Đã tạo patch module Hoạt động/Sự kiện lite:
- Thêm/chuẩn hóa `drizzle/activities.ts` với `activities` và `activityParticipants`.
- Thêm `server/db/activities.ts`, `server/services/activityService.ts`, `server/routers/modules/activities.ts`.
- Thêm trang manager `client/src/pages/Activities.tsx`.
- Thêm trang resident `client/src/pages/ResidentActivities.tsx`.
- Cập nhật `App.tsx`, `managerNavigation.ts`, `residentNavigation.ts`.
- Hoạt động có flag `isPublicOnPortal` để hiển thị/ẩn ở portal học viên.
- Date dùng `FormDateInput`, time dùng `TimePickerInput` theo rule picker toàn hệ thống.

### 14B / 14B2 — DB migration
Sau khi chạy 14A, runtime báo failed query do bảng/cột `activities` chưa align database. Đã tạo migration 14B. User báo MySQL không hỗ trợ `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, nên đã tạo 14B2 dùng `INFORMATION_SCHEMA` tương thích MySQL cũ hơn. User đã chạy xong 14B2.

### 14C — Layout polish
Đã polish trang `/activities`:
- Gọn header, filter, list.
- List hoạt động chuyển sang row compact.
- Nút Sửa/Hủy/Xóa nhỏ hơn.
- Nút Tạo hoạt động dùng action chính tone đen/premium.
- Không đổi API/schema/service/router.

### 14D — Modal compact
Đã compact modal Tạo/Sửa hoạt động:
- Grid 12 cột trên desktop.
- Gom nhóm Mã/Tên, Loại/Trạng thái/Portal, Ngày/Giờ/Số người, Địa điểm/Phụ trách, Mô tả/Ghi chú.
- Giảm chiều cao form để tránh mất nội dung ở màn hình thấp.
- Không đổi picker và nghiệp vụ.

### 14E — Align Activities page with DailyRoutine style
User nhắc trang Hoạt động phải bám style chung của hệ thống, đặc biệt tham chiếu trang Sinh hoạt hằng ngày. Đã tạo patch 14E:
- Header đổi sang hero centered, background gradient nhẹ, action góc phải như tinh thần DailyRoutine.
- Summary stats chuyển thành card nhỏ dưới header.
- Thêm quick segmented filter theo trạng thái: Tất cả / Dự kiến / Đang diễn ra / Đã diễn ra.
- Search/filter panel đổi tone trắng/kem/amber nhẹ, gọn hơn.
- List section đổi nhịp title/khoảng cách để hài hòa hơn.
- Không đổi backend, schema, service, router, migration.

### Next
Sau khi apply 14E cần chạy:
- `pnpm check`
- `pnpm test`
- `pnpm build`
- Runtime test manager `/activities` và resident `/resident/activities`.
