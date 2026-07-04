# RESIDENCECORE - VIỆC 9B: Date/Time Picker Guard

## Trạng thái

- Việc 9A: shared helper foundation - đang chờ pass chung với Việc 9.
- Việc 9B: bổ sung TimePickerInput và thay các input giờ dạng text/native rời rạc - đã tạo patch, chờ apply/test.

## Rule bắt buộc mới

Các field kiểu ngày/giờ/datetime trong App Lưu Xá phải có picker để chọn nhanh:

- `date`: dùng `DatePickerInput` hoặc `FormDateInput`.
- `time`: dùng `TimePickerInput`.
- `datetime`: nếu phát sinh sau này, tạo/tái dùng `DateTimePickerInput`.
- Không tạo input text trần cho ngày/giờ.
- Không dùng UI chỉ cho nhập tay mà không có nút/popup chọn nhanh.

## Audit đã làm

### Date picker

Đã xác nhận:

- `DatePickerInput.tsx` có popup `DayPicker`, không chỉ là text input.
- `FormDateInput.tsx` đang alias sang `DatePickerInput`.

### Time input cần chuẩn hóa

Đã phát hiện input giờ còn nằm ở:

- `client/src/components/daily-routine/duties/DutyAssignmentForm.tsx`
- `client/src/components/daily-routine/routine/RoutineItemModal.tsx`
- `client/src/components/members/StudyScheduleModal.tsx`
- `client/src/components/members/StudyScheduleSection.tsx`

## Patch 9B

Patch tạo mới:

- `client/src/components/shared/form/TimePickerInput.tsx`

Và thay các `input type="time"` / `Input type="time"` ở các file trên bằng `TimePickerInput`.

## Runtime checklist sau khi apply

- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.
- [ ] DailyRoutine: chọn giờ bắt đầu/kết thúc bằng dropdown nhanh.
- [ ] DailyRoutine: nhập/chọn giờ vẫn lưu đúng `HH:mm`.
- [ ] Routine setup: chọn giờ bắt đầu/kết thúc bằng picker.
- [ ] Study schedule: chọn giờ bắt đầu/kết thúc bằng picker.
- [ ] FinanceLite/Members/DailyRoutine các flow đã pass trước đó không bị regression.

## Kết luận

Việc 9 chưa được chốt pass cho tới khi Patch 9A + Patch 9B đều apply và check/test/build/runtime ổn.
