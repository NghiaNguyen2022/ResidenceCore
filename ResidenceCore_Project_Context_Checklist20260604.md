# ResidenceCore / App Lưu Xá — Project Context & Checklist tổng hợp

> Tài liệu này dùng làm **context tổng hợp của dự án** để tiếp tục phát triển App Lưu Xá theo hướng Simple Mode / Detailed Mode, ưu tiên module Học viên, Phòng ở, Gia đình liên hệ, Tài khoản và các luồng lưu trú chính.

---

## 1. Nguyên tắc phát triển chung

### 1.1. Định hướng sản phẩm

- [x] Ứng dụng quản lý lưu xá dành cho học viên nội trú.
- [x] Ưu tiên nghiệp vụ quản lý thực tế, thao tác nhanh, dễ dùng cho người quản lý.
- [x] Giao diện phải thân thiện, không hiển thị ghi chú kỹ thuật cho end-user.
- [x] Các màn hình user-facing không dùng các câu như:
  - “đã kết nối database”
  - “mock UI”
  - “phase sau”
  - “đọc/ghi từ bảng…”
  - “backend mapping…”
- [x] Nếu module đã có data thật / tRPC / DB thì giữ kết nối thật.
- [x] Nếu module chưa có DB thì có thể dựng UI trước nhưng không hiện technical note trên giao diện người dùng.

### 1.2. Simple Mode / Detailed Mode

- [x] App có 2 mức hiển thị: **Simple Mode** và **Detailed Mode**.
- [x] Simple Mode áp dụng theo setting chung toàn hệ thống, không mặc định cấu hình riêng từng module.
- [x] Detailed Mode dùng cho cấu hình nâng cao, lưới chi tiết, phân quyền, cột, bộ lọc đầy đủ.
- [x] Simple Mode ưu tiên:
  - ít menu
  - ít nút
  - ít cột
  - thao tác theo ngữ cảnh
  - đủ dùng cho vận hành hằng ngày
- [x] Detailed Mode vẫn giữ các màn hình/lưới nâng cao nếu cần.
- [ ] Rà lại toàn bộ module khác để áp dụng Simple/Detailed nhất quán.

---

## 2. Kiến trúc kỹ thuật hiện tại

### 2.1. Frontend

- [x] React + Tailwind.
- [x] Routing dùng `wouter`.
- [x] tRPC client dùng qua `trpc`.
- [x] Layout chính: `ResidenceCareLayout`.
- [x] Sidebar đã hỗ trợ menu nhiều cấp.
- [x] Active state menu đã được làm mềm hơn, rõ cấp bậc hơn.
- [x] Đã sửa lỗi nested `<a>` trong `ResidenceCareLayout` khi dùng `wouter Link`.

### 2.2. Backend

- [x] Backend dùng tRPC router.
- [x] Router module backend dùng import chuẩn:

```ts
import { router, protectedProcedure } from "../../_core/trpc";
```

- [x] DB dùng Drizzle.
- [x] Schema đã tách file, không còn giả định một file schema monolithic.
- [x] Khi sửa schema học viên phải kiểm tra đúng file module như `residents.ts`, không chỉ sửa root `schema.ts`.

### 2.3. Quy ước UI setting hook

- [x] Stat card nên có setting hook trong Detailed Mode.
- [x] Grid/table nên có setting hook như cấu hình cột, ẩn/hiện cột, sorting.
- [x] Mở rộng setting hook tương lai cho:
  - combobox/dropdown
  - form
  - field
  - checkbox/switch
  - button/action
  - badge/status
  - search/filter
  - modal/dialog
  - detail section
- [ ] Simple Mode có thể hạn chế setting hook hiển thị để tránh rối.

---

## 3. Menu / Navigation hiện tại

### 3.1. Nhóm menu chính

- [x] Dashboard / Tổng quan.
- [x] Quản lý lưu trú.
- [x] Tổ chức lưu xá.
- [x] Sinh hoạt & Đời sống.
- [x] Học vụ & Phát triển.
- [x] Tài chính.
- [x] Báo cáo & Thiết lập.

### 3.2. Quy tắc Simple Mode cho menu

