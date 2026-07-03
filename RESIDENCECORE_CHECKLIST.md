# ResidenceCore / App Lưu Xá - Checklist triển khai tuần tự

**Cập nhật gần nhất:** 2026-07-04 - Việc 7 đã pass. Việc 8 chuyển sang trạng thái sẵn sàng bắt đầu.

**Nguyên tắc làm việc:**

- Làm từng việc một.
- Sau mỗi bước phải cập nhật lại file checklist này.
- File nào người dùng đã gửi và assistant đã sửa/patch xong thì xem là bản mới nhất, trừ khi người dùng nói đã chỉnh thêm bên ngoài.
- Không yêu cầu gửi lại cùng một file nếu chưa có lý do thật sự.
- Không mở rộng module mới khi việc hiện tại chưa pass.

---

## 0. Tổng trạng thái hiện tại

| Việc | Nội dung | Ưu tiên | Trạng thái |
|---|---|---|---|
| 1 | Đồng bộ Route / Menu / Page | P0 | ✅ Hoàn tất - patch đã apply, check/test/build pass |
| 2 | Phân loại page chưa vào route chính | P0 | ✅ Hoàn tất audit - chưa patch/xóa file |
| 3 | Khóa main flow Học viên → Phòng → Tổ chức | P0 | ✅ Hoàn tất - patch đã apply, check/test/build/runtime pass |
| 4 | Khóa FinanceLite tối thiểu | P0/P1 | ✅ Hoàn tất - patch đã apply, check/test/build/runtime pass |
| 5 | Khóa DailyRoutine / Công tác mức demo | P0/P1 | ✅ Hoàn tất - Patch 5A đã apply, check/test/build/runtime pass |
| 6 | Review Resident Portal theo dữ liệu thật | P1 | ✅ Hoàn tất - Patch 6A đã apply, check/test/build/runtime pass |
| 7 | Dọn test baseline | P1 | ✅ Hoàn tất - Patch 7A đã apply, check/test/build pass |
| 8 | Chốt Definition of Done cho module chính | P1 | ▶️ Sẵn sàng bắt đầu |
| 9 | Chuẩn hóa helper / util / style | P1/P2 | ⏳ Chưa làm |
| 10 | Cleanup docs / file thừa | P2 | ⏳ Chưa làm |

---

## 1. Việc 1 - Đồng bộ Route / Menu / Page

### Trạng thái

✅ Hoàn tất. User đã áp patch và xác nhận `pnpm check`, `pnpm test`, `pnpm build` pass.

### File đã xử lý

- `client/src/App.tsx`
- `client/src/navigation/managerNavigation.ts`
- `client/src/components/ResidenceCareLayout.tsx`

### Kết quả

- `/users` đã được chuẩn hóa về route thật `/settings/users`.
- Các menu chưa phục vụ demo được chuyển sang disabled/badge `Sau` để không click vào 404.
- Sau patch không còn navigation path clickable thiếu route.

---

## 2. Việc 2 - Phân loại page chưa vào route chính

### Trạng thái

✅ Hoàn tất audit. Chưa patch code, chưa xóa/move file.

### Kết quả audit

- Tổng file page trong `client/src/pages`: 59
- Page đã có route/import trong `App.tsx`: 26
- Page chưa vào route chính: 33
- Navigation path unique sau Việc 1: 22
- Navigation path thiếu route sau Việc 1: 0
- Route có nhưng không nằm trong menu: 3 route hệ thống/đặc biệt
  - `/`
  - `/login`
  - `/my-duties`

### Phân loại 33 page orphan

#### Connect - có thể nối route/menu sau khi đến đúng bước

- `AdminSettings.tsx`
- `Parents.tsx`
- `Reports.tsx`
- `Fees.tsx`
- `Financial.tsx`
- `ActivityPlans.tsx`
- `DisciplineCases.tsx`
- `LiturgySchedule.tsx`
- `SkillClasses.tsx`
- `SkillResults.tsx`
- `Skills.tsx`
- `SmartAssignment.tsx`

#### Keep - giữ lại cho roadmap, chưa hiện menu chính

- `AcademicEvaluations.tsx`
- `AcademicInfo.tsx`
- `Attendance.tsx`
- `Clubs.tsx`
- `EducationReferences.tsx`
- `LiturgyAssignments.tsx`
- `LiturgyAttendance.tsx`
- `NotificationPreferences.tsx`
- `OrganizationRoles.tsx`
- `OrganizationStructure.tsx`
- `OrganizationTerms.tsx`
- `OrganizationUnits.tsx`
- `ResidentLeadershipOverview.tsx`
- `ResidentRoleDutiesScopePage.tsx`
- `RoomDetail.tsx`
- `Schedule.tsx`
- `Tasks.tsx`

#### Archive - nên tách khỏi luồng chính sau khi xác nhận

- `ComponentShowcase.tsx`
- `ResidentRolePlaceholderPage.tsx`
- `Residents.tsx`
- `Schedules.tsx`

---

## 3. Việc 3 - Khóa main flow Học viên → Phòng → Tổ chức

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 3 pass**.

### Patch đã áp

