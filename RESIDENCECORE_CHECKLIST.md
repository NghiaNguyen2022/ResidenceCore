# RESIDENCECORE_CHECKLIST — Full Checklist

> Bản full cập nhật đến Việc 15I — 2026-07-12.  
> Quy tắc: checklist này được cập nhật theo hướng **append-only/full-history**, không xóa các bước đã pass.

---

## A. Quy tắc chung bắt buộc

- [x] Làm từng việc nhỏ, không gom patch quá lớn khi không cần.
- [x] Mỗi việc có audit/checklist/status.
- [x] Sau mỗi pass cập nhật `PROJECT_SUMMARY.md` và checklist.
- [x] Tracking file append-only/full-history, không ghi đè.
- [x] Nếu user đã gửi file cho một việc, xem là base hiện tại.
- [x] Không hỏi lại file đã có nếu user không nói đã thay đổi.
- [x] Nếu không chắc base mới nhất, hỏi user gửi lại file.
- [x] Không lấy patch cũ/file cũ làm base để tránh revert.
- [x] Date/time/datetime phải dùng picker shared.
- [x] Style ưu tiên token/shared style, không Tailwind rời rạc.

---

## B. Protected regression checklist

### Members / Contacts / Rooms

- [x] Contact list filter theo residentId.
- [x] Room source of truth dùng currentRoomId/currentRoom fields.
- [x] Gán phòng check capacity.
- [x] Chuyển phòng cập nhật current room.
- [x] Trả phòng release current room.
- [x] Học viên rời/ngừng bị khóa thao tác không hợp lệ.

### Organization

- [x] Tổ trưởng scope theo từng Tổ.
- [x] Trưởng ban scope theo từng Ban.
- [x] Không validate Tổ trưởng/Trưởng ban theo global role.
- [x] OrgChart layout giữ: Trưởng top, Phó/Thư ký/Thủ quỹ hàng 2, Tổ/Ban bên dưới.
- [x] Bổ nhiệm lỗi hiển thị trong modal, không hiện sau page.

### Study / Duties

- [x] Lịch học validate start < end.
- [x] Lịch học validate HH:mm backend.
- [x] Không trùng lịch học cùng ngày.
- [x] Công tác check conflict lịch học.
- [x] Công tác phân công được theo học viên/phòng/tổ/ban.
- [x] Resident portal hiển thị công tác thuộc phạm vi cá nhân/phòng/tổ/ban.
- [x] Resident chỉ complete công tác thuộc scope của mình.

### Finance

- [x] Tạo kỳ thu chung.
- [x] Apply kỳ/tháng cho học viên.
- [x] Không tạo khoản thu invalid amount.
- [x] Không thu vượt còn lại.
- [x] Portal học viên thấy tài chính cá nhân.
- [x] Input tiền ở portal finance format `1.000.000`.

### Picker/UI

- [x] DatePicker portal fix.
- [x] TimePickerInput added.
- [x] Study schedule dùng TimePicker.
- [x] DailyRoutine time dùng TimePicker.
- [x] ResidentFinance `Ngày chi` dùng FormDateInput.

---

## C. Việc 1–10

### Việc 1 — Route/Menu/Page sync

- [x] Audit route/menu.
- [x] Map `/users` về `/settings/users`.
- [x] Disable/ẩn menu chưa có route.
- [x] User xác nhận pass.

### Việc 2 — Page orphan audit

- [x] Audit pages orphan/imported.
- [x] Phân loại connect/keep/archive.
- [x] Không patch code.

### Việc 3 — Members/Rooms/Organization main flow

- [x] Guard assign room.
- [x] Check resident inactive/left.
- [x] Check capacity.
- [x] Rooms mutation RBAC.
- [x] User xác nhận pass.

### Việc 4 — FinanceLite minimal flow

- [x] Finance router RBAC.
- [x] Validate amount.
- [x] Skip inactive/left residents on batch create.
- [x] Duplicate guard.
- [x] User xác nhận pass.

### Việc 5 — DailyRoutine/Công tác

- [x] Duties management RBAC.
- [x] Resident endpoints giữ đúng.
- [x] Demo flow pass.

### Việc 6 — Resident Portal real data

