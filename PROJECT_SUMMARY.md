# PROJECT_SUMMARY — ResidenceCore / App Lưu Xá

> Bản tổng hợp full cập nhật đến Việc 15I — 2026-07-12.  
> Quy tắc duy trì: tài liệu này được cập nhật theo hướng **ghi thêm / append có kiểm soát**, không xóa lịch sử quan trọng, không thay thế các quyết định đã pass.

---

## 1. Tổng quan dự án

ResidenceCore / App Lưu Xá là hệ thống quản lý lưu xá theo hướng vận hành thực tế, ưu tiên **Simple Mode**: đủ nghiệp vụ, dễ hiểu, dễ demo, không làm giao diện rối.

Các nhóm nghiệp vụ chính:

- Học viên / cư dân lưu trú.
- Phòng ở, gán phòng, chuyển phòng, trả phòng.
- Liên hệ gia đình / phụ huynh.
- Học tập, lịch học, tránh phân công trùng lịch.
- Cơ cấu tổ chức lưu xá: nhiệm kỳ, tổ, ban, chức vụ, bổ nhiệm.
- Sinh hoạt hằng ngày / công tác / phân công.
- Tài chính lưu xá.
- Portal học viên.
- Thông báo nội bộ lite.
- Hoạt động / sự kiện lite.
- Các module mở rộng về sau: cửa hàng/quỹ riêng, hoạt động kinh doanh, báo cáo nâng cao.

---

## 2. Nguyên tắc triển khai đã chốt

### 2.1. Quy trình làm việc

- Làm từng việc nhỏ: audit → patch → test → pass → cập nhật checklist/summary.
- Thứ tự ưu tiên khi làm code: DB/schema → backend route/service/db → frontend page/component → test runtime.
- Sau mỗi việc/pass phải cập nhật:
  - `PROJECT_SUMMARY.md`
  - `RESIDENCECORE_CHECKLIST.md`
  - hoặc file status append tương ứng nếu đang làm theo từng việc.
- Các file tracking phải **append-only/full-history**, không ghi đè mất lịch sử.
- Khi user đã gửi file cho một việc, xem đó là base hiện tại cho việc đó. Không hỏi lại cùng file nếu user không nói đã thay đổi.
- Khi không chắc file hiện tại có phải mới nhất hay không, phải hỏi user gửi lại trước khi patch.
- Không dùng file/patch cũ làm base vì dễ revert các phần đã sửa.

### 2.2. Rule bảo vệ code/UI

- Không reintroduce bug đã pass.
- Không revert layout đã được user xác nhận.
- Không phá OrgChart layout đã chốt.
- Không phá logic Tổ/Ban/chức vụ theo unit.
- Không phá logic room source of truth.
- Không phá logic contact filter theo residentId.
- Không phá logic công tác/lịch học conflict.
- Không phá Finance period-based flow đã pass.
- `use client` phải viết đúng `'use client';` nếu file cần client component.

### 2.3. Rule date/time/picker

Toàn hệ thống phải dùng Asia/Ho_Chi_Minh cho “hôm nay”, tháng hiện tại, mặc định ngày.

Các input ngày/giờ/datetime phải dùng picker shared:

- Date: `FormDateInput` / `DatePickerInput`.
- Time: `TimePickerInput`.
- Không để input text/date/time thô nếu đã có picker chuẩn.

Các fix đã pass:

- DatePicker dùng portal để không bị clipping trong modal/card.
- TimePicker đã được thêm và dùng cho StudySchedule/DailyRoutine.
- ResidentFinance `Ngày chi` đã đổi sang `FormDateInput`.

### 2.4. Rule style premium

Style chung theo hướng trắng/kem/amber nhẹ, slate/black text, action đen/premium.

Ưu tiên dùng:

- `src/config/residenceAppearance.ts`
- `shared/styleMedium.ts`
- `residenceMediumStyle`
- style token/shared component đã có.

Tránh:

- Tailwind rời rạc không theo token.
- Card quá dày, quá nhiều border, quá nhiều layer.
- Dropdown chồng layout.
- Modal dài quá mức.
- Scroll ngang ngoài ý muốn.

---

## 3. Kiến trúc tổng quan

### 3.1. Frontend

- React / TypeScript.
- Pages chính trong `client/src/pages`.
- Components nghiệp vụ trong `client/src/components`.
- Navigation tách theo vai trò:
  - managerNavigation
  - residentNavigation
  - appointedResidentNavigation
- Layout chính: `ResidenceCareLayout.tsx`.

### 3.2. Backend

- tRPC routers theo module.
- Service layer chứa nghiệp vụ.
- DB layer chứa query/transaction.
- RBAC guard ở router/service cho endpoint quản trị.

### 3.3. Database

- Drizzle schema tách nhóm:
  - `core.ts`
  - `residents.ts`
  - `dailyRoutine.ts`
  - `activities.ts`
  - `schema.ts` export tổng.

---

## 4. Vai trò người dùng

### 4.1. Manager

Quản lý toàn bộ vận hành lưu xá:

