# RESIDENCECORE - CHECKLIST VIỆC 12

> Nguyên tắc tracking: file này là **append-only** trong suốt Việc 12. Khi cập nhật, chỉ ghi thêm mục mới, không thay thế lịch sử cũ. Khi gửi lại cho user, gửi **full file đã gom đủ lịch sử**.

---

## 0. Bối cảnh chuyển sang Việc 12

Sau khi hoàn tất Việc 11/11E, chuyển sang Việc 12 với mục tiêu kiểm tra/demo xuyên suốt:

```txt
Tổ/Ban
→ Bổ nhiệm
→ Phân công công tác
→ Học viên xem công tác trên portal
→ Người có chức vụ thấy đúng phạm vi phụ trách
```

Phạm vi Việc 12:

- OrganizationSimple: Tổ/Ban, bổ nhiệm, danh sách, OrgChart.
- Công tác/DailyRoutine/Duties: phân công theo học viên/phòng/tổ/ban.
- Resident Portal: học viên thường và học viên có chức vụ.
- Navigation: menu resident thường và resident có chức vụ.
- Không đổi layout OrgChart đã ổn.
- Không mở rộng lan man ngoài flow demo.

---

## 1. File base đã nhận cho Việc 12

User đã gửi bộ file đầy đủ cho Việc 12 và nhắc lần sau phải dùng bộ này, không hỏi lại nếu user không nói có chỉnh thêm.

### Frontend pages/layout/navigation

- [x] `client/src/pages/OrganizationSimple.tsx`
- [x] `client/src/pages/DailyRoutine.tsx`
- [x] `client/src/pages/MyDuties.tsx`
- [x] `client/src/components/ResidenceCareLayout.tsx`
- [x] `client/src/navigation/appointedResidentNavigation.ts`
- [x] `client/src/navigation/index.ts`
- [x] `client/src/navigation/managerNavigation.ts`
- [x] `client/src/navigation/navigation.ts`
- [x] `client/src/navigation/residentNavigation.ts`
- [x] `client/src/navigation/types.ts`

### Frontend component bundle

- [x] `client/src/components/organization-simple/` via `organization-simple.zip`

### Backend routers/services/db

- [x] `server/routers/modules/organization.ts`
- [x] `server/routers/modules/duties.ts`
- [x] `server/routers/modules/dailyRoutine.ts`
- [x] `server/routers/modules/residentPortal.ts`
- [x] `server/services/organizationService.ts`
- [x] `server/services/dailyRoutineService.ts`
- [x] `server/services/residentPortalAccessService.ts`
- [x] `server/services/residentPortalService.ts`
- [x] `server/db/duty.ts`

Ghi chú: đây là base hiện tại của Việc 12 cho đến khi user nói có thay đổi file.

---

## 2. Checklist tổng Việc 12

### 2.1 Organization / Tổ / Ban

- [ ] Tạo Tổ.
- [ ] Tạo Ban.
- [ ] Thêm học viên vào Tổ.
- [ ] Thêm học viên vào Ban.
- [ ] Đổi Tổ cho học viên nếu cần.
- [ ] Xem cơ cấu hiện tại.
- [ ] OrgChart giữ layout protected: Trưởng top-center; Phó/Thư ký/Thủ quỹ row 2; Tổ/Ban bên dưới.

### 2.2 Bổ nhiệm / phân nhiệm

- [ ] Bổ nhiệm Trưởng.
- [ ] Bổ nhiệm Phó.
- [ ] Bổ nhiệm Thư ký.
- [ ] Bổ nhiệm Thủ quỹ.
- [ ] Bổ nhiệm Tổ trưởng theo từng Tổ.
- [ ] Bổ nhiệm Trưởng ban theo từng Ban.
- [ ] Validate Tổ trưởng scoped theo từng Tổ, không global.
- [ ] Validate Trưởng ban scoped theo từng Ban, không global.
- [ ] Lỗi validate hiển thị ngay trong modal Bổ nhiệm/Phân công.

### 2.3 Công tác / DailyRoutine / Duties

- [ ] Tạo công tác.
- [ ] Phân công cho một học viên.
- [ ] Phân công cho Tổ.
- [ ] Phân công cho Ban.
- [ ] Phân công cho Phòng.
- [ ] Preview trước khi ghi phân công.
- [ ] Conflict với lịch học vẫn hoạt động.
- [ ] Conflict công tác với công tác vẫn hoạt động.
- [ ] Cancel rồi reassign vẫn hoạt động.
- [ ] Học viên đã rời/ngừng không cập nhật công tác.

### 2.4 Portal học viên thường

- [ ] Resident thường login được.
- [ ] Resident thường thấy công tác của mình.
- [ ] Resident thường thấy công tác hôm nay.
- [ ] Resident thường đánh dấu hoàn thành/chưa hoàn thành.
- [ ] Không thấy menu/route quản trị.
- [ ] Không gọi được API quản trị.

### 2.5 Portal theo chức vụ

