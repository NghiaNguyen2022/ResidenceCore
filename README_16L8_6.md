# 16L8.6 — Chi tiết card trên đúng màn hình /daily-routine

Lỗi trước đó: 16L8.5 sửa `client/src/pages/Duties.tsx`, trong khi ảnh người dùng đang ở `/daily-routine`.
Card thực tế được render bởi:
- `DailyRoutine.tsx`
- `DutiesTab.tsx`
- `DutyDayView.tsx`

## Kết quả
- Mỗi card công tác đã phân công có nút `Chi tiết`.
- Bấm sẽ bung nội dung ngay bên dưới card.
- Riêng `Trực cửa hàng` có nút `Gửi mã qua Thông báo`.
- Không chuyển trang, không cần modal riêng.
- Mã mới thu hồi mã cũ và gửi cho học viên qua hệ thống Thông báo.

## Yêu cầu
Backend 16L8.4 phải đã được áp dụng:
- `issueDutyAccessCodeByAssignment`
- `issueAccessCodeByDutyAssignment`

## Áp dụng
Từ thư mục gốc ResidenceCore:

```bash
git apply --whitespace=fix client/src/pages/DailyRoutine.tsx.patch
git apply --whitespace=fix client/src/components/daily-routine/duties/DutiesTab.tsx.patch
git apply --whitespace=fix client/src/components/daily-routine/duties/DutyDayView.tsx.patch
pnpm check
pnpm dev
```