- Học viên.
- Phòng.
- Liên hệ.
- Học tập.
- Tổ chức.
- Công tác.
- Tài chính.
- Thông báo.
- Hoạt động.
- Cấu hình/mẫu phiếu về sau.

### 4.2. Resident / Học viên

Portal học viên sau Việc 15F được gom menu tối giản:

- `Hôm nay`
- `Lưu xá của tôi`
  - Hồ sơ
  - Công tác
  - Tài chính
  - Thông báo
  - Hoạt động

### 4.3. Resident có chức vụ

Nếu học viên có chức vụ, thêm nhóm:

- `Phụ trách`
  - Tổng quan
  - Điều hành
  - Tổ phụ trách
  - Ban phụ trách

---

## 5. Protected business rules

### 5.1. Members / Contacts

- Contact list phải filter theo `residentId`.
- Học viên đã rời/ngừng không được thao tác phòng/học tập/công tác không hợp lệ.
- Leave flow phải kiểm tra nếu học viên còn appointment/tổ/ban/chức vụ.

### 5.2. Rooms

- `residents.currentRoomId/currentRoom*` là source of truth cho phòng hiện tại.
- Broad room fallback chỉ dùng hiển thị, không dùng quyết định nghiệp vụ.
- Gán/chuyển/trả phòng phải cập nhật current room và lịch sử đúng.

### 5.3. Organization

- `Tổ trưởng` và `Trưởng ban` không phải role assign độc lập toàn cục.
- Chức vụ này phải gắn theo từng `Tổ` / `Ban` cụ thể.
- Validation Trưởng ban/Tổ trưởng phải scope theo unit, không global.
- OrgChart layout protected:
  - Trưởng top-center.
  - Phó/Thư ký/Thủ quỹ hàng 2.
  - Tổ/Ban bên dưới.

### 5.4. Study schedule

- Lịch học dùng thứ/ngày + giờ bắt đầu/kết thúc.
- start < end.
- Không trùng lịch cùng học viên/cùng ngày.
- Giờ học validate `HH:mm` ở backend.
- DailyRoutine/công tác phải tránh conflict lịch học.

### 5.5. DailyRoutine / Duties

- Duties có thể phân công theo học viên/phòng/tổ/ban.
- Resident portal phải hiển thị công tác thuộc phạm vi:
  - cá nhân
  - phòng hiện tại
  - tổ đang là thành viên
  - ban đang là thành viên
- Resident chỉ hoàn thành công tác thuộc phạm vi của mình.
- Cancel rồi reassign được.
- Conflict lịch học/công tác giữ nguyên.

### 5.6. Finance

- Finance dùng flow theo kỳ:
  - Tạo kỳ thu chung.
  - Chọn kỳ + tháng.
  - Apply khoản thu cho học viên.
  - Sinh khoản phải thu thật.
- Không tạo khoản thu cho học viên rời/ngừng nếu không hợp lệ theo tháng.
- Không tạo amount <= 0.
- Không thu vượt số còn lại.
- Portal học viên thấy tài chính cá nhân.
- Input tiền phải format kiểu Việt Nam, ví dụ `1.000.000`, nhưng submit numeric.

---

## 6. Trạng thái các việc đã hoàn tất

### Việc 1 — Route/Menu/Page sync — DONE/PASS

- Sửa route/menu mismatch.
- `/users` map đúng `/settings/users`.
- Ẩn/disable menu chưa có route để tránh 404.

### Việc 2 — Page orphan audit — DONE

- Audit pages orphan/imported.
- Phân loại connect/keep/archive.
- Không patch code.

### Việc 3 — Members / Rooms / Organization main flow — DONE/PASS

- Guard assign room.
- Check inactive/left.
- Check capacity/same-room.
- Rooms mutation RBAC.

### Việc 4 — FinanceLite minimal flow — DONE/PASS

- Finance router RBAC.
- Validate amount.
- Skip inactive/left on batch create.
- Duplicate check.
- Amount paid/remaining guard.

### Việc 5 — DailyRoutine/Công tác demo flow — DONE/PASS

- Duties management RBAC.
- Resident endpoint vẫn dùng cho công tác của mình.
- Scope demo giữ DailyRoutine/Công tác, không mở Smart Assignment nâng cao.

### Việc 6 — Resident Portal real data — DONE/PASS

- Resident portal guard user active/resident active.
- Access context.
- Today overview.
- Finance overview.
- Duty/org scope.

### Việc 7 — Test baseline cleanup — DONE/PASS

- Rename legacy router helper test file.
- Giữ `pnpm test` sạch hơn.

### Việc 8 — Definition of Done — DONE

- Tạo DoD cho modules chính:
  - Members
  - Rooms
  - Organization
  - DailyRoutine
  - FinanceLite

### Việc 9 — Helper/style/picker standardization — DONE/PASS

- Shared helper foundation.
- TimePickerInput added.
- DatePicker portal fix.
- Date/time/datetime picker rule protected.

### Việc 10 — Docs cleanup — DONE/PASS

- Cleanup docs status.
- Archive docx/legacy docs.
- Update summary/status.

