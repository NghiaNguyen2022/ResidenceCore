# ResidenceCore / App Lưu Xá - Checklist triển khai tuần tự

**Cập nhật gần nhất:** 2026-07-03 - Việc 5 đang làm: DailyRoutine/Công tác audit vòng 1, đã tạo Patch 5A RBAC duties router, chờ apply/check/test/build/runtime  
**Nguyên tắc làm việc:** làm từng việc một; sau mỗi bước cập nhật lại file checklist này; không mở rộng module mới khi main flow chưa ổn định.

---

## 0. Tổng trạng thái hiện tại

| Việc | Nội dung | Ưu tiên | Trạng thái |
|---|---|---|---|
| 1 | Đồng bộ Route / Menu / Page | P0 | ✅ Hoàn tất - patch đã apply, check/test/build pass |
| 2 | Phân loại page chưa vào route chính | P0 | ✅ Hoàn tất audit - chưa patch/xóa file |
| 3 | Khóa main flow Học viên → Phòng → Tổ chức | P0 | ✅ Hoàn tất - patch đã apply, check/test/build/runtime pass theo xác nhận user |
| 4 | Khóa FinanceLite tối thiểu | P0/P1 | ✅ Hoàn tất - patch đã apply, check/test/build/runtime pass theo xác nhận user |
| 5 | Khóa DailyRoutine / Công tác mức demo | P0/P1 | 🟡 Đang làm - audit vòng 1, chờ apply Patch 5A |
| 6 | Review Resident Portal theo dữ liệu thật | P1 | ⏳ Chưa làm |
| 7 | Dọn test baseline | P1 | ⏳ Chưa làm |
| 8 | Chốt Definition of Done cho module chính | P1 | ⏳ Chưa làm |
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

### Kết luận

- Không cần patch code ngay ở Việc 2 vì route/menu đã sạch sau Việc 1.
- Không nên connect hàng loạt 12 page nhóm Connect, vì dễ mở rộng app quá nhanh và làm loãng demo.
- Nhóm Archive để xử lý sau khi main flow demo ổn định.

---

## 3. Việc 3 - Khóa main flow Học viên → Phòng → Tổ chức

### Trạng thái

✅ Hoàn tất. User xác nhận **Việc 3 pass**.

### File đã kiểm tra

- `client/src/pages/Members.tsx`
- `client/src/pages/OrganizationSimple.tsx`
- `client/src/components/members/*`
- `client/src/components/organization-simple/*`
- `server/routers/modules/members.ts`
- `server/routers/modules/rooms.ts`
- `server/routers/modules/organization.ts`
- `server/services/memberService.ts`
- `server/services/roomService.ts`
- `server/services/organizationService.ts`
- `server/db/resident.ts`
- `server/db/room.ts`
- `server/db/user.ts`
- `server/services/authService.ts`
- `drizzle/residents.ts`
- `drizzle/schema.ts`

### Patch đã áp

#### Patch 3A - Bảo vệ endpoint legacy `members.assignRoom`

- `server/services/memberService.ts`
- `server/routers/modules/members.ts`

Mục tiêu:

- Bổ sung quyền quản lý cho `members.assignRoom`.
- Chặn học viên inactive/transferred_out thao tác phòng trực tiếp.
- Chặn gán cùng phòng.
- Kiểm tra phòng tồn tại.
- Kiểm tra sức chứa.
- Khi chuyển/trả phòng: đóng assignment cũ.
- Cập nhật `residents.currentRoomId`.
- Giữ lịch sử `roomAssignments`.

#### Patch 3B - Bổ sung RBAC cho `rooms` router

- `server/routers/modules/rooms.ts`

Mục tiêu:

- Các mutation quản lý phòng phải có guard manager rõ ràng.
- Tránh resident user gọi nhầm API quản lý phòng nếu chỉ qua `protectedProcedure`.

### Kết quả xác minh

- ✅ `rooms.assignResident` là endpoint chính của frontend hiện tại.
- ✅ `roomService.ts` dùng `residents.currentRoomId` làm nguồn hiện trạng chính.
- ✅ Chặn học viên đã rời/ngừng gán/chuyển phòng.
- ✅ Chặn gán mới nếu học viên đã có phòng.
- ✅ Chặn chuyển phòng khi chưa có phòng.
- ✅ Kiểm tra phòng tồn tại.
- ✅ Kiểm tra sức chứa.
- ✅ Chặn chuyển cùng phòng.
- ✅ Đóng assignment cũ khi chuyển/trả phòng.
- ✅ Cập nhật `currentRoomId`.
- ✅ Rule Tổ trưởng theo từng Tổ, không check global.
- ✅ Rule Trưởng ban theo từng Ban, không check global.
- ✅ OrgChart giữ layout đã chốt.