- [x] Simple Mode không cần menu riêng cho Phòng ở.
- [x] Simple Mode không cần menu riêng cho Gia đình / Phụ huynh.
- [x] Phòng ở và Gia đình / liên hệ được gom vào trang Học viên.
- [x] Tác vụ quản lý phòng nhanh đi từ trang Học viên qua **Tác vụ nhanh**.
- [x] Tổ chức lưu xá là nhóm riêng, không nằm trong Báo cáo & Thiết lập.
- [ ] Sau này rà lại menu cho resident role để ẩn các mục quản lý nâng cao.

---

## 4. Module Members / Học viên lưu trú

### 4.1. Vai trò module

- [x] Members là trung tâm của Simple Mode.
- [x] Một màn hình gom:
  - hồ sơ học viên
  - phòng hiện tại
  - gia đình / liên hệ
  - tài khoản học viên
  - thao tác rời / đăng ký lại
- [x] Simple Mode dùng card/list thay vì lưới chi tiết.
- [x] Detailed Mode vẫn có thể dùng `ConfigurableDataTable`.

### 4.2. Thông tin học viên

- [x] Có trường `holyName` / Tên thánh, optional, đứng trước họ tên.
- [x] Form thêm/sửa học viên hỗ trợ Tên thánh.
- [x] Tạo học viên có thể tạo user học viên.
- [x] Chi tiết học viên có thể tạo user nếu chưa có.
- [x] Có tạo user hàng loạt cho học viên chưa có user.
- [x] Username mặc định dạng `ten.ho`, nếu trùng thì thêm 1, 2, 3...
- [x] Role user học viên là `resident`.
- [x] `mustChangePassword` mặc định true.

### 4.3. Danh sách Simple Mode

- [x] Danh sách học viên dạng card 1 cột.
- [x] Có phân trang 5 / 7 / 10.
- [x] Card hiển thị:
  - tên thánh + họ tên
  - trạng thái học viên
  - trạng thái tài khoản
  - phòng hiện tại
  - gia đình / liên hệ chính
  - điện thoại
  - mã học viên
  - badge cần xử lý nếu có
- [x] Actions đã đưa vào từng dòng/card học viên, không dùng action bar “Đã chọn…” phía trên nữa.
- [x] Mỗi card có actions:
  - Xem chi tiết
  - Gắn phòng nếu chưa có phòng
  - Chuyển phòng nếu đang có phòng
  - Ngừng / Rời lưu xá nếu đang lưu trú
  - Đăng ký lại nếu đã rời lưu xá
- [x] Card học viên đã rời có background khác để phân biệt.
- [x] Danh sách sort theo trạng thái:
  - Đang lưu trú lên trước
  - Tạm ngưng/tạm vắng ở giữa
  - Đã rời xuống sau
- [x] Trong cùng trạng thái, ưu tiên học viên có phòng trước, sau đó sort theo tên.

### 4.4. Stat cards Simple Mode

Simple Mode chỉ giữ 3 card:

- [x] Tổng học viên.
- [x] Đang lưu trú.
- [x] Cần xử lý.

Không đưa lên đầu trong Simple Mode:

- [x] Đã rời.
- [x] Tạm rời.

Card “Cần xử lý” thể hiện rõ:

- [x] Chưa có phòng.
- [x] Chưa có tài khoản.
- [x] Thiếu liên hệ.
- [x] Học viên đã rời không được tính là hồ sơ cần xử lý hằng ngày.

### 4.5. Refresh sau thao tác

- [x] Sau thêm học viên: refetch danh sách.
- [x] Sau sửa học viên: refetch danh sách.
- [x] Sau gán/chuyển/trả phòng: refetch members + rooms.
- [x] Sau thêm phòng nhanh: refetch rooms.
- [x] Sau tạo user học viên: refetch members.
- [x] Sau tạo user hàng loạt: refetch members.
- [x] Sau thêm/sửa/xóa liên hệ: refetch members để card cập nhật liên hệ chính.
- [x] Sau rời lưu xá: refetch members + rooms + stats.
- [x] Sau đăng ký lại: refetch members + rooms + clear selection/state phù hợp.

---

