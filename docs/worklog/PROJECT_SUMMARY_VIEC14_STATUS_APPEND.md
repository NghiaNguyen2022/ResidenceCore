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

### 14F — Activities premium style refinement
User phản hồi sau 14E rằng trang Hoạt động vẫn chưa theo premium style chung của hệ thống, đặc biệt màu nền, component và card chưa đồng bộ với Finance/DailyRoutine. Đã tạo patch 14F:
- Giữ layout 14E nhưng chỉnh visual theo tone trắng/kem/amber premium.
- Hero đổi sang gradient/radial nhẹ, action button vẫn ở góc phải.
- Summary cards đổi thành gradient vàng/kem, có icon box trắng và shadow nhẹ giống Finance.
- Quick filter/search/list panel thêm ring amber nhẹ, shadow mềm, giảm cảm giác phẳng.
- Activity row thêm accent vàng nhẹ, vẫn compact.
- Modal tạo/sửa giữ layout compact 14D nhưng container đổi sang gradient trắng/kem nhẹ.
- Không đổi backend, schema, service, router, migration, DatePicker hay TimePicker.

Next sau 14F: chạy check/test/build và runtime test `/activities` + `/resident/activities`; nếu ổn thì chốt 14F pass và chuẩn bị đóng Việc 14.

---

## 2026-07-09 — Việc 14G: Activities style bám FinanceLite

Người dùng yêu cầu trang Hoạt động/Sự kiện phải tham khảo trực tiếp trang Tài chính (`FinanceLite.tsx`) và bám theo style premium chung hơn. 14F đã cải thiện màu/card nhưng vẫn còn cảm giác tự dựng riêng, chưa cùng hệ thống.

Thực hiện 14G:
- Chỉnh `client/src/pages/Activities.tsx` dùng `residenceMediumStyle` giống FinanceLite.
- Page wrapper dùng `residenceMediumStyle.page`, `pageAura`, `standardPageContent`.
- Header dùng `standardHeader`, title centered, actions góc phải như FinanceLite.
- Summary cards đổi sang premium token chung.
- Filter panel và search/select bám `filterPanel`, `searchInput`, tone amber/white.
- Quick filter dùng `standardTabRail`.
- List section dùng `section`, `sectionHeader`, `sectionBody`.
- Activity row giữ compact nhưng đổi shadow/border/gradient gần style Finance.

Không thay đổi nghiệp vụ:
- API/router/service/schema/migration giữ nguyên.
- DatePicker/TimePicker giữ nguyên.
- Public portal flag giữ nguyên.

Trạng thái: PATCH READY, chờ user apply/test.


---

## 2026-07-09 - Việc 14H: Activity modal controls fix

Sau 14G, user kiểm tra modal Tạo hoạt động và phát hiện các control trong modal còn bị chồng nhau, đặc biệt dropdown Loại/Trạng thái, ngày/giờ và icon control chen vào field kế bên.

Patch 14H tập trung riêng vào `client/src/pages/Activities.tsx`:
- Giữ layout/page style FinanceLite của 14G.
- Giữ modal compact 14D.
- Thay control select trong modal bằng native select styled để tránh dropdown custom overlap trong modal.
- Chia lại grid modal cho các nhóm field: thông tin chính, loại/trạng thái/dự kiến/portal, ngày/giờ, địa điểm/phụ trách, mô tả/ghi chú.
- Bọc DatePicker/FormDateInput và TimePickerInput bằng wrapper width/min-width để hạn chế icon/input chồng sang control bên cạnh.
- Không thay đổi API/schema/backend/migration.

Kết luận: 14H là patch UI/control placement cho modal Hoạt động; cần test `pnpm check`, `pnpm test`, `pnpm build` và runtime tạo/sửa hoạt động.