### Việc 11 — Học tập / Lịch học — DONE/PASS

- Backend guard cho education/study schedule.
- HH:mm validation.
- Chặn cập nhật học tập/lịch học cho resident inactive/left.
- Study schedule conflict giữ đúng.
- 11B/11C/11D/11E polish layout tab Học tập; lưu ý khi sửa `MemberDetailModal.tsx` phải kiểm tra JSX wrapper kỹ.

### Việc 12 — Organization + Công tác + Portal theo chức vụ — DONE/PASS

Các bước:

- 12A: Org/Duty/Portal guard/scope patch.
- 12B: lỗi validate Bổ nhiệm/Phân công hiển thị trong modal, không hiện sau page — PASS.
- 12C: Portal công tác theo cá nhân/phòng/tổ/ban — PASS.
- 12D: Demo script Organization → Công tác → Portal theo chức vụ — PASS.

Kết luận: `Việc 12 DONE/PASS`.

### Việc 13 — Thông báo nội bộ lite — DONE/PASS

Các bước:

- 13A: Notification API/page/menu — PASS.
- 13B: Popup thông báo mới — DONE.
- 13C: Badge số chưa đọc trên menu portal — DONE.
- 13D: Polish trang thông báo — PASS.
- 13E: Final demo checklist — DONE/PASS.

Scope lite:

- Không WebSocket realtime.
- Không email/SMS/Zalo.
- Không template engine phức tạp.

Kết luận: `Việc 13 DONE/PASS`.

### Việc 14 — Hoạt động / Sự kiện lite — IN PROGRESS, gần đóng

Các bước đã làm:

- 14A: Activities lite module, manager CRUD, resident public activities.
- 14B/14B2: DB migration fix, tương thích MySQL không có `ADD COLUMN IF NOT EXISTS`.
- 14C–14J: nhiều vòng polish UI/modal.
- 14K: Filter/layout fix — PASS.
- 14L: Final runtime checklist đã chuẩn bị, chờ user xác nhận pass để đóng Việc 14.

Lưu ý style:

- `/activities` phải bám FinanceLite/DailyRoutine premium style.
- Không dùng dropdown filter gây chồng layout; dùng segmented/pill filters.
- Modal activity đã nhiều lần polish; nếu sửa tiếp phải giữ layout gọn, không chồng control, không input date/time thô.

### Việc 15 — Portal học viên mở rộng / gom trải nghiệm — IN PROGRESS

Các bước đã làm:

- 15A: Portal activities route — patched.
- 15B: Portal Today polish nhẹ — chưa đủ rõ, không chốt.
- 15C: Portal Today visible premium restyle — PASS.
- 15D: MyDuties polish ban đầu — chưa chốt vì menu/route chưa rõ.
- 15E: Gọn menu portal bước đầu — pass nhưng còn rời rạc.
- 15F: Gom tiếp menu portal học viên — PASS.
- 15G: Chuẩn hóa trang Công tác trong menu mới — DONE/PASS theo flow user.
- 15H: Resident Finance DatePicker fix — patched.
- 15I: Resident Finance currency input — PASS.

Trạng thái hiện tại:

- Portal menu đã gọn theo nhóm `Hôm nay`, `Lưu xá của tôi`, `Phụ trách` nếu có chức vụ.
- Portal Today premium restyle đã pass.
- Công tác trong menu mới đã xong theo flow.
- Tài chính resident đã có DatePicker cho Ngày chi và format input tiền.

Bước gợi ý tiếp theo:

- 15J: Rà/polish các trang portal còn lại: Hồ sơ, Hoạt động, Thông báo, Tài chính final check.
- Sau đó làm demo full flow Portal học viên.

---

## 7. Roadmap tiếp theo

### Ngắn hạn

1. Chốt 14L nếu runtime ok: `Việc 14 DONE/PASS`.
2. Tiếp tục Việc 15J: rà các trang còn lại của Portal học viên.
3. Viết demo script full từ manager đến học viên.
4. Kiểm tra build/test toàn app.

### Trung hạn

- Việc 16 — Cửa hàng / quỹ riêng lite.
- Việc 17 — Demo script 15 phút full app.
- Việc 18 — Polish UI/UX toàn bộ demo.

### Backlog

- In phiếu/chứng từ tài chính: phiếu thu, phiếu chi, tạm ứng, quyết toán tạm ứng, biên nhận thu học viên.
- Nội quy & nhắc nhở nâng cao.
- Báo cáo nâng cao.
- Parent portal.
- Email/SMS/Zalo/push realtime.
- Cửa hàng nâng cao: tồn kho/sản phẩm/POS/công nợ.

---

## 8. Các file tracking quan trọng

- `PROJECT_SUMMARY.md`
- `RESIDENCECORE_CHECKLIST.md`
- `docs/worklog/RESIDENCECORE_CHECKLIST_VIEC*.md`
- `docs/worklog/PROJECT_SUMMARY_VIEC*_STATUS_APPEND.md`

Quy tắc: tracking phải giữ full history, append-only, không overwrite mất nội dung cũ.