### Runtime checklist đã pass theo xác nhận user

- ✅ Patch 3A đã apply.
- ✅ Patch 3B đã apply.
- ✅ `pnpm check` pass.
- ✅ `pnpm test` pass.
- ✅ `pnpm build` pass.
- ✅ Runtime test Members/Rooms pass.
- ✅ Runtime test Organization pass.

### Kết luận sau Việc 3

Main flow **Học viên → Phòng → Tổ chức** đã được khóa đủ để chuyển sang FinanceLite. Không mở rộng thêm Organization/Members trong thời điểm này trừ khi phát sinh bug trực tiếp.

---

## 4. Việc 4 - Khóa FinanceLite tối thiểu

### Trạng thái

✅ Hoàn tất. User xác nhận **ok, pass** sau khi apply patch và chạy kiểm tra.

### Mục tiêu đã khóa

Khóa luồng tài chính tối thiểu để demo/vận hành được:

```text
Tạo kỳ thu
→ chọn kỳ/tháng
→ áp dụng khoản thu cho học viên
→ sinh khoản phải thu thật
→ ghi nhận thanh toán
→ cập nhật trạng thái đã thu/chưa thu
→ tổng quan tài chính phản ánh đúng
```

### File đã kiểm tra

- `client/src/pages/FinanceLite.tsx`
- `client/src/components/finance-lite/FinanceLiteModals.tsx`
- `client/src/components/finance-lite/FinanceLitePanels.tsx`
- `client/src/components/finance-lite/FinanceLiteStudentLedger.tsx`
- `client/src/components/finance-lite/FinanceSummaryCards.tsx`
- `client/src/components/finance-lite/FinanceTabRail.tsx`
- `client/src/components/finance-lite/FinanceVoucherPreviewModal.tsx`
- `client/src/components/finance-lite/FinanceVoucherSettingsModal.tsx`
- `client/src/components/finance-lite/financeLiteTypes.ts`
- `client/src/components/finance-lite/financeLiteUtils.ts`
- `client/src/components/finance-lite/financeVoucherUtils.ts`
- `client/src/lib/format.ts`
- `client/src/lib/utils.ts`
- `client/src/components/shared/styleMedium.ts`
- `server/routers/modules/finance.ts`
- `server/routers/financial.ts`
- `server/db/finance.ts`
- `drizzle/schema.ts`

### Patch đã áp

#### Patch 4A - RBAC cho finance router

- `server/routers/modules/finance.ts`

Mục tiêu:

- Bổ sung guard `requireFinanceManagementAccess()`.
- Chặn user không phải manager đọc/ghi API finance-lite quản trị.
- Giữ finance quản trị tách khỏi resident portal finance.

#### Patch 4B - Guard nghiệp vụ DB finance

- `server/db/finance.ts`

Mục tiêu:

- Thêm helper `isInactiveResidentStatus()`.
- Dùng helper này trong preview apply kỳ.
- Validate `feeTypeId`, `residentIds`, `amount > 0` khi tạo batch.
- Skip học viên không tồn tại hoặc đã rời/ngừng khi tạo batch.
- Set `target_type = resident` và `target_name` từ tên/mã học viên khi tạo batch.
- Chặn update khoản thu nhỏ hơn số đã thu.
- Check trùng khoản thu bằng billing month đã resolve.

### Kết quả xác minh

- ✅ FE FinanceLite có đủ trục flow tối thiểu: kỳ thu, tháng áp dụng, preview học viên, chọn khoản phí, apply kỳ thu, danh sách khoản phải thu, ghi nhận thanh toán, thu gộp theo học viên, tổng quan theo kỳ.
- ✅ Tháng hiện tại có logic tự chọn/focus qua helper `getCurrentBillingMonth()` và `scrollIntoView`.
- ✅ Flow apply kỳ thu refetch charges, periods, preview, period detail và summary sau khi thành công.
- ✅ Flow record payment refetch charges, transactions, periods và summary sau khi thành công.
- ✅ `recordFinancePayment()` chặn khoản cancelled/paid, chặn số tiền thu <= 0, chặn thu vượt remaining amount.
- ✅ Sau payment, hệ thống cập nhật `paid_amount`, `remaining_amount`, `status` sang `partial` hoặc `paid`.
- ✅ `cancelFinanceCharge()` chặn hủy trực tiếp nếu khoản đã phát sinh thanh toán.
- ✅ Summary tính dựa trên `finance_charges` không cancelled và `finance_transactions`, phù hợp flow apply/payment/cancel hiện tại.

