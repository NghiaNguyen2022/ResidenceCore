# Việc 9C - Fix DatePicker bị cắt trong modal/card

## Vấn đề
DatePicker popup đang render absolute bên trong component cha. Khi nằm trong modal/card/panel có overflow hidden hoặc vùng cuộn giới hạn, calendar bị cắt phần dưới.

## Cách sửa
- Render calendar dropdown bằng React portal ra `document.body`.
- Dùng `position: fixed` theo vị trí input hiện tại.
- Tự cập nhật vị trí khi scroll/resize.
- Click ngoài vẫn đóng được vì đã kiểm tra cả wrapper và dropdownRef.

## File ảnh hưởng
- `client/src/components/shared/form/DatePickerInput.tsx`

## Runtime cần test
- Mở datepicker trong MemberFormModal, FinanceLite modal, DailyRoutine modal.
- Calendar không còn bị cắt đáy.
- Chọn ngày vẫn trả về `YYYY-MM-DD`.
- Gõ nhanh `dd/mm/yyyy` vẫn hoạt động như cũ.