## 5. Trạng thái học viên / Luồng rời lưu xá / Đăng ký lại

### 5.1. Trạng thái hiển thị

- [x] Trạng thái học viên hiển thị tiếng Việt.
- [x] Mapping cơ bản:
  - `active` → Đang lưu trú
  - `inactive` → Tạm ngưng
  - `temporary_leave` → Tạm vắng
  - `transferred_out` / `left` → Đã rời lưu xá

### 5.2. Khi học viên rời/ngừng lưu trú

- [x] Không xóa cứng nếu đã phát sinh dữ liệu.
- [x] Rời/ngừng lưu trú chuyển status về `transferred_out`.
- [x] Cập nhật `departureDate`.
- [x] Khóa tài khoản user liên kết nếu có.
- [x] Nhả phòng hiện tại.
- [x] Đóng assignment phòng đang mở bằng `unassignedDate`.
- [x] Set `currentRoomId/currentroomid = null`.
- [x] Giữ lịch sử phòng, không xóa lịch sử trong luồng nghiệp vụ bình thường.

### 5.3. UI khi học viên đã rời

- [x] Card có background khác.
- [x] Không hiện action Phòng ở.
- [x] Không hiện action Ngừng / Rời lưu xá.
- [x] Hiện action Đăng ký lại.
- [x] Detail chỉ xem, không cho sửa thông tin.
- [x] Detail không cho thêm/sửa/xóa liên hệ.
- [x] Detail hiển thị banner “Học viên đã rời lưu xá / ngừng lưu trú”.
- [x] Nếu có user, trạng thái tài khoản hiển thị “Đã khóa tài khoản”.

### 5.4. Đăng ký lại / Quay lại lưu xá

- [x] Có chức năng Đăng ký lại / Quay lại lưu xá.
- [x] Khi đăng ký lại:
  - status → `active`
  - `departureDate` → null
  - `currentRoomId/currentroomid` → null
  - active lại user liên kết nếu có
- [x] Không tự gán lại phòng cũ.
- [x] Sau đăng ký lại học viên cần được gán phòng mới như một lượt vào lại.
- [ ] Test kỹ flow đăng ký lại sau khi đã cleanup room assignment.

---

## 6. Phòng ở / Room Assignment

### 6.1. Quy tắc quan trọng về phòng hiện tại

Từ hiện tại phải phân biệt rõ:

- [x] `currentRoom*` = phòng hiện tại, dùng cho nghiệp vụ.
- [x] `room*` fallback = chỉ dùng hiển thị khi backend cũ chưa chuẩn, không dùng quyết định thao tác.
- [x] Lịch sử phòng không được hiểu là phòng hiện tại.

### 6.2. Hàm tiện ích phòng

- [x] `hasCurrentRoom(member)` strict, chỉ check:
  - `currentRoomId`
  - `currentRoomName`
  - `currentRoomCode`
  - `currentRoomNumber`
- [x] `hasAnyRoomDisplayData(member)` giữ logic broad cũ để fallback hiển thị nếu cần.
- [x] `getRoomLabelFromMember(member)` dùng để hiển thị tên phòng.
- [x] `getCurrentRoomIdFromMember(member)` không fallback sang `roomId` nữa.

### 6.3. AssignRoomModal

- [x] Không dùng lịch sử phòng để quyết định học viên đang có phòng.
- [x] Nếu không có `currentRoom*`: cho Gán phòng mới.
- [x] Nếu có `currentRoom*`: cho Chuyển phòng / Trả phòng.
- [x] Không còn hiển thị đồng thời 2 thông báo mâu thuẫn:
  - “Học viên đã có phòng…”
  - “Học viên hiện chưa có phòng…”
- [x] “Thêm phòng nhanh” đã đưa sang panel phải để tránh nhầm với nút “Lưu thao tác phòng”.
- [x] Khi chuyển phòng, loại trừ đúng `currentRoomId` khỏi danh sách phòng chọn.

### 6.4. Backend room assignment

