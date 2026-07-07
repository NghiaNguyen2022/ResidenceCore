# PROJECT_SUMMARY - STATUS APPEND VIỆC 12

> Nguyên tắc: file này dùng để **ghi thêm** vào `PROJECT_SUMMARY.md`, không thay thế file gốc. Nội dung dưới đây là phần append tích lũy cho Việc 12. Khi cập nhật, chỉ thêm mục mới vào cuối và gửi lại toàn bộ file này.

---

## Update Việc 12 - Organization + Công tác + Portal theo chức vụ

### Mục tiêu Việc 12

Việc 12 tập trung rà soát và demo xuyên suốt luồng:

```txt
Tổ/Ban
→ Bổ nhiệm
→ Phân công công tác
→ Học viên xem công tác trên portal
→ Người có chức vụ thấy đúng phạm vi phụ trách
```

Phạm vi chính:

- OrganizationSimple: Tổ/Ban, bổ nhiệm, danh sách, OrgChart.
- DailyRoutine/Duties: công tác, phân công theo học viên/phòng/tổ/ban.
- Resident Portal: học viên thường và học viên có chức vụ.
- Navigation: phân menu resident thường và appointed resident.

Nguyên tắc thực hiện:

- Không đổi layout OrgChart đã ổn.
- Không mở rộng lan man ngoài flow demo.
- Chỉ patch phần thiếu/bug/demo-blocker.
- Sau mỗi audit/patch/pass phải cập nhật checklist và summary theo hướng append-only.

---

### Bộ file base Việc 12 đã nhận

User đã gửi bộ file đầy đủ cho Việc 12 và nhắc lần sau phải dùng các file này làm base, không hỏi lại nếu user không nói có chỉnh thêm.

Các file đã nhận:

- `client/src/pages/OrganizationSimple.tsx`
- `client/src/pages/DailyRoutine.tsx`
- `client/src/pages/MyDuties.tsx`
- `client/src/components/ResidenceCareLayout.tsx`
- `client/src/components/organization-simple/` qua `organization-simple.zip`
- `client/src/navigation/appointedResidentNavigation.ts`
- `client/src/navigation/index.ts`
- `client/src/navigation/managerNavigation.ts`
- `client/src/navigation/navigation.ts`
- `client/src/navigation/residentNavigation.ts`
- `client/src/navigation/types.ts`
- `server/routers/modules/organization.ts`
- `server/routers/modules/duties.ts`
- `server/routers/modules/dailyRoutine.ts`
- `server/routers/modules/residentPortal.ts`
- `server/services/organizationService.ts`
- `server/services/dailyRoutineService.ts`
- `server/services/residentPortalAccessService.ts`
- `server/services/residentPortalService.ts`
- `server/db/duty.ts`

Ghi nhớ workflow: bộ file này là base hiện tại của Việc 12 trong cuộc làm việc này, trừ khi user nói đã thay đổi.

---

### 12A - Org/Duty/Portal guard & scope

Đã audit và gửi patch 12A cho các điểm guard/scope trong Organization, Duties, Resident Portal và MyDuties.

Mục tiêu 12A:

- Bảo đảm demo flow Tổ/Ban → Bổ nhiệm → Công tác → Portal không bị hở quyền.
- Bảo đảm scope công tác theo học viên không bị lệch.
- Đồng bộ MyDuties với Resident Portal overview.

Các vấn đề phát hiện:

1. Organization router mutation chưa guard manager rõ ở router layer.
2. Một số duties endpoint quản trị còn mở ở mức `protectedProcedure`.
3. `duty` DB query theo resident có nguy cơ mất điều kiện residentId khi có filter.
4. `MyDuties` còn dùng flow duties cũ, chưa đồng bộ với `residentPortal.getTodayOverview`.

Patch 12A ảnh hưởng:

- `server/routers/modules/organization.ts`
- `server/routers/modules/duties.ts`
- `server/db/duty.ts`
- `client/src/pages/MyDuties.tsx`

Nội dung 12A:

- Thêm manager guard cho mutation quản trị Organization.
- Thêm manager guard cho một số Duties endpoint quản trị còn thiếu.
- Chặn resident inactive/transferred_out/left xem/cập nhật công tác.
- Sửa `getAssignmentsByResident` để giữ đúng scope resident.
- Sửa `updateAssignmentForResident` để hỗ trợ cả `residentId` và `assignedToType=resident`.
- Sửa `getAssignmentsByDuty` để không bị override condition khi có filter.
- `MyDuties` dùng `residentPortal.getTodayOverview` + `completeTodayDuty`.

Trạng thái 12A: đã gửi patch và tiếp tục theo flow demo.

---

### 12B - Assignment modal error placement - PASS

User phát hiện lỗi validate “Vui lòng chọn học viên.” nằm ở page phía sau modal Bổ nhiệm / Phân công. Đây là lỗi UX vì lỗi phải hiển thị ngay trên form/modal đang thao tác.

Đã xử lý bằng patch 12B.

File ảnh hưởng:

- `client/src/pages/OrganizationSimple.tsx`

Kết quả:

- Modal Bổ nhiệm / Phân công có state lỗi riêng.
- Lỗi validate khi chưa chọn học viên hiển thị trong modal.
- Lỗi API khi lưu bổ nhiệm cũng hiển thị trong modal.
- Clear lỗi khi mở modal.
- Clear lỗi khi đóng modal.
- Clear lỗi khi lưu thành công.
- Không đổi backend.
- Không đổi OrgChart.
- Không đổi rule bổ nhiệm.

