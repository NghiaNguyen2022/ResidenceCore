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

### 14F — Activities premium style refinement
- [x] User phản hồi 14E vẫn chưa theo premium style chung: màu nền, component, card còn chưa giống Finance/DailyRoutine.
- [x] Giữ layout 14E nhưng chỉnh lại visual system: hero premium hơn, stats card dùng gradient vàng/kem giống Finance.
- [x] Search/filter panel đổi sang card trắng/kem có ring amber nhẹ.
- [x] List/card hoạt động thêm accent vàng nhẹ, giảm cảm giác card trắng phẳng.
- [x] Modal form giữ compact 14D nhưng đổi container sang gradient trắng/kem nhẹ.
- [x] Không đổi API, schema, service, router, migration, DatePicker, TimePicker.

### Test cần chạy sau 14F
- [ ] pnpm check
- [ ] pnpm test
- [ ] pnpm build
- [ ] Mở /activities, kiểm tra màu nền/card/component gần style premium Finance/DailyRoutine hơn.
- [ ] Tạo/sửa/hủy/xóa hoạt động vẫn hoạt động.
- [ ] Modal tạo/sửa vẫn compact và không mất nội dung.
- [ ] /resident/activities vẫn chỉ hiện hoạt động public.

---

## 14G — Activities bám style FinanceLite

Ngày cập nhật: 2026-07-09

Trạng thái: PATCH READY

Mục tiêu:
- Chỉnh trang `/activities` bám style premium chung của `FinanceLite.tsx`.
- Dùng lại `residenceMediumStyle` thay vì tự dựng quá nhiều style rời rạc.
- Header, action, summary cards, filter panel, tab rail và section list cùng nhịp với trang Tài chính.

Đã làm:
- Import `residenceMediumStyle`.
- Đổi page wrapper sang `residenceMediumStyle.page` + `pageAura` + `standardPageContent`.
- Đổi header sang `standardHeader`, title centered và actions góc phải như FinanceLite.
- Summary cards dùng premium card tokens (`premiumGoldBlackCardSoft`, gloss/glow/glass).
- Filter panel dùng `filterPanel`, `searchInput` và select tone amber/white.
- Status quick filter dùng `standardTabRail`.
- Danh sách dùng `section`, `sectionHeader`, `sectionBody`.
- Activity row đổi sang list-card compact có gradient nhẹ và hover premium.

Không đổi:
- Không đổi API/router/service/schema/migration.
- Không đổi modal compact 14D.
- Không đổi DatePicker/TimePicker.
- Không đổi logic public portal.

Test cần chạy:
- `pnpm check`
- `pnpm test`
- `pnpm build`
- Mở `/activities` kiểm tra style đã gần FinanceLite hơn.
- Tạo/sửa/hủy/xóa hoạt động vẫn chạy.
- `/resident/activities` vẫn chỉ thấy hoạt động public.


---

## 2026-07-09 - Việc 14H - Activity modal controls fix

Trạng thái: PATCH READY

Mục tiêu:
- Sửa modal Tạo/Sửa hoạt động bị control chồng nhau.
- Bám lại các control đã chuẩn hóa trước đó: DatePicker/FormDateInput và TimePickerInput.
- Giữ style premium/FinanceLite, nhưng ưu tiên không vỡ layout.

Đã chỉnh:
- Modal select Loại/Trạng thái đổi sang native select styled trong form để tránh dropdown custom đè/chồng lên label/control bên dưới.
- Grid modal chia lại hàng rõ hơn: Loại/Trạng thái/Dự kiến/Portal riêng, Ngày/Bắt đầu/Kết thúc riêng.
- Date/Time fields được bọc wrapper min-width/width để không đẩy icon sang control kế bên.
- Input/Textarea dùng class chung trong modal để thống nhất bo góc, shadow, focus ring.
- Không đổi API, schema, router, service, migration, DatePicker, TimePicker logic.

Runtime test:
- [ ] Mở modal Tạo hoạt động.
- [ ] Mở dropdown Loại, không còn chồng/đè lộn layout các control khác.
- [ ] Mở dropdown Trạng thái, không đè lộn layout.
- [ ] Ngày không bị cắt chữ, icon không chen sang field khác.
- [ ] Bắt đầu/Kết thúc không chồng icon sang field Dự kiến.
- [ ] Tạo hoạt động thành công.
- [ ] Sửa hoạt động thành công.
- [ ] Public portal flag vẫn đúng.

---

## Việc 14I — Activity modal premium compact refinement

**Ngày:** 2026-07-10  
**Trạng thái:** Đã tạo patch, chờ user apply/test.

### Lý do

Sau 14H, modal tạo/sửa hoạt động đã hết chồng control nhưng vẫn còn dày, rối và chưa đủ premium:

- Card portal chiếm diện tích, chữ bị cắt/dồn ở mép phải.
- Grid còn nhiều ô kích thước khác nhau làm form nặng mắt.
- Input/select/textarea còn cao và shadow dày.
- Modal chưa giống tinh thần premium compact của Finance/DailyRoutine.

### File chỉnh

- `client/src/pages/Activities.tsx`

### Nội dung chỉnh

- Giảm chiều cao input/select/textarea trong modal.
- Đổi bo góc control từ quá lớn sang rounded-xl gọn hơn.
- Đưa checkbox `Hiển thị portal` lên thanh header nhỏ của form thay vì một card riêng.
- Chia lại form thành grid 12 cột rõ nhịp:
  - Mã + Tên.
  - Loại + Trạng thái + Ngày + Dự kiến.
  - Bắt đầu + Kết thúc + Địa điểm + Phụ trách.
  - Mô tả + Ghi chú.
- Giữ DatePicker/TimePicker, không revert về input text.
- Footer modal gọn hơn, có divider nhẹ.
- Không đổi API/schema/service/router.

### Test cần chạy

- `pnpm check`
- `pnpm test`
- `pnpm build`

### Runtime checklist

- [ ] Mở modal Tạo hoạt động không còn cảm giác quá dày/rối.
- [ ] Không còn chữ `Hiển thị portal` bị cắt hoặc chồng layout.
- [ ] Dropdown Loại/Trạng thái không chồng control bên dưới.
- [ ] DatePicker hoạt động.
- [ ] TimePicker hoạt động.
- [ ] Tạo hoạt động thành công.
- [ ] Sửa hoạt động thành công.
- [ ] Public portal flag vẫn đúng.

---

## Việc 14J — Activity modal simplify / less cluttered

Trạng thái: PATCH READY

Lý do:
- Sau 14I modal đã bớt lỗi chồng control nhưng vẫn còn rối, nhiều field nặng mắt.
- Người dùng yêu cầu layout premium hơn, ít dày hơn, ít rối hơn.

Phạm vi:
- Chỉ chỉnh `client/src/pages/Activities.tsx`.
- Không đổi API/schema/router/service/migration.
- Không đổi DatePicker/TimePicker logic.

Thay đổi:
- Giữ style theo FinanceLite nhưng đơn giản hóa form.
- Bỏ card “Hiển thị portal” lớn; giữ thành pill nhỏ ở header form.
- Nhóm form chính chỉ còn các trường cần cho demo:
  - Mã, tên hoạt động
  - Loại, ngày, khung giờ
  - Địa điểm, phụ trách
  - Mô tả ngắn
- Chuyển các trường ít dùng vào `Thông tin bổ sung` dạng collapsible:
  - Trạng thái
  - Dự kiến
  - Ghi chú
- Giảm chiều cao input/select/textarea xuống `h-9`.
- Giảm shadow, bo góc, padding để modal nhẹ hơn.

Checklist test:
- [ ] Mở modal Tạo hoạt động không còn cảm giác dày/rối.
- [ ] Không còn control chồng nhau.
- [ ] DatePicker/TimePicker hoạt động.
- [ ] Tạo hoạt động public portal vẫn đúng.
- [ ] Sửa hoạt động vẫn đúng dữ liệu.
- [ ] Mở `Thông tin bổ sung` thấy Trạng thái/Dự kiến/Ghi chú.
- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.


---

## 2026-07-12 — Việc 14K: Activities layout filter/control fix

Trạng thái: **PATCH READY**

Lý do:
- Sau 14J, trang `/activities` còn lỗi layout khi mở dropdown filter trạng thái/loại: dropdown chồng lên quick filter/list và nút tạo hoạt động, nhìn không premium.
- Trang cần tiếp tục bám style FinanceLite nhưng tránh control overlay/chồng nhau.

Thay đổi 14K:
- Bỏ dropdown trạng thái/loại ở filter panel của trang quản lý hoạt động.
- Giữ trạng thái bằng segmented quick filter phía trên.
- Chuyển loại hoạt động thành pill filter dạng wrap, không dùng dropdown nên không còn menu đè layout.
- Search giữ trong filter panel premium.
- Chỉ giữ nút “Tạo hoạt động” ở header/action chính, tránh nút trùng ở khu danh sách.
- Không đổi API/schema/service/router/migration.
- Không đổi modal tạo/sửa hoạt động, DatePicker/TimePicker.

Test sau apply:
- `pnpm check`
- `pnpm test`
- `pnpm build`
- Mở `/activities`, bấm các filter trạng thái/loại không còn dropdown đè layout.
- Search/filter/list vẫn hoạt động.
- Tạo/sửa/hủy/xóa hoạt động vẫn hoạt động.