- [ ] Tổ trưởng login thấy đúng phạm vi Tổ.
- [ ] Trưởng ban login thấy đúng phạm vi Ban.
- [ ] Người có chức vụ thấy navigation theo chức vụ.
- [ ] Không lộ dữ liệu ngoài phạm vi.
- [ ] Duty scope theo chức vụ hiển thị đúng.

---

## 3. 12A - Org/Duty/Portal guard & scope

Trạng thái: **Đã gửi patch / tiếp tục theo flow demo**

### Audit 12A

Nền hiện tại đã có:

- OrganizationSimple: Tổ/Ban, bổ nhiệm, danh sách, OrgChart.
- DailyRoutine/Duties: phân công theo học viên/phòng/tổ/ban.
- ResidentPortalAccessService: access context, organization scope, duty scope, today overview.
- Navigation: tách resident thường và resident có chức vụ.

Điểm rủi ro phát hiện:

- [x] Organization router mutation chưa guard manager rõ ở router layer.
- [x] Một số duties endpoint quản trị còn mở ở mức `protectedProcedure`.
- [x] `duty` DB query theo resident có nguy cơ mất điều kiện residentId khi có filter.
- [x] `MyDuties` còn dùng flow duties cũ, chưa đồng bộ với `residentPortal.getTodayOverview`.

### Patch 12A

File ảnh hưởng:

- [x] `server/routers/modules/organization.ts`
- [x] `server/routers/modules/duties.ts`
- [x] `server/db/duty.ts`
- [x] `client/src/pages/MyDuties.tsx`

Nội dung:

- [x] Thêm manager guard cho mutation quản trị Organization.
- [x] Thêm manager guard cho Duties endpoint quản trị còn thiếu.
- [x] Chặn resident inactive/transferred_out/left xem/cập nhật công tác.
- [x] Sửa `getAssignmentsByResident` để giữ đúng scope resident.
- [x] Sửa `updateAssignmentForResident` hỗ trợ cả `residentId` và `assignedToType=resident`.
- [x] Sửa `getAssignmentsByDuty` để không bị override condition khi có filter.
- [x] `MyDuties` dùng `residentPortal.getTodayOverview` + `completeTodayDuty`.

### Test sau 12A cần chạy

- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Manager tạo Tổ/Ban.
- [ ] Manager bổ nhiệm chức vụ.
- [ ] Manager phân công công tác cho học viên.
- [ ] Manager phân công công tác cho Tổ/Ban.
- [ ] Resident thường mở `/my-duties` thấy công tác hôm nay.
- [ ] Resident thường đánh dấu hoàn thành công tác hôm nay.
- [ ] Resident đã rời/ngừng không cập nhật được công tác.
- [ ] Tổ trưởng/Trưởng ban mở portal theo vai trò thấy đúng phạm vi.

---

## 4. 12B - Assignment modal error placement

Trạng thái: **PASS**

### Lỗi user phát hiện

Trong modal Bổ nhiệm/Phân công của OrganizationSimple, lỗi validate như:

```txt
Vui lòng chọn học viên.
```

đang hiển thị ẩn ở page phía sau modal, không nằm trên form hiện tại. Điều này làm UX sai vì người dùng bấm lưu trong modal nhưng không thấy lỗi ở nơi cần sửa.

### Patch 12B

File ảnh hưởng:

- [x] `client/src/pages/OrganizationSimple.tsx`

Đã xử lý:

- [x] Thêm state lỗi riêng cho modal bổ nhiệm/phân công.
- [x] Lỗi validate hiển thị ngay trong modal.
- [x] Lỗi API khi lưu bổ nhiệm cũng hiển thị ngay trong modal.
- [x] Clear lỗi khi mở modal.
- [x] Clear lỗi khi đóng modal.
- [x] Clear lỗi khi lưu thành công.
- [x] Không đổi rule bổ nhiệm.
- [x] Không đổi OrgChart.
- [x] Không đổi backend.

### Runtime đã xác nhận

- [x] Mở modal Bổ nhiệm / Phân công.
- [x] Không chọn học viên.
- [x] Bấm Lưu.
- [x] Lỗi hiển thị trong modal, không nằm dưới page phía sau.
- [x] User xác nhận: **pass**.

---

## 5. 12C - Test xuyên suốt Organization → Công tác → Portal theo chức vụ

Trạng thái: **Bước tiếp theo**

Mục tiêu: sau khi 12A/12B đã xử lý guard và lỗi modal, chạy audit/test demo xuyên suốt, chưa thêm chức năng mới nếu chưa cần.

### Checklist 12C

#### Organization

- [ ] Tạo Tổ.
- [ ] Tạo Ban.
- [ ] Thêm học viên vào Tổ/Ban.
- [ ] Bổ nhiệm Trưởng / Phó / Thư ký / Thủ quỹ.
- [ ] Bổ nhiệm Tổ trưởng theo từng Tổ.
- [ ] Bổ nhiệm Trưởng ban theo từng Ban.
- [ ] Lỗi validate hiển thị trong modal.

#### Công tác