- [x] Gán phòng mới cập nhật `residents.currentRoomId`.
- [x] Chuyển phòng đóng assignment cũ, tạo assignment mới.
- [x] Trả phòng đóng assignment cũ và set `currentRoomId = null`.
- [x] Rời lưu xá tự trả phòng nếu đang có phòng.
- [x] Không cho gán/chuyển vào phòng đã đủ sức chứa.
- [x] Không cho chuyển sang chính phòng hiện tại.
- [x] Không cho gán/chuyển phòng cho học viên đã rời.
- [x] `rooms.assignResident` cho phép `eventType = left` không cần `roomId`.

### 6.5. Cleanup dữ liệu phòng

Do lịch sử cũ có thể được tạo trước khi có logic nhả phòng, đã quyết định reset lại:

- [x] Clear toàn bộ lịch sử room assignment.
- [x] Reset toàn bộ `currentroomid/currentRoomId` của residents về null.
- [x] Sau cleanup, toàn bộ học viên sẽ được assign lại từ đầu.
- [x] Với MySQL Safe Update Mode, dùng `WHERE id > 0` hoặc `SET SQL_SAFE_UPDATES = 0`.

Script đã dùng / khuyến nghị:

```sql
START TRANSACTION;

UPDATE residence_care.residents
SET
    currentroomid = NULL,
    updatedat = NOW()
WHERE id > 0;

DELETE FROM residence_care.room_assignments
WHERE id > 0;

COMMIT;
```

Nếu có bảng history:

```sql
START TRANSACTION;

UPDATE residence_care.residents
SET
    currentroomid = NULL,
    updatedat = NOW()
WHERE id > 0;

DELETE FROM residence_care.room_assignment_history
WHERE id > 0;

DELETE FROM residence_care.room_assignments
WHERE id > 0;

COMMIT;
```

---

## 7. Quản lý phòng nhanh trong trang Members

### 7.1. Định hướng

- [x] Simple Mode không thêm menu Phòng ở riêng.
- [x] Trong trang Members có **Tác vụ nhanh** để quản lý phòng cơ bản.
- [x] Tác vụ nhanh cần có:
  - Danh sách phòng & sức chứa
  - Thêm phòng
  - Sửa phòng cơ bản

### 7.2. RoomsQuickModal

- [x] Có component `RoomsQuickModal.tsx`.
- [x] Xem danh sách phòng.
- [x] Xem sức chứa.
- [x] Xem đang ở.
- [x] Xem còn trống.
- [x] Xem trạng thái: Còn chỗ / Đầy.
- [x] Có tìm kiếm phòng.
- [x] Có thêm phòng.
- [x] Có sửa phòng cơ bản.
- [x] Khi sửa phòng, mã phòng readonly, không được sửa.
- [x] Cho sửa sức chứa.
- [x] Cho sửa ghi chú / tên hiển thị tạm thời.
- [x] Không cho sức chứa nhỏ hơn số học viên đang ở.

### 7.3. Backend room management

- [x] `rooms.update` không nhận `roomCode` nữa.
- [x] `roomService.updateRoom` chủ động bỏ `roomCode` nếu FE gửi nhầm.
- [x] Validate sức chứa mới không nhỏ hơn số học viên đang ở.
- [x] Không cho xóa phòng đang có học viên.
- [x] `createRoom` đã fix logic lấy roomId sau khi db trả object.
- [ ] Nếu cần tên phòng riêng, bổ sung field `roomName` vào schema/DB sau.

---

## 8. Gia đình / Liên hệ

### 8.1. Trong chi tiết học viên

- [x] Có `ParentsSection` trong `MemberDetailModal`.
- [x] Thêm/sửa/xóa cha/mẹ/người giám hộ từ detail học viên.
- [x] Học viên đã rời thì liên hệ chỉ xem, không thêm/sửa/xóa.
- [x] Sau thay đổi liên hệ, refetch danh sách học viên.

### 8.2. Danh sách liên hệ tổng

- [x] Không đưa thành menu riêng trong Simple Mode.
- [x] Có `ContactsListModal` đi từ trang Members.
- [x] Xem danh sách liên hệ tổng.
- [x] Tìm kiếm theo học viên / tên liên hệ / số điện thoại.
- [x] Lọc theo Cha / Mẹ / Người giám hộ.
- [x] Sửa thông tin liên hệ cơ bản.
- [x] Sau sửa liên hệ, refetch danh sách liên hệ và danh sách học viên.
- [ ] Nếu cần, chuyển xóa liên hệ sang `AppMessageBox`.

