# RESIDENCECORE - VIỆC 9 RUNTIME CHECKLIST

## 9A - Shared helper foundation

- [ ] Apply patch 9A.
- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.
- [ ] FinanceLite: tiền vẫn hiển thị dạng `1.200.000đ`.
- [ ] FinanceLite: input tiền vẫn nhập/chuyển format đúng.
- [ ] Members: danh sách/tìm kiếm/lọc vẫn ổn.
- [ ] DailyRoutine: mở trang và thao tác cơ bản không lỗi.

## 9B - Date/Time picker guard

- [ ] Apply patch 9B.
- [ ] Thêm `client/src/components/shared/form/TimePickerInput.tsx`.
- [ ] DailyRoutine DutyAssignmentForm dùng `TimePickerInput` cho giờ bắt đầu/kết thúc.
- [ ] RoutineItemModal dùng `TimePickerInput` cho giờ bắt đầu/kết thúc.
- [ ] StudyScheduleModal dùng `TimePickerInput` cho giờ bắt đầu/kết thúc.
- [ ] StudyScheduleSection dùng `TimePickerInput` cho giờ bắt đầu/kết thúc.
- [ ] DatePickerInput/FormDateInput vẫn mở được calendar picker.
- [ ] Không còn input date/time text-only trong các file đã audit.
- [ ] Chọn nhanh giờ lưu đúng dạng `HH:mm`.
- [ ] User vẫn có thể gõ giờ nếu trình duyệt hỗ trợ, nhưng có dropdown picker để chọn nhanh.

## Chốt Việc 9

- [ ] Patch 9A pass.
- [ ] Patch 9B pass.
- [ ] Cập nhật `PROJECT_SUMMARY.md`.
- [ ] Cập nhật `RESIDENCECORE_CHECKLIST.md`.