- Patch 3A: bảo vệ legacy `members.assignRoom`.
- Patch 3B: bổ sung RBAC cho `rooms` router.

### Kết quả

- Flow Members → Rooms → Organization ổn.
- Không phát sinh yêu cầu sửa lại sau khi pass.

---

## 4. Việc 4 - Khóa FinanceLite tối thiểu

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 4 pass**.

### Patch đã áp

- Patch 4A: RBAC cho finance router.
- Patch 4B: guard nghiệp vụ DB finance.

### Kết quả

- Flow tạo kỳ/khoản thu → áp dụng → thanh toán → summary/trạng thái pass.
- Chưa mở rộng sang chứng từ/in phiếu nâng cao.

---

## 5. Việc 5 - DailyRoutine / Công tác mức demo

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 5 ổn/pass**.

### Patch đã áp

- Patch 5A: RBAC duties router.

### Kết quả

- Manager flow `/daily-routine` ổn.
- Resident `MyDuties` ổn.
- Chưa mở Smart Assignment nâng cao.

---

## 6. Việc 6 - Resident Portal theo dữ liệu thật

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 6 pass**.

### Patch đã áp

- Patch 6A: active guard cho Resident Portal.

### Kết quả

- Resident active vào được portal.
- Resident inactive/transferred_out bị guard.
- Resident portal hiển thị đúng các nhóm dữ liệu chính.

---

## 7. Việc 7 - Dọn test baseline

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 7 pass**.

### Patch đã áp dụng

- Đổi `server/routers.test.ts` thành `server/routers.legacy.ts`.
- Mục tiêu: tránh Vitest collect nhầm file helper DB legacy như test thật.
- Không đổi logic nghiệp vụ/runtime.

### Kết quả

- `pnpm check` pass.
- `pnpm test` pass.
- `pnpm build` pass.
- Test baseline đã rõ hơn, không còn file legacy helper mang hậu tố `.test.ts`.

---

## 8. Việc 8 - Chốt Definition of Done cho module chính

### Trạng thái

⏳ Chưa làm. Chỉ bắt đầu sau khi Việc 7 pass.

### Mục tiêu

Tạo tài liệu định nghĩa “xong” cho từng module chính, để tránh tình trạng module có UI nhưng chưa đủ route/API/test/business rule.

### Module áp dụng trước

- Members
- Rooms
- Organization
- DailyRoutine
- FinanceLite
- Resident Portal

### Checklist dự kiến

- [ ] Tạo `docs/MODULE_DONE_DEFINITION.md`.
- [ ] Chốt DoD chung cho mọi module.
- [ ] Chốt DoD riêng cho Members.
- [ ] Chốt DoD riêng cho Rooms.
- [ ] Chốt DoD riêng cho Organization.
- [ ] Chốt DoD riêng cho DailyRoutine.
- [ ] Chốt DoD riêng cho FinanceLite.
- [ ] Chốt DoD riêng cho Resident Portal.
- [ ] Cập nhật README hoặc PROJECT_SUMMARY nếu cần.

### File dự kiến cần dùng

- `README.md`
- `PROJECT_SUMMARY.md`
- `docs/05_USER_MANUAL.md` nếu có
- Các audit/checklist đã tạo từ Việc 1 → Việc 7

---

## 9. Việc 9 - Chuẩn hóa helper / util / style

### Trạng thái

⏳ Chưa làm.

### Checklist giữ lại

- [ ] Gom/chuẩn hóa `formatMoney`.
- [ ] Gom/chuẩn hóa `formatVND`.
- [ ] Gom/chuẩn hóa `formatVNDFull`.
- [ ] Gom/chuẩn hóa `formatMoneyInput`.
- [ ] Gom/chuẩn hóa `formatDate`.
- [ ] Gom/chuẩn hóa `parseDateInput`.
- [ ] Gom/chuẩn hóa `toInputDateValue`.
- [ ] Rà `normalizeText`.
- [ ] Rà `normalizeCode`.
- [ ] Đảm bảo dùng `cx/cn` từ `client/src/lib/utils.ts`.
- [ ] Đảm bảo page mới dùng `residenceMediumStyle`.
- [ ] Không tạo style Tailwind random ngoài token.

---

## 10. Việc 10 - Cleanup docs / file thừa

### Trạng thái

⏳ Chưa làm.

### Checklist giữ lại

- [ ] So sánh `STYLE_SYNC_RULES.md` ở root và `client/docs`.
- [ ] Merge nếu trùng nội dung.
- [ ] Xóa `.temp_tsc_out_utf8.txt` nếu chỉ là file tạm.
- [ ] Xóa `.temp_tsc_out.txt` nếu chỉ là file tạm.
- [ ] Rà `Trình-bày.docx`.
- [ ] Rà `Trình-bày-Professional.docx`.
- [ ] Rà `client/src/components/ResidenceCore-Business.docx`.
- [ ] Nếu cần giữ thì chuyển vào `docs/archive`.
- [ ] Rà README/module docs riêng bị trùng.
- [ ] Cập nhật `PROJECT_SUMMARY.md` sau cleanup.