### 8.3. Liên hệ chính trên card

- [x] Backend members.list trả:
  - `primaryContactType`
  - `primaryContactName`
  - `primaryContactPhone`
- [x] Card học viên đọc `primaryContact*` để hiển thị liên hệ chính.
- [x] Ưu tiên liên hệ chính:
  - Mẹ
  - Cha
  - Người giám hộ
  - Liên hệ đầu tiên có số điện thoại

---

## 9. Tài khoản / User Management / Role

### 9.1. Quy tắc role

- [x] Không dùng role `admin` trong app.
- [x] User mặc định có username `admin` nhưng role là `manager`.
- [x] `manager` là role quản lý đầy đủ.
- [x] UserManagement chỉ tạo user role `manager`.
- [x] Không tạo trực tiếp role `resident` từ UserManagement.
- [x] User học viên được tạo từ nghiệp vụ học viên.
- [x] Appointment roles không tạo trực tiếp từ UserManagement.

Appointment roles định hướng:

- [x] `team_leader`
- [x] `committee_head`
- [x] `house_leader`
- [x] `deputy`
- [x] `secretary`
- [x] `treasurer`

### 9.2. Password / account status

- [x] Có password helper hash/verify.
- [x] Có `mustChangePassword`.
- [x] Có change password API.
- [x] Rời lưu xá khóa user.
- [x] Đăng ký lại active user.
- [ ] FE bắt buộc đổi mật khẩu lần đầu nếu `mustChangePassword = true`.
- [ ] Reset password cho học viên.
- [ ] Hiển thị trạng thái tài khoản chi tiết hơn nếu cần:
  - đang hoạt động
  - đã khóa
  - cần đổi mật khẩu

---

## 10. AppMessageBox dùng chung

### 10.1. Đã làm

- [x] Có `AppMessageBox.tsx` dùng chung.
- [x] Không dùng `window.confirm/window.prompt` cho Ngừng/Xóa/Đăng ký lại.
- [x] Không dùng `window.confirm/window.alert` cho tạo user hàng loạt.
- [x] AppMessageBox hỗ trợ nhiều action lựa chọn.
- [x] AppMessageBox có variant:
  - info
  - warning
  - danger
  - success

### 10.2. Đang dùng cho

- [x] Rời lưu xá / Ngừng lưu trú.
- [x] Xóa hồ sơ nhập nhầm.
- [x] Đăng ký lại / Quay lại lưu xá.
- [x] Tạo tài khoản học viên hàng loạt.

### 10.3. Có thể dùng tiếp cho

- [ ] Xóa liên hệ.
- [ ] Xóa phòng.
- [ ] Reset mật khẩu.
- [ ] Khóa / mở tài khoản.
- [ ] Hủy thao tác nghiệp vụ.

---

## 11. Organization / Tổ chức lưu xá

### 11.1. Đã có

- [x] `OrganizationRoles` đã có DB/table/service/router/UI.
- [x] `OrganizationTerms` đã có DB/table/service/router/UI.
- [x] `OrganizationUnits` cho Tổ/Ban.
- [x] `OrganizationStructure` dùng `organization_assignments`.
- [x] `organization_roles` đã mở rộng:
  - level
  - roleType
  - minAssignees
  - maxAssignees
  - isSystem
  - requiresUnit
- [x] `organization_assignments` có `unitId` và `assignmentTitle`.
- [x] Chart tổ chức hiển thị compact/professional.
- [x] Chart card chỉ hiển thị resident name + room, không hiển thị resident code.

### 11.2. Cần làm sau

- [ ] Hoàn thiện hiển thị phòng trong OrganizationStructure theo field `currentRoom*` thật.
- [ ] Kết nối appointment role với user role khi bổ nhiệm.
- [ ] Khi kết thúc nhiệm kỳ và không tái bổ nhiệm thì remove appointment role, giữ lịch sử.

---

## 12. Sinh hoạt & Đời sống — hướng tiếp theo