- [x] Resident linked user active guard.
- [x] Portal access context.
- [x] Today overview.
- [x] Finance overview.
- [x] Duty/org scope.
- [x] User xác nhận pass.

### Việc 7 — Test baseline cleanup

- [x] Rename legacy router helper test.
- [x] User xác nhận pass.

### Việc 8 — Definition of Done

- [x] DoD cho Members.
- [x] DoD cho Rooms.
- [x] DoD cho Organization.
- [x] DoD cho DailyRoutine.
- [x] DoD cho FinanceLite.

### Việc 9 — Helper/style/picker

- [x] Shared helper foundation.
- [x] TimePickerInput.
- [x] DatePicker portal fix.
- [x] Picker rule protected.

### Việc 10 — Docs cleanup

- [x] Docs cleanup plan.
- [x] Archive/legacy docs note.
- [x] Status zip.
- [x] User xác nhận pass.

---

## D. Việc 11 — Học tập / Lịch học

- [x] 11A backend guard/validate.
- [x] getEducation/getStudySchedules manager guard.
- [x] Chặn resident inactive/left update study.
- [x] Validate HH:mm.
- [x] User xác nhận Việc 11 pass.
- [x] 11B layout Học tập attempted.
- [x] Lỗi JSX trong MemberDetailModal đã được xử lý theo repo user.
- [x] 11C/11D/11E polish hướng tab Học tập.
- [x] Lưu ý protected: sửa MemberDetailModal phải kiểm tra wrapper JSX kỹ.

---

## E. Việc 12 — Organization + Công tác + Portal theo chức vụ

- [x] Bộ file base Việc 12 đã nhận.
- [x] 12A Org/Duty/Portal guard/scope patch.
- [x] 12B modal error placement.
- [x] User xác nhận 12B pass.
- [x] Tracking full-history rebuilt.
- [x] 12C portal duty scope cá nhân/phòng/tổ/ban.
- [x] User xác nhận 12C pass.
- [x] 12D demo script Organization → Công tác → Portal theo chức vụ.
- [x] User xác nhận 12D pass.
- [x] Việc 12 DONE/PASS.

---

## F. Việc 13 — Thông báo nội bộ lite

- [x] 13A Notification API/page/menu.
- [x] User xác nhận 13A pass.
- [x] 13B Popup thông báo mới.
- [x] 13C Badge số chưa đọc trên menu portal.
- [x] 13D Polish trang thông báo.
- [x] User xác nhận 13D pass.
- [x] 13E Final demo checklist.
- [x] Việc 13 DONE/PASS.

Scope không làm:

- [x] Không WebSocket realtime.
- [x] Không push/email/SMS/Zalo.
- [x] Không template engine phức tạp.

---

## G. Việc 14 — Hoạt động / Sự kiện lite

- [x] 14A Activities lite module patch.
- [x] Manager CRUD hoạt động.
- [x] Resident xem hoạt động public.
- [x] Hoạt động nội bộ không hiện portal.
- [x] 14B migration fix phát hiện MySQL không hỗ trợ `ADD COLUMN IF NOT EXISTS`.
- [x] 14B2 migration compatible MySQL.
- [x] User chạy migration done.
- [x] 14C layout polish.
- [x] 14D compact modal.
- [x] 14E match DailyRoutine style.
- [x] 14F premium style refinement.
- [x] 14G follow FinanceLite style.
- [x] 14H modal controls fix.
- [x] 14I modal premium compact.
- [x] 14J modal simplify.
- [x] 14K filter/layout fix.
- [x] User xác nhận 14K pass.
- [ ] 14L final runtime checklist pass chưa được user xác nhận chính thức.

Checklist 14L cần test để đóng:

- [ ] Manager mở `/activities` không lỗi query/migration.
- [ ] Tạo hoạt động công khai portal.
- [ ] Tạo hoạt động nội bộ.
- [ ] Sửa hoạt động.
- [ ] Hủy hoạt động.
- [ ] Xóa mềm hoạt động.
- [ ] Resident mở `/resident/activities` thấy hoạt động công khai.
- [ ] Resident không thấy hoạt động nội bộ.
- [ ] Filter/search hoạt động, không dropdown chồng layout.
- [ ] DatePicker/TimePicker đúng rule picker.

