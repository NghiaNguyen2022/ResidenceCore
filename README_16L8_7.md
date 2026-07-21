# 16L8.7 — File hoàn chỉnh, không dùng patch

Nguyên nhân nút chưa xuất hiện:
- Các gói trước chứa file `.patch`.
- Git commit mới nhất chỉ commit các file `.patch`, chưa thay đổi mã nguồn `DutyDayView.tsx`.
- Trình duyệt vì vậy vẫn chạy component cũ.

## Áp dụng
Copy/Replace file hoàn chỉnh:

`client/src/components/daily-routine/duties/DutyDayView.tsx`

Sau đó chạy:

```bash
pnpm check
pnpm dev
```

Không cần chạy `git apply`.

## Kết quả
- Card đã phân công có nút `Chi tiết`.
- Card Trực cửa hàng có phần `Quyền vào Cửa hàng`.
- Có nút `Gửi mã qua Thông báo`.
- Component tự gọi API, không cần sửa DailyRoutine.tsx hay DutiesTab.tsx.