### 12.1. Định hướng khách hàng

- [x] Các công tác cần đơn giản nhất có thể.
- [x] Ví dụ trực nhật chỉ cần:
  - ngày
  - nơi làm
  - đã hoàn thành / chưa hoàn thành
- [x] Học viên có thể xem các công tác hằng ngày để ý thức hoàn thành.
- [x] Phần quản lý nhân sự chi tiết chỉ manager xem.

### 12.2. Module cần làm tiếp

- [ ] DailyRoutine / Lịch sinh hoạt hằng ngày.
- [ ] Công tác / trực nhật đơn giản.
- [ ] Phụng vụ & Hoạt động.
- [ ] Nội quy.
- [ ] Quyền xem cho resident.
- [ ] Quyền quản lý cho manager.

---

## 13. Tài chính

- [ ] Chưa hoàn thiện Simple Mode cho tài chính.
- [ ] Cần xác định màn hình Simple:
  - phí lưu trú
  - theo dõi đóng phí
  - công nợ cơ bản
- [ ] Logic không xóa học viên nếu đã phát sinh phí cần gắn vào backend nghiệp vụ sau.

---

## 14. Báo cáo & Thiết lập

- [x] Có nhóm menu Báo cáo & Thiết lập.
- [x] UserManagement đã đưa vào layout.
- [x] Có app settings phục vụ display mode.
- [ ] Cấu hình Simple/Detailed Mode trong UI thiết lập.
- [ ] Cấu hình ứng dụng.
- [ ] Danh mục dùng chung.
- [ ] Người dùng & phân quyền hoàn thiện.
- [ ] Cấu hình thông báo.

---

## 15. Kiểm thử end-to-end cần làm ngay

### 15.1. Members / Student

- [ ] Thêm học viên mới.
- [ ] Thêm học viên mới + tạo user.
- [ ] Sửa học viên.
- [ ] Tạo user từ detail.
- [ ] Tạo user hàng loạt.
- [ ] Thêm/sửa/xóa liên hệ.
- [ ] Xem danh sách liên hệ tổng.

### 15.2. Phòng

- [ ] Sau cleanup, tất cả active student chưa có phòng.
- [ ] Gán phòng cho học viên active.
- [ ] Kiểm tra card hiển thị phòng mới.
- [ ] Kiểm tra phòng giảm slot còn lại.
- [ ] Chuyển phòng.
- [ ] Kiểm tra phòng cũ nhả slot, phòng mới tăng người ở.
- [ ] Trả phòng.
- [ ] Kiểm tra student về Chưa gán.
- [ ] Không cho gán quá sức chứa.
- [ ] Không cho giảm capacity thấp hơn số đang ở.

### 15.3. Rời / Đăng ký lại

- [ ] Rời lưu xá khi đang có phòng.
- [ ] Kiểm tra user bị khóa.
- [ ] Kiểm tra currentRoomId null.
- [ ] Kiểm tra assignment được đóng nếu có.
- [ ] Detail học viên đã rời chỉ xem.
- [ ] Đăng ký lại.
- [ ] Kiểm tra user active lại.
- [ ] Kiểm tra học viên active lại nhưng vẫn chưa có phòng.
- [ ] Gán phòng mới sau đăng ký lại.

### 15.4. MessageBox

- [ ] Ngừng/Rời dùng AppMessageBox.
- [ ] Xóa nhập nhầm dùng AppMessageBox.
- [ ] Đăng ký lại dùng AppMessageBox.
- [ ] Tạo user hàng loạt dùng AppMessageBox.

---

## 16. Ưu tiên tiếp theo

1. Test flow phòng sau khi cleanup data:
   - gán
   - chuyển
   - trả
   - rời
   - đăng ký lại
   - gán lại
2. Test card “Cần xử lý” có đúng số chưa có phòng / thiếu liên hệ / chưa có tài khoản.
3. Test RoomsQuickModal:
   - danh sách phòng
   - thêm phòng
   - sửa sức chứa
   - không sửa mã phòng
4. Nếu Members Simple Mode ổn định, chốt module Members.
5. Chuyển sang DailyRoutine / Lịch sinh hoạt hằng ngày.

