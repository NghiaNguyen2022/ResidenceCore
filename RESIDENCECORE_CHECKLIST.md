# ResidenceCore / App Lưu Xá — Context Update 2026-07-04

## Trạng thái đã chốt

### Nền dự án / cleanup

- Việc 1 — Route / Menu / Page: Done / Pass
- Việc 2 — Page orphan audit: Done
- Việc 3 — Members / Rooms / Organization main flow: Done / Pass
- Việc 4 — FinanceLite tối thiểu: Done / Pass
- Việc 5 — DailyRoutine / Công tác mức demo: Done / Pass
- Việc 6 — Resident Portal theo dữ liệu thật: Done / Pass
- Việc 7 — Test baseline: Done / Pass
- Việc 8 — Definition of Done cho module chính: Done
- Việc 9 — Helper / Style / Picker: Done / Pass
- Việc 10 — Docs cleanup / file thừa: Done / Pass

### Demo full flow

- Việc 11 — Học tập / Lịch học: Done / Pass
  - Tab Học tập trong hồ sơ học viên đã review.
  - Lịch học dùng TimePicker theo rule picker.
  - Backend guard đã bổ sung cho học tập/lịch học.
  - Validate HH:mm và start/end time đã được bảo vệ.
  - Conflict công tác với lịch học vẫn hoạt động.

## Rule đã chốt và cần bảo vệ

1. File nào user đã gửi và assistant đã patch xong thì xem là bản mới nhất, trừ khi user nói có chỉnh thêm bên ngoài.
2. Không yêu cầu user gửi lại cùng một file nhiều lần nếu không cần thiết.
3. Mọi input date/time/datetime phải có picker phù hợp, không dùng text input trần.
4. DatePickerInput đã được fix portal để không bị cắt trong modal/card.
5. TimePickerInput đã được thêm và dùng cho lịch học / công tác / routine.
6. Các flow đã pass không được refactor lan rộng nếu không có bug rõ ràng.
7. Sau mỗi việc pass phải cập nhật checklist và PROJECT_SUMMARY.md/context tương ứng.

## Ghi chú Việc 11B — Polish layout Học tập

- Đã thử patch layout/style cho tab Học tập & Lịch học.
- Patch gây lỗi JSX trong `MemberDetailModal.tsx` quanh line ~673: Adjacent JSX elements must be wrapped.
- User đã xử lý xong bên repo và yêu cầu update context.
- Với các bước sau, phải xem bản repo hiện tại của user là bản mới nhất.
- Nếu cần polish lại layout học tập, ưu tiên sửa trong `StudyScheduleSection.tsx`; khi đụng `MemberDetailModal.tsx` phải kiểm tra kỹ cặp JSX wrapper.

## Bước tiếp theo đề xuất

### Việc 12 — Review Organization + Công tác + Portal theo chức vụ

Mục tiêu: tạo được kịch bản demo xuyên suốt theo vai trò.

Checklist chính:

- Tạo nhiệm kỳ / cơ cấu hiện tại.
- Tạo Tổ / Ban.
- Thêm học viên vào Tổ / Ban.
- Bổ nhiệm Trưởng, Phó, Thư ký, Thủ quỹ.
- Bổ nhiệm Tổ trưởng theo từng Tổ.
- Bổ nhiệm Trưởng ban theo từng Ban.
- Phân công công tác theo học viên / phòng / tổ / ban.
- Học viên thường thấy công tác của mình trên portal.
- Học viên có chức vụ thấy đúng phạm vi phụ trách.
- Resident không thấy menu manager và không gọi được API quản trị.

## File nên dùng cho Việc 12

- `client/src/pages/OrganizationSimple.tsx`
- `client/src/components/organization-simple/*`
- `client/src/pages/DailyRoutine.tsx`
- `client/src/components/daily-routine/*`
- `client/src/pages/MyDuties.tsx`
- `client/src/pages/resident/*`
- `client/src/navigation/*`
- `client/src/components/ResidenceCareLayout.tsx`
- `server/routers/modules/organization.ts`
- `server/services/organizationService.ts`
- `server/routers/modules/duties.ts`
- `server/routers/modules/dailyRoutine.ts`
- `server/services/dailyRoutineService.ts`
- `server/db/duty.ts`
- `server/routers/modules/residentPortal.ts`
- `server/services/residentPortalService.ts`
- `server/services/residentPortalAccessService.ts`
- `drizzle/schema.ts`
- `drizzle/residents.ts`
- `drizzle/dailyRoutine.ts`