- [ ] Tạo công tác.
- [ ] Phân công cho 1 học viên.
- [ ] Phân công cho Tổ.
- [ ] Phân công cho Ban.
- [ ] Phân công cho Phòng.
- [ ] Kiểm tra conflict lịch học vẫn hoạt động.

#### Portal học viên thường

- [ ] Học viên login.
- [ ] Thấy công tác của mình.
- [ ] Thấy công tác hôm nay.
- [ ] Đánh dấu hoàn thành/chưa hoàn thành.

#### Portal theo chức vụ

- [ ] Tổ trưởng login.
- [ ] Thấy phạm vi Tổ mình phụ trách.
- [ ] Trưởng ban login.
- [ ] Thấy phạm vi Ban mình phụ trách.
- [ ] Không thấy dữ liệu ngoài phạm vi.

---

## 6. Ghi chú workflow tracking

- [x] User nhắc: `PROJECT_SUMMARY` phải **ghi thêm**, không thay thế.
- [x] User nhắc: `RESIDENCECORE_CHECKLIST_VIEC12_IN_PROGRESS.md` và `PROJECT_SUMMARY_VIEC12_STATUS_APPEND.md` phải append-only.
- [x] Khi update tracking, gửi lại **full accumulated file**, không gửi bản rút gọn.
- [x] Lần trước bản gửi lại chưa full lịch sử; đã rà lại và dựng lại file full lịch sử Việc 12 đến hiện tại.


## 7. Tracking full-history rebuild - PASS

Trạng thái: **PASS**

User đã kiểm tra lại 2 file tracking sau khi dựng lại full-history:

- [x] `RESIDENCECORE_CHECKLIST_VIEC12_IN_PROGRESS.md`
- [x] `PROJECT_SUMMARY_VIEC12_STATUS_APPEND.md`

Kết quả:

- [x] File tracking đã được chấp nhận.
- [x] Từ bước sau, tiếp tục dùng 2 file này làm base tracking append-only.
- [x] Khi có 12C/12D/pass, chỉ ghi thêm vào cuối file.
- [x] Khi gửi lại, gửi full accumulated file.

Bước tiếp theo:

- [ ] Bắt đầu audit/test **12C - Organization → Công tác → Portal theo chức vụ**.


## 8. 12C - Audit/Patch Portal công tác theo cá nhân/phòng/tổ/ban

Trạng thái: **Patch 12C đã chuẩn bị, chờ user apply/test**

### Audit 12C

- [x] Rà lại Organization flow nền: Tổ/Ban, bổ nhiệm, OrgChart.
- [x] Rà lại Duties flow nền: phân công theo `resident`, `room`, `team`, `committee`.
- [x] Rà lại Resident Portal today overview.
- [x] Rà lại MyDuties.
- [x] Phát hiện demo blocker: portal học viên thường chỉ lấy công tác trực tiếp theo resident, chưa gom công tác theo phòng/tổ/ban.
- [x] Phát hiện demo blocker: hoàn thành công tác từ portal chỉ hỗ trợ assignment trực tiếp, chưa cho assignment theo phòng/tổ/ban mà học viên thuộc về.
- [x] Phát hiện UI thiếu nhãn phạm vi công tác.

### Patch 12C

File ảnh hưởng:

- [x] `server/services/residentPortalAccessService.ts`
- [x] `client/src/pages/MyDuties.tsx`

Nội dung patch:

- [x] Thêm helper xác định phạm vi công tác của học viên:
  - [x] cá nhân;
  - [x] phòng hiện tại;
  - [x] tổ đang là thành viên;
  - [x] ban đang là thành viên.
- [x] `getTodayOverview` gom công tác hôm nay theo tất cả phạm vi hợp lệ.
- [x] Dedupe assignment theo id.
- [x] Gắn `assignmentScopeLabel` để UI hiển thị phạm vi.
- [x] `completeTodayDuty` cho phép hoàn thành công tác nếu assignment thuộc cá nhân/phòng/tổ/ban của học viên.
- [x] MyDuties hiển thị nhãn `Cá nhân`, `Phòng hiện tại`, `Tổ: ...`, `Ban: ...`.

### Runtime test cần chạy sau khi apply

- [ ] Manager phân công công tác cho 1 học viên.
- [ ] Học viên đó login thấy công tác trên portal hôm nay.
- [ ] Học viên đánh dấu hoàn thành được.
- [ ] Manager phân công công tác cho Phòng.
- [ ] Học viên đang ở phòng đó login thấy công tác với nhãn Phòng hiện tại.
- [ ] Học viên đánh dấu hoàn thành được.
- [ ] Manager phân công công tác cho Tổ.
- [ ] Thành viên tổ login thấy công tác với nhãn Tổ.
- [ ] Tổ trưởng login thấy phạm vi công tác tổ.
- [ ] Manager phân công công tác cho Ban.
- [ ] Thành viên ban login thấy công tác với nhãn Ban.
- [ ] Trưởng ban login thấy phạm vi công tác ban.
- [ ] Học viên ngoài phạm vi không thấy assignment không thuộc mình.

