# ResidenceCore - Việc 11: Học tập / Lịch học

## Mục tiêu

Review và khóa luồng học tập / lịch học cho demo full:

- Quản lý nhập thông tin học tập cơ bản của học viên.
- Quản lý tạo/sửa/xóa lịch học theo tuần.
- Lịch học dùng để tránh phân công công tác trùng giờ.
- UI/UX giữ đơn giản: trường/lớp, thứ, giờ bắt đầu, giờ kết thúc, nội dung, địa điểm.
- Các field giờ phải dùng TimePicker đã chuẩn hóa ở Việc 9.

## File đã audit

- `client/src/components/members/MemberDetailModal.tsx`
- `client/src/components/members/StudyScheduleModal.tsx`
- `client/src/components/members/StudyScheduleSection.tsx`
- `client/src/pages/Members.tsx`
- `server/routers/modules/members.ts`
- `server/services/memberService.ts`
- `server/db/resident.ts`
- `drizzle/residents.ts`
- `drizzle/schema.ts`

## Kết quả audit

### Đã ổn

- Tab Học tập trong `MemberDetailModal` đã gom `EducationInfoSection` và `StudyScheduleSection`.
- `StudyScheduleModal` và `StudyScheduleSection` đã dùng `TimePickerInput` theo rule Việc 9.
- Backend đã có API:
  - `members.getEducation`
  - `members.upsertEducation`
  - `members.getStudySchedules`
  - `members.createStudySchedule`
  - `members.updateStudySchedule`
  - `members.deleteStudySchedule`
- DB đã có bảng Simple Mode:
  - `residentEducation`
  - `residentStudySchedules`
- DB đã có kiểm tra lịch học trùng giờ trong cùng ngày.

### Rủi ro cần vá

1. `members.getEducation` và `members.getStudySchedules` là `protectedProcedure` nhưng chưa guard manager rõ ràng.
2. Service cho phép cập nhật thông tin học tập / lịch học cho resident đã inactive/transferred_out nếu gọi API trực tiếp.
3. Validate giờ ở service/db còn dễ lọt chuỗi không đúng HH:mm nếu bypass UI.

## Patch 11A

Patch này chỉ vá guard backend, không đổi UI.

Ảnh hưởng:

- `server/routers/modules/members.ts`
- `server/services/memberService.ts`
- `server/db/resident.ts`

Nội dung:

- Thêm `requireMemberManagementAccess(ctx.user)` cho `getEducation` và `getStudySchedules`.
- Chặn upsert education / create-update-delete study schedule nếu học viên đã inactive/transferred_out/left.
- Validate giờ học phải đúng định dạng `HH:mm`.
- So sánh giờ bằng phút thay vì so sánh chuỗi.

## Runtime checklist

- [ ] Manager mở tab Học tập trong chi tiết học viên.
- [ ] Lưu thông tin học tập.
- [ ] Tạo lịch học mới.
- [ ] Sửa lịch học.
- [ ] Xóa lịch học.
- [ ] Tạo lịch trùng giờ cùng ngày bị chặn.
- [ ] Giờ kết thúc <= giờ bắt đầu bị chặn.
- [ ] Giờ sai định dạng bị chặn ở backend.
- [ ] Học viên đã rời/ngừng không cập nhật được học tập/lịch học.
- [ ] DailyRoutine conflict với lịch học vẫn hoạt động.
- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.