---

## H. Việc 15 — Portal học viên mở rộng / gom trải nghiệm

### 15A — Portal activities route

- [x] Nhận bộ file portal.
- [x] Audit phát hiện menu `/resident/activities` có nguy cơ thiếu route.
- [x] Patch route `/resident/activities`.

### 15B — Portal Today polish nhẹ

- [x] Patch thử polish nhẹ.
- [x] User phản hồi chưa thấy thay đổi style rõ.
- [x] Không chốt pass, thay bằng 15C.

### 15C — Portal Today visible premium restyle

- [x] Hero centered.
- [x] Nền trắng/kem/amber.
- [x] Summary cards premium.
- [x] Panel lịch học/công tác/vai trò đồng bộ hơn.
- [x] User xác nhận 15C pass.

### 15D — MyDuties polish ban đầu

- [x] Patch polish MyDuties.
- [x] Phát hiện route/menu chưa rõ.
- [x] Không chốt pass, chuyển sang gom menu.

### 15E — Gọn menu bước đầu

- [x] Gọn menu portal bước đầu.
- [x] User xác nhận pass nhưng vẫn thấy rời rạc.

### 15F — Gom tiếp menu portal học viên

- [x] Menu học viên thường chỉ còn `Hôm nay` và `Lưu xá của tôi`.
- [x] `Lưu xá của tôi` gồm Hồ sơ/Công tác/Tài chính/Thông báo/Hoạt động.
- [x] Học viên có chức vụ có nhóm `Phụ trách`.
- [x] User xác nhận 15F pass.

### 15G — Công tác trong menu mới

- [x] Chuẩn hóa MyDuties theo ngữ cảnh `Lưu xá của tôi > Công tác`.
- [x] Style đồng bộ Portal Today 15C.
- [x] Giữ logic cá nhân/phòng/tổ/ban.
- [x] User nói done/tiếp, xem là pass theo flow.

### 15H — Resident Finance DatePicker fix

- [x] Audit ResidentFinance.
- [x] Phát hiện `Ngày chi` dùng input date thô.
- [x] Patch sang `FormDateInput`.
- [x] Không đổi backend/API/schema/logic.

### 15I — Resident Finance currency input

- [x] Field `Số tiền thực chi` format tiền Việt khi nhập.
- [x] `1000000` hiển thị `1.000.000`.
- [x] Submit vẫn là numeric.
- [x] User xác nhận 15I pass.

### 15J — Next suggested

- [ ] Rà/polish trang Hồ sơ portal.
- [ ] Rà/polish trang Hoạt động public portal.
- [ ] Rà/polish trang Thông báo portal sau 13D.
- [ ] Rà Tài chính portal sau 15H/15I.
- [ ] Final demo flow Portal học viên.

---

## I. Roadmap còn lại

### Việc 16 — Cửa hàng / quỹ riêng lite

- [ ] Sổ thu chi riêng.
- [ ] Khoản thu.
- [ ] Khoản chi.
- [ ] Ngày phát sinh.
- [ ] Người ghi nhận.
- [ ] Nội dung.
- [ ] Số tiền.
- [ ] Tổng thu / tổng chi / tồn quỹ.
- [ ] Không trộn với tài chính học viên.

### Việc 17 — Demo script full 15 phút

- [ ] Manager tạo học viên.
- [ ] Gán phòng.
- [ ] Tạo liên hệ.
- [ ] Nhập học tập/lịch học.
- [ ] Tạo Tổ/Ban/bổ nhiệm.
- [ ] Tạo công tác.
- [ ] Tạo kỳ thu/tài chính.
- [ ] Tạo thông báo.
- [ ] Tạo hoạt động.
- [ ] Resident login portal.
- [ ] Resident xem hôm nay/công tác/tài chính/thông báo/hoạt động.

### Việc 18 — Polish UI/UX toàn demo

- [ ] Header/action đồng bộ.
- [ ] Card/list/filter đồng bộ.
- [ ] Modal gọn, không mất nội dung.
- [ ] Không dropdown chồng layout.
- [ ] Không scroll ngang ngoài ý muốn.
- [ ] Empty/loading/error state đẹp.
- [ ] Full check/test/build.