### Runtime checklist đã pass theo xác nhận user

- ✅ Patch 4A đã apply.
- ✅ Patch 4B đã apply.
- ✅ `pnpm check` pass.
- ✅ `pnpm test` pass.
- ✅ `pnpm build` pass.
- ✅ Runtime test FinanceLite tối thiểu pass theo xác nhận user.

### Kết luận sau Việc 4

FinanceLite tối thiểu đã đủ khóa để chuyển sang **Việc 5 - DailyRoutine / Công tác mức demo**. Chưa mở rộng thêm phiếu thu/phiếu chi/tạm ứng/dự chi/in chứng từ ở thời điểm này; các phần đó để sau khi DailyRoutine và Resident Portal ổn định.

## 5. Việc 5 - Khóa DailyRoutine / Công tác mức demo

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 5.1. Dùng `/daily-routine` làm điểm vào chính.
- [ ] 5.2. Có tab Hôm nay.
- [ ] 5.3. Có tab Lịch sinh hoạt.
- [ ] 5.4. Có tab Công tác.
- [ ] 5.5. Tạo mẫu lịch sinh hoạt.
- [ ] 5.6. Tạo công tác trực nhật/công tác chung.
- [ ] 5.7. Công tác giữ gọn: ngày, nơi làm, người/phòng/tổ/ban được phân công, đã hoàn thành/chưa hoàn thành.
- [ ] 5.8. Phân công theo ngày.
- [ ] 5.9. Phân công theo tuần đơn giản.
- [ ] 5.10. Cập nhật trạng thái hoàn thành.
- [ ] 5.11. Kiểm tra conflict với lịch học.
- [ ] 5.12. Giữ buffer 60 phút.
- [ ] 5.13. Cancel rồi reassign được.
- [ ] 5.14. Không mở Smart Assignment nâng cao trong demo chính.

---

## 6. Việc 6 - Review Resident Portal theo dữ liệu thật

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 6.1. Resident đăng nhập được.
- [ ] 6.2. Nếu `mustChangePassword = true` thì chặn bằng popup đổi mật khẩu.
- [ ] 6.3. Đổi mật khẩu xong logout/relogin.
- [ ] 6.4. Hôm nay hiển thị lịch/công tác đúng.
- [ ] 6.5. Tài chính của tôi hiển thị khoản thu đúng.
- [ ] 6.6. Hồ sơ của tôi hiển thị thông tin cá nhân đúng.
- [ ] 6.7. Phòng ở hiển thị đúng.
- [ ] 6.8. Liên hệ gia đình hiển thị đúng.
- [ ] 6.9. Resident không thấy menu manager.
- [ ] 6.10. Resident không gọi được API quản lý.

---

## 7. Việc 7 - Dọn test baseline

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 7.1. Xác nhận file test nào là test thật.
- [ ] 7.2. Xử lý `server/routers.test.ts` nếu chỉ là legacy helper.
- [ ] 7.3. Tách helper DB sang file riêng nếu cần.
- [ ] 7.4. Giữ test auth logout.
- [ ] 7.5. Giữ test duties permission.
- [ ] 7.6. Thêm test phòng đầy.
- [ ] 7.7. Thêm test học viên đã rời/ngừng.
- [ ] 7.8. Thêm test reset password/mustChangePassword.
- [ ] 7.9. Thêm test ghi nhận thanh toán.
- [ ] 7.10. Chạy `pnpm test` pass.

---

## 8. Việc 8 - Chốt Definition of Done cho module chính

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 8.1. Tạo `docs/MODULE_DONE_DEFINITION.md`.
- [ ] 8.2. Chốt DoD cho Members.
- [ ] 8.3. Chốt DoD cho Rooms.
- [ ] 8.4. Chốt DoD cho Organization.
- [ ] 8.5. Chốt DoD cho DailyRoutine.
- [ ] 8.6. Chốt DoD cho FinanceLite.
- [ ] 8.7. Mỗi module phải có route thật.
- [ ] 8.8. Mỗi module phải có menu vào được hoặc có lý do ẩn/disabled.
- [ ] 8.9. Mỗi module phải có API khớp UI.
- [ ] 8.10. Mỗi module phải có business rule chính đúng.
- [ ] 8.11. Mỗi module phải có loading/error/empty state.
- [ ] 8.12. Mỗi module phải có test cơ bản.