Runtime user đã xác nhận:

- Mở modal Bổ nhiệm / Phân công.
- Không chọn học viên.
- Bấm Lưu.
- Lỗi hiển thị trong modal, không còn nằm dưới page phía sau.

User xác nhận: **12B pass**.

---

### 12C - Bước tiếp theo: test xuyên suốt Organization → Công tác → Portal theo chức vụ

Sau 12A và 12B, chưa nên thêm chức năng mới ngay. Cần chạy demo flow để bắt lỗi thật.

Kịch bản 12C cần kiểm tra:

1. Tạo Tổ/Ban và thêm học viên.
2. Bổ nhiệm chức vụ nhà, Tổ trưởng, Trưởng ban.
3. Phân công công tác theo học viên/phòng/tổ/ban.
4. Học viên thường xem và hoàn thành công tác trên portal.
5. Người có chức vụ xem đúng phạm vi phụ trách.
6. Không lộ dữ liệu ngoài phạm vi.

Các điểm audit 12C cần tập trung:

- Portal theo chức vụ đã đủ dữ liệu chưa.
- Công tác theo Tổ/Ban/Phòng có hiển thị đúng cho học viên liên quan chưa.
- MyDuties / Today overview có đồng bộ trạng thái hoàn thành chưa.
- Navigation theo vai trò có đúng menu cần demo chưa.

---

### Ghi chú workflow tracking

User nhắc lại:

- `PROJECT_SUMMARY.md` chỉ ghi thêm phần status append, không thay thế toàn bộ nội dung hiện có nếu user không yêu cầu.
- `RESIDENCECORE_CHECKLIST_VIEC12_IN_PROGRESS.md` và `PROJECT_SUMMARY_VIEC12_STATUS_APPEND.md` phải được cập nhật theo hướng append-only.
- Khi gửi lại cần gửi full file đã gom đủ lịch sử, không gửi bản ghi đè/rút gọn.

Rà lại sau nhắc nhở của user:

- Bản trước đó chưa thật sự full lịch sử.
- Đã dựng lại 2 file tracking đầy đủ hơn cho Việc 12, gồm: bối cảnh, file base, checklist tổng, 12A, 12B pass, 12C next, và workflow append-only.


---

### Tracking full-history rebuild - PASS

User đã kiểm tra lại bản dựng mới của 2 file tracking Việc 12:

- `RESIDENCECORE_CHECKLIST_VIEC12_IN_PROGRESS.md`
- `PROJECT_SUMMARY_VIEC12_STATUS_APPEND.md`

Kết quả: **pass**.

Từ sau mốc này:

- Dùng 2 file tracking hiện tại làm base.
- Mọi cập nhật tiếp theo của Việc 12 phải append vào cuối file.
- Không ghi đè, không thay thế lịch sử.
- Khi gửi lại cho user, gửi full accumulated file.

Bước tiếp theo là bắt đầu **12C - Test/audit xuyên suốt Organization → Công tác → Portal theo chức vụ**.


---

### 12C - Audit/Patch Portal công tác theo cá nhân/phòng/tổ/ban

Trạng thái: **Patch đã chuẩn bị, chờ apply/test**.

Sau 12A/12B, tiến hành audit luồng demo xuyên suốt:

```txt
Tổ/Ban → Bổ nhiệm → Công tác → Portal học viên → Portal theo chức vụ
```

Kết quả audit:

- Organization nền đã ổn cho demo: có Tổ/Ban, bổ nhiệm, OrgChart và modal error đúng chỗ.
- Duties nền đã hỗ trợ phân công theo `resident`, `room`, `team`, `committee`.
- Resident portal có `getTodayOverview`, `getMyDutyScope`, `completeTodayDuty`.
- Navigation đã có menu theo chức vụ.

Demo blocker phát hiện:

- Portal học viên thường trước đó chỉ lấy công tác trực tiếp theo resident, chưa gom công tác theo phòng/tổ/ban mà học viên thuộc về.
- `completeTodayDuty` trước đó chỉ cho hoàn thành assignment trực tiếp, chưa cho assignment theo phòng/tổ/ban thuộc phạm vi học viên.
- MyDuties chưa hiển thị nhãn phạm vi công tác.

Patch 12C chuẩn bị:

- Cập nhật `server/services/residentPortalAccessService.ts`:
  - xác định duty target của học viên gồm cá nhân, phòng hiện tại, tổ, ban;
  - `getTodayOverview` gom công tác hôm nay theo các target này;
  - dedupe assignment theo id;
  - cho phép hoàn thành công tác nếu assignment thuộc phạm vi hợp lệ của học viên.
- Cập nhật `client/src/pages/MyDuties.tsx`:
  - hiển thị nhãn phạm vi công tác: `Cá nhân`, `Phòng hiện tại`, `Tổ: ...`, `Ban: ...`;
  - empty state nói rõ không có công tác cá nhân/phòng/tổ/ban.

Không đổi:

- Không đổi schema.
- Không đổi OrgChart.
- Không đổi rule bổ nhiệm.
- Không đổi conflict lịch học/công tác.
- Không mở rộng module mới.

Cần test sau apply:

- Phân công cho học viên → học viên thấy và hoàn thành được.
- Phân công cho phòng → học viên trong phòng thấy và hoàn thành được.
- Phân công cho tổ → thành viên tổ thấy; tổ trưởng thấy scope tổ.
- Phân công cho ban → thành viên ban thấy; trưởng ban thấy scope ban.
- Học viên ngoài phạm vi không thấy assignment không thuộc mình.