---

## 9. Việc 9 - Chuẩn hóa helper / util / style

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 9.1. Gom `formatMoney`.
- [ ] 9.2. Gom `formatVND`.
- [ ] 9.3. Gom `formatVNDFull`.
- [ ] 9.4. Gom `formatMoneyInput`.
- [ ] 9.5. Gom `formatDate`.
- [ ] 9.6. Gom `parseDateInput`.
- [ ] 9.7. Gom `toInputDateValue`.
- [ ] 9.8. Rà `normalizeText`.
- [ ] 9.9. Rà `normalizeCode`.
- [ ] 9.10. Đảm bảo dùng `cx`/`cn` từ `client/src/lib/utils.ts`.
- [ ] 9.11. Đảm bảo page mới dùng `residenceMediumStyle`.
- [ ] 9.12. Không tạo style Tailwind random ngoài token.

---

## 10. Việc 10 - Cleanup docs / file thừa

### Trạng thái

⏳ Chưa làm.

### Checklist chi tiết

- [ ] 10.1. So sánh `STYLE_SYNC_RULES.md` ở root và `client/docs`.
- [ ] 10.2. Merge nếu trùng nội dung.
- [ ] 10.3. Xóa `.temp_tsc_out_utf8.txt` nếu chỉ là file tạm.
- [ ] 10.4. Xóa `.temp_tsc_out.txt` nếu chỉ là file tạm.
- [ ] 10.5. Rà `Trình-bày.docx`.
- [ ] 10.6. Rà `Trình-bày-Professional.docx`.
- [ ] 10.7. Rà `client/src/components/ResidenceCore-Business.docx`.
- [ ] 10.8. Nếu cần giữ thì chuyển vào `docs/archive`.
- [ ] 10.9. Rà README/module docs riêng bị trùng.
- [ ] 10.10. Cập nhật checklist sau cleanup.

---

## Ghi chú vận hành

- Việc tiếp theo được phép bắt đầu: **Việc 5 - DailyRoutine / Công tác mức demo**.
- Không quay lại sửa Members/Rooms/Organization/FinanceLite trừ khi có bug phát sinh sau pass.
- Không mở rộng chứng từ/in phiếu tài chính trước khi DailyRoutine và Resident Portal ổn định.


---

## Cập nhật Việc 5 - DailyRoutine / Công tác mức demo

**Trạng thái:** 🟡 Đang làm - audit vòng 1  
**Ngày cập nhật:** 2026-07-03

### Đã làm

```txt
[x] Nhận file DailyRoutine/Duties từ user.
[x] Đọc client/src/pages/DailyRoutine.tsx.
[x] Đọc client/src/pages/MyDuties.tsx.
[x] Giải nén và đọc client/src/components/daily-routine/*.
[x] Đọc server/routers/modules/dailyRoutine.ts.
[x] Đọc server/routers/modules/duties.ts.
[x] Đọc server/services/dailyRoutineService.ts.
[x] Đọc server/db/duty.ts.
[x] Kiểm tra hướng flow /daily-routine và /my-duties.
[x] Phát hiện rủi ro RBAC ở dutiesRouter.
[x] Tạo Patch 5A: RBAC cho endpoint quản lý công tác.
```

### Cần apply

```txt
[ ] Patch 5A: server/routers/modules/duties.ts
```

### Cần chạy sau patch

```txt
[ ] pnpm check
[ ] pnpm test
[ ] pnpm build
```

### Runtime test sau patch

```txt
[ ] Manager mở /daily-routine.
[ ] Tạo/cập nhật lịch sinh hoạt.
[ ] Tạo công tác.
[ ] Preview phân công.
[ ] Ghi phân công.
[ ] Đánh dấu hoàn thành.
[ ] Đánh dấu vắng/chưa làm.
[ ] Hủy công tác.
[ ] Cancel rồi reassign.
[ ] Resident xem /my-duties.
[ ] Resident chỉ cập nhật công tác của mình.
```

### File phát sinh

```txt
RESIDENCECORE_VIEC5_DAILY_ROUTINE_AUDIT.md
RESIDENCECORE_VIEC5_RUNTIME_CHECKLIST.md
residencecore_viec5_duties_rbac.patch
duties.updated.ts
```
